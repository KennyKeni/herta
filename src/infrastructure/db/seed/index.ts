import { db } from '../index';
import { createLogger } from './logger';
import {
  abilitiesSeeder,
  articlesSeeder,
  aspectsSeeder,
  baseReferenceSeeder,
  cobblemonSeeder,
  formsSeeder,
  gameMechanicsSeeder,
  itemsSeeder,
  movesSeeder,
  naturesSeeder,
  outboxSeeder,
  pokemonDataSeeder,
  recipesSeeder,
  speciesSeeder,
} from './seeders';
import type { Seeder } from './utils';

const SEEDERS: Seeder[] = [
  baseReferenceSeeder,
  naturesSeeder,
  abilitiesSeeder,
  speciesSeeder,
  formsSeeder,
  movesSeeder,
  itemsSeeder,
  aspectsSeeder,
  gameMechanicsSeeder,
  cobblemonSeeder,
  recipesSeeder,
  pokemonDataSeeder,
  articlesSeeder,
  outboxSeeder,
];

async function main() {
  const logger = createLogger();
  const startTime = Date.now();
  let totalRows = 0;

  logger.info('Starting database seed...');

  try {
    for (const seeder of SEEDERS) {
      const count = await seeder.seed(db, logger);
      totalRows += count;
    }

    logger.summary(totalRows, Date.now() - startTime);
  } catch (error) {
    logger.error('Seed failed', error as Error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

main();
