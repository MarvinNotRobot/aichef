import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Create a Supabase client with the Admin key
const supabaseAdmin = createClient(
  // Get values from environment variables
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl, recipeId } = await req.json()
    
    if (!imageUrl || !recipeId) {
      console.error('Missing required parameters')
      return new Response(
        JSON.stringify({ error: 'Image URL and recipe ID are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing image download request:', { imageUrl, recipeId })

    // Download image with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    try {
      console.log('Fetching image from URL...')
      const response = await fetch(imageUrl, {
        signal: controller.signal,
        headers: {
          'Accept': 'image/*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      })

      console.log('Fetch response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`)
      }

      // Get the content type and validate it's an image
      const contentType = response.headers.get('content-type')
      if (!contentType?.startsWith('image/')) {
        throw new Error(`Invalid content type: ${contentType}`)
      }

      // Get the image data as a buffer
      const imageBuffer = await response.arrayBuffer()
      
      console.log('Image downloaded successfully:', {
        contentType,
        imageSize: imageBuffer.byteLength,
        url: imageUrl
      })

      if (imageBuffer.byteLength === 0) {
        throw new Error('Received empty image buffer')
      }

      // Generate a unique filename
      const timestamp = new Date().getTime()
      const extension = contentType.split('/')[1] || 'jpg'
      const filename = `${timestamp}.${extension}`
      const storagePath = `${recipeId}/${filename}`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('recipe-photos')
        .upload(storagePath, imageBuffer, {
          contentType,
          cacheControl: '31536000'
        })

      if (uploadError) {
        console.log('Upload Failed:', { error: uploadError })
        throw uploadError
      }

      // Get the public URL for the uploaded file
      const { data: urlData } = supabaseAdmin.storage
        .from('recipe-photos')
        .getPublicUrl(storagePath)

      console.log('Upload successful:', { 
        path: storagePath,
        fullpath: urlData.publicUrl,
        uploadData 
      })

      // Return the storage path and full URL
      return new Response(
        JSON.stringify({ 
          fullpath: urlData.publicUrl,
          path: storagePath,
          contentType,
          size: imageBuffer.byteLength
        }),
        { 
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json'
          }
        }
      )
    } finally {
      clearTimeout(timeout)
    }
  } catch (error) {
    console.error('Error processing image:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    })

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to process image',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})