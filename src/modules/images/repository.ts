import type { Kysely } from 'kysely';
import type { DB } from '@/infrastructure/db/types';
import type { CreateImage, Image, ImageStatus, UpdateImageMetadata } from './domain';

export class ImagesRepository {
  constructor(private db: Kysely<DB>) {}

  withTransaction(trx: Kysely<DB>): ImagesRepository {
    return new ImagesRepository(trx);
  }

  async create(data: CreateImage): Promise<{ id: string; s3Key: string }> {
    const result = await this.db
      .insertInto('images')
      .values({
        s3_key: data.s3Key,
        mime_type: data.mimeType,
        uploaded_by: data.uploadedBy ?? null,
      })
      .returning(['id', 's3_key'])
      .executeTakeFirstOrThrow();

    return { id: result.id, s3Key: result.s3_key };
  }

  async getById(id: string): Promise<Image | null> {
    const row = await this.db
      .selectFrom('images')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    return row ? this.toImage(row) : null;
  }

  async getByIds(ids: string[]): Promise<Image[]> {
    if (!ids.length) return [];
    const rows = await this.db.selectFrom('images').selectAll().where('id', 'in', ids).execute();
    return rows.map((row) => this.toImage(row));
  }

  async getByS3Key(s3Key: string): Promise<Image | null> {
    const row = await this.db
      .selectFrom('images')
      .selectAll()
      .where('s3_key', '=', s3Key)
      .executeTakeFirst();
    return row ? this.toImage(row) : null;
  }

  async updateStatus(id: string, status: ImageStatus): Promise<boolean> {
    const result = await this.db
      .updateTable('images')
      .set({ status })
      .where('id', '=', id)
      .executeTakeFirst();
    return (result.numUpdatedRows ?? 0n) > 0n;
  }

  async confirmUpload(id: string, metadata: UpdateImageMetadata): Promise<boolean> {
    const result = await this.db
      .updateTable('images')
      .set({
        status: 'pending_published',
        uploaded_at: new Date(),
        width: metadata.width ?? null,
        height: metadata.height ?? null,
        file_size: metadata.fileSize ? BigInt(metadata.fileSize) : null,
      })
      .where('id', '=', id)
      .where('status', '=', 'pending_upload')
      .executeTakeFirst();
    return (result.numUpdatedRows ?? 0n) > 0n;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await this.db
      .updateTable('images')
      .set({ status: 'deleted' })
      .where('id', '=', id)
      .executeTakeFirst();
    return (result.numUpdatedRows ?? 0n) > 0n;
  }

  async hardDelete(id: string): Promise<boolean> {
    const result = await this.db.deleteFrom('images').where('id', '=', id).executeTakeFirst();
    return (result.numDeletedRows ?? 0n) > 0n;
  }

  async findPendingUploads(olderThanMinutes = 60): Promise<Image[]> {
    const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);
    const rows = await this.db
      .selectFrom('images')
      .selectAll()
      .where('status', '=', 'pending_upload')
      .where('created_at', '<', cutoff)
      .execute();
    return rows.map((row) => this.toImage(row));
  }

  private toImage(row: {
    id: string;
    s3_key: string;
    status: ImageStatus;
    mime_type: string | null;
    width: number | null;
    height: number | null;
    file_size: string | null;
    uploaded_by: string | null;
    uploaded_at: Date | null;
    created_at: Date;
  }): Image {
    return {
      id: row.id,
      s3Key: row.s3_key,
      status: row.status,
      mimeType: row.mime_type,
      width: row.width,
      height: row.height,
      fileSize: row.file_size ? Number(row.file_size) : null,
      uploadedBy: row.uploaded_by,
      uploadedAt: row.uploaded_at,
      createdAt: row.created_at,
    };
  }
}
