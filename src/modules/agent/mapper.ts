import type { Ability } from '../abilities/domain';
import type { Article } from '../article/domain';
import type { Item } from '../items/domain';
import type { Move } from '../moves/domain';
import type { PokemonFilter, SpeciesWithForms } from '../pokemon/domain';
import type {
  AgentAbility,
  AgentAbilityQuery,
  AgentAbilityResponse,
  AgentArticle,
  AgentArticleQuery,
  AgentArticleSearchResponse,
  AgentItem,
  AgentItemQuery,
  AgentItemResponse,
  AgentMove,
  AgentMoveQuery,
  AgentMoveResponse,
  AgentPokemon,
  AgentPokemonQuery,
  AgentPokemonResponse,
} from './model';

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
    includeSpawns: query.includeSpawns,
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
        slug: form.slug,
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
          slot: a.slot.name,
        }));
      }

      if (query.includeMoves && form.moves.length > 0) {
        pokemon.moves = form.moves.map((m) => ({
          name: m.move.name,
          method: m.method.name,
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
          eggCycles: form.eggCycles,
          baseFriendship: form.baseFriendship,
          maleRatio: form.maleRatio,
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

      if (query.includeLighting && sp.lighting) {
        pokemon.lighting = {
          lightLevel: sp.lighting.lightLevel,
          liquidGlowMode: sp.lighting.liquidGlowMode,
        };
      }

      if (query.includeRiding) {
        pokemon.riding = sp.riding;
      }

      if (query.includeBehaviour) {
        pokemon.behaviour = form.behaviour;
      }

      if (query.includeSpawns && form.spawns.length > 0) {
        pokemon.spawns = form.spawns.map((spawn) => ({
          bucket: spawn.bucket.name,
          positionType: spawn.positionType.name,
          weight: spawn.weight,
          levelMin: spawn.levelMin,
          levelMax: spawn.levelMax,
          presets: spawn.presets.map((p) => p.presetType.name),
          conditions: spawn.conditions.map((c) => ({
            type: c.type,
            multiplier: c.multiplier,
            biomes: c.biomes.map((b) => b.name),
            biomeTags: c.biomeTags.map((bt) => bt.name),
            timeRanges: c.timeRanges.map((tr) => tr.name),
            moonPhases: c.moonPhases.map((mp) => mp.name),
            weather: c.weather,
            sky: c.sky,
            position: c.position,
            lure: c.lure,
          })),
        }));
      }

      results.push(pokemon);
    }
  }

  return {
    results,
    total,
    limit: query.limit ?? 5,
    offset: query.offset ?? 0,
  };
}

export function toAbilityResponse(
  abilities: Ability[],
  query: AgentAbilityQuery,
  total: number
): AgentAbilityResponse {
  const results: AgentAbility[] = abilities.map((ability) => {
    const result: AgentAbility = {
      name: ability.name,
      slug: ability.slug,
    };

    if (query.includeDescription) {
      result.shortDesc = ability.shortDesc;
      result.desc = ability.desc;
    }

    if (query.includeFlags && ability.flags.length > 0) {
      result.flags = ability.flags.map((f) => f.name);
    }

    return result;
  });

  return {
    results,
    total,
    limit: query.limit ?? 5,
    offset: query.offset ?? 0,
  };
}

export function toMoveResponse(
  moves: Move[],
  query: AgentMoveQuery,
  total: number
): AgentMoveResponse {
  const results: AgentMove[] = moves.map((move) => {
    const result: AgentMove = {
      name: move.name,
      slug: move.slug,
      type: move.type.name,
      category: move.category.name,
      power: move.power,
      accuracy: move.accuracy,
      pp: move.pp,
      priority: move.priority,
    };

    if (query.includeDescription) {
      result.shortDesc = move.shortDesc;
      result.desc = move.desc;
      result.target = move.target?.name ?? null;
    }

    if (query.includeFlags && move.flags.length > 0) {
      result.flags = move.flags.map((f) => f.name);
    }

    if (query.includeBoosts && move.boosts.length > 0) {
      result.boosts = move.boosts.map((b) => ({
        stat: b.stat.name,
        stages: b.stages,
        isSelf: b.isSelf,
      }));
    }

    if (query.includeEffects && move.effects.length > 0) {
      result.effects = move.effects.map((e) => ({
        effect: e.conditionType.name,
        chance: e.chance,
        isSelf: e.isSelf,
        condition: e.condition?.name ?? null,
      }));
    }

    if (query.includeZData && move.zData) {
      result.zData = {
        zPower: move.zData.zPower,
        zEffect: move.zData.zEffect,
        zCrystal: move.zData.zCrystal,
        isZExclusive: move.zData.isZExclusive,
      };
    }

    return result;
  });

  return {
    results,
    total,
    limit: query.limit ?? 5,
    offset: query.offset ?? 0,
  };
}

export function toItemResponse(
  items: Item[],
  query: AgentItemQuery,
  total: number
): AgentItemResponse {
  const results: AgentItem[] = items.map((item) => {
    const result: AgentItem = {
      name: item.name,
      slug: item.slug,
    };

    if (query.includeDescription) {
      result.shortDesc = item.shortDesc;
      result.desc = item.desc;
    }

    if (query.includeBoosts && item.boosts.length > 0) {
      result.boosts = item.boosts.map((b) => ({
        stat: b.stat.name,
        stages: b.stages,
      }));
    }

    if (query.includeTags && item.tags.length > 0) {
      result.tags = item.tags.map((t) => t.name);
    }

    if (query.includeRecipes && item.recipes.length > 0) {
      result.recipes = item.recipes.map((r) => ({
        type: r.type.name,
        resultCount: r.resultCount,
        experience: r.experience,
        cookingTime: r.cookingTime,
        inputs: r.inputs.map((i) => ({
          item: i.item.name,
          slot: i.slot,
          slotType: i.slotType?.name ?? null,
        })),
        tagInputs: r.tagInputs.map((t) => ({
          tag: t.tag.name,
          slot: t.slot,
          slotType: t.slotType?.name ?? null,
        })),
      }));
    }

    return result;
  });

  return {
    results,
    total,
    limit: query.limit ?? 5,
    offset: query.offset ?? 0,
  };
}

export function toArticleSearchResponse(
  articles: Article[],
  query: AgentArticleQuery,
  total: number
): AgentArticleSearchResponse {
  const results: AgentArticle[] = articles.map((article) => {
    const result: AgentArticle = {
      title: article.title,
      slug: article.slug,
    };

    result.subtitle = article.subtitle;
    result.description = article.description;
    result.author = article.author;

    if (query.includeBody && article.body) {
      result.body = article.body;
    }

    if (query.includeCategories && article.categories.length > 0) {
      result.categories = article.categories.map((c) => c.name);
    }

    return result;
  });

  return {
    results,
    total,
    limit: query.limit ?? 5,
    offset: query.offset ?? 0,
  };
}
