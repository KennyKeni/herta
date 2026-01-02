import { type Kysely, sql } from 'kysely';
import { createFuzzyMatcher, type FuzzyMatchOptions, type FuzzyMatchResult } from '@/common/fuzzy';
import { FilterLogic } from '@/common/types';
import type { DB } from '@/infrastructure/db/types';
import type { Spawn } from '../spawns/domain';
import { SpawnRepository } from '../spawns/repository';
import type {
  AspectRef,
  DropPercentage,
  DropRange,
  Form,
  FormAspectCombo,
  FormDrops,
  IncludeOptions,
  PokemonFilter,
  Species,
  SpeciesWithForm,
  SpeciesWithForms,
} from './domain';

export class PokemonRepository {
  private spawnRepository: SpawnRepository;

  constructor(private db: Kysely<DB>) {
    this.spawnRepository = new SpawnRepository(db);
  }

  async getByIdentifier(
    identifier: string,
    options: IncludeOptions = {}
  ): Promise<SpeciesWithForms | null> {
    const isId = /^\d+$/.test(identifier);

    const rows = await this.db
      .selectFrom('forms as f')
      .innerJoin('species as s', 's.id', 'f.species_id')
      .leftJoin('form_overrides as fo', 'fo.form_id', 'f.id')
      .select([
        'f.id as form_id',
        'f.slug as form_slug',
        'f.name as form_name',
        'f.form_name as form_full_name',
        'f.description as form_description',
        'f.generation as form_generation',
        'f.species_id',
        'f.height',
        'f.weight',
        'f.base_hp',
        'f.base_attack',
        'f.base_defence',
        'f.base_special_attack',
        'f.base_special_defence',
        'f.base_speed',
        'f.base_experience_yield',
        'f.ev_hp',
        'f.ev_attack',
        'f.ev_defence',
        'f.ev_special_attack',
        'f.ev_special_defence',
        'f.ev_speed',
        's.id as species_id',
        's.slug as species_slug',
        's.name as species_name',
        's.description as species_description',
        's.generation as species_generation',
        's.experience_group_id',
      ])
      .select(sql<number>`COALESCE(fo.catch_rate, s.catch_rate)`.as('catch_rate'))
      .select(sql<number>`COALESCE(fo.base_friendship, s.base_friendship)`.as('base_friendship'))
      .select(sql<number>`COALESCE(fo.egg_cycles, s.egg_cycles)`.as('egg_cycles'))
      .select(sql<number | null>`COALESCE(fo.male_ratio, s.male_ratio)`.as('male_ratio'))
      .select(sql<number | null>`COALESCE(fo.base_scale, s.base_scale)`.as('base_scale'))
      .where(isId ? 's.id' : 's.slug', '=', isId ? Number(identifier) : identifier)
      .execute();

    if (rows.length === 0) return null;

    const formIds = rows.map((r) => r.form_id);
    const speciesIds = [rows[0].species_id];
    const experienceGroupIds = rows[0].experience_group_id ? [rows[0].experience_group_id] : [];

    const relations = await this.fetchRelations(formIds, speciesIds, experienceGroupIds, options);

    return this.assembleResults(rows, relations)[0] ?? null;
  }

  async getFormByIdentifier(
    identifier: string,
    options: IncludeOptions = {}
  ): Promise<SpeciesWithForm | null> {
    const isId = /^\d+$/.test(identifier);

    const row = await this.db
      .selectFrom('forms as f')
      .innerJoin('species as s', 's.id', 'f.species_id')
      .leftJoin('form_overrides as fo', 'fo.form_id', 'f.id')
      .select([
        'f.id as form_id',
        'f.slug as form_slug',
        'f.name as form_name',
        'f.form_name as form_full_name',
        'f.description as form_description',
        'f.generation as form_generation',
        'f.species_id',
        'f.height',
        'f.weight',
        'f.base_hp',
        'f.base_attack',
        'f.base_defence',
        'f.base_special_attack',
        'f.base_special_defence',
        'f.base_speed',
        'f.base_experience_yield',
        'f.ev_hp',
        'f.ev_attack',
        'f.ev_defence',
        'f.ev_special_attack',
        'f.ev_special_defence',
        'f.ev_speed',
        's.id as species_id',
        's.slug as species_slug',
        's.name as species_name',
        's.description as species_description',
        's.generation as species_generation',
        's.experience_group_id',
      ])
      .select(sql<number>`COALESCE(fo.catch_rate, s.catch_rate)`.as('catch_rate'))
      .select(sql<number>`COALESCE(fo.base_friendship, s.base_friendship)`.as('base_friendship'))
      .select(sql<number>`COALESCE(fo.egg_cycles, s.egg_cycles)`.as('egg_cycles'))
      .select(sql<number | null>`COALESCE(fo.male_ratio, s.male_ratio)`.as('male_ratio'))
      .select(sql<number | null>`COALESCE(fo.base_scale, s.base_scale)`.as('base_scale'))
      .where(isId ? 'f.id' : 'f.slug', '=', isId ? Number(identifier) : identifier)
      .executeTakeFirst();

    if (!row) return null;

    const formIds = [row.form_id];
    const speciesIds = [row.species_id];
    const experienceGroupIds = row.experience_group_id ? [row.experience_group_id] : [];

    const relations = await this.fetchRelations(formIds, speciesIds, experienceGroupIds, options);

    const species = this.toSpeciesOnly(row, relations);
    const form = this.toForm(row, relations);

    return { ...species, form };
  }

