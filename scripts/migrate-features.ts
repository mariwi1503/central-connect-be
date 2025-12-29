import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { adapter } from 'prisma/adapter';
import { generateKeyFromLabel } from 'src/utils';
import { FeatureType, PrismaClient } from 'src/generated/prisma/client';

dotenv.config();

const prisma = new PrismaClient({ adapter });
const oldDb = new Client({
  connectionString: process.env.OLD_DATABASE_URL,
});

async function migrateFeatures() {
  await oldDb.connect();
  console.log('--- Memulai Migrasi Features (Dashboard & Mobile) ---');

  try {
    // 1. Extract data dari kedua tabel lama
    const dashboardRes = await oldDb.query(
      'SELECT * FROM "feature_dashboards"',
    );
    const mobileRes = await oldDb.query('SELECT * FROM "feature_mobiles"');

    const oldDashboardFeatures = dashboardRes.rows;
    const oldMobileFeatures = mobileRes.rows;

    // 2. Transform Dashboard Features
    const dashboardMapped = oldDashboardFeatures.map((x, i) => ({
      id: x.id,
      createdAt: x.created_at || new Date(),
      updatedAt: x.updated_at || new Date(),
      deletedAt: x.deleted_at || null,
      label: x.name,
      key: `${generateKeyFromLabel(x.name)}_${i}`,
      order: x.order_number || 0,
      imageUrl: x.image_url,
      type: FeatureType.WEB,
    }));

    // 3. Transform Mobile Features
    const mobileMapped = oldMobileFeatures.map((x, i) => ({
      id: x.id,
      createdAt: x.created_at || new Date(),
      updatedAt: x.updated_at || new Date(),
      deletedAt: x.deleted_at || null,
      label: x.name,
      key: `${generateKeyFromLabel(x.name)}_${i}`,
      order: x.order_number || 0,
      imageUrl: typeof x.image_url === 'string' ? x.image_url : null, // Handle boolean issue di schema lama
      type: FeatureType.MOBILE,
    }));

    const allFeatures = [...dashboardMapped, ...mobileMapped];

    console.log(`Mengolah total ${allFeatures.length} data feature...`);

    // 4. Load ke Database Baru
    const result = await prisma.feature.createMany({
      data: allFeatures,
      skipDuplicates: true,
    });

    console.log(`✅ Berhasil memigrasi ${result.count} features.`);
  } catch (error) {
    console.error('❌ Gagal migrasi feature:', error);
  } finally {
    await oldDb.end();
    await prisma.$disconnect();
  }
}

migrateFeatures();
