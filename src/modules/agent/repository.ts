// import { DB } from '@/infrastructure/db/types';
// import { Kysely, sql } from 'kysely';
// import { AgentPokemonQuery } from './model';
// import { FormWithSpecies } from '../pokemon/domain';
// import { SqlBool } from 'kysely';
// import { AspectGroup } from '../aspects/domain';

// export class AgentRepository {
//   constructor(private db: Kysely<DB>) {}

//   async searchPokemon(query: AgentPokemonQuery): Promise<FormWithSpecies> {
//     let baseQuery = this.db
//       .selectFrom('forms as f')
//       .innerJoin('species as s', 's.id', 'f.species_id')
//       .selectAll('f')
//       .selectAll('s');

//     if (query.name) {
//       baseQuery = baseQuery
//         .where(sql<SqlBool>`full_name % ${query.name}$`)
//         .orderBy(sql`similiarty(f.fullname, ${query.name})`, 'desc');
//     }

//     if (query.dex) {
//       baseQuery = baseQuery.where('s.id', '=', query.dex);
//     }

//     if (query.generation) {
//       baseQuery = baseQuery.where('generation', '=', query.generation);
//     }

//     // Need fuzzy
//     if (query.types?.length) {
//       baseQuery = baseQuery.where(
//         'f.id',
//         'in',
//         this.db
//           .selectFrom('form_types as ft')
//           .select('ft.form_id')
//           .innerJoin('types as t', 't.id', 'ft.type_id')
//           .where('t.id', 'in', query.types)
//       );
//     }

//     // Need fuzzy
//     if (query.abilities?.length) {
//       baseQuery = baseQuery.where(
//         'f.id',
//         'in',
//         this.db
//           .selectFrom('form_abilities as fa')
//           .select('fa.form_id')
//           .innerJoin('abilities as a', 'a.id', 'fa.ability_id')
//           .where('a.id', 'in', query.abilities)
//       );
//     }

//     // Need fuzzy
//     if (query.moves?.length) {
//       baseQuery = baseQuery.where(
//         'f.id',
//         'in',
//         this.db
//           .selectFrom('form_moves as fm')
//           .select('fm.form_id')
//           .innerJoin('moves as m', 'a.id', 'fm.move_id')
//           .where('m.id', 'in', query.abilities)
//       );
//     }

//     // Need fuzzy
//     if (query.moves?.length) {
//       baseQuery = baseQuery.where(
//         's.id',
//         'in',
//         this.db
//           .selectFrom('species_egg_groups as se')
//           .select('se.egg_group_id')
//           .innerJoin('egg_groups as e', 'e.id', 'se.egg_group_id')
//           .where('e.id', 'in', query.abilities)
//       );
//     }

//     if (query.hp?.gte) baseQuery = baseQuery.where('f.base_hp', '>=', query.hp.gte);
//     if (query.hp?.lte) baseQuery = baseQuery.where('f.base_hp', '<=', query.hp.lte);
//     if (query.attack?.gte) baseQuery = baseQuery.where('f.base_attack', '>=', query.attack.gte);
//     if (query.attack?.lte) baseQuery = baseQuery.where('f.base_attack', '<=', query.attack.lte);
//     if (query.defense?.gte) baseQuery = baseQuery.where('f.base_defence', '>=', query.defense.gte);
//     if (query.defense?.lte) baseQuery = baseQuery.where('f.base_defence', '<=', query.defense.lte);
//     if (query.spAtk?.gte)
//       baseQuery = baseQuery.where('f.base_special_attack', '>=', query.spAtk.gte);
//     if (query.spAtk?.lte)
//       baseQuery = baseQuery.where('f.base_special_attack', '<=', query.spAtk.lte);
//     if (query.spDef?.gte)
//       baseQuery = baseQuery.where('f.base_special_defence', '>=', query.spDef.gte);
//     if (query.spDef?.lte)
//       baseQuery = baseQuery.where('f.base_special_defence', '<=', query.spDef.lte);
//     if (query.speed?.gte) baseQuery = baseQuery.where('f.base_speed', '>=', query.speed.gte);
//     if (query.speed?.lte) baseQuery = baseQuery.where('f.base_speed', '<=', query.speed.lte);
//     if (query.height?.gte) baseQuery = baseQuery.where('f.height', '>=', query.height.gte);
//     if (query.height?.lte) baseQuery = baseQuery.where('f.height', '<=', query.height.lte);
//     if (query.weight?.gte) baseQuery = baseQuery.where('f.weight', '>=', query.weight.gte);
//     if (query.weight?.lte) baseQuery = baseQuery.where('f.weight', '<=', query.weight.lte);
//     if (query.catchRate?.gte)
//       baseQuery = baseQuery.where('s.catch_rate', '>=', query.catchRate.gte);
//     if (query.catchRate?.lte)
//       baseQuery = baseQuery.where('s.catch_rate', '<=', query.catchRate.lte);

