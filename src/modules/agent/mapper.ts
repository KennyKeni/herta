import type { PokemonFilter, SpeciesWithForms } from '../pokemon/domain';
import type { AgentPokemon, AgentPokemonQuery, AgentPokemonResponse } from './model';

export function mapIncludeFlags(query: AgentPokemonQuery): Partial<PokemonFilter> {
  return {
    includeTypes: query.includeTypes,
    includeAbilities: query.includeAbilities,
    includeMoves: query.includeMoves,
    includeEggGroups: query.includeEggGroups,
    includeExperienceGroup: query.includeExperienceGroup,
    includeDrops: query.includeDrops,
    includeLabels: query.includeLabels,
    includeAspects: query.includeAspects,
    includeHitboxes: query.includeHitboxes,
    includeLighting: query.includeLighting,
    includeRiding: query.includeRiding,
    includeBehaviour: query.includeBehaviour,
  };
}

export function toResponse(
  species: SpeciesWithForms[],
  query: AgentPokemonQuery,
  total: number
): AgentPokemonResponse {
  const results: AgentPokemon[] = [];

  for (const sp of species) {
    for (const form of sp.forms) {
      const pokemon: AgentPokemon = {
        name: form.fullName,
        speciesName: sp.name,
      };

      if (query.includeDescription) {
        pokemon.description = form.description ?? sp.description;
      }

      if (query.includeGeneration) {
        pokemon.generation = form.generation ?? sp.generation;
      }

      if (query.includeStats) {
        pokemon.stats = {
          hp: form.baseHp,
          attack: form.baseAttack,
          defense: form.baseDefence,
          spAtk: form.baseSpecialAttack,
          spDef: form.baseSpecialDefence,
          speed: form.baseSpeed,
          total:
            form.baseHp +
            form.baseAttack +
            form.baseDefence +
            form.baseSpecialAttack +
            form.baseSpecialDefence +
            form.baseSpeed,
        };
      }

      if (query.includeEvYield) {
        pokemon.evYield = {
          hp: form.evHp,
          attack: form.evAttack,
          defense: form.evDefence,
          spAtk: form.evSpecialAttack,
          spDef: form.evSpecialDefence,
          speed: form.evSpeed,
        };
      }

      if (query.includePhysical) {
        pokemon.physical = {
          height: form.height,
          weight: form.weight,
        };
      }

      if (query.includeTypes && form.types.length > 0) {
        pokemon.types = form.types.sort((a, b) => a.slot - b.slot).map((t) => t.type.name);
      }

      if (query.includeAbilities && form.abilities.length > 0) {
        pokemon.abilities = form.abilities.map((a) => ({
          name: a.ability.name,
          slot: a.slot,
        }));
      }

      if (query.includeMoves && form.moves.length > 0) {
        pokemon.moves = form.moves.map((m) => ({
          name: m.move.name,
          method: m.method,
          level: m.level,
        }));
      }

      if (query.includeDrops && form.drops) {
        pokemon.drops = [
          ...form.drops.percentages.map((p) => ({
            item: p.item.name,
            chance: p.percentage,
          })),
          ...form.drops.ranges.map((r) => ({
            item: r.item.name,
            quantityMin: r.quantityMin,
            quantityMax: r.quantityMax,
          })),
        ];
      }

      if (query.includeBreeding) {
        pokemon.breeding = {
          eggCycles: sp.eggCycles,
          baseFriendship: sp.baseFriendship,
          maleRatio: sp.maleRatio,
        };
      }

      if (query.includeEggGroups && sp.eggGroups.length > 0) {
        pokemon.eggGroups = sp.eggGroups.map((eg) => eg.name);
      }

      if (query.includeExperienceGroup) {
        pokemon.experienceGroup = sp.experienceGroup?.name ?? null;
      }

      if (query.includeLabels && form.labels.length > 0) {
        pokemon.labels = form.labels.map((l) => l.name);
      }

      if (query.includeAspects && (form.aspectChoices.length > 0 || form.aspectCombos.length > 0)) {
        pokemon.cosmetics = {
          aspectChoices: form.aspectChoices.map((a) => a.name),
          aspectCombos: form.aspectCombos.map((c) => c.aspects.map((a) => a.name)),
        };
      }

      if (query.includeHitboxes) {
        pokemon.hitbox = form.hitbox ?? sp.hitbox ?? null;
      }

      if (query.includeLighting) {
        pokemon.lighting = sp.lighting;
      }

      if (query.includeRiding) {
        pokemon.riding = sp.riding;
      }

      if (query.includeBehaviour) {
        pokemon.behaviour = form.behaviour;
      }

      results.push(pokemon);
    }
  }

  return {
    results,
    total,
    limit: query.limit ?? 20,
    offset: query.offset ?? 0,
  };
}