  async searchPokemon(filters: PokemonFilter): Promise<SpeciesWithForms[]> {
    const rows = await this.buildSearchQuery(filters)
      .limit(filters.limit ?? 20)
      .offset(filters.offset ?? 0)
      .execute();

    if (rows.length === 0) return [];

    const formIds = rows.map((r) => r.form_id);
    const speciesIds = [...new Set(rows.map((r) => r.species_id))];
    const experienceGroupIds = [
      ...new Set(rows.map((r) => r.experience_group_id).filter((id): id is number => id != null)),
    ];

    const relations = await this.fetchRelations(formIds, speciesIds, experienceGroupIds, filters);
    return this.assembleResults(rows, relations);
  }

  async searchBySpecies(filters: PokemonFilter): Promise<SpeciesWithForms[]> {
    const speciesIdsQuery = this.buildSearchQuery(filters)
      .select('f.species_id')
      .distinctOn('f.species_id')
      .orderBy('f.species_id')
      .limit(filters.limit ?? 20)
      .offset(filters.offset ?? 0);

    const speciesRows = await speciesIdsQuery.execute();
    if (speciesRows.length === 0) return [];

    const targetSpeciesIds = speciesRows.map((r) => r.species_id);

    const rows = await this.buildSearchQuery(filters)
      .where('f.species_id', 'in', targetSpeciesIds)
      .orderBy('f.species_id')
      .execute();

    if (rows.length === 0) return [];

    const formIds = rows.map((r) => r.form_id);
    const speciesIds = [...new Set(rows.map((r) => r.species_id))];
    const experienceGroupIds = [
      ...new Set(rows.map((r) => r.experience_group_id).filter((id): id is number => id != null)),
    ];

    const relations = await this.fetchRelations(formIds, speciesIds, experienceGroupIds, filters);
    return this.assembleResults(rows, relations);
  }

  async fuzzyResolveSpecies(names: string[]): Promise<string[]> {
    if (!names.length) return [];

    const results = await Promise.all(
      names.map((name) =>
        this.db
          .selectFrom('species')
          .select(['slug'])
          .where(sql<boolean>`name % ${name}`)
          .orderBy(sql`similarity(name, ${name})`, 'desc')
          .limit(1)
          .executeTakeFirst()
      )
    );

    return results.filter((r): r is { slug: string } => r != null).map((r) => r.slug);
  }

  async fuzzyResolveForms(names: string[]): Promise<string[]> {
    if (!names.length) return [];

    const results = await Promise.all(
      names.map((name) =>
        this.db
          .selectFrom('forms')
          .select(['slug'])
          .where(sql<boolean>`name % ${name}`)
          .orderBy(sql`similarity(name, ${name})`, 'desc')
          .limit(1)
          .executeTakeFirst()
      )
    );

    return results.filter((r): r is { slug: string } => r != null).map((r) => r.slug);
  }

  async fuzzyResolveEggGroups(names: string[]): Promise<number[]> {
    if (!names.length) return [];

    const results = await Promise.all(
      names.map((name) =>
        this.db
          .selectFrom('egg_groups')
          .select(['id'])
          .where(sql<boolean>`name % ${name}`)
          .orderBy(sql`similarity(name, ${name})`, 'desc')
          .limit(1)
          .executeTakeFirst()
      )
    );

    return results.filter((r): r is { id: number } => r != null).map((r) => r.id);
  }

  async fuzzyResolveLabels(names: string[]): Promise<number[]> {
    if (!names.length) return [];

    const results = await Promise.all(
      names.map((name) =>
        this.db
          .selectFrom('labels')
          .select(['id'])
          .where(sql<boolean>`name % ${name}`)
          .orderBy(sql`similarity(name, ${name})`, 'desc')
          .limit(1)
          .executeTakeFirst()
      )
    );

    return results.filter((r): r is { id: number } => r != null).map((r) => r.id);
  }

  async fuzzyMatchSpecies(
    query: string,
    options?: FuzzyMatchOptions
  ): Promise<FuzzyMatchResult<string>[]> {
    return createFuzzyMatcher<string>(this.db, {
      table: 'species',
      matchColumn: 'name',
      idColumn: 'slug',
    })(query, options);
  }

  async fuzzyMatchForms(
    query: string,
    options?: FuzzyMatchOptions
  ): Promise<FuzzyMatchResult<string>[]> {
    return createFuzzyMatcher<string>(this.db, {
      table: 'forms',
      matchColumn: 'name',
      idColumn: 'slug',
    })(query, options);
  }

