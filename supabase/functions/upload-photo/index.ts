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
  const requestId = crypto.randomUUID()
  const startTime = Date.now()
  
  console.log(`[${requestId}] Starting upload-photo request`, {
    method: req.method,
    url: req.url,
    headers: Object.fromEntries(req.headers.entries())
  })

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`[${requestId}] Handling CORS preflight request`, {
      origin: req.headers.get('origin'),
      requestHeaders: req.headers.get('access-control-request-headers')
    })
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the current user from the authorization header
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

    // Get form data from request
    console.log(`[${requestId}] Parsing form data`)
    const formData = await req.formData()
    const file = formData.get('file') as File
    const recipeId = formData.get('recipeId') as string

    if (!file || !recipeId) {
      console.error(`[${requestId}] Missing required fields`, {
        hasFile: !!file,
        hasRecipeId: !!recipeId
      })
      throw new Error('File and recipe ID are required')
    }

    console.log(`[${requestId}] Validating file`, {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size
    })

    // Validate file
    if (!file.type.startsWith('image/')) {
      console.error(`[${requestId}] Invalid file type`, {
        type: file.type,
        allowedTypes: ['image/*']
      })
      throw new Error('Only image files are allowed')
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      console.error(`[${requestId}] File too large`, {
        size: file.size,
        maxSize
      })
      throw new Error('File size must be less than 5MB')
    }

    // Generate unique filename
    const timestamp = new Date().getTime()
    const fileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const storagePath = `${user.id}/${recipeId}/${timestamp}_${fileName}`

    console.log(`[${requestId}] Converting file to ArrayBuffer`)
    const arrayBuffer = await file.arrayBuffer()

    console.log(`[${requestId}] Starting file upload`, {
      path: storagePath,
      size: file.size,
      type: file.type,
      bucket: 'recipe-photos'
    })

    // Upload to Supabase Storage
    const uploadStartTime = Date.now()
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('recipe-photos')
      .upload(storagePath, arrayBuffer, {
        contentType: file.type,
        cacheControl: '31536000'
      })

    if (uploadError) {
      console.error(`[${requestId}] Upload failed`, {
        error: {
          message: uploadError.message,
          statusCode: uploadError.statusCode,
          name: uploadError.name,
          details: uploadError.details
        },
        path: storagePath
      })
      throw uploadError
    }

    const uploadDuration = Date.now() - uploadStartTime
    console.log(`[${requestId}] Upload completed`, {
      path: uploadData.path,
      duration: uploadDuration,
      bytesUploaded: file.size
    })

    // Get the public URL
    console.log(`[${requestId}] Generating public URL`)
    const { data: urlData } = supabaseAdmin.storage
      .from('recipe-photos')
      .getPublicUrl(storagePath)

    const totalDuration = Date.now() - startTime
    console.log(`[${requestId}] Request completed successfully`, {
      path: storagePath,
      publicUrl: urlData.publicUrl,
      totalDuration,
      uploadDuration,
      bytesUploaded: file.size
    })

    return new Response(
      JSON.stringify({
        path: storagePath,
        url: urlData.publicUrl,
        size: file.size,
        type: file.type,
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
    const totalDuration = Date.now() - startTime
    console.error(`[${requestId}] Request failed`, {
      error: error instanceof Error ? {
        message: error.message,
        name: error.name,
        stack: error.stack
      } : error,
      duration: totalDuration
    })

    // Determine appropriate status code
    let statusCode = 500
    if (error instanceof Error) {
      switch (error.message) {
        case 'Unauthorized':
        case 'Missing authorization header':
          statusCode = 401
          break
        case 'File and recipe ID are required':
        case 'Only image files are allowed':
        case 'File size must be less than 5MB':
          statusCode = 400
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
        status: statusCode,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})