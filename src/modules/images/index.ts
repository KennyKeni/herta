import jwt from '@elysiajs/jwt';
import { Elysia, NotFoundError } from 'elysia';
import { config } from '@/config';
import { imagesSetup } from '@/infrastructure/setup';
import { authModule } from '@/modules/auth';
import { ImageModel } from './model';

export const images = new Elysia({ prefix: '/images', tags: ['images'] })
  .use(imagesSetup)
  .use(authModule)
  .use(
    jwt({
      name: 'uploadJwt',
      secret: config.upload.UPLOAD_JWT_SECRET,
      exp: `${config.upload.UPLOAD_JWT_EXPIRES_IN}s`,
    })
  )
  .post(
    '/upload-url',
    async ({ body, user, imagesService, uploadJwt }) => {
      const { imageId, s3Key, publicUrl, maxSize } = await imagesService.requestUpload(
        body.contentType,
        body.maxSize,
        body.keyPrefix,
        user.id
      );

      const token = await uploadJwt.sign({
        imageId,
        s3Key,
        maxSize,
        contentType: body.contentType,
      });

      return {
        imageId,
        uploadUrl: `${config.upload.UPLOAD_WORKER_URL}/upload`,
        uploadToken: token,
        publicUrl,
        maxSize,
      };
    },
    {
      auth: true,
      permission: { image: ['upload'] },
      body: ImageModel.uploadUrlRequest,
      response: ImageModel.uploadUrlResponse,
      detail: {
        summary: 'Get upload URL',
        description:
          'Create an image record and get an upload URL with JWT token. Requires image:upload permission.',
      },
    }
  )
  .get(
    '/:id',
    async ({ params, imagesService }) => {
      const image = await imagesService.getById(params.id);
      if (!image) throw new NotFoundError('Image not found');
      return image;
    },
    {
      response: ImageModel.image,
      detail: {
        summary: 'Get image by ID',
        description: 'Get image metadata by UUID.',
      },
    }
  )
  .post(
    '/:id/confirm',
    async ({ params, body, imagesService }) => {
      const image = await imagesService.confirmUpload(params.id, body);
      if (!image) throw new NotFoundError('Image not found or already confirmed');
      return image;
    },
    {
      body: ImageModel.confirmUploadBody,
      response: ImageModel.image,
      detail: {
        summary: 'Confirm upload',
        description: 'Confirm that the image has been uploaded to S3.',
      },
    }
  )
  .post(
    '/:id/publish',
    async ({ params, imagesService }) => {
      const published = await imagesService.publish(params.id);
      if (!published) throw new NotFoundError('Image not found');
      return { success: true };
    },
    {
      response: ImageModel.successResponse,
      detail: {
        summary: 'Publish image',
        description: 'Transition image status to published.',
      },
    }
  )
  .delete(
    '/:id',
    async ({ params, imagesService }) => {
      const deleted = await imagesService.softDelete(params.id);
      if (!deleted) throw new NotFoundError('Image not found');
      return { success: true };
    },
    {
      auth: true,
      permission: { image: ['delete'] },
      response: ImageModel.successResponse,
      detail: {
        summary: 'Delete image',
        description: 'Soft-delete an image. Requires image:delete permission.',
      },
    }
  );
