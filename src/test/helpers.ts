import type { Kysely } from 'kysely';
import type { DB } from '../infrastructure/db/types';
import { testDb } from './db';

class RollbackError extends Error {
  constructor() {
    super('test rollback');
  }
}

export async function createTestTransaction(): Promise<{
  trx: Kysely<DB>;
  rollback: () => Promise<void>;
}> {
  let resolveTrx: ((trx: Kysely<DB>) => void) | undefined;
  let rejectTransaction: ((err: Error) => void) | undefined;

  const trxPromise = new Promise<Kysely<DB>>((resolve) => {
    resolveTrx = resolve;
  });

  const transactionPromise = testDb
    .transaction()
    .execute(
      (trx) =>
        new Promise<void>((_, reject) => {
          rejectTransaction = reject;
          resolveTrx?.(trx);
        })
    )
    .catch((err) => {
      if (err instanceof RollbackError) return;
      throw err;
    });

  const trx = await trxPromise;

  const rollback = async () => {
    rejectTransaction?.(new RollbackError());
    await transactionPromise;
  };

  return { trx, rollback };
}
