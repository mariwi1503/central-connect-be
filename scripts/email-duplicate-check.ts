import { Client } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkDuplicateEmails() {
  const oldDb = new Client({
    connectionString: process.env.OLD_DATABASE_URL,
  });

  try {
    await oldDb.connect();
    console.log('--- Memulai Pengecekan Email Duplikat ---');

    // Query untuk mencari email yang muncul lebih dari 1 kali
    const query = `
      SELECT email, COUNT(*) as total, array_agg(id) as ids
      FROM "users"
      WHERE email IS NOT NULL AND email != ''
      GROUP BY email
      HAVING COUNT(*) > 1
      ORDER BY total DESC;
    `;

    const res = await oldDb.query(query);

    if (res.rows.length === 0) {
      console.log('✅ Tidak ditemukan email duplikat. Database aman!');
    } else {
      console.warn(`⚠️ Ditemukan ${res.rows.length} email yang duplikat!\n`);

      console.table(
        res.rows.map((row) => ({
          Email: row.email,
          Jumlah: row.total,
          IDs: row.ids.join(', '),
        })),
      );

      console.log(
        '\nSaran: Bersihkan data di atas atau gunakan logika filter di script migrasi agar tidak terkena Unique Constraint.',
      );
    }
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat cek database:', error.message);
  } finally {
    await oldDb.end();
  }
}

checkDuplicateEmails();
