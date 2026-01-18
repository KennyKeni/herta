import { t } from 'elysia';

const ImageStatusSchema = t.Union([
  t.Literal('pending_upload'),
  t.Literal('pending_published'),
  t.Literal('published'),
  t.Literal('deleted'),
]);

const ImageSchema = t.Object({
  id: t.String(),
  s3Key: t.String(),
  status: ImageStatusSchema,
  mimeType: t.Nullable(t.String()),
  width: t.Nullable(t.Number()),
  height: t.Nullable(t.Number()),
  fileSize: t.Nullable(t.Number()),
  uploadedBy: t.Nullable(t.String()),
  uploadedAt: t.Nullable(t.Date()),
  createdAt: t.Date(),
});

const AllowedContentTypeSchema = t.Union(
  [
    t.Literal('image/jpeg'),
    t.Literal('image/png'),
    t.Literal('image/gif'),
    t.Literal('image/webp'),
    t.Literal('image/svg+xml'),
  ],
  { default: 'image/png' }
);

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const UploadUrlRequestSchema = t.Object({
  contentType: AllowedContentTypeSchema,
  keyPrefix: t.Optional(t.String()),
  maxSize: t.Optional(t.Number({ minimum: 1, maximum: MAX_FILE_SIZE, default: MAX_FILE_SIZE })),
});

const UploadUrlResponseSchema = t.Object({
  imageId: t.String(),
  uploadUrl: t.String(),
  uploadToken: t.String(),
  publicUrl: t.String(),
  maxSize: t.Number(),
});

const ConfirmUploadBodySchema = t.Object({
  width: t.Optional(t.Number()),
  height: t.Optional(t.Number()),
  fileSize: t.Optional(t.Number()),
});

const SuccessResponseSchema = t.Object({
  success: t.Boolean(),
});

export const ImageModel = {
  image: ImageSchema,
  status: ImageStatusSchema,
  uploadUrlRequest: UploadUrlRequestSchema,
  uploadUrlResponse: UploadUrlResponseSchema,
  confirmUploadBody: ConfirmUploadBodySchema,
  successResponse: SuccessResponseSchema,
};