  async fuzzyMatchEggGroups(
    query: string,
    options?: FuzzyMatchOptions
  ): Promise<FuzzyMatchResult[]> {
    return createFuzzyMatcher(this.db, {
      table: 'egg_groups',
      matchColumn: 'name',
      idColumn: 'id',
    })(query, options);
  }

  async fuzzyMatchLabels(query: string, options?: FuzzyMatchOptions): Promise<FuzzyMatchResult[]> {
    return createFuzzyMatcher(this.db, {
      table: 'labels',
      matchColumn: 'name',
      idColumn: 'id',
    })(query, options);
  }

  private buildSearchQuery(filter: PokemonFilter) {
    let query = this.db
      .selectFrom('forms as f')
      .innerJoin('species as s', 's.id', 'f.species_id')
      .leftJoin('form_overrides as fo', 'fo.form_id', 'f.id')
      .select([
        'f.id as form_id',
        'f.slug as form_slug',
        'f.name as form_name',
        'f.form_name as form_full_name',
        'f.description as form_description',
        'f.generation as form_generation',
        'f.species_id',
        'f.height',
        'f.weight',
        'f.base_hp',
        'f.base_attack',
        'f.base_defence',
        'f.base_special_attack',
        'f.base_special_defence',
        'f.base_speed',
        'f.base_experience_yield',
        'f.ev_hp',
        'f.ev_attack',
        'f.ev_defence',
        'f.ev_special_attack',
        'f.ev_special_defence',
        'f.ev_speed',
        's.id as species_id',
        's.slug as species_slug',
        's.name as species_name',
        's.description as species_description',
        's.generation as species_generation',
        's.experience_group_id',
      ])
      .select(sql<number>`COALESCE(fo.catch_rate, s.catch_rate)`.as('catch_rate'))
      .select(sql<number>`COALESCE(fo.base_friendship, s.base_friendship)`.as('base_friendship'))
      .select(sql<number>`COALESCE(fo.egg_cycles, s.egg_cycles)`.as('egg_cycles'))
      .select(sql<number | null>`COALESCE(fo.male_ratio, s.male_ratio)`.as('male_ratio'))
      .select(sql<number | null>`COALESCE(fo.base_scale, s.base_scale)`.as('base_scale'));
    if (filter.formIds?.length) query = query.where('f.id', 'in', filter.formIds);
    if (filter.formSlugs?.length) query = query.where('f.slug', 'in', filter.formSlugs);
    if (filter.typeIds?.length || filter.typeSlugs?.length) {
      query = query.where('f.id', 'in', this.typeSubquery(filter.typeIds, filter.typeSlugs));
    }
    if (filter.abilityIds?.length || filter.abilitySlugs?.length) {
      query = query.where(
        'f.id',
        'in',
        this.abilitySubquery(filter.abilityIds, filter.abilitySlugs)
      );
    }
    if (filter.moveIds?.length || filter.moveSlugs?.length) {
      query = query.where('f.id', 'in', this.movesSubquery(filter.moveIds, filter.moveSlugs));
    }
    if (filter.labelIds?.length || filter.labelSlugs?.length) {
      query = query.where('f.id', 'in', this.labelsSubquery(filter.labelIds, filter.labelSlugs));
    }
    if (filter.labelIds?.length || filter.labelSlugs?.length) {
      query = query.where('f.id', 'in', this.labelsSubquery(filter.labelIds, filter.labelSlugs));
    }
    if (filter.eggGroupIds?.length || filter.eggGroupSlugs?.length) {
      query = query.where(
        's.id',
        'in',
        this.eggGroupSubquery(filter.eggGroupIds, filter.eggGroupSlugs)
      );
    }
    if (filter.biomeIds?.length || filter.biomeSlugs?.length) {
      query = query.where('f.id', 'in', this.biomeSubquery(filter.biomeIds, filter.biomeSlugs));
    }
    if (filter.biomeTagIds?.length || filter.biomeTagSlugs?.length) {
      query = query.where(
        'f.id',
        'in',
        this.biomeTagSubquery(filter.biomeTagIds, filter.biomeTagSlugs)
      );
    }
    if (filter.spawnBucketIds?.length || filter.spawnBucketSlugs?.length) {
      query = query.where(
        'f.id',
        'in',
        this.spawnBucketSubquery(filter.spawnBucketIds, filter.spawnBucketSlugs)
      );
    }
    if (filter.dropItemIds?.length || filter.dropItemSlugs?.length) {
      query = query.where(
        'f.id',
        'in',
        this.dropItemSubquery(filter.dropItemIds, filter.dropItemSlugs)
      );
    }

    return query;
  }

