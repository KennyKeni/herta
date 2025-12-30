import { slugForPokemon } from '../../../../common/utils/slug';
import type { Seeder } from '../utils';
import { batchInsert, loadJson } from '../utils';

interface ItemJson {
  id: number;
  name: string;
  num: number | null;
  gen: number | null;
  desc: string | null;
  shortDesc: string | null;
  namespaceId: number | null;
  implemented: boolean;
}

interface ItemBoostJson {
  itemId: number;
  statId: number;
  stages: number;
}

interface ItemFlagJson {
  itemId: number;
  flagTypeId: number;
}

interface ItemTagTypeJson {
  id: number;
  name: string;
}

interface ItemTagJson {
  itemId: number;
  tagId: number;
}

interface ItemTagHierarchyJson {
  id: number;
  parentTagId: number;
  childTagId: number;
}

export const itemsSeeder: Seeder = {
  name: 'Items',
  tables: [
    'item_tag_types',
    'items',
    'item_boosts',
    'item_flags',
    'item_tags',
    'item_tag_hierarchy',
  ],

  async seed(db, logger) {
    let total = 0;

    // item_tag_types
    {
      const start = Date.now();
      const data = await loadJson<ItemTagTypeJson[]>('item_tag_types.json');
      const rows = data.map((t) => ({
        id: t.id,
        slug: slugForPokemon(t.name),
        name: t.name,
      }));
      const count = await batchInsert(db, 'item_tag_types', rows);
      logger.table('item_tag_types', count, Date.now() - start);
      total += count;
    }

    // items
    {
      const start = Date.now();
      const data = await loadJson<ItemJson[]>('items.json');
      const rows = data.map((i) => ({
        id: i.id,
        name: i.name,
        num: i.num,
        gen: i.gen,
        desc: i.desc || null,
        short_desc: i.shortDesc || null,
        namespace_id: i.namespaceId,
        implemented: i.implemented,
      }));
      const count = await batchInsert(db, 'items', rows);
      logger.table('items', count, Date.now() - start);
      total += count;
    }

    // item_boosts
    {
      const start = Date.now();
      const data = await loadJson<ItemBoostJson[]>('item_boosts.json');
      const rows = data.map((b) => ({
        item_id: b.itemId,
        stat_id: b.statId,
        stages: b.stages,
      }));
      const count = await batchInsert(db, 'item_boosts', rows);
      logger.table('item_boosts', count, Date.now() - start);
      total += count;
    }

    // item_flags
    {
      const start = Date.now();
      const data = await loadJson<ItemFlagJson[]>('item_flags.json');
      const rows = data.map((f) => ({
        item_id: f.itemId,
        flag_type_id: f.flagTypeId,
      }));
      const count = await batchInsert(db, 'item_flags', rows);
      logger.table('item_flags', count, Date.now() - start);
      total += count;
    }

    // item_tags
    {
      const start = Date.now();
      const data = await loadJson<ItemTagJson[]>('item_tags.json');
      const rows = data.map((t) => ({
        item_id: t.itemId,
        tag_id: t.tagId,
      }));
      const count = await batchInsert(db, 'item_tags', rows);
      logger.table('item_tags', count, Date.now() - start);
      total += count;
    }

    // item_tag_hierarchy
    {
      const start = Date.now();
      const data = await loadJson<ItemTagHierarchyJson[]>('item_tag_hierarchy.json');
      const rows = data.map((h) => ({
        id: h.id,
        parent_tag_id: h.parentTagId,
        child_tag_id: h.childTagId,
      }));
      const count = await batchInsert(db, 'item_tag_hierarchy', rows);
      logger.table('item_tag_hierarchy', count, Date.now() - start);
      total += count;
    }

    return total;
  },
};
