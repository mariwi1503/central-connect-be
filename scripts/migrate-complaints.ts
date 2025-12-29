import { Client } from 'pg';
import * as dotenv from 'dotenv';
import { ComplaintStatus, PrismaClient } from 'prisma/generated/client';
import { adapter } from 'prisma/adapter';

dotenv.config();

const prisma = new PrismaClient({ adapter });
const oldDb = new Client({
  connectionString: process.env.OLD_DATABASE_URL,
});

async function migrateComplaints() {
  await oldDb.connect();
  console.log('--- Memulai Migrasi Complaint (dengan Proteksi FK) ---');

  try {
    const statusMapping: Record<string, ComplaintStatus> = {
      TERKIRIM: ComplaintStatus.SUBMITTED,
      PROSES: ComplaintStatus.IN_PROGRESS,
      SELESAI: ComplaintStatus.RESOLVED,
      BATAL: ComplaintStatus.CANCELLED,
      INVALID: ComplaintStatus.INVALID,
      'PROSES LANJUTAN': ComplaintStatus.FURTHER_PROCESS,
      'MENUNGGU KONFIRMASI': ComplaintStatus.PENDING_APPROVAL,
    };

    // 1. Ambil semua ID valid dari tabel induk di DB Baru
    const validCategories = await prisma.complaintCategory.findMany({
      select: { id: true },
    });
    const validUsers = await prisma.user.findMany({ select: { id: true } });
    const validUnits = await prisma.unit.findMany({ select: { id: true } });

    const categorySet = new Set(validCategories.map((c) => c.id));
    const userSet = new Set(validUsers.map((u) => u.id));
    const unitSet = new Set(validUnits.map((un) => un.id));

    // 2. Extract
    const res = await oldDb.query(`
      SELECT cr.*, cs.name as old_status_name
      FROM "complaint_reports" cr
      LEFT JOIN "complaint_statuses" cs ON cr.complaint_status_id = cs.id
    `);

    const oldComplaints = res.rows;
    console.log(`Mengevaluasi ${oldComplaints.length} laporan...`);

    // 3. Transform & Filter
    const finalData = oldComplaints
      .filter((x) => {
        // Validasi Kategori (Penyebab Error Anda)
        if (!categorySet.has(x.complaint_category_id)) {
          console.warn(
            `[SKIP] Complaint ID ${x.id}: Category ID ${x.complaint_category_id} tidak ditemukan.`,
          );
          return false;
        }
        // Validasi User
        if (!userSet.has(x.user_id)) {
          console.warn(
            `[SKIP] Complaint ID ${x.id}: User ID ${x.user_id} tidak ditemukan.`,
          );
          return false;
        }
        return true;
      })
      .map((x) => ({
        id: x.id,
        createdAt: x.created_at || new Date(),
        updatedAt: x.updated_at || new Date(),
        deletedAt: x.deleted_at || null,
        title: x.title,
        content: x.content,
        duration: x.duration || 0,
        rating: x.rating,
        review: x.review,
        managementRating: x.rating_pengelola || 0,
        managementReview: x.review_pengelola || '',
        managementRatingTimeStamp: x.timestamp_rating_pengelola || new Date(),
        workDuration: BigInt(x.work_duration || 0),
        estimatedFinishAt: x.estimated_finish,
        status:
          statusMapping[x.old_status_name.toUpperCase()] ||
          ComplaintStatus.SUBMITTED,
        complaintCategoryId: x.complaint_category_id,
        userId: x.user_id,
        unitId: unitSet.has(x.unit_id) ? x.unit_id : null, // Unit boleh null jika tidak valid
      }));

    // 4. Load
    if (finalData.length > 0) {
      const result = await prisma.complaint.createMany({
        data: finalData,
        skipDuplicates: true,
      });
      console.log(`✅ Berhasil memigrasi ${result.count} laporan.`);
    }
  } catch (error) {
    console.error('❌ Gagal migrasi:', error);
  } finally {
    await oldDb.end();
    await prisma.$disconnect();
  }
}

migrateComplaints();
