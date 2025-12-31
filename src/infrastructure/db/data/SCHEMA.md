# Cobblemon CSV Schema

Auto-generated documentation for the pipeline output.

**Total files:** 86

## Domains

- **Pokemon** (`pokemon/`): 31 tables
- **Moves** (`moves/`): 11 tables
- **Abilities** (`abilities/`): 4 tables
- **Items & Recipes** (`items/`): 13 tables
- **Spawns** (`spawns/`): 15 tables
- **World** (`world/`): 5 tables
- **Game Mechanics** (`mechanics/`): 7 tables

## Tables

### Pokemon

| Table | Rows | Columns |
|-------|------|---------|
| `species` | 1025 | id, slug, name, generation, catchRate, ... (+6) |
| `forms` | 1337 | id, speciesId, slug, formName, name, ... (+17) |
| `form_types` | 2056 | formId, typeId, slot |
| `form_abilities` | 2910 | formId, abilityId, slotId |
| `form_moves` | 130641 | formId, moveId, methodId, level |
| `form_aspects` | 373 | formId, aspectChoiceId |
| `form_labels` | 1925 | formId, labelId |
| `form_tags` | 1925 | id, formId, tagId |
| `form_tag_types` | 36 | id, slug, name |
| `species_egg_groups` | 1304 | speciesId, eggGroupId |
| `species_hitboxes` | 965 | speciesId, width, height, fixed |
| `form_hitboxes` | 14 | formId, width, height, fixed |
| `aspects` | 96 | id, slug, name, typeId, aspectFormat |
| `aspect_choices` | 467 | id, aspectId, value, name, aspectString |
| `aspect_groups` | 5 | id, slug, name, rule, description |
| `aspect_groups_map` | 12 | aspectId, aspectGroupId |
| `aspect_types` | 3 | id, slug, name |
| `form_aspect_combos` | 97 | id, formId, comboIndex |
| `form_aspect_combo_aspects` | 107 | comboId, aspectId |
| `form_overrides` | 42 | formId, catchRate, baseFriendship, eggCycles, maleRatio, ... (+1) |
| `form_drops` | 982 | formId, amount |
| `drop_ranges` | 588 | formId, itemId, quantityMin, quantityMax, id |
| `drop_percentages` | 1528 | formId, itemId, percentage, id |
| `form_override_egg_groups` | 8 | formId, eggGroupId |
| `behaviour` | 1158 | formId, data |
| `riding` | 113 | speciesId, data |
| `lighting` | 84 | speciesId, lightLevel, liquidGlowMode |
| `egg_groups` | 15 | id, slug, name |
| `experience_groups` | 6 | id, slug, name, formula |
| `natures` | 25 | id, slug, name, plusStatId, minusStatId |
| `stats` | 6 | id, name |

### Moves

| Table | Rows | Columns |
|-------|------|---------|
| `moves` | 951 | id, slug, name, typeId, categoryId, ... (+13) |
| `move_flags` | 464 | moveId, flagId |
| `move_categories` | 3 | id, slug, name, description |
| `move_flag_types` | 8 | id, slug, name, description |
| `move_boosts` | 187 | moveId, isSelf, statId, stages |
| `move_effects` | 209 | moveId, chance, isSelf, conditionTypeId, conditionId |
| `move_targets` | 15 | id, slug, name, description |
| `move_max_power` | 50 | moveId, maxPower |
| `move_z_data` | 318 | moveId, isZExclusive, zCrystal, zPower, zEffect |
| `gmax_moves` | 32 | moveId, speciesId |
| `move_learn_methods` | 7 | id, slug, name |

### Abilities

| Table | Rows | Columns |
|-------|------|---------|
| `abilities` | 310 | id, slug, name, desc, shortDesc |
| `ability_flags` | 278 | abilityId, flagId |
| `ability_flag_types` | 8 | id, slug, name, description |
| `ability_slots` | 3 | id, slug, name |

### Items & Recipes

| Table | Rows | Columns |
|-------|------|---------|
| `items` | 841 | id, slug, name, num, gen, ... (+4) |
| `item_flags` | 122 | itemId, flagTypeId |
| `item_flag_types` | 5 | id, slug, name |
| `item_boosts` | 11 | itemId, statId, stages |
| `item_tag_types` | 143 | id, slug, name |
| `item_tags` | 1901 | itemId, tagId |
| `item_tag_hierarchy` | 57 | id, parentTagId, childTagId |
| `recipes` | 574 | id, typeId, resultItemId, resultCount |
| `recipe_types` | 9 | id, slug, name |
| `recipe_inputs` | 1325 | recipeId, itemId, slot |
| `recipe_slot_types` | 4 | id, name, description |
| `recipe_tag_types` | 45 | id, slug, namespaceId, path, name |
| `recipe_tag_inputs` | 573 | recipeId, tagTypeId, slot |

### Spawns

| Table | Rows | Columns |
|-------|------|---------|
| `spawns` | 2924 | id, pokemon, bucketId, positionTypeId, levelMin, ... (+3) |
| `spawn_buckets` | 4 | id, slug, name |
| `spawn_position_types` | 5 | id, slug, name |
| `spawn_presets` | 2652 | spawnId, presetTypeId |
| `spawn_preset_types` | 26 | id, slug, name |
| `spawn_conditions` | 4434 | id, spawnId, conditionType, multiplier |
| `spawn_condition_types` | 3 | id, slug, name |
| `spawn_condition_biomes` | 308 | conditionId, biomeId |
| `spawn_condition_biome_tags` | 5272 | conditionId, biomeTagId |
| `spawn_condition_weather` | 220 | conditionId, isRaining, isThundering |
| `spawn_condition_time` | 612 | conditionId, timeRangeId |
| `spawn_condition_lure` | 387 | conditionId, minLureLevel, maxLureLevel |
| `spawn_condition_moon_phases` | 90 | conditionId, moonPhaseId |
| `spawn_condition_position` | 369 | conditionId, minY, maxY |
| `spawn_condition_sky` | 2364 | conditionId, canSeeSky, minSkyLight, maxSkyLight |

### World

| Table | Rows | Columns |
|-------|------|---------|
| `biomes` | 410 | id, slug, namespaceId, path, name |
| `biome_tags` | 70 | id, slug, namespaceId, path, name |
| `biome_tag_biomes` | 671 | biomeTagId, biomeId |
| `moon_phases` | 8 | id, slug, name |
| `time_ranges` | 5 | id, slug, name |

### Game Mechanics

| Table | Rows | Columns |
|-------|------|---------|
| `types` | 19 | id, slug, name |
| `type_matchups` | 120 | attackingTypeId, defendingTypeId, multiplier |
| `hidden_power_ivs` | 16 | typeId, hp, atk, def, spa, ... (+2) |
| `conditions` | 65 | id, name, typeId, description |
| `condition_types` | 2 | id, slug, name |
| `labels` | 36 | id, slug, name |
| `namespaces` | 17 | id, slug, name |

## Relationships

```
species (1) ──< forms (many)
forms ──< form_types, form_abilities, form_moves, form_aspects
forms ──< form_drops ──< drop_ranges, drop_percentages
drop_ranges.item_id ──> items.id
drop_percentages.item_id ──> items.id
aspects ──< aspect_choices
moves ──< move_flags, move_boosts, move_effects
abilities ──< ability_flags
form_tag_types ──< form_tags ──> forms
item_tag_types ──< item_tags ──> items
item_tag_types ──< item_tag_hierarchy (parent/child)
items ──< item_flags, item_boosts
recipes ──< recipe_inputs
```