  private typeSubquery(
    idFilter?: number[],
    slugFilter?: string[],
    _filter: FilterLogic = FilterLogic.OR
  ) {
    return this.db
      .selectFrom('form_types as ft')
      .innerJoin('types as t', 't.id', 'ft.type_id')
      .select('ft.form_id')
      .where((eb) => {
        const conditions = [];

        if (idFilter?.length) {
          conditions.push(eb('t.id', 'in', idFilter));
        }
        if (slugFilter?.length) {
          conditions.push(eb('t.slug', 'in', slugFilter));
        }

        return conditions.length ? eb.or(conditions) : eb.lit(true);
      });
  }

  private abilitySubquery(
    idFilter?: number[],
    slugFilter?: string[],
    _filter: FilterLogic = FilterLogic.OR
  ) {
    return this.db
      .selectFrom('form_abilities as fa')
      .select('fa.form_id')
      .innerJoin('abilities as a', 'a.id', 'fa.ability_id')
      .where((eb) => {
        const conditions = [];

        if (idFilter?.length) {
          conditions.push(eb('a.id', 'in', idFilter));
        }
        if (slugFilter?.length) {
          conditions.push(eb('a.slug', 'in', slugFilter));
        }

        return conditions.length ? eb.or(conditions) : eb.lit(true);
      });
  }

  private movesSubquery(
    idFilter?: number[],
    slugFilter?: string[],
    _filter: FilterLogic = FilterLogic.OR
  ) {
    return this.db
      .selectFrom('form_moves as fm')
      .innerJoin('moves as m', 'm.id', 'fm.move_id')
      .select('fm.form_id')
      .where((eb) => {
        const conditions = [];

        if (idFilter?.length) {
          conditions.push(eb('m.id', 'in', idFilter));
        }
        if (slugFilter?.length) {
          conditions.push(eb('m.slug', 'in', slugFilter));
        }

        return conditions.length ? eb.or(conditions) : eb.lit(true);
      });
  }

  private labelsSubquery(
    idFilter?: number[],
    slugFilter?: string[],
    _filter: FilterLogic = FilterLogic.OR
  ) {
    return this.db
      .selectFrom('form_labels as fl')
      .innerJoin('labels as l', 'l.id', 'fl.label_id')
      .select('fl.form_id')
      .where((eb) => {
        const conditions = [];

        if (idFilter?.length) {
          conditions.push(eb('l.id', 'in', idFilter));
        }
        if (slugFilter?.length) {
          conditions.push(eb('l.slug', 'in', slugFilter));
        }

        return conditions.length ? eb.or(conditions) : eb.lit(true);
      });
  }

  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: future implementation
  private aspectChoicesSubquery(
    idFilter?: number[],
    valueFilter?: string[],
    _filter: FilterLogic = FilterLogic.OR
  ) {
    return this.db
      .selectFrom('form_aspects as fa')
      .innerJoin('aspect_choices as fc', 'fc.id', 'fa.aspect_choice_id')
      .select('fa.form_id')
      .where((eb) => {
        const conditions = [];

        if (idFilter?.length) {
          conditions.push(eb('fc.id', 'in', idFilter));
        }
        if (valueFilter?.length) {
          conditions.push(eb('fc.value', 'in', valueFilter));
        }

        return conditions.length ? eb.or(conditions) : eb.lit(true);
      });
  }

  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: future implementation
  private aspectComboSubquery(
    idFilter?: number[],
    slugFilter?: string[],
    _filter: FilterLogic = FilterLogic.OR
  ) {
    return this.db
      .selectFrom('form_aspect_combos as fc')
      .innerJoin('form_aspect_combo_aspects as fa', 'fa.combo_id', 'fc.id')
      .innerJoin('aspects as a', 'a.id', 'fa.aspect_id')
      .select('fc.form_id')
      .where((eb) => {
        const conditions = [];

        if (idFilter?.length) {
          conditions.push(eb('a.id', 'in', idFilter));
        }
        if (slugFilter?.length) {
          conditions.push(eb('a.slug', 'in', slugFilter));
        }

        return conditions.length ? eb.or(conditions) : eb.lit(true);
      });
  }

  private eggGroupSubquery(idFilter?: number[], slugFilter?: string[], _filter = FilterLogic.OR) {
    return this.db
      .selectFrom('species_egg_groups as seg')
      .select('seg.species_id')
      .innerJoin('egg_groups as eg', 'eg.id', 'seg.egg_group_id')
      .where((eb) => {
        const conditions = [];

        if (idFilter?.length) {
          conditions.push(eb('eg.id', 'in', idFilter));
        }
        if (slugFilter?.length) {
          conditions.push(eb('eg.slug', 'in', slugFilter));
        }
        return conditions.length ? eb.or(conditions) : eb.lit(true);
      });
  }

  private biomeSubquery(idFilter?: number[], slugFilter?: string[]) {
    return this.db
      .selectFrom('spawns as sp')
      .innerJoin('spawn_conditions as sc', 'sc.spawn_id', 'sp.id')
      .innerJoin('spawn_condition_biomes as scb', 'scb.condition_id', 'sc.id')
      .innerJoin('biomes as b', 'b.id', 'scb.biome_id')
      .select('sp.form_id')
      .where((eb) => {
        const conditions = [];
        if (idFilter?.length) {
          conditions.push(eb('b.id', 'in', idFilter));
        }
        if (slugFilter?.length) {
          conditions.push(eb('b.slug', 'in', slugFilter));
        }
        return conditions.length ? eb.or(conditions) : eb.lit(true);
      });
  }

