import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import OpenAI from 'https://esm.sh/openai@4.20.1'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  const requestId = crypto.randomUUID()
  const startTime = Date.now()

  console.log(`[${requestId}] Starting generate-image request`, {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  })

  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] Handling CORS preflight request`, {
      origin: req.headers.get('origin'),
      requestHeaders: req.headers.get('access-control-request-headers')
    })
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      console.error(`[${requestId}] Missing authorization header`)
      throw new Error('Missing authorization header')
    }

    console.log(`[${requestId}] Authenticating user`)
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError) {
      console.error(`[${requestId}] Authentication failed`, {
        error: {
          message: authError.message,
          status: authError.status,
          name: authError.name
        }
      })
      throw new Error('Unauthorized')
    }

    if (!user) {
      console.error(`[${requestId}] No user found in auth response`)
      throw new Error('Unauthorized')
    }

    console.log(`[${requestId}] User authenticated successfully`, {
      userId: user.id,
      email: user.email
    })

    // Get request data
    console.log(`[${requestId}] Parsing request body`)
    const { prompt, recipeId } = await req.json()
    
    if (!prompt || !recipeId) {
      console.error(`[${requestId}] Missing required fields`, {
        hasPrompt: !!prompt,
        hasRecipeId: !!recipeId
      })
      throw new Error('Prompt and recipe ID are required')
    }

    console.log(`[${requestId}] Request parameters validated`, {
      promptLength: prompt.length,
      recipeId
    })

    // Initialize OpenAI
    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      console.error(`[${requestId}] OpenAI API key not configured`)
      throw new Error('OpenAI API key not configured')
    }

    const openai = new OpenAI({ apiKey })

    // Generate image with retry logic
    const maxRetries = 3
    let lastError = null

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`[${requestId}] Starting OpenAI image generation (Attempt ${attempt}/${maxRetries})`, {
          model: 'dall-e-3',
          size: '1024x1024',
          quality: 'hd'
        })

        const openaiStartTime = Date.now()
        const response = await openai.images.generate({
          prompt,
          n: 1,
          size: '1024x1024',
          quality: 'hd',
          response_format: 'url'
        })

        const openaiDuration = Date.now() - openaiStartTime
        console.log(`[${requestId}] OpenAI response received`, {
          duration: openaiDuration,
          hasUrl: !!response.data?.[0]?.url
        })

        if (!response.data?.[0]?.url) {
          console.error(`[${requestId}] No image URL in OpenAI response`)
          throw new Error('No image URL returned')
        }

        // Download image
        console.log(`[${requestId}] Downloading generated image`)
        const downloadStartTime = Date.now()
        const imageResponse = await fetch(response.data[0].url)
        
        if (!imageResponse.ok) {
          console.error(`[${requestId}] Failed to download image`, {
            status: imageResponse.status,
            statusText: imageResponse.statusText
          })
          throw new Error('Failed to download image')
        }

        const contentType = imageResponse.headers.get('content-type')
        if (!contentType?.startsWith('image/')) {
          console.error(`[${requestId}] Invalid content type`, {
            contentType,
            expectedType: 'image/*'
          })
          throw new Error('Invalid content type')
        }

        const imageBuffer = await imageResponse.arrayBuffer()
        const downloadDuration = Date.now() - downloadStartTime

        console.log(`[${requestId}] Image downloaded successfully`, {
          contentType,
          size: imageBuffer.byteLength,
          duration: downloadDuration
        })

        // Create form data for upload
        const timestamp = Date.now()
        const extension = contentType.split('/')[1] || 'jpg'
        const fileName = `${timestamp}.${extension}`
        
        // Convert ArrayBuffer to File
        const imageFile = new File([imageBuffer], fileName, { type: contentType })
        
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('recipeId', recipeId)

        // Call upload-photo function
        console.log(`[${requestId}] Calling upload-photo function`, {
          fileName,
          fileSize: imageFile.size,
          fileType: imageFile.type
        })

        const uploadStartTime = Date.now()
        const uploadResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/upload-photo`,
          {
            method: 'POST',
            headers: {
              'Authorization': authHeader
            },
            body: formData
          }
        )

        if (!uploadResponse.ok) {
          const error = await uploadResponse.json()
          console.error(`[${requestId}] Upload failed`, {
            status: uploadResponse.status,
            error: error.error
          })
          throw new Error(error.error || 'Failed to upload image')
        }

        const uploadResult = await uploadResponse.json()
        const uploadDuration = Date.now() - uploadStartTime

        console.log(`[${requestId}] Upload completed successfully`, {
          path: uploadResult.path,
          duration: uploadDuration
        })

        const totalDuration = Date.now() - startTime
        console.log(`[${requestId}] Request completed successfully`, {
          totalDuration,
          openaiDuration,
          downloadDuration,
          uploadDuration,
          path: uploadResult.path
        })

        return new Response(
          JSON.stringify({
            path: uploadResult.path,
            url: uploadResult.url,
            duration: totalDuration
          }),
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
          } : error,
          attempt,
          maxRetries
        })

        if (attempt < maxRetries) {
          const delay = Math.pow(2, attempt) * 1000
          console.log(`[${requestId}] Retrying after ${delay}ms`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }
      }
    }

    throw lastError || new Error('Failed to generate image')
  } catch (error) {
    const totalDuration = Date.now() - startTime
    console.error(`[${requestId}] Request failed`, {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : error,
      duration: totalDuration
    })

    let status = 500
    if (error instanceof Error) {
      switch (error.message) {
        case 'Unauthorized':
        case 'Missing authorization header':
          status = 401
          break
        case 'Prompt and recipe ID are required':
          status = 400
          break
      }
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Internal server error',
        requestId,
        duration: totalDuration
      }),
      { 
        status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})