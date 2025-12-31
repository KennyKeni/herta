import { slugForPokemon } from '@/common/utils/slug';
import type { DB } from '../../types';
import type { Seeder } from '../utils';
import { batchInsert, loadJson } from '../utils';

interface IdName {
  id: number;
  name: string;
}

interface TypeJson {
  id: number;
  name: string;
}

interface MoveCategoryJson {
  id: number;
  name: string;
  description: string;
}

interface MoveTargetJson {
  id: number;
  name: string;
  description: string;
}

interface ConditionJson {
  id: number;
  name: string;
  typeId: number;
  description: string;
}

interface ExperienceGroupJson {
  id: number;
  name: string;
  formula: string;
}

interface FlagTypeJson {
  id: number;
  name: string;
  description: string;
}

interface AspectGroupJson {
  id: number;
  name: string;
  rule: string;
  description: string;
}

interface LabelJson {
  id: number;
  name: string;
}

interface EggGroupJson {
  id: number;
  name: string;
}

interface BiomeJson {
  id: number;
  namespaceId: number;
  name: string;
}

interface BiomeTagJson {
  id: number;
  namespaceId: number;
  name: string;
}

interface BiomeTagBiomeJson {
  biomeId: number;
  biomeTagId: number;
}

export const baseReferenceSeeder: Seeder = {
  name: 'Base Reference Tables',
  tables: [
    'types',
    'stats',
    'move_categories',
    'move_targets',
    'condition_types',
    'conditions',
    'experience_groups',
    'egg_groups',
    'ability_flag_types',
    'move_flag_types',
    'aspect_groups',
    'labels',
    'namespaces',
    'ability_slots',
    'aspect_types',
    'item_flag_types',
    'move_learn_methods',
    'time_ranges',
    'moon_phases',
    'spawn_position_types',
    'spawn_preset_types',
    'spawn_buckets',
    'recipe_types',
    'form_tag_types',
    'recipe_tag_types',
    'biome_tags',
    'biomes',
    'biome_tag_biomes',
  ],

  async seed(db, logger) {
    let total = 0;

    const seedSimple = async (table: keyof DB, file: string) => {
      const start = Date.now();
      const data = await loadJson<IdName[]>(file);
      const rows = data.map((d) => ({ id: d.id, slug: slugForPokemon(d.name), name: d.name }));
      const count = await batchInsert(db, table, rows);
      logger.table(table, count, Date.now() - start);
      return count;
    };

    const seedWithGeneratedSlug = async (table: keyof DB, file: string) => {
      const start = Date.now();
      const data = await loadJson<IdName[]>(file);
      const rows = data.map((d) => ({ id: d.id, slug: slugForPokemon(d.name), name: d.name }));
      const count = await batchInsert(db, table, rows);
      logger.table(table, count, Date.now() - start);
      return count;
    };

    // types
    {
      const start = Date.now();
      const data = await loadJson<TypeJson[]>('types.json');
      const rows = data.map((t) => ({
        id: t.id,
        slug: slugForPokemon(t.name),
        name: t.name,
      }));
      const count = await batchInsert(db, 'types', rows);
      logger.table('types', count, Date.now() - start);
      total += count;
    }

    // stats
    total += await seedSimple('stats', 'stats.json');

    // move_categories
    {
      const start = Date.now();
      const data = await loadJson<MoveCategoryJson[]>('move_categories.json');
      const rows = data.map((c) => ({
        id: c.id,
        slug: slugForPokemon(c.name),
        name: c.name,
        description: c.description,
      }));
      const count = await batchInsert(db, 'move_categories', rows);
      logger.table('move_categories', count, Date.now() - start);
      total += count;
    }

    // move_targets
    {
      const start = Date.now();
      const data = await loadJson<MoveTargetJson[]>('move_targets.json');
      const rows = data.map((t) => ({
        id: t.id,
        slug: slugForPokemon(t.name),
        name: t.name,
        description: t.description,
      }));
      const count = await batchInsert(db, 'move_targets', rows);
      logger.table('move_targets', count, Date.now() - start);
      total += count;
    }

    // condition_types
    total += await seedSimple('condition_types', 'condition_types.json');

    // conditions
    {
      const start = Date.now();
      const data = await loadJson<ConditionJson[]>('conditions.json');
      const rows = data.map((c) => ({
        id: c.id,
        slug: slugForPokemon(c.name),
        name: c.name,
        type_id: c.typeId,
        description: c.description || null,
      }));
      const count = await batchInsert(db, 'conditions', rows);
      logger.table('conditions', count, Date.now() - start);
      total += count;
    }

    // experience_groups
    {
      const start = Date.now();
      const data = await loadJson<ExperienceGroupJson[]>('experience_groups.json');
      const rows = data.map((e) => ({
        id: e.id,
        slug: slugForPokemon(e.name),
        name: e.name,
        formula: e.formula,
      }));
      const count = await batchInsert(db, 'experience_groups', rows);
      logger.table('experience_groups', count, Date.now() - start);
      total += count;
    }

    // egg_groups
    {
      const start = Date.now();
      const data = await loadJson<EggGroupJson[]>('egg_groups.json');
      const rows = data.map((e) => ({
        id: e.id,
        slug: slugForPokemon(e.name),
        name: e.name,
      }));
      const count = await batchInsert(db, 'egg_groups', rows);
      logger.table('egg_groups', count, Date.now() - start);
      total += count;
    }

    // ability_flag_types
    {
      const start = Date.now();
      const data = await loadJson<FlagTypeJson[]>('ability_flag_types.json');
      const rows = data.map((f) => ({
        id: f.id,
        slug: slugForPokemon(f.name),
        name: f.name,
        description: f.description || null,
      }));
      const count = await batchInsert(db, 'ability_flag_types', rows);
      logger.table('ability_flag_types', count, Date.now() - start);
      total += count;
    }

    // move_flag_types
    {
      const start = Date.now();
      const data = await loadJson<FlagTypeJson[]>('move_flag_types.json');
      const rows = data.map((f) => ({
        id: f.id,
        slug: slugForPokemon(f.name),
        name: f.name,
        description: f.description || null,
      }));
      const count = await batchInsert(db, 'move_flag_types', rows);
      logger.table('move_flag_types', count, Date.now() - start);
      total += count;
    }

    // aspect_groups
    {
      const start = Date.now();
      const data = await loadJson<AspectGroupJson[]>('aspect_groups.json');
      const rows = data.map((g) => ({
        id: g.id,
        slug: slugForPokemon(g.name),
        name: g.name,
        rule: g.rule,
        description: g.description || null,
      }));
      const count = await batchInsert(db, 'aspect_groups', rows);
      logger.table('aspect_groups', count, Date.now() - start);
      total += count;
    }

    // labels
    {
      const start = Date.now();
      const data = await loadJson<LabelJson[]>('labels.json');
      const rows = data.map((l) => ({
        id: l.id,
        slug: slugForPokemon(l.name),
        name: l.name,
      }));
      const count = await batchInsert(db, 'labels', rows);
      logger.table('labels', count, Date.now() - start);
      total += count;
    }

    // New lookup tables
    total += await seedSimple('namespaces', 'namespaces.json');
    total += await seedSimple('ability_slots', 'ability_slots.json');
    total += await seedSimple('aspect_types', 'aspect_types.json');
    total += await seedSimple('item_flag_types', 'item_flag_types.json');
    total += await seedSimple('move_learn_methods', 'move_learn_methods.json');
    total += await seedSimple('time_ranges', 'time_ranges.json');
    total += await seedSimple('moon_phases', 'moon_phases.json');
    total += await seedSimple('spawn_position_types', 'spawn_position_types.json');
    total += await seedSimple('spawn_preset_types', 'spawn_preset_types.json');
    total += await seedWithGeneratedSlug('spawn_buckets', 'spawn_buckets.json');
    total += await seedSimple('spawn_condition_types', 'spawn_condition_types.json');
    total += await seedSimple('recipe_types', 'recipe_types.json');
    total += await seedWithGeneratedSlug('form_tag_types', 'form_tag_types.json');
    total += await seedWithGeneratedSlug('recipe_tag_types', 'recipe_tag_types.json');

    // biome_tags (need namespace lookup for unique slugs)
    const namespaces = await loadJson<IdName[]>('namespaces.json');
    const nsMap = new Map(namespaces.map((n) => [n.id, slugForPokemon(n.name)]));

    {
      const start = Date.now();
      const data = await loadJson<BiomeTagJson[]>('biome_tags.json');
      const rows = data.map((b) => ({
        id: b.id,
        slug: `${nsMap.get(b.namespaceId) ?? 'unknown'}-${slugForPokemon(b.name)}`,
        namespace_id: b.namespaceId,
        name: b.name,
      }));
      const count = await batchInsert(db, 'biome_tags', rows);
      logger.table('biome_tags', count, Date.now() - start);
      total += count;
    }

    // biomes
    {
      const start = Date.now();
      const data = await loadJson<BiomeJson[]>('biomes.json');
      const rows = data.map((b) => ({
        id: b.id,
        slug: `${nsMap.get(b.namespaceId) ?? 'unknown'}-${slugForPokemon(b.name)}`,
        namespace_id: b.namespaceId,
        name: b.name,
      }));
      const count = await batchInsert(db, 'biomes', rows);
      logger.table('biomes', count, Date.now() - start);
      total += count;
    }

    // biome_tag_biomes
    {
      const start = Date.now();
      const data = await loadJson<BiomeTagBiomeJson[]>('biome_tag_biomes.json');
      const rows = data.map((b) => ({
        biome_id: b.biomeId,
        biome_tag_id: b.biomeTagId,
      }));
      const count = await batchInsert(db, 'biome_tag_biomes', rows);
      logger.table('biome_tag_biomes', count, Date.now() - start);
      total += count;
    }

    return total;
  },
};