  private biomeTagSubquery(idFilter?: number[], slugFilter?: string[]) {
    return this.db
      .selectFrom('spawns as sp')
      .innerJoin('spawn_conditions as sc', 'sc.spawn_id', 'sp.id')
      .innerJoin('spawn_condition_biome_tags as scbt', 'scbt.condition_id', 'sc.id')
      .innerJoin('biome_tags as bt', 'bt.id', 'scbt.biome_tag_id')
      .select('sp.form_id')
      .where((eb) => {
        const conditions = [];
        if (idFilter?.length) {
          conditions.push(eb('bt.id', 'in', idFilter));
        }
        if (slugFilter?.length) {
          conditions.push(eb('bt.slug', 'in', slugFilter));
        }
        return conditions.length ? eb.or(conditions) : eb.lit(true);
      });
  }

  private spawnBucketSubquery(idFilter?: number[], slugFilter?: string[]) {
    return this.db
      .selectFrom('spawns as sp')
      .innerJoin('spawn_buckets as sb', 'sb.id', 'sp.bucket_id')
      .select('sp.form_id')
      .where((eb) => {
        const conditions = [];
        if (idFilter?.length) {
          conditions.push(eb('sb.id', 'in', idFilter));
        }
        if (slugFilter?.length) {
          conditions.push(eb('sb.slug', 'in', slugFilter));
        }
        return conditions.length ? eb.or(conditions) : eb.lit(true);
      });
  }

  private dropItemSubquery(idFilter?: number[], slugFilter?: string[]) {
    return this.db
      .selectFrom('form_drops as fd')
      .leftJoin('drop_percentages as dp', 'dp.form_id', 'fd.form_id')
      .leftJoin('drop_ranges as dr', 'dr.form_id', 'fd.form_id')
      .leftJoin('items as ip', 'ip.id', 'dp.item_id')
      .leftJoin('items as ir', 'ir.id', 'dr.item_id')
      .select('fd.form_id')
      .where((eb) => {
        const conditions = [];
        if (idFilter?.length) {
          conditions.push(eb('ip.id', 'in', idFilter));
          conditions.push(eb('ir.id', 'in', idFilter));
        }
        if (slugFilter?.length) {
          conditions.push(eb('ip.slug', 'in', slugFilter));
          conditions.push(eb('ir.slug', 'in', slugFilter));
        }
        return conditions.length ? eb.or(conditions) : eb.lit(true);
      });
  }

  private async fetchRelations(
    formIds: number[],
    speciesIds: number[],
    experienceGroupIds: number[],
    options: IncludeOptions = {}
  ) {
    const [
      types,
      abilities,
      moves,
      labels,
      aspectChoices,
      aspectCombos,
      drops,
      eggGroups,
      experienceGroups,
      speciesHitboxes,
      speciesLighting,
      speciesRiding,
      formHitboxes,
      behaviour,
      spawns,
    ] = await Promise.all([
      this.fetchTypes(options.includeTypes !== false ? formIds : []),
      this.fetchAbilities(options.includeAbilities !== false ? formIds : []),
      this.fetchMoves(options.includeMoves !== false ? formIds : []),
      this.fetchLabels(options.includeLabels !== false ? formIds : []),
      this.fetchAspectChoices(options.includeAspects !== false ? formIds : []),
      this.fetchAspectCombos(options.includeAspects !== false ? formIds : []),
      this.fetchDrops(options.includeDrops !== false ? formIds : []),
      this.fetchEggGroups(options.includeEggGroups !== false ? speciesIds : []),
      this.fetchExperienceGroups(
        options.includeExperienceGroup !== false ? experienceGroupIds : []
      ),
      this.fetchSpeciesHitboxes(options.includeHitboxes !== false ? speciesIds : []),
      this.fetchSpeciesLighting(options.includeLighting !== false ? speciesIds : []),
      this.fetchSpeciesRiding(options.includeRiding !== false ? speciesIds : []),
      this.fetchFormHitboxes(options.includeHitboxes !== false ? formIds : []),
      this.fetchBehaviour(options.includeBehaviour !== false ? formIds : []),
      options.includeSpawns !== false
        ? this.spawnRepository.findByFormIds(formIds)
        : Promise.resolve(new Map<number, Spawn[]>()),
    ]);

    return {
      types: this.groupBy(types, 'form_id'),
      abilities: this.groupBy(abilities, 'form_id'),
      moves: this.groupBy(moves, 'form_id'),
      labels: this.groupBy(labels, 'form_id'),
      aspectChoices: this.groupBy(aspectChoices, 'form_id'),
      aspectCombos: this.groupBy(aspectCombos, 'form_id'),
      drops: this.groupBy(drops, 'form_id'),
      eggGroups: this.groupBy(eggGroups, 'species_id'),
      experienceGroups: new Map(experienceGroups.map((eg) => [eg.id, eg])),
      speciesHitboxes: new Map(speciesHitboxes.map((h) => [h.species_id, h])),
      speciesLighting: new Map(speciesLighting.map((l) => [l.species_id, l])),
      speciesRiding: new Map(speciesRiding.map((r) => [r.species_id, r])),
      formHitboxes: new Map(formHitboxes.map((h) => [h.form_id, h])),
      behaviour: new Map(behaviour.map((b) => [b.form_id, b])),
      spawns,
    };
  }

