import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import OpenAI from 'https://esm.sh/openai@4.20.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const requestId = crypto.randomUUID()
  console.log(`[${requestId}] Starting parse-recipe request`)

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] Handling CORS preflight request`)
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      console.error(`[${requestId}] OpenAI API key not found in environment`)
      throw new Error('Missing OpenAI API key')
    }

    console.log(`[${requestId}] Parsing request body`)
    const { text } = await req.json()
    if (!text) {
      console.error(`[${requestId}] No recipe text provided in request`)
      throw new Error('Recipe text is required')
    }

    console.log(`[${requestId}] Initializing OpenAI client`)
    const openai = new OpenAI({ apiKey })

    // Create system prompt
    const systemPrompt = `You are a professional chef and recipe analyzer. Parse the following recipe or ingredient information into a structured format.
If it's just ingredients, suggest a recipe name and category.
Calculate suggested price for 60% profit margin.
Include detailed cooking instructions if available.`

    // Create user prompt
    const userPrompt = `Parse this recipe information:
${text}

Return the response in this exact JSON format:
{
  "name": "Recipe name",
  "category": "One of: Breakfast, Lunch, Dinner, Dessert",
  "ingredients": [
    {
      "name": "Ingredient name",
      "quantity": number,
      "unit": "unit of measurement",
      "price": number,
      "notes": "optional notes"
    }
  ],
  "suggestedPrice": number,
  "instructions": ["Step 1...", "Step 2...", "Step 3..."]
}`

    console.log(`[${requestId}] Starting OpenAI request with retry logic (max attempts: 3)`)
    const maxRetries = 3
    let lastError = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[${requestId}] Attempt ${attempt} of ${maxRetries}`)
        
        const completion = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })

        console.log(`[${requestId}] OpenAI response received`, {
          usage: completion.usage,
          model: completion.model,
          responseLength: completion.choices[0]?.message?.content?.length || 0
        })

        const response = completion.choices[0]?.message?.content
        if (!response) {
          console.error(`[${requestId}] Empty response from OpenAI`)
          throw new Error('No response from OpenAI')
        }

        // Validate JSON response
        console.log(`[${requestId}] Parsing and validating JSON response`)
        const parsedResponse = JSON.parse(response)
        
        if (!parsedResponse.name || !parsedResponse.category || !Array.isArray(parsedResponse.ingredients)) {
          console.error(`[${requestId}] Invalid response format`, {
            hasName: !!parsedResponse.name,
            hasCategory: !!parsedResponse.category,
            hasIngredients: Array.isArray(parsedResponse.ingredients)
          })
          throw new Error('Invalid response format')
        }

        console.log(`[${requestId}] Successfully processed recipe`, {
          recipeName: parsedResponse.name,
          category: parsedResponse.category,
          ingredientCount: parsedResponse.ingredients.length,
          hasInstructions: Array.isArray(parsedResponse.instructions)
        })

        return new Response(
          JSON.stringify(parsedResponse),
          { 
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json'
            }
          }
        )
      } catch (error) {
        lastError = error
        console.error(`[${requestId}] Attempt ${attempt} failed`, {
          error: error instanceof Error ? {
            message: error.message,
            name: error.name,
            stack: error.stack
          } : error
        })

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000
          console.log(`[${requestId}] Retrying after ${delay}ms`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }
    }

    throw lastError || new Error('Failed to process recipe')
  } catch (error) {
    console.error(`[${requestId}] Request failed`, {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : error
    })

    const message = error instanceof Error ? error.message : 'Internal server error'
    
    return new Response(
      JSON.stringify({ 
        error: message,
        details: error instanceof Error ? error.stack : undefined,
        requestId
      }),
      { 
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})