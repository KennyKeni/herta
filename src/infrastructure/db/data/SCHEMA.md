# Cobblemon CSV Schema

Auto-generated documentation for the pipeline output.

**Total files:** 64

## Tables

### Core Pokemon Data

| Table | Rows | Columns |
|-------|------|---------|
| `species` | 1025 | id, slug, name, generation, catchRate, ... (+6) |
| `forms` | 1337 | id, speciesId, slug, formName, name, ... (+17) |
| `form_types` | 2056 | formId, typeId, slot |
| `form_abilities` | 2910 | formId, abilityId, slot |
| `form_moves` | 130641 | formId, moveId, method, level |
| `form_aspects` | 373 | formId, aspectChoiceId |
| `form_labels` | 1925 | formId, labelId |
| `labels` | 36 | id, slug, name |

### Species Details

| Table | Rows | Columns |
|-------|------|---------|
| `species_egg_groups` | 1304 | speciesId, eggGroupId |
| `species_hitboxes` | 965 | speciesId, width, height, fixed |
| `form_hitboxes` | 14 | formId, width, height, fixed |
| `form_overrides` | 42 | formId, catchRate, baseFriendship, eggCycles, maleRatio, ... (+1) |
| `form_override_egg_groups` | 8 | formId, eggGroupId |

### Drops

| Table | Rows | Columns |
|-------|------|---------|
| `form_drops` | 982 | formId, amount |
| `drop_ranges` | 588 | formId, itemId, quantityMin, quantityMax |
| `drop_percentages` | 1528 | formId, itemId, percentage |

### Spawns

| Table | Rows | Columns |
|-------|------|---------|
| `spawn_buckets` | 4 | id, slug, name |
| `spawn_position_types` | 5 | id, slug, name |
| `biome_types` | 84 | id, slug, name, isTag |
| `spawns` | 2822 | id, sourceId, pokemon, bucketId, positionTypeId, ... (+3) |
| `spawn_presets` | 2652 | spawnId, preset |
| `spawn_conditions` | 4717 | id, spawnId, role, canSeeSky, minSkyLight, ... (+9) |
| `spawn_condition_biomes` | 5713 | conditionId, biomeId |
| `spawn_weight_multipliers` | 883 | id, spawnId, multiplier, conditionId |

### Aspects & Variants

| Table | Rows | Columns |
|-------|------|---------|
| `aspects` | 96 | id, slug, name, type, aspectFormat |
| `aspect_choices` | 468 | id, aspectId, value, name, aspectString |
| `aspect_groups` | 5 | id, slug, name, rule, description |
| `aspect_groups_map` | 12 | aspectId, aspectGroupId |
| `form_aspect_combos` | 97 | id, formId, comboIndex |
| `form_aspect_combo_aspects` | 107 | comboId, aspectId |

### Moves

| Table | Rows | Columns |
|-------|------|---------|
| `moves` | 951 | id, slug, name, typeId, categoryId, ... (+13) |
| `move_flags` | 464 | moveId, flagId |
| `move_boosts` | 187 | moveId, isSelf, statId, stages |
| `move_effects` | 209 | moveId, chance, isSelf, effectTypeId, effectValue |
| `move_categories` | 3 | id, name, description, num |
| `move_targets` | 15 | id, slug, name, description |
| `move_flag_types` | 8 | id, slug, name, description |
| `move_max_power` | 50 | moveId, maxPower |
| `move_z_data` | 318 | moveId, isZExclusive, zCrystal, zPower, zEffect |
| `gmax_moves` | 32 | moveId, speciesId |

### Abilities

| Table | Rows | Columns |
|-------|------|---------|
| `abilities` | 310 | id, slug, name, desc, shortDesc |
| `ability_flags` | 278 | abilityId, flagId |
| `ability_flag_types` | 8 | id, slug, name, description |

### Items

