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

const UploadUrlRequestSchema = t.Object({
  contentType: t.String({ default: 'image/png' }),
  keyPrefix: t.Optional(t.String()),
});

const UploadUrlResponseSchema = t.Object({
  imageId: t.String(),
  uploadUrl: t.String(),
  s3Key: t.String(),
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
