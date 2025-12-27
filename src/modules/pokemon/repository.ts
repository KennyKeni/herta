/* eslint-disable @typescript-eslint/no-unused-vars */
import { DB } from '@/infrastructure/db/types';
import { Kysely } from 'kysely';
import {
  AbilitySlot,
  AspectRef,
  DropPercentage,
  DropRange,
  Form,
  FormAspectCombo,
  FormDrops,
  PokemonFilter,
  SpeciesWithForms,
} from './domain';
import { FilterLogic } from '@/common/types';

export class PokemonRepository {
  constructor(private db: Kysely<DB>) {}

  async searchPokemon(filters: PokemonFilter): Promise<SpeciesWithForms[]> {
    const rows = await this.buildSearchQuery(filters)
      .limit(filters.limit ?? 20)
      .offset(filters.offset ?? 0)
      .execute();

    if (rows.length == 0) return [];

    const formIds = rows.map((r) => r.form_id);
    const speciesIds = [...new Set(rows.map((r) => r.species_id))];

    const relations = await this.fetchRelations(formIds, speciesIds);
    return this.assembleResults(rows, relations);
  }

  private buildSearchQuery(filter: PokemonFilter) {
    let query = this.db
      .selectFrom('forms as f')
      .innerJoin('species as s', 's.id', 'f.species_id')
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
        's.base_friendship',
        's.base_scale',
        's.catch_rate',
        's.egg_cycles',
        's.male_ratio',
      ]);
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

    return query;
  }

  private typeSubquery(
    idFilter?: number[],
    slugFilter?: string[],
    filter: FilterLogic = FilterLogic.OR
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
    filter: FilterLogic = FilterLogic.OR
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
    filter: FilterLogic = FilterLogic.OR
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
    filter: FilterLogic = FilterLogic.OR
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

  private aspectChoicesSubquery(
    idFilter?: number[],
    slugFilter?: string[],
    filter: FilterLogic = FilterLogic.OR
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
        if (slugFilter?.length) {
          conditions.push(eb('fc.slug', 'in', slugFilter));
        }

        return conditions.length ? eb.or(conditions) : eb.lit(true);
      });
  }

  private aspectComboSubquery(
    idFilter?: number[],
    slugFilter?: string[],
    filter: FilterLogic = FilterLogic.OR
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

  private eggGroupSubquery(idFilter?: number[], slugFilter?: string[], logic = FilterLogic.OR) {
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

  private async fetchRelations(formIds: number[], speciesIds: number[]) {
    const [types, abilities, moves, labels, aspectChoices, aspectCombos, drops, eggGroups] =
      await Promise.all([
        this.fetchTypes(formIds),
        this.fetchAbilities(formIds),
        this.fetchMoves(formIds),
        this.fetchLabels(formIds),
        this.fetchAspectChoices(formIds),
        this.fetchAspectCombos(formIds),
        this.fetchDrops(formIds),
        this.fetchEggGroups(speciesIds),
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
    };
  }

  private fetchTypes(formIds: number[]) {
    return this.db
      .selectFrom('form_types as ft')
      .innerJoin('types as t', 't.id', 'ft.type_id')
      .select(['ft.form_id', 'ft.slot', 't.id', 't.name', 't.slug'])
      .where('ft.form_id', 'in', formIds)
      .execute();
  }

  private fetchAbilities(formIds: number[]) {
    return this.db
      .selectFrom('form_abilities as fa')
      .innerJoin('abilities as a', 'a.id', 'fa.ability_id')
      .select(['fa.form_id', 'fa.slot', 'a.id', 'a.name', 'a.slug'])
      .where('fa.form_id', 'in', formIds)
      .execute();
  }

  private fetchMoves(formIds: number[]) {
    return this.db
      .selectFrom('form_moves as fm')
      .innerJoin('moves as m', 'm.id', 'fm.move_id')
      .select(['fm.form_id', 'fm.method', 'fm.level', 'm.id', 'm.name', 'm.slug'])
      .where('fm.form_id', 'in', formIds)
      .execute();
  }

  private fetchLabels(formIds: number[]) {
    return this.db
      .selectFrom('form_labels as fl')
      .innerJoin('labels as l', 'l.id', 'fl.label_id')
      .select(['fl.form_id', 'l.id', 'l.name', 'l.slug'])
      .where('fl.form_id', 'in', formIds)
      .execute();
  }

  private fetchAspectChoices(formIds: number[]) {
    return this.db
      .selectFrom('form_aspects as fa')
      .innerJoin('aspect_choices as ac', 'ac.id', 'fa.aspect_choice_id')
      .select(['fa.form_id', 'ac.id', 'ac.name', 'ac.slug'])
      .where('fa.form_id', 'in', formIds)
      .execute();
  }

  private fetchAspectCombos(formIds: number[]) {
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
    return this.db
      .selectFrom('form_drops as fd')
      .leftJoin('drop_percentages as dp', 'dp.form_drop_id', 'fd.form_id')
      .leftJoin('drop_ranges as dr', 'dr.form_drop_id', 'fd.form_id')
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
    return this.db
      .selectFrom('species_egg_groups as seg')
      .innerJoin('egg_groups as eg', 'eg.id', 'seg.egg_group_id')
      .select(['seg.species_id', 'eg.id', 'eg.name', 'eg.slug'])
      .where('seg.species_id', 'in', speciesIds)
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
      if (!speciesMap.has(row.species_id)) {
        speciesMap.set(row.species_id, {
          species: this.toSpecies(row, relations),
          forms: [],
        });
      }
      speciesMap.get(row.species_id)!.forms.push(this.toForm(row, relations));
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
    const eggGroups = relations.eggGroups.get(row.species_id) ?? [];

    return {
      id: row.species_id,
      name: row.species_name,
      slug: row.species_slug,
      description: row.species_description,
      generation: row.species_generation,
      baseFriendship: row.base_friendship,
      baseScale: row.base_scale,
      catchRate: row.catch_rate,
      eggCycles: row.egg_cycles,
      experienceGroup: null,
      maleRatio: row.male_ratio,
      eggGroups: eggGroups.map((eg) => ({ id: eg.id, name: eg.name, slug: eg.slug })),
      hitbox: null,
      lighting: null,
      riding: null,
    };
  }

  private toForm(
    row: Awaited<ReturnType<ReturnType<typeof this.buildSearchQuery>['execute']>>[number],
    relations: Awaited<ReturnType<typeof this.fetchRelations>>
  ): Form {
    const formId = row.form_id;
    const types = relations.types.get(formId) ?? [];
    const abilities = relations.abilities.get(formId) ?? [];
    const moves = relations.moves.get(formId) ?? [];
    const labels = relations.labels.get(formId) ?? [];
    const aspectChoices = relations.aspectChoices.get(formId) ?? [];
    const aspectComboRows = relations.aspectCombos.get(formId) ?? [];
    const dropRows = relations.drops.get(formId) ?? [];

    return {
      id: formId,
      name: row.form_name,
      fullName: row.form_full_name,
      slug: row.form_slug,
      description: row.form_description,
      generation: row.form_generation,
      height: row.height,
      weight: row.weight,
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
      labels: labels.map((l) => ({ id: l.id, name: l.name, slug: l.slug })),
      aspectChoices: aspectChoices.map((ac) => ({ id: ac.id, name: ac.name, slug: ac.slug })),
      types: types.map((t) => ({
        type: { id: t.id, name: t.name, slug: t.slug },
        slot: t.slot,
      })),
      abilities: abilities.map((a) => ({
        ability: { id: a.id, name: a.name, slug: a.slug },
        slot: a.slot as AbilitySlot,
      })),
      moves: moves.map((m) => ({
        move: { id: m.id, name: m.name, slug: m.slug },
        method: m.method,
        level: m.level,
      })),
      hitbox: null,
      drops: this.toDrops(dropRows),
      aspectCombos: this.toAspectCombos(aspectComboRows),
      behaviour: null,
      overrides: null,
    };
  }

  private toDrops(rows: Awaited<ReturnType<typeof this.fetchDrops>>): FormDrops | null {
    if (rows.length === 0) return null;

    const percentages: DropPercentage[] = [];
    const ranges: DropRange[] = [];

    for (const row of rows) {
      if (row.pct_item_id && row.percentage != null) {
        percentages.push({
          item: { id: String(row.pct_item_id), name: row.pct_item_name ?? '', source: '' },
          percentage: row.percentage,
        });
      }
      if (row.range_item_id && row.quantity_min != null) {
        ranges.push({
          item: { id: String(row.range_item_id), name: row.range_item_name ?? '', source: '' },
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
      if (!comboMap.has(row.combo_id)) {
        comboMap.set(row.combo_id, { comboIndex: row.combo_index, aspects: [] });
      }
      comboMap.get(row.combo_id)!.aspects.push({
        id: row.aspect_id,
        name: row.aspect_name,
        slug: row.aspect_slug,
      });
    }

    return Array.from(comboMap.values());
  }
}