  private fetchTypes(formIds: number[]) {
    if (!formIds.length)
      return Promise.resolve(
        [] as { form_id: number; slot: number; id: number; name: string; slug: string }[]
      );
    return this.db
      .selectFrom('form_types as ft')
      .innerJoin('types as t', 't.id', 'ft.type_id')
      .select(['ft.form_id', 'ft.slot', 't.id', 't.name', 't.slug'])
      .where('ft.form_id', 'in', formIds)
      .execute();
  }

  private fetchAbilities(formIds: number[]) {
    if (!formIds.length)
      return Promise.resolve(
        [] as {
          form_id: number;
          slot_id: number;
          slot_slug: string;
          slot_name: string;
          id: number;
          name: string;
          slug: string;
        }[]
      );
    return this.db
      .selectFrom('form_abilities as fa')
      .innerJoin('abilities as a', 'a.id', 'fa.ability_id')
      .innerJoin('ability_slots as s', 's.id', 'fa.slot_id')
      .select([
        'fa.form_id',
        'fa.slot_id',
        's.slug as slot_slug',
        's.name as slot_name',
        'a.id',
        'a.name',
        'a.slug',
      ])
      .where('fa.form_id', 'in', formIds)
      .execute();
  }

  private fetchMoves(formIds: number[]) {
    if (!formIds.length)
      return Promise.resolve(
        [] as {
          form_id: number;
          method_id: number;
          method_slug: string;
          method_name: string;
          level: number | null;
          id: number;
          name: string;
          slug: string;
        }[]
      );
    return this.db
      .selectFrom('form_moves as fm')
      .innerJoin('moves as m', 'm.id', 'fm.move_id')
      .innerJoin('move_learn_methods as mlm', 'mlm.id', 'fm.method_id')
      .select([
        'fm.form_id',
        'fm.method_id',
        'mlm.slug as method_slug',
        'mlm.name as method_name',
        'fm.level',
        'm.id',
        'm.name',
        'm.slug',
      ])
      .where('fm.form_id', 'in', formIds)
      .execute();
  }

  private fetchLabels(formIds: number[]) {
    if (!formIds.length)
      return Promise.resolve([] as { form_id: number; id: number; name: string; slug: string }[]);
    return this.db
      .selectFrom('form_labels as fl')
      .innerJoin('labels as l', 'l.id', 'fl.label_id')
      .select(['fl.form_id', 'l.id', 'l.name', 'l.slug'])
      .where('fl.form_id', 'in', formIds)
      .execute();
  }

  private fetchAspectChoices(formIds: number[]) {
    if (!formIds.length)
      return Promise.resolve(
        [] as { form_id: number; id: number; slug: string; name: string; value: string }[]
      );
    return this.db
      .selectFrom('form_aspects as fa')
      .innerJoin('aspect_choices as ac', 'ac.id', 'fa.aspect_choice_id')
      .select(['fa.form_id', 'ac.id', 'ac.slug', 'ac.name', 'ac.value'])
      .where('fa.form_id', 'in', formIds)
      .execute();
  }

  private fetchAspectCombos(formIds: number[]) {
    if (!formIds.length)
      return Promise.resolve(
        [] as {
          form_id: number;
          combo_id: number;
          combo_index: number;
          aspect_id: number;
          aspect_name: string;
          aspect_slug: string;
        }[]
      );
    return this.db
      .selectFrom('form_aspect_combos as fac')
      .innerJoin('form_aspect_combo_aspects as faca', 'faca.combo_id', 'fac.id')
      .innerJoin('aspects as a', 'a.id', 'faca.aspect_id')
      .select([
        'fac.form_id',
        'fac.id as combo_id',
        'fac.combo_index',
        'a.id as aspect_id',
        'a.name as aspect_name',
        'a.slug as aspect_slug',
      ])
      .where('fac.form_id', 'in', formIds)
      .execute();
  }

