import type { Kysely } from 'kysely';
import type { DB } from '../../types';
import { EntityType, Operation } from '../../../outbox/domain';
import { OutboxRepository } from '../../../outbox/repository';
import type { createLogger } from '../logger';
import type { Seeder } from '../utils';

const BATCH_SIZE = 1000;

export const outboxSeeder: Seeder = {
  name: 'Outbox Events',
  tables: ['outbox_events'],

  async seed(db: Kysely<DB>, logger: ReturnType<typeof createLogger>): Promise<number> {
    let total = 0;
    const outboxRepository = new OutboxRepository(db);

    const seedEntityIds = async (
      entityType: EntityType,
      ids: number[]
    ): Promise<number> => {
      const start = Date.now();
      const events = ids.map((id) => ({
        entityType,
        entityId: String(id),
        operation: Operation.CREATE,
      }));

      for (let i = 0; i < events.length; i += BATCH_SIZE) {
        const batch = events.slice(i, i + BATCH_SIZE);
        await outboxRepository.recordBatch(batch);
      }

      logger.table(`outbox (${entityType})`, events.length, Date.now() - start);
      return events.length;
    };

    const speciesIds = await db.selectFrom('species').select('id').execute();
    total += await seedEntityIds(EntityType.SPECIES, speciesIds.map((r) => r.id));

    // const formIds = await db.selectFrom('forms').select('id').execute();
    // total += await seedEntityIds(EntityType.FORM, formIds.map((r) => r.id));

    const moveIds = await db.selectFrom('moves').select('id').execute();
    total += await seedEntityIds(EntityType.MOVE, moveIds.map((r) => r.id));

    const abilityIds = await db.selectFrom('abilities').select('id').execute();
    total += await seedEntityIds(EntityType.ABILITY, abilityIds.map((r) => r.id));

    const itemIds = await db.selectFrom('items').select('id').execute();
    total += await seedEntityIds(EntityType.ITEM, itemIds.map((r) => r.id));

    const articleIds = await db.selectFrom('articles').select('id').execute();
    total += await seedEntityIds(EntityType.ARTICLE, articleIds.map((r) => r.id));

    return total;
  },
};
