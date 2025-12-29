import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { PrismaClient } from 'prisma/generated/client';
import { adapter } from 'prisma/adapter';
import { generateKeyFromLabel } from 'src/utils';

dotenv.config();

const prisma = new PrismaClient({ adapter });
const oldDb = new Client({
  connectionString: process.env.OLD_DATABASE_URL,
});

async function migrateSubFeatures() {
  await oldDb.connect();
  console.log('--- Memulai Migrasi SubFeatures (Dashboard & Mobile) ---');

  try {
    // 1. Extract data dari kedua tabel sub_feature lama
    const dashboardSubRes = await oldDb.query(
      'SELECT * FROM "sub_feature_dashboards"',
    );
    const mobileSubRes = await oldDb.query(
      'SELECT * FROM "sub_feature_mobiles"',
    );

    const oldDashboardSubs = dashboardSubRes.rows;
    const oldMobileSubs = mobileSubRes.rows;

    // 2. Transform SubFeature Dashboard
    const dashboardMapped = oldDashboardSubs.map((x, i) => ({
      id: x.id,
      createdAt: x.created_at || new Date(),
      updatedAt: x.updated_at || new Date(),
      deletedAt: x.deleted_at || null,
      label: x.name,
      key: `${generateKeyFromLabel(x.name)}_${i}`,
      order: x.order_number || 0,
      imageUrl: x.image_url,
      featureId: x.feature_dashboard_id, // Foreign Key ke Feature Dashboard
    }));

    // 3. Transform SubFeature Mobile
    const mobileMapped = oldMobileSubs.map((x, i) => ({
      id: x.id,
      createdAt: x.created_at || new Date(),
      updatedAt: x.updated_at || new Date(),
      deletedAt: x.deleted_at || null,
      label: x.name,
      key: `${generateKeyFromLabel(x.name)}_${i}`,
      order: x.order_number || 0,
      imageUrl: typeof x.image_url === 'string' ? x.image_url : null,
      featureId: x.feature_mobile_id, // Foreign Key ke Feature Mobile
    }));

    const allSubFeatures = [...dashboardMapped, ...mobileMapped];

    console.log(`Mengolah total ${allSubFeatures.length} data sub-feature...`);

    // 4. Validasi Relasi sebelum insert (Opsional tapi sangat disarankan)
    const existingFeatures = await prisma.feature.findMany({
      select: { id: true },
    });
    const existingFeatureIds = new Set(existingFeatures.map((f) => f.id));

    const finalData = allSubFeatures.filter((sf) => {
      if (!existingFeatureIds.has(sf.featureId)) {
        console.error(
          `🚨 Skip SubFeature "${sf.label}": Feature ID ${sf.featureId} tidak ditemukan!`,
        );
        return false;
      }
      return true;
    });

    // 5. Load ke Database Baru
    const result = await prisma.subFeature.createMany({
      data: finalData,
      skipDuplicates: true,
    });

    console.log(`✅ Berhasil memigrasi ${result.count} sub-features.`);

    if (result.count < finalData.length) {
      console.warn(`⚠️ Beberapa data dilewati karena duplikasi key.`);
    }
  } catch (error) {
    console.error('❌ Gagal migrasi sub-feature:', error);
  } finally {
    await oldDb.end();
    await prisma.$disconnect();
  }
}

migrateSubFeatures();
