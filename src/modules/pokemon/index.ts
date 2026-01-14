import { Elysia, NotFoundError } from 'elysia';
import { pokemonSetup } from '@/infrastructure/setup';
import { PokemonModel } from './model';

export const pokemon = new Elysia({ prefix: '/pokemon', tags: ['pokemon'] })
  .use(pokemonSetup)
  .get('/', ({ query, pokemonService }) => pokemonService.search(query), {
    query: PokemonModel.searchQuery,
    response: PokemonModel.searchResponse,
    detail: {
      summary: 'List Pokemon',
      description:
        'List Pokemon species and forms with optional filtering by IDs, slugs, types, abilities, moves, and more.',
    },
  })
  .get(
    '/form/:identifier',
    async ({ params, query, pokemonService }) => {
      const result = await pokemonService.getFormByIdentifier(params.identifier, query);
      if (!result) throw new NotFoundError('Form not found');
      return result;
    },
    {
      query: PokemonModel.getFormQuery,
      response: PokemonModel.getFormResponse,
      detail: {
        summary: 'Get Pokemon form by ID or slug',
        description: 'Get a single Pokemon form with its parent species by form ID or slug.',
      },
    }
  )
  .get(
    '/:identifier',
    async ({ params, query, pokemonService }) => {
      const result = await pokemonService.getByIdentifier(params.identifier, query);
      if (!result) throw new NotFoundError('Pokemon not found');
      return result;
    },
    {
      query: PokemonModel.getOneQuery,
      response: PokemonModel.getOneResponse,
      detail: {
        summary: 'Get Pokemon by ID or slug',
        description: 'Get a single Pokemon species with all its forms by species ID or slug.',
      },
    }
  )
  .post(
    '/species',
    async ({ body, pokemonService }) => {
      return pokemonService.createSpecies(body);
    },
    {
      body: PokemonModel.createSpeciesBody,
      response: PokemonModel.createdSpeciesResponse,
      detail: {
        summary: 'Create Pokemon species',
        description:
          'Create a new Pokemon species with optional egg groups, hitbox, lighting, and riding data.',
      },
    }
  )
  .patch(
    '/species/:identifier',
    async ({ params, body, pokemonService }) => {
      const result = await pokemonService.updateSpecies(params.identifier, body);
      if (!result) throw new NotFoundError('Species not found');
      return result;
    },
    {
      body: PokemonModel.updateSpeciesBody,
      response: PokemonModel.updatedSpeciesResponse,
      detail: {
        summary: 'Update Pokemon species',
        description: 'Update an existing Pokemon species by ID or slug.',
      },
    }
  )
  .post(
    '/species/:identifier/upload-url',
    async ({ params, body, pokemonService }) => {
      const result = await pokemonService.getSpeciesUploadUrl(params.identifier, body.contentType);
      if (!result) throw new NotFoundError('Species not found');
      return result;
    },
    {
      body: PokemonModel.uploadUrlBody,
      response: PokemonModel.uploadUrlResponse,
      detail: {
        summary: 'Get species sprite upload URL',
        description: 'Get a presigned URL for uploading a species sprite image.',
      },
    }
  )
  .post(
    '/forms',
    async ({ body, pokemonService }) => {
      return pokemonService.createForm(body);
    },
    {
      body: PokemonModel.createFormBody,
      response: PokemonModel.createdFormResponse,
      detail: {
        summary: 'Create Pokemon form',
        description: 'Create a new Pokemon form with types, abilities, stats, and other data.',
      },
    }
  )
  .patch(
    '/forms/:identifier',
    async ({ params, body, pokemonService }) => {
      const result = await pokemonService.updateForm(params.identifier, body);
      if (!result) throw new NotFoundError('Form not found');
      return result;
    },
    {
      body: PokemonModel.updateFormBody,
      response: PokemonModel.updatedFormResponse,
      detail: {
        summary: 'Update Pokemon form',
        description: 'Update an existing Pokemon form by ID or slug.',
      },
    }
  )
  .post(
    '/forms/:identifier/upload-url',
    async ({ params, body, pokemonService }) => {
      const result = await pokemonService.getFormUploadUrl(params.identifier, body.contentType);
      if (!result) throw new NotFoundError('Form not found');
      return result;
    },
    {
      body: PokemonModel.uploadUrlBody,
      response: PokemonModel.uploadUrlResponse,
      detail: {
        summary: 'Get form sprite upload URL',
        description: 'Get a presigned URL for uploading a form sprite image.',
      },
    }
  )
  .delete(
    '/species/:identifier',
    async ({ params, pokemonService }) => {
      const deleted = await pokemonService.deleteSpecies(params.identifier);
      if (!deleted) throw new NotFoundError('Species not found');
      return { success: true };
    },
    {
      detail: {
        summary: 'Delete Pokemon species',
        description: 'Delete a Pokemon species and all its forms by ID or slug.',
      },
    }
  )
  .delete(
    '/forms/:identifier',
    async ({ params, pokemonService }) => {
      const deleted = await pokemonService.deleteForm(params.identifier);
      if (!deleted) throw new NotFoundError('Form not found');
      return { success: true };
    },
    {
      detail: {
        summary: 'Delete Pokemon form',
        description: 'Delete a Pokemon form by ID or slug.',
      },
    }
  );
