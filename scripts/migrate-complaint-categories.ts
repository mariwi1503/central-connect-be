import { Client } from 'pg';
import { adapter } from 'prisma/adapter';
import { PrismaClient } from 'prisma/generated/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient({ adapter });
const oldDb = new Client({
  connectionString: process.env.OLD_DATABASE_URL,
});

async function migrateComplaintCategories() {
  await oldDb.connect();
  console.log('--- Memulai Migrasi Complaint Categories ---');

  try {
    // 1. Extract: Ambil data dari tabel lama
    const res = await oldDb.query('SELECT * FROM "complaint_categories"');
    const oldCategories = res.rows;

    if (oldCategories.length === 0) {
      console.log('ℹ️ Tidak ada data kategori untuk dimigrasi.');
      return;
    }

    // 2. Transform: Petakan ke skema Prisma baru
    const dataToInsert = oldCategories.map((x) => ({
      id: x.id,
      createdAt: x.created_at || new Date(),
      updatedAt: x.updated_at || new Date(),
      deletedAt: x.deleted_at || null,
      label: x.name,
      description: x.description || '',
      order: x.order_number || 0,
    }));

    // 3. Load: Simpan ke DB baru
    const result = await prisma.complaintCategory.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });

    console.log(`✅ Berhasil memigrasi ${result.count} kategori pengaduan.`);
  } catch (error) {
    console.error('❌ Gagal migrasi kategori pengaduan:', error);
  } finally {
    await oldDb.end();
    await prisma.$disconnect();
  }
}

migrateComplaintCategories();