  private fetchDrops(formIds: number[]) {
    if (!formIds.length)
      return Promise.resolve(
        [] as {
          form_id: number;
          amount: number;
          percentage: number | null;
          pct_item_id: number | null;
          pct_item_name: string | null;
          quantity_min: number | null;
          quantity_max: number | null;
          range_item_id: number | null;
          range_item_name: string | null;
        }[]
      );
    return this.db
      .selectFrom('form_drops as fd')
      .leftJoin('drop_percentages as dp', 'dp.form_id', 'fd.form_id')
      .leftJoin('drop_ranges as dr', 'dr.form_id', 'fd.form_id')
      .leftJoin('items as ip', 'ip.id', 'dp.item_id')
      .leftJoin('items as ir', 'ir.id', 'dr.item_id')
      .select([
        'fd.form_id',
        'fd.amount',
        'dp.percentage',
        'ip.id as pct_item_id',
        'ip.name as pct_item_name',
        'dr.quantity_min',
        'dr.quantity_max',
        'ir.id as range_item_id',
        'ir.name as range_item_name',
      ])
      .where('fd.form_id', 'in', formIds)
      .execute();
  }

  private fetchEggGroups(speciesIds: number[]) {
    if (!speciesIds.length)
      return Promise.resolve(
        [] as { species_id: number; id: number; name: string; slug: string }[]
      );
    return this.db
      .selectFrom('species_egg_groups as seg')
      .innerJoin('egg_groups as eg', 'eg.id', 'seg.egg_group_id')
      .select(['seg.species_id', 'eg.id', 'eg.name', 'eg.slug'])
      .where('seg.species_id', 'in', speciesIds)
      .execute();
  }

  private fetchExperienceGroups(ids: number[]) {
    if (!ids.length)
      return Promise.resolve([] as { id: number; slug: string; name: string; formula: string }[]);
    return this.db
      .selectFrom('experience_groups')
      .select(['id', 'slug', 'name', 'formula'])
      .where('id', 'in', ids)
      .execute();
  }

  private fetchSpeciesHitboxes(speciesIds: number[]) {
    if (!speciesIds.length)
      return Promise.resolve(
        [] as { species_id: number; width: number; height: number; fixed: boolean }[]
      );
    return this.db
      .selectFrom('species_hitboxes')
      .select(['species_id', 'width', 'height', 'fixed'])
      .where('species_id', 'in', speciesIds)
      .execute();
  }

  private fetchSpeciesLighting(speciesIds: number[]) {
    if (!speciesIds.length)
      return Promise.resolve(
        [] as { species_id: number; light_level: number; liquid_glow_mode: string | null }[]
      );
    return this.db
      .selectFrom('lighting')
      .select(['species_id', 'light_level', 'liquid_glow_mode'])
      .where('species_id', 'in', speciesIds)
      .execute();
  }

  private fetchSpeciesRiding(speciesIds: number[]) {
    if (!speciesIds.length) return Promise.resolve([] as { species_id: number; data: unknown }[]);
    return this.db
      .selectFrom('riding')
      .select(['species_id', 'data'])
      .where('species_id', 'in', speciesIds)
      .execute();
  }

  private fetchFormHitboxes(formIds: number[]) {
    if (!formIds.length)
      return Promise.resolve(
        [] as { form_id: number; width: number; height: number; fixed: boolean }[]
      );
    return this.db
      .selectFrom('form_hitboxes')
      .select(['form_id', 'width', 'height', 'fixed'])
      .where('form_id', 'in', formIds)
      .execute();
  }

  private fetchBehaviour(formIds: number[]) {
    if (!formIds.length) return Promise.resolve([] as { form_id: number; data: unknown }[]);
    return this.db
      .selectFrom('behaviour')
      .select(['form_id', 'data'])
      .where('form_id', 'in', formIds)
      .execute();
  }

  private groupBy<T, K extends keyof T>(rows: T[], key: K): Map<T[K], T[]> {
    const map = new Map<T[K], T[]>();
    for (const row of rows) {
      const arr = map.get(row[key]) ?? [];
      arr.push(row);
      map.set(row[key], arr);
    }
    return map;
  }

  private assembleResults(
    rows: Awaited<ReturnType<ReturnType<typeof this.buildSearchQuery>['execute']>>,
    relations: Awaited<ReturnType<typeof this.fetchRelations>>
  ): SpeciesWithForms[] {
    const speciesMap = new Map<
      number,
      { species: Omit<SpeciesWithForms, 'forms'>; forms: Form[] }
    >();

    for (const row of rows) {
      let entry = speciesMap.get(row.species_id);
      if (!entry) {
        entry = { species: this.toSpecies(row, relations), forms: [] };
        speciesMap.set(row.species_id, entry);
      }
      entry.forms.push(this.toForm(row, relations));
    }

    return Array.from(speciesMap.values()).map(({ species, forms }) => ({
      ...species,
      forms,
    }));
  }

