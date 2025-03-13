import { S3Client } from '@aws-sdk/client-s3';
import { appLogger } from '../logger';

// AWS Configuration
const region = import.meta.env.VITE_AWS_REGION;
const bucketName = import.meta.env.VITE_S3_BUCKET_NAME;
const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY_ID;
const secretAccessKey = import.meta.env.VITE_AWS_SECRET_ACCESS_KEY;

// Validate required configuration
if (!accessKeyId || !secretAccessKey || !region || !bucketName) {
  const missingVars = [];
  if (!accessKeyId) missingVars.push('VITE_AWS_ACCESS_KEY_ID');
  if (!secretAccessKey) missingVars.push('VITE_AWS_SECRET_ACCESS_KEY');
  if (!region) missingVars.push('VITE_AWS_REGION');
  if (!bucketName) missingVars.push('VITE_S3_BUCKET_NAME');
  
  const error = `Missing required AWS configuration: ${missingVars.join(', ')}`;
  appLogger.error(error, { missingVars });
  throw new Error(error);
}

// Initialize S3 Client with logging and CORS configuration
const clientConfig = {
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  },
  // Enable CORS support
  requestHandler: {
    handleRequest: async (request: any) => {
      // Add CORS headers to the request
      request.headers['Access-Control-Allow-Origin'] = '*';
      request.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
      request.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      return request;
    }
  },
  logger: {
    debug: (...args: any[]) => appLogger.debug('S3 Client Debug', { args }),
    info: (...args: any[]) => appLogger.info('S3 Client Info', { args }),
    warn: (...args: any[]) => appLogger.warn('S3 Client Warning', { args }),
    error: (...args: any[]) => appLogger.error('S3 Client Error', { args })
  }
};

appLogger.debug('Initializing S3 client with config', {
  region,
  bucketName,
  hasAccessKeyId: !!accessKeyId,
  hasSecretKey: !!secretAccessKey
});

export const s3Client = new S3Client(clientConfig);

export const s3Config = {
  bucketName,
  region,
  uploadOptions: {
    CacheControl: 'max-age=31536000' // 1 year cache
  }
};

appLogger.info('AWS S3 client initialized', { 
  region, 
  bucketName,
  hasCredentials: !!accessKeyId && !!secretAccessKey 
});