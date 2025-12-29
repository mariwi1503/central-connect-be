import { Client } from 'pg';
import { adapter } from 'prisma/adapter';
import * as dotenv from 'dotenv';
import { generateKeyFromLabel } from 'src/utils';
import { PrismaClient } from 'src/generated/prisma/client';

dotenv.config();

const prisma = new PrismaClient({ adapter });
const oldDb = new Client({
  connectionString: process.env.OLD_DATABASE_URL,
});

async function migrateRolesAndPermissions() {
  await oldDb.connect();
  console.log(
    '--- Memulai Migrasi Role & Permissions (Feature & SubFeature) ---',
  );

  try {
    // ==========================================
    // 1. MIGRASI TABEL ROLE
    // ==========================================
    const roleRes = await oldDb.query('SELECT * FROM "roles"');
    const oldRoles = roleRes.rows;

    const rolesToInsert = oldRoles.map((x, i) => ({
      id: x.id,
      createdAt: x.created_at || new Date(),
      updatedAt: x.updated_at || new Date(),
      deletedAt: x.deleted_at,
      label: x.name,
      key:
        x.name.toLowerCase() === 'resident'
          ? 'resident'
          : `${generateKeyFromLabel(x.name)}_${i}`,
      access: x.access || [],
    }));

    const roleResult = await prisma.role.createMany({
      data: rolesToInsert,
      skipDuplicates: true,
    });
    console.log(`✅ Berhasil memigrasi ${roleResult.count} roles.`);

    // Persiapkan Valid ID dari DB baru untuk relasi
    const validRoles = await prisma.role.findMany({ select: { id: true } });
    const validFeatures = await prisma.feature.findMany({
      select: { id: true },
    });
    const validSubFeatures = await prisma.subFeature.findMany({
      select: { id: true },
    });

    const validRoleSet = new Set(validRoles.map((r) => r.id));
    const validFeatureSet = new Set(validFeatures.map((f) => f.id));
    const validSubFeatureSet = new Set(validSubFeatures.map((sf) => sf.id));

    // ==========================================
    // 2. MIGRASI RELASI ROLE <-> FEATURE
    // ==========================================
    console.log('--- Memulai Migrasi Relasi Role-Feature ---');
    const dashFeatRel = await oldDb.query(
      'SELECT * FROM "feature_dashboard_roles"',
    );
    const mobFeatRel = await oldDb.query(
      'SELECT * FROM "feature_mobile_roles"',
    );

    const featRelations: any[] = [];

    // Gabungkan Dashboard & Mobile Features
    [...dashFeatRel.rows, ...mobFeatRel.rows].forEach((rel) => {
      const featureId = rel.feature_dashboard_id || rel.feature_mobile_id;
      if (validRoleSet.has(rel.role_id) && validFeatureSet.has(featureId)) {
        featRelations.push({
          roleId: rel.role_id,
          featureId: featureId,
          createdAt: rel.created_at || new Date(),
          updatedAt: rel.updated_at || new Date(),
        });
      }
    });

    if (featRelations.length > 0) {
      const res = await prisma.roleFeature.createMany({
        data: featRelations,
        skipDuplicates: true,
      });
      console.log(`✅ Berhasil memigrasi ${res.count} relasi Role-Feature.`);
    }

    // ==========================================
    // 3. MIGRASI RELASI ROLE <-> SUBFEATURE
    // ==========================================
    console.log('--- Memulai Migrasi Relasi Role-SubFeature ---');
    const dashSubRel = await oldDb.query(
      'SELECT * FROM "sub_feature_dashboard_roles"',
    );
    const mobSubRel = await oldDb.query(
      'SELECT * FROM "sub_feature_mobile_roles"',
    );

    const subFeatRelations: any[] = [];

    // Gabungkan Dashboard & Mobile SubFeatures
    [...dashSubRel.rows, ...mobSubRel.rows].forEach((rel) => {
      const subFeatureId =
        rel.sub_feature_dashboard_id || rel.sub_feature_mobile_id;
      if (
        validRoleSet.has(rel.role_id) &&
        validSubFeatureSet.has(subFeatureId)
      ) {
        subFeatRelations.push({
          roleId: rel.role_id,
          subFeatureId: subFeatureId,
          createdAt: rel.created_at || new Date(),
          updatedAt: rel.updated_at || new Date(),
        });
      }
    });

    if (subFeatRelations.length > 0) {
      const res = await prisma.roleSubFeature.createMany({
        data: subFeatRelations,
        skipDuplicates: true,
      });
      console.log(`✅ Berhasil memigrasi ${res.count} relasi Role-SubFeature.`);
    }
  } catch (error) {
    console.error('❌ Gagal migrasi:', error);
  } finally {
    await oldDb.end();
    await prisma.$disconnect();
  }
}

migrateRolesAndPermissions();
