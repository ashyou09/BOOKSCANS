import { S3Client } from '@aws-sdk/client-s3';

const endpoint = process.env.R2_ENDPOINT || process.env.S3_ENDPOINT;

export const s3 = new S3Client({
  region: process.env.AWS_REGION || 'auto',
  endpoint: endpoint || undefined,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID || 'demo',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY || 'demo',
  },
});
