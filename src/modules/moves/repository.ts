import { type Kysely, sql } from 'kysely';
import type { DB } from '@/infrastructure/db/types';
import type { Move } from './domain';

export class MovesRepository {
  constructor(private db: Kysely<DB>) {}

  async getByIdentifier(identifier: string): Promise<Move | null> {
    const isId = /^\d+$/.test(identifier);

    const row = await this.db
      .selectFrom('moves')
      .innerJoin('types', 'types.id', 'moves.type_id')
      .innerJoin('move_categories', 'move_categories.id', 'moves.category_id')
      .leftJoin('move_targets', 'move_targets.id', 'moves.target_id')
      .leftJoin('move_z_data', 'move_z_data.move_id', 'moves.id')
      .select([
        'moves.id',
        'moves.name',
        'moves.slug',
        'moves.desc',
        'moves.short_desc',
        'moves.power',
        'moves.accuracy',
        'moves.pp',
        'moves.priority',
        'moves.crit_ratio',
        'moves.min_hits',
        'moves.max_hits',
        'moves.drain_percent',
        'moves.heal_percent',
        'moves.recoil_percent',
        'types.id as type_id',
        'types.name as type_name',
        'types.slug as type_slug',
        'move_categories.id as category_id',
        'move_categories.name as category_name',
        'move_categories.description as category_description',
        'move_targets.id as target_id',
        'move_targets.name as target_name',
        'move_targets.slug as target_slug',
        'move_targets.description as target_description',
        'move_z_data.z_power',
        'move_z_data.z_effect',
        'move_z_data.z_crystal',
        'move_z_data.is_z_exclusive',
      ])
      .where(isId ? 'moves.id' : 'moves.slug', '=', isId ? Number(identifier) : identifier)
      .executeTakeFirst();

    if (!row) return null;

    const [flags, boosts, effects, maxPower] = await Promise.all([
      this.db
        .selectFrom('move_flags')
        .innerJoin('move_flag_types', 'move_flag_types.id', 'move_flags.flag_id')
        .select([
          'move_flag_types.id',
          'move_flag_types.name',
          'move_flag_types.slug',
          'move_flag_types.description',
        ])
        .where('move_flags.move_id', '=', row.id)
        .execute(),

      this.db
        .selectFrom('move_boosts')
        .innerJoin('stats', 'stats.id', 'move_boosts.stat_id')
        .select([
          'stats.id as stat_id',
          'stats.name as stat_name',
          'move_boosts.stages',
          'move_boosts.is_self',
        ])
        .where('move_boosts.move_id', '=', row.id)
        .execute(),

      this.db
        .selectFrom('move_effects')
        .innerJoin('effect_types', 'effect_types.id', 'move_effects.effect_type_id')
        .leftJoin('conditions', 'conditions.id', 'move_effects.condition_id')
        .select([
          'effect_types.id as effect_type_id',
          'effect_types.name as effect_type_name',
          'conditions.id as condition_id',
          'conditions.name as condition_name',
          'conditions.type as condition_type',
          'conditions.description as condition_description',
          'move_effects.chance',
          'move_effects.is_self',
        ])
        .where('move_effects.move_id', '=', row.id)
        .execute(),

      this.db
        .selectFrom('move_max_power')
        .select('max_power')
        .where('move_id', '=', row.id)
        .executeTakeFirst(),
    ]);

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      desc: row.desc,
      shortDesc: row.short_desc,
      type: { id: row.type_id, name: row.type_name, slug: row.type_slug },
      category: {
        id: row.category_id,
        name: row.category_name,
        description: row.category_description,
      },
      target: row.target_id
        ? {
            id: row.target_id,
            name: row.target_name!,
            slug: row.target_slug!,
            description: row.target_description,
          }
        : null,
      power: row.power,
      accuracy: row.accuracy,
      pp: row.pp,
      priority: row.priority,
      critRatio: row.crit_ratio,
      minHits: row.min_hits,
      maxHits: row.max_hits,
      drainPercent: row.drain_percent,
      healPercent: row.heal_percent,
      recoilPercent: row.recoil_percent,
      flags,
      boosts: boosts.map((b) => ({
        stat: { id: b.stat_id, name: b.stat_name },
        stages: b.stages,
        isSelf: b.is_self,
      })),
      effects: effects.map((e) => ({
        effectType: { id: e.effect_type_id, name: e.effect_type_name },
        condition: e.condition_id
          ? {
              id: e.condition_id,
              name: e.condition_name!,
              type: e.condition_type!,
              description: e.condition_description,
            }
          : null,
        chance: e.chance,
        isSelf: e.is_self,
      })),
      maxPower: maxPower?.max_power ?? null,
      zData:
        row.z_power != null || row.z_effect != null
          ? {
              zPower: row.z_power,
              zEffect: row.z_effect,
              zCrystal: row.z_crystal,
              isZExclusive: row.is_z_exclusive ?? false,
            }
          : null,
    };
  }

  async fuzzyResolve(names: string[]): Promise<number[]> {
    if (!names.length) return [];

    const results = await Promise.all(
      names.map((name) =>
        this.db
          .selectFrom('moves')
          .select(['id'])
          .where(sql<boolean>`name % ${name}`)
          .orderBy(sql`similarity(name, ${name})`, 'desc')
          .limit(1)
          .executeTakeFirst()
      )
    );

    return results.filter((r): r is { id: number } => r != null).map((r) => r.id);
  }
}