  private toSpecies(
    row: Awaited<ReturnType<ReturnType<typeof this.buildSearchQuery>['execute']>>[number],
    relations: Awaited<ReturnType<typeof this.fetchRelations>>
  ): Omit<SpeciesWithForms, 'forms'> {
    const lighting = relations.speciesLighting.get(row.species_id);

    return {
      id: row.species_id,
      name: row.species_name,
      slug: row.species_slug,
      description: row.species_description,
      generation: row.species_generation,
      experienceGroup:
        (row.experience_group_id != null &&
          relations.experienceGroups.get(row.experience_group_id)) ||
        null,
      eggGroups: (relations.eggGroups.get(row.species_id) ?? []).map((eg) => ({
        id: eg.id,
        name: eg.name,
        slug: eg.slug,
      })),
      hitbox: relations.speciesHitboxes.get(row.species_id) ?? null,
      lighting: lighting
        ? { lightLevel: lighting.light_level, liquidGlowMode: lighting.liquid_glow_mode }
        : null,
      riding: relations.speciesRiding.get(row.species_id) ?? null,
    };
  }

  private toSpeciesOnly(
    row: Awaited<ReturnType<ReturnType<typeof this.buildSearchQuery>['execute']>>[number],
    relations: Awaited<ReturnType<typeof this.fetchRelations>>
  ): Species {
    return this.toSpecies(row, relations);
  }

  private toForm(
    row: Awaited<ReturnType<ReturnType<typeof this.buildSearchQuery>['execute']>>[number],
    relations: Awaited<ReturnType<typeof this.fetchRelations>>
  ): Form {
    const formId = row.form_id;

    return {
      id: formId,
      name: row.form_name,
      fullName: row.form_full_name,
      slug: row.form_slug,
      description: row.form_description,
      generation: row.form_generation,
      height: row.height,
      weight: row.weight,
      catchRate: row.catch_rate,
      baseFriendship: row.base_friendship,
      eggCycles: row.egg_cycles,
      maleRatio: row.male_ratio,
      baseScale: row.base_scale,
      baseHp: row.base_hp,
      baseAttack: row.base_attack,
      baseDefence: row.base_defence,
      baseSpecialAttack: row.base_special_attack,
      baseSpecialDefence: row.base_special_defence,
      baseSpeed: row.base_speed,
      baseExperienceYield: row.base_experience_yield,
      evHp: row.ev_hp,
      evAttack: row.ev_attack,
      evDefence: row.ev_defence,
      evSpecialAttack: row.ev_special_attack,
      evSpecialDefence: row.ev_special_defence,
      evSpeed: row.ev_speed,
      labels: (relations.labels.get(formId) ?? []).map((l) => ({
        id: l.id,
        name: l.name,
        slug: l.slug,
      })),
      aspectChoices: (relations.aspectChoices.get(formId) ?? []).map((ac) => ({
        id: ac.id,
        slug: ac.slug,
        name: ac.name,
        value: ac.value,
      })),
      types: (relations.types.get(formId) ?? []).map((t) => ({
        type: { id: t.id, name: t.name, slug: t.slug },
        slot: t.slot,
      })),
      abilities: (relations.abilities.get(formId) ?? []).map((a) => ({
        ability: { id: a.id, name: a.name, slug: a.slug },
        slot: { id: a.slot_id, slug: a.slot_slug, name: a.slot_name },
      })),
      moves: (relations.moves.get(formId) ?? []).map((m) => ({
        move: { id: m.id, name: m.name, slug: m.slug },
        method: { id: m.method_id, slug: m.method_slug, name: m.method_name },
        level: m.level,
      })),
      hitbox: relations.formHitboxes.get(formId) ?? null,
      drops: this.toDrops(relations.drops.get(formId) ?? []),
      aspectCombos: this.toAspectCombos(relations.aspectCombos.get(formId) ?? []),
      behaviour: relations.behaviour.get(formId) ?? null,
      spawns: relations.spawns.get(formId) ?? [],
    };
  }

  private toDrops(rows: Awaited<ReturnType<typeof this.fetchDrops>>): FormDrops | null {
    if (rows.length === 0) return null;

    const percentages: DropPercentage[] = [];
    const ranges: DropRange[] = [];

    for (const row of rows) {
      if (row.pct_item_id != null && row.percentage != null) {
        percentages.push({
          item: { id: row.pct_item_id, name: row.pct_item_name ?? '' },
          percentage: row.percentage,
        });
      }
      if (row.range_item_id != null && row.quantity_min != null) {
        ranges.push({
          item: { id: row.range_item_id, name: row.range_item_name ?? '' },
          quantityMin: row.quantity_min,
          quantityMax: row.quantity_max ?? row.quantity_min,
        });
      }
    }

    return {
      amount: rows[0]?.amount ?? 1,
      percentages,
      ranges,
    };
  }

  private toAspectCombos(
    rows: Awaited<ReturnType<typeof this.fetchAspectCombos>>
  ): FormAspectCombo[] {
    const comboMap = new Map<number, { comboIndex: number; aspects: AspectRef[] }>();

    for (const row of rows) {
      let entry = comboMap.get(row.combo_id);
      if (!entry) {
        entry = { comboIndex: row.combo_index, aspects: [] };
        comboMap.set(row.combo_id, entry);
      }
      entry.aspects.push({
        id: row.aspect_id,
        name: row.aspect_name,
        slug: row.aspect_slug,
      });
    }

    return Array.from(comboMap.values());
  }
}
