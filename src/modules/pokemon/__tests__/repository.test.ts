import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { type Kysely, sql } from 'kysely';
import type { DB } from '@/infrastructure/db/types';
import { createTestTransaction } from '@/test/helpers';
import { PokemonRepository } from '../repository';

describe('PokemonRepository', () => {
  let trx: Kysely<DB>;
  let rollback: () => Promise<void>;
  let repo: PokemonRepository;

  beforeEach(async () => {
    ({ trx, rollback } = await createTestTransaction());
    repo = new PokemonRepository(trx);
  });

  afterEach(async () => {
    await rollback();
  });

  async function seedSpecies(
    trx: Kysely<DB>,
    overrides: Partial<{
      id: number;
      slug: string;
      name: string;
      generation: number;
      catch_rate: number;
      base_friendship: number;
      egg_cycles: number;
    }> = {}
  ) {
    const data = {
      id: 1,
      slug: 'bulbasaur',
      name: 'Bulbasaur',
      generation: 1,
      catch_rate: 45,
      base_friendship: 50,
      egg_cycles: 20,
      ...overrides,
    };
    await trx.insertInto('species').values(data).execute();
    return data;
  }

  async function seedForm(
    trx: Kysely<DB>,
    overrides: Partial<{
      id: number;
      species_id: number;
      slug: string;
      name: string;
      form_name: string;
      height: number;
      weight: number;
    }> = {}
  ) {
    const data = {
      id: 1,
      species_id: 1,
      slug: 'bulbasaur',
      name: 'Bulbasaur',
      form_name: 'Normal',
      description: null as string | null,
      generation: 1,
      height: 7,
      weight: 69,
      base_hp: 45,
      base_attack: 49,
      base_defence: 49,
      base_special_attack: 65,
      base_special_defence: 65,
      base_speed: 45,
      base_experience_yield: 64,
      ev_hp: 0,
      ev_attack: 0,
      ev_defence: 0,
      ev_special_attack: 1,
      ev_special_defence: 0,
      ev_speed: 0,
      ...overrides,
    };
    await sql`INSERT INTO forms (id, species_id, slug, name, form_name, description, generation, height, weight, base_hp, base_attack, base_defence, base_special_attack, base_special_defence, base_speed, base_experience_yield, ev_hp, ev_attack, ev_defence, ev_special_attack, ev_special_defence, ev_speed) OVERRIDING SYSTEM VALUE VALUES (${data.id}, ${data.species_id}, ${data.slug}, ${data.name}, ${data.form_name}, ${data.description}, ${data.generation}, ${data.height}, ${data.weight}, ${data.base_hp}, ${data.base_attack}, ${data.base_defence}, ${data.base_special_attack}, ${data.base_special_defence}, ${data.base_speed}, ${data.base_experience_yield}, ${data.ev_hp}, ${data.ev_attack}, ${data.ev_defence}, ${data.ev_special_attack}, ${data.ev_special_defence}, ${data.ev_speed})`.execute(
      trx
    );
    return data;
  }

  describe('checkSpeciesExists', () => {
    it('returns false for non-existent species', async () => {
      const result = await repo.checkSpeciesExists(999, 'nonexistent');
      expect(result).toEqual({ idExists: false, slugExists: false });
    });

    it('detects existing species by id and slug', async () => {
      await seedSpecies(trx);
      const result = await repo.checkSpeciesExists(1, 'bulbasaur');
      expect(result).toEqual({ idExists: true, slugExists: true });
    });
  });

  describe('checkFormSlugExists', () => {
    it('returns false for non-existent form slug', async () => {
      const result = await repo.checkFormSlugExists('nonexistent');
      expect(result).toBe(false);
    });

    it('detects existing form by slug', async () => {
      await seedSpecies(trx);
      await seedForm(trx);
      const result = await repo.checkFormSlugExists('bulbasaur');
      expect(result).toBe(true);
    });
  });

  describe('createSpecies', () => {
    it('creates a species and returns id + slug', async () => {
      const result = await repo.createSpecies(
        {
          id: 1,
          name: 'Bulbasaur',
          generation: 1,
          catchRate: 45,
          baseFriendship: 50,
          eggCycles: 20,
        },
        'bulbasaur'
      );
      expect(result).toEqual({ id: 1, slug: 'bulbasaur' });
    });

    it('creates species with forms', async () => {
      const formSlugs = new Map([[0, 'bulbasaur']]);
      const result = await repo.createSpecies(
        {
          id: 1,
          name: 'Bulbasaur',
          generation: 1,
          catchRate: 45,
          baseFriendship: 50,
          eggCycles: 20,
          forms: [
            {
              speciesId: 1,
              name: 'Bulbasaur',
              formName: 'Normal',
              height: 7,
              weight: 69,
              baseHp: 45,
              baseAttack: 49,
              baseDefence: 49,
              baseSpecialAttack: 65,
              baseSpecialDefence: 65,
              baseSpeed: 45,
            },
          ],
        },
        'bulbasaur',
        formSlugs
      );
      expect(result).toEqual({ id: 1, slug: 'bulbasaur' });

      const formExists = await repo.checkFormSlugExists('bulbasaur');
      expect(formExists).toBe(true);
    });
  });

  describe('getByIdentifier', () => {
    it('returns null for non-existent species', async () => {
      const result = await repo.getByIdentifier('999');
      expect(result).toBeNull();
    });

    it('retrieves species by id', async () => {
      await seedSpecies(trx);
      await seedForm(trx);

      const result = await repo.getByIdentifier('1');
      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
      expect(result?.name).toBe('Bulbasaur');
      expect(result?.slug).toBe('bulbasaur');
      expect(result?.forms).toBeArray();
      expect(result?.forms.length).toBe(1);
    });

    it('retrieves species by slug', async () => {
      await seedSpecies(trx);
      await seedForm(trx);

      const result = await repo.getByIdentifier('bulbasaur');
      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
    });
  });

  describe('getFormByIdentifier', () => {
    it('returns null for non-existent form', async () => {
      const result = await repo.getFormByIdentifier('999');
      expect(result).toBeNull();
    });

    it('retrieves form with parent species', async () => {
      await seedSpecies(trx);
      await seedForm(trx);

      const result = await repo.getFormByIdentifier('1');
      expect(result).not.toBeNull();
      expect(result?.form.id).toBe(1);
      expect(result?.form.name).toBe('Bulbasaur');
      expect(result?.id).toBe(1);
    });

    it('retrieves form by slug', async () => {
      await seedSpecies(trx);
      await seedForm(trx);

      const result = await repo.getFormByIdentifier('bulbasaur');
      expect(result).not.toBeNull();
      expect(result?.form.slug).toBe('bulbasaur');
    });
  });

  describe('searchByForm', () => {
    it('returns empty results when no data', async () => {
      const result = await repo.searchByForm({}, false);
      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('returns species with forms', async () => {
      await seedSpecies(trx);
      await seedForm(trx);

      const result = await repo.searchByForm({}, false);
      expect(result.data.length).toBe(1);
      expect(result.data[0].name).toBe('Bulbasaur');
      expect(result.total).toBe(1);
    });

    it('filters by generation', async () => {
      await seedSpecies(trx, { id: 1, slug: 'bulbasaur', name: 'Bulbasaur', generation: 1 });
      await seedForm(trx, { id: 1, species_id: 1, slug: 'bulbasaur' });
      await seedSpecies(trx, { id: 2, slug: 'chikorita', name: 'Chikorita', generation: 2 });
      await seedForm(trx, {
        id: 2,
        species_id: 2,
        slug: 'chikorita',
        name: 'Chikorita',
        form_name: 'Normal',
      });

      const gen1 = await repo.searchByForm({ generation: 1 }, false);
      expect(gen1.data.length).toBe(1);
      expect(gen1.data[0].name).toBe('Bulbasaur');
    });

    it('respects limit and offset', async () => {
      await seedSpecies(trx, { id: 1, slug: 'bulbasaur', name: 'Bulbasaur' });
      await seedForm(trx, { id: 1, species_id: 1, slug: 'bulbasaur' });
      await seedSpecies(trx, { id: 2, slug: 'ivysaur', name: 'Ivysaur' });
      await seedForm(trx, {
        id: 2,
        species_id: 2,
        slug: 'ivysaur',
        name: 'Ivysaur',
        form_name: 'Normal',
      });

      const page1 = await repo.searchByForm({ limit: 1, offset: 0 }, false);
      expect(page1.data.length).toBe(1);
      expect(page1.total).toBe(2);

      const page2 = await repo.searchByForm({ limit: 1, offset: 1 }, false);
      expect(page2.data.length).toBe(1);
      expect(page2.total).toBe(2);
      expect(page2.data[0].id).not.toBe(page1.data[0].id);
    });
  });

  describe('updateSpecies', () => {
    it('returns null for non-existent species', async () => {
      const result = await repo.updateSpecies('999', { name: 'Updated' });
      expect(result).toBeNull();
    });

    it('updates species by id', async () => {
      await seedSpecies(trx);
      await seedForm(trx);

      const result = await repo.updateSpecies('1', { generation: 2 }, undefined);
      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);

      const fetched = await repo.getByIdentifier('1');
      expect(fetched?.generation).toBe(2);
    });

    it('updates species slug when name changes', async () => {
      await seedSpecies(trx);
      await seedForm(trx);

      const result = await repo.updateSpecies('1', { name: 'Fushigidane' }, 'fushigidane');
      expect(result).not.toBeNull();
      expect(result?.slug).toBe('fushigidane');
    });
  });

  describe('createForm', () => {
    it('creates a form and returns id + slug', async () => {
      await seedSpecies(trx);

      const result = await repo.createForm(
        {
          speciesId: 1,
          name: 'Bulbasaur',
          formName: 'Normal',
          height: 7,
          weight: 69,
          baseHp: 45,
          baseAttack: 49,
          baseDefence: 49,
          baseSpecialAttack: 65,
          baseSpecialDefence: 65,
          baseSpeed: 45,
        },
        'bulbasaur'
      );
      expect(result.slug).toBe('bulbasaur');
      expect(result.id).toBeNumber();
    });
  });

  describe('updateForm', () => {
    it('returns null for non-existent form', async () => {
      const result = await repo.updateForm('999', { height: 10 });
      expect(result).toBeNull();
    });

    it('updates form by id', async () => {
      await seedSpecies(trx);
      await seedForm(trx);

      const result = await repo.updateForm('1', { height: 10 });
      expect(result).not.toBeNull();
      expect(result?.id).toBe(1);
    });
  });

  describe('deleteSpecies', () => {
    it('returns false for non-existent species', async () => {
      const result = await repo.deleteSpecies('999');
      expect(result).toBe(false);
    });

    it('deletes species and its forms', async () => {
      await seedSpecies(trx);
      await seedForm(trx);

      const result = await repo.deleteSpecies('1');
      expect(result).toBe(true);

      const fetched = await repo.getByIdentifier('1');
      expect(fetched).toBeNull();
    });
  });

  describe('deleteForm', () => {
    it('returns false for non-existent form', async () => {
      const result = await repo.deleteForm('999');
      expect(result).toBe(false);
    });

    it('deletes a form', async () => {
      await seedSpecies(trx);
      await seedForm(trx);

      const result = await repo.deleteForm('1');
      expect(result).toBe(true);

      const fetched = await repo.getFormByIdentifier('1');
      expect(fetched).toBeNull();
    });
  });

  describe('getSpeciesIdBySlug / getFormIdBySlug', () => {
    it('returns null for non-existent slug', async () => {
      expect(await repo.getSpeciesIdBySlug('nope')).toBeNull();
      expect(await repo.getFormIdBySlug('nope')).toBeNull();
    });

    it('resolves species id from slug', async () => {
      await seedSpecies(trx);
      expect(await repo.getSpeciesIdBySlug('bulbasaur')).toBe(1);
    });

    it('resolves form id from slug', async () => {
      await seedSpecies(trx);
      await seedForm(trx);
      expect(await repo.getFormIdBySlug('bulbasaur')).toBe(1);
    });
  });

  describe('slug conflict checks', () => {
    it('detects species slug conflict excluding self', async () => {
      await seedSpecies(trx, { id: 1, slug: 'bulbasaur', name: 'Bulbasaur' });
      await seedSpecies(trx, { id: 2, slug: 'ivysaur', name: 'Ivysaur' });

      expect(await repo.checkSpeciesSlugConflict('ivysaur', 1)).toBe(true);
      expect(await repo.checkSpeciesSlugConflict('bulbasaur', 1)).toBe(false);
      expect(await repo.checkSpeciesSlugConflict('nonexistent', 1)).toBe(false);
    });

    it('detects form slug conflict excluding self', async () => {
      await seedSpecies(trx);
      await seedForm(trx, { id: 1, slug: 'bulbasaur' });
      await seedForm(trx, { id: 2, slug: 'bulbasaur-mega', name: 'Bulbasaur', form_name: 'Mega' });

      expect(await repo.checkFormSlugConflict('bulbasaur-mega', 1)).toBe(true);
      expect(await repo.checkFormSlugConflict('bulbasaur', 1)).toBe(false);
      expect(await repo.checkFormSlugConflict('nonexistent', 1)).toBe(false);
    });
  });
});