//     // Pagination
//     const rows = await baseQuery
//       .limit(query.limit ?? 20)
//       .offset(query.offset ?? 0)
//       .execute();

//     if (rows.length === 0) return [];

//     const formIds = rows.map((r) => r.id);
//     const includes = query.include ?? [];

//     const [types, labels, tags, abilities, moves, drops, dropPercentage, dropRange, aspectCombos] =
//       await Promise.all([
//         this.db
//           .selectFrom('form_types as f')
//           .innerJoin('types as t', 't.id', 'f.type_id')
//           .select(['f.form_id', 'f.slot', 't.id', 't.name', 't.slug'])
//           .where('f.form_id', 'in', formIds),
//         this.db
//           .selectFrom('form_labels as fl')
//           .innerJoin('labels as l', 'l.id', 'fl.label_id')
//           .select(['fl.form_id', 'l.id', 'l.name', 'l.slug'])
//           .where('fl.form_id', 'in', formIds),
//         this.db
//           .selectFrom('form_tags as f')
//           .innerJoin('form_tag_types as ft', 'ft.id', 'f.tag_id')
//           .select(['f.form_id', 'ft.id', 'ft.name', 'ft.slug'])
//           .where('f.form_id', 'in', formIds),
//         includes.includes('abilities')
//           ? this.db
//               .selectFrom('form_abilities as f')
//               .innerJoin('abilities as a', 'a.id', 'f.ability_id')
//               .select(['f.form_id', 'f.slot', 'a.id', 'a.name', 'a.slug'])
//               .where('f.form_id', 'in', formIds)
//           : [],
//         includes.includes('moves')
//           ? this.db
//               .selectFrom('form_moves as f')
//               .innerJoin('moves as m', 'm.id', 'f.move_id')
//               .select(['f.form_id', 'f.method', 'f.level', 'm.id', 'm.name', 'm.slug'])
//               .where('f.form_id', 'in', formIds)
//           : [],
//         includes.includes('drops')
//           ? this.db.selectFrom('form_drops').selectAll().where('form_id', 'in', formIds).execute()
//           : [],
//         includes.includes('drops')
//           ? this.db
//               .selectFrom('drop_percentages as d')
//               .innerJoin('items as i', 'i.id', 'd.item_id')
//               .select(['d.form_id', 'd.percentage', 'i.id', 'i.name', 'i.source'])
//               .where('d.form_id', 'in', formIds)
//           : [],
//         includes.includes('drops')
//           ? this.db
//               .selectFrom('drop_ranges as d')
//               .innerJoin('items as i', 'i.id', 'd.item_id')
//               .select([
//                 'd.form_id',
//                 'd.quantity_min',
//                 'd.quantity_max',
//                 'i.id',
//                 'i.name',
//                 'i.source',
//               ])
//               .where('d.form_id', 'in', formIds)
//           : [],
//         includes.includes('cosmetics')
//           ? this.db
//               .selectFrom('form_aspect_combos as f')
//               .innerJoin('form_aspect_combo_aspects as fa', 'fa.combo_id', 'f.id')
//               .innerJoin('aspect_groups as a', 'a.id', 'fa.aspect_id')
//               .select([
//                 'f.id as combo_id',
//                 'f.form_id',
//                 'f.combo_index',
//                 'a.id as aspect_id',
//                 'a.name as aspect_name',
//               ])
//               .where('f.form_id', 'in', formIds)
//           : [],
//       ]);
//   }
// }
