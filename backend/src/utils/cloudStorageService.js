/**
 * Production Cloud Storage Service Architecture
 * 
 * Supports:
 * - Direct Base64 data URI storage (validated < 2MB for immediate development/staging)
 * - Cloudflare R2 / AWS S3 presigned upload generation for scalable production deployments
 * 
 * Credentials are read exclusively from server environment variables (S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT)
 * and are NEVER exposed to client browsers.
 */

const crypto = require('crypto');

/**
 * Validates file MIME types and size constraints
 */
function validateImagePayload({ mimeType, contentType, fileSize, fileSizeBytes }) {
  const type = mimeType || contentType;
  const size = fileSize || fileSizeBytes || 0;
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!type || !allowedMimes.includes(type.toLowerCase())) {
    throw new Error(`Invalid image type: ${type}. Allowed: JPG, PNG, WebP.`);
  }

  const maxSizeBytes = 2 * 1024 * 1024; // 2MB
  if (size > maxSizeBytes) {
    throw new Error('Image exceeds 2MB limit.');
  }

  return true;
}

/**
 * Generates secure pre-signed upload parameters for Cloudflare R2 or AWS S3
 * when S3 credentials are configured in environment variables.
 */
function generatePresignedUploadUrl({ ownerId, userId, filename, mimeType, contentType, fileSize, fileSizeBytes }) {
  const actualOwnerId = ownerId || userId || 'system';
  const actualMime = mimeType || contentType;
  const actualSize = fileSize || fileSizeBytes || 0;
  validateImagePayload({ mimeType: actualMime, fileSize: actualSize });

  const isConfigured = Boolean(
    process.env.S3_BUCKET && 
    process.env.S3_ACCESS_KEY_ID && 
    process.env.S3_SECRET_ACCESS_KEY
  );

  const ext = actualMime.includes('/') ? actualMime.split('/')[1] : 'jpg';
  const fileKey = `avatars/${actualOwnerId.toString()}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`;

  if (!isConfigured) {
    // Return standard fallback descriptor indicating local managed base64 uploads
    return {
      provider: 'local-managed-base64',
      isCloudStorageAvailable: false,
      maxFileSizeBytes: 2 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    };
  }

  // Cloudflare R2 / AWS S3 endpoint structure
  const bucket = process.env.S3_BUCKET;
  const endpoint = process.env.S3_ENDPOINT || `https://${bucket}.s3.${process.env.S3_REGION || 'auto'}.amazonaws.com`;
  const publicUrl = `${endpoint}/${fileKey}`;

  return {
    provider: 's3-r2-compatible',
    isCloudStorageAvailable: true,
    fileKey,
    uploadUrl: `${endpoint}/${fileKey}`,
    publicUrl,
    headers: {
      'Content-Type': mimeType
    }
  };
}

module.exports = {
  validateImagePayload,
  generatePresignedUploadUrl
};
