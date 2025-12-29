import { Client } from 'pg';
import { adapter } from 'prisma/adapter';
import * as dotenv from 'dotenv';
import { PrismaClient, UserStatus } from 'src/generated/prisma/client';

dotenv.config();

const prisma = new PrismaClient({ adapter });
const oldDb = new Client({
  connectionString: process.env.OLD_DATABASE_URL,
});

async function migrateInBatches() {
  await oldDb.connect();

  const BATCH_SIZE = 1000;
  let offset = 0;
  let continueMigration = true;

  while (continueMigration) {
    // 1. Extract: Ambil data secara bertahap
    const res = await oldDb.query(
      `SELECT u.*, s.name as status_name 
      FROM "users" u 
      LEFT JOIN "statuses" s ON u.status_id = s.id 
      WHERE u.deleted_at IS NULL
      ORDER BY u.id LIMIT $1 OFFSET $2`,
      [BATCH_SIZE, offset],
    );

    const oldUsers = res.rows;
    if (oldUsers.length === 0) {
      continueMigration = false;
      break;
    }

    const statusMapping = {
      Request: UserStatus.REQUESTED,
      Approved: UserStatus.APPROVED,
      Rejected: UserStatus.REJECTED,
    };

    // 2. Transform
    const dataToInsert = oldUsers.map((x) => ({
      id: x.id,
      createdAt: x.created_at,
      updatedAt: x.updated_at,
      deletedAt: x.deleted_at,
      name: x.name,
      email: x.email,
      phone: x.phone,
      imageUrl: x.image_url,
      password: x.password,
      isActive: x.is_activated,
      isReceiveEmergency: x.is_receive_emergency,
      isDashboardAccessGranted: x.can_access_dashboard,
      isResident: x.is_a_resident,
      rating: x.rating,
      lastActive: x.last_active,
      roleId: x.role_id,
      status: statusMapping[x.status_name] || UserStatus.REQUESTED,
    }));

    // 3. Load
    await prisma.user.createMany({
      data: dataToInsert,
      skipDuplicates: true,
    });

    offset += BATCH_SIZE;
    console.log(`Berhasil memigrasi ${offset} data.`);
  }

  console.log('Migrasi selesai sepenuhnya!');
  await oldDb.end();
  await prisma.$disconnect();
}

migrateInBatches();