| Table | Rows | Columns |
|-------|------|---------|
| `items` | 824 | id, name, num, gen, desc, ... (+3) |
| `item_flags` | 122 | item_id, flag |
| `item_boosts` | 11 | itemId, statId, stages |
| `item_tag_types` | 143 | id, slug, name |
| `item_tags` | 1901 | id, itemId, tagId |
| `item_tag_hierarchy` | 57 | id, parentTagId, childTagId |

### Types & Matchups

| Table | Rows | Columns |
|-------|------|---------|
| `types` | 19 | id, slug, name |
| `type_matchups` | 120 | attackingTypeId, defendingTypeId, multiplier |
| `hidden_power_ivs` | 16 | typeId, hp, atk, def, spa, ... (+2) |

### Other

| Table | Rows | Columns |
|-------|------|---------|
| `natures` | 25 | id, slug, name, plusStatId, minusStatId |
| `conditions` | 65 | id, name, type, description |
| `effect_types` | 2 | id, name |
| `stats` | 6 | id, name |
| `labels` | 36 | id, slug, name |
| `egg_groups` | 15 | id, slug, name |
| `experience_groups` | 6 | id, name, formula |

### Recipes

| Table | Rows | Columns |
|-------|------|---------|
| `recipes` | 574 | id, type, result_id, result_count |
| `recipe_inputs` | 2030 | recipe_id, input_type, input_namespace, input_value, slot |
| `recipe_slot_types` | 4 | id, name, description |

### Pokemon Behavior

| Table | Rows | Columns |
|-------|------|---------|
| `behaviour` | 1158 | formId, data |
| `riding` | 113 | speciesId, data |
| `lighting` | 84 | speciesId, data |

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
labels ──< form_labels ──> forms
item_tag_types ──< item_tags ──> items
item_tag_types ──< item_tag_hierarchy (parent/child)
items ──< item_flags, item_boosts
recipes ──< recipe_inputs
spawn_buckets ──< spawns
spawn_position_types ──< spawns
spawns ──< spawn_presets, spawn_conditions, spawn_weight_multipliers
spawn_conditions ──< spawn_condition_biomes ──> biome_types
```

## Indexes

| Index | Table | Column(s) |
|-------|-------|-----------|
| `idx_forms_species_id` | `forms` | species_id |
| `idx_forms_slug` | `forms` | slug |
| `idx_form_types_form_id` | `form_types` | form_id |
| `idx_form_abilities_form_id` | `form_abilities` | form_id |
| `idx_form_moves_form_id` | `form_moves` | form_id |
| `idx_species_egg_groups_species_id` | `species_egg_groups` | species_id |
| `idx_species_egg_groups_egg_group_id` | `species_egg_groups` | egg_group_id |
| `idx_form_labels_form_id` | `form_labels` | form_id |
| `idx_form_labels_label_id` | `form_labels` | label_id |
| `idx_recipe_inputs_recipe_id` | `recipe_inputs` | recipe_id |
| `idx_drop_ranges_form_id` | `drop_ranges` | form_id |
| `idx_drop_ranges_item_id` | `drop_ranges` | item_id |
| `idx_drop_percentages_form_id` | `drop_percentages` | form_id |
| `idx_drop_percentages_item_id` | `drop_percentages` | item_id |
| `idx_item_tags_item_id` | `item_tags` | item_id |
| `idx_item_tags_tag_id` | `item_tags` | tag_id |
| `idx_item_tag_hierarchy_parent` | `item_tag_hierarchy` | parent_tag_id |
| `idx_item_tag_hierarchy_child` | `item_tag_hierarchy` | child_tag_id |
| `idx_spawns_bucket_id` | `spawns` | bucket_id |
| `idx_spawns_position_type_id` | `spawns` | position_type_id |
| `idx_spawn_conditions_spawn_id` | `spawn_conditions` | spawn_id |
| `idx_spawn_condition_biomes_condition_id` | `spawn_condition_biomes` | condition_id |
| `idx_spawn_condition_biomes_biome_id` | `spawn_condition_biomes` | biome_id |
| `idx_spawn_weight_multipliers_spawn_id` | `spawn_weight_multipliers` | spawn_id |
