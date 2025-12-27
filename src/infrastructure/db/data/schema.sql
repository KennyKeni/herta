-- Cobblemon CSV Pipeline Schema
-- Auto-generated from Pydantic models

CREATE TABLE IF NOT EXISTS species (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    generation INTEGER,
    catch_rate INTEGER,
    base_friendship INTEGER,
    experience_group_id INTEGER,
    egg_cycles INTEGER,
    male_ratio REAL,
    base_scale REAL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS forms (
    id INTEGER PRIMARY KEY,
    species_id INTEGER NOT NULL REFERENCES species(id),
    slug TEXT NOT NULL,
    form_name TEXT NOT NULL,
    name TEXT NOT NULL,
    generation INTEGER,
    height REAL,
    weight REAL,
    base_experience_yield INTEGER,
    base_hp INTEGER,
    base_attack INTEGER,
    base_defence INTEGER,
    base_special_attack INTEGER,
    base_special_defence INTEGER,
    base_speed INTEGER,
    ev_hp INTEGER,
    ev_attack INTEGER,
    ev_defence INTEGER,
    ev_special_attack INTEGER,
    ev_special_defence INTEGER,
    ev_speed INTEGER,
    description TEXT
);

CREATE TABLE IF NOT EXISTS types (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS moves (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type_id INTEGER REFERENCES types(id),
    category_id INTEGER,
    target_id INTEGER,
    power INTEGER,
    accuracy INTEGER,
    pp INTEGER,
    priority INTEGER DEFAULT 0,
    crit_ratio INTEGER,
    min_hits INTEGER,
    max_hits INTEGER,
    drain_percent INTEGER,
    heal_percent INTEGER,
    recoil_percent INTEGER,
    desc TEXT,
    short_desc TEXT
);

CREATE TABLE IF NOT EXISTS abilities (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    desc TEXT,
    short_desc TEXT
);

CREATE TABLE IF NOT EXISTS natures (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    plus_stat_id INTEGER,
    minus_stat_id INTEGER
);

CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    num INTEGER,
    gen INTEGER,
    desc TEXT,
    short_desc TEXT,
    source TEXT NOT NULL,
    implemented INTEGER DEFAULT 1,
    fling_power INTEGER,
    fling_effect TEXT,
    natural_gift_type TEXT,
    natural_gift_power INTEGER
);

CREATE TABLE IF NOT EXISTS form_types (
    form_id INTEGER NOT NULL REFERENCES forms(id),
    type_id INTEGER NOT NULL REFERENCES types(id),
    slot INTEGER NOT NULL,
    PRIMARY KEY (form_id, type_id, slot)
);

CREATE TABLE IF NOT EXISTS form_abilities (
    form_id INTEGER NOT NULL REFERENCES forms(id),
    ability_id INTEGER NOT NULL REFERENCES abilities(id),
    slot TEXT NOT NULL,
    PRIMARY KEY (form_id, ability_id, slot)
);

CREATE TABLE IF NOT EXISTS form_moves (
    form_id INTEGER NOT NULL REFERENCES forms(id),
    move_id INTEGER NOT NULL REFERENCES moves(id),
    method TEXT NOT NULL,
    level INTEGER,
    PRIMARY KEY (form_id, move_id, method)
);

CREATE TABLE IF NOT EXISTS type_matchups (
    attacking_type_id INTEGER NOT NULL REFERENCES types(id),
    defending_type_id INTEGER NOT NULL REFERENCES types(id),
    multiplier REAL NOT NULL,
    PRIMARY KEY (attacking_type_id, defending_type_id)
);

CREATE TABLE IF NOT EXISTS aspects (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    type TEXT,
    aspect_format TEXT
);

CREATE TABLE IF NOT EXISTS aspect_choices (
    id INTEGER PRIMARY KEY,
    aspect_id INTEGER NOT NULL REFERENCES aspects(id),
    value TEXT,
    name TEXT,
    aspect_string TEXT
);

CREATE TABLE IF NOT EXISTS egg_groups (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS species_egg_groups (
    species_id INTEGER NOT NULL REFERENCES species(id),
    egg_group_id INTEGER NOT NULL REFERENCES egg_groups(id),
    PRIMARY KEY (species_id, egg_group_id)
);

CREATE TABLE IF NOT EXISTS labels (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS form_labels (
    form_id INTEGER NOT NULL REFERENCES forms(id),
    label_id INTEGER NOT NULL REFERENCES labels(id),
    PRIMARY KEY (form_id, label_id)
);

CREATE TABLE IF NOT EXISTS recipes (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    result_id TEXT NOT NULL,
    result_count INTEGER DEFAULT 1,
    experience REAL,
    cooking_time INTEGER
);

CREATE TABLE IF NOT EXISTS recipe_inputs (
    recipe_id TEXT NOT NULL REFERENCES recipes(id),
    input_type TEXT NOT NULL,
    input_namespace TEXT NOT NULL,
    input_value TEXT NOT NULL,
    slot INTEGER,
    slot_type_id INTEGER
);

CREATE TABLE IF NOT EXISTS form_drops (
    form_id INTEGER PRIMARY KEY REFERENCES forms(id),
    amount INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS drop_ranges (
    id INTEGER PRIMARY KEY,
    form_id INTEGER NOT NULL REFERENCES form_drops(form_id),
    item_id TEXT NOT NULL REFERENCES items(id),
    quantity_min INTEGER NOT NULL,
    quantity_max INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS drop_percentages (
    id INTEGER PRIMARY KEY,
    form_id INTEGER NOT NULL REFERENCES form_drops(form_id),
    item_id TEXT NOT NULL REFERENCES items(id),
    percentage REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS item_tag_types (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS item_tags (
    id INTEGER PRIMARY KEY,
    item_id TEXT NOT NULL REFERENCES items(id),
    tag_id INTEGER NOT NULL REFERENCES item_tag_types(id)
);

CREATE TABLE IF NOT EXISTS item_tag_hierarchy (
    id INTEGER PRIMARY KEY,
    parent_tag_id INTEGER NOT NULL REFERENCES item_tag_types(id),
    child_tag_id INTEGER NOT NULL REFERENCES item_tag_types(id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_forms_species_id ON forms(species_id);
CREATE INDEX IF NOT EXISTS idx_forms_slug ON forms(slug);
CREATE INDEX IF NOT EXISTS idx_form_types_form_id ON form_types(form_id);
CREATE INDEX IF NOT EXISTS idx_form_abilities_form_id ON form_abilities(form_id);
CREATE INDEX IF NOT EXISTS idx_form_moves_form_id ON form_moves(form_id);
CREATE INDEX IF NOT EXISTS idx_species_egg_groups_species_id ON species_egg_groups(species_id);
CREATE INDEX IF NOT EXISTS idx_species_egg_groups_egg_group_id ON species_egg_groups(egg_group_id);
CREATE INDEX IF NOT EXISTS idx_form_labels_form_id ON form_labels(form_id);
CREATE INDEX IF NOT EXISTS idx_form_labels_label_id ON form_labels(label_id);
CREATE INDEX IF NOT EXISTS idx_recipe_inputs_recipe_id ON recipe_inputs(recipe_id);
CREATE INDEX IF NOT EXISTS idx_drop_ranges_form_id ON drop_ranges(form_id);
CREATE INDEX IF NOT EXISTS idx_drop_ranges_item_id ON drop_ranges(item_id);
CREATE INDEX IF NOT EXISTS idx_drop_percentages_form_id ON drop_percentages(form_id);
CREATE INDEX IF NOT EXISTS idx_drop_percentages_item_id ON drop_percentages(item_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_item_id ON item_tags(item_id);
CREATE INDEX IF NOT EXISTS idx_item_tags_tag_id ON item_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_item_tag_hierarchy_parent ON item_tag_hierarchy(parent_tag_id);
CREATE INDEX IF NOT EXISTS idx_item_tag_hierarchy_child ON item_tag_hierarchy(child_tag_id);

-- Spawn tables
CREATE TABLE IF NOT EXISTS spawn_buckets (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS spawn_position_types (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS biome_types (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    is_tag INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS spawns (
    id INTEGER PRIMARY KEY,
    source_id TEXT NOT NULL UNIQUE,
    pokemon TEXT NOT NULL,
    bucket_id INTEGER NOT NULL REFERENCES spawn_buckets(id),
    position_type_id INTEGER NOT NULL REFERENCES spawn_position_types(id),
    level_min INTEGER NOT NULL,
    level_max INTEGER NOT NULL,
    weight REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS spawn_presets (
    spawn_id INTEGER NOT NULL REFERENCES spawns(id),
    preset TEXT NOT NULL,
    PRIMARY KEY (spawn_id, preset)
);

CREATE TABLE IF NOT EXISTS spawn_conditions (
    id INTEGER PRIMARY KEY,
    spawn_id INTEGER NOT NULL REFERENCES spawns(id),
    role TEXT NOT NULL,
    can_see_sky INTEGER,
    min_sky_light INTEGER,
    max_sky_light INTEGER,
    min_y INTEGER,
    max_y INTEGER,
    min_lure_level INTEGER,
    max_lure_level INTEGER,
    is_thundering INTEGER,
    is_raining INTEGER,
    moon_phase TEXT,
    time_range TEXT
);

CREATE TABLE IF NOT EXISTS spawn_condition_biomes (
    condition_id INTEGER NOT NULL REFERENCES spawn_conditions(id),
    biome_id INTEGER NOT NULL REFERENCES biome_types(id),
    PRIMARY KEY (condition_id, biome_id)
);

CREATE TABLE IF NOT EXISTS spawn_weight_multipliers (
    id INTEGER PRIMARY KEY,
    spawn_id INTEGER NOT NULL REFERENCES spawns(id),
    multiplier REAL NOT NULL,
    condition_id INTEGER REFERENCES spawn_conditions(id)
);

CREATE INDEX IF NOT EXISTS idx_spawns_bucket_id ON spawns(bucket_id);
CREATE INDEX IF NOT EXISTS idx_spawns_position_type_id ON spawns(position_type_id);
CREATE INDEX IF NOT EXISTS idx_spawn_conditions_spawn_id ON spawn_conditions(spawn_id);
CREATE INDEX IF NOT EXISTS idx_spawn_condition_biomes_condition_id ON spawn_condition_biomes(condition_id);
CREATE INDEX IF NOT EXISTS idx_spawn_condition_biomes_biome_id ON spawn_condition_biomes(biome_id);
CREATE INDEX IF NOT EXISTS idx_spawn_weight_multipliers_spawn_id ON spawn_weight_multipliers(spawn_id);
