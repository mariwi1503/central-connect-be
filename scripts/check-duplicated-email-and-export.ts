import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as ExcelJS from 'exceljs';
import * as path from 'path';

dotenv.config();

async function checkDuplicateEmailsAndExport() {
  const oldDb = new Client({
    connectionString: process.env.OLD_DATABASE_URL,
  });

  try {
    await oldDb.connect();
    console.log('--- Memulai Pengecekan Email Duplikat dengan Nama ---');

    // Query untuk mencari email duplikat, menggabungkan ID dan Nama
    const query = `
      SELECT 
        email, 
        COUNT(*) as total, 
        array_agg(id) as ids,
        array_agg(name) as names
      FROM "users"
      WHERE email IS NOT NULL AND email != ''
      GROUP BY email
      HAVING COUNT(*) > 1
      ORDER BY total DESC;
    `;

    const res = await oldDb.query(query);

    if (res.rows.length === 0) {
      console.log('✅ Tidak ditemukan email duplikat. Database aman!');
      return;
    }

    console.warn(
      `⚠️ Ditemukan ${res.rows.length} email duplikat. Menyiapkan Excel...`,
    );

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Email Duplikat');

    // Definisi Kolom - Ditambah kolom "Nama Terkait"
    worksheet.columns = [
      { header: 'No', key: 'no', width: 5 },
      { header: 'Email', key: 'email', width: 35 },
      { header: 'Total', key: 'total', width: 10 },
      { header: 'Nama Terkait', key: 'names', width: 50 },
      { header: 'Daftar ID (Lama)', key: 'ids', width: 60 },
    ];

    // Styling Header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Masukkan Data
    res.rows.forEach((row, index) => {
      worksheet.addRow({
        no: index + 1,
        email: row.email,
        total: parseInt(row.total),
        // Menggabungkan array nama dengan pemisah koma
        names: row.names.map((n) => n || '[Tanpa Nama]').join(', '),
        ids: row.ids.join(', '),
      });
    });

    // Bungkus teks (wrap text) untuk kolom Nama dan ID agar rapi jika sangat panjang
    worksheet.getColumn('names').alignment = {
      wrapText: true,
      vertical: 'middle',
    };
    worksheet.getColumn('ids').alignment = {
      wrapText: true,
      vertical: 'middle',
    };

    const filePath = path.join(process.cwd(), 'laporan_email_duplikat.xlsx');
    await workbook.xlsx.writeFile(filePath);

    console.log(`\n✅ Selesai! File laporan: ${filePath}`);
  } catch (error) {
    console.error('❌ Terjadi kesalahan:', error.message);
  } finally {
    await oldDb.end();
  }
}

checkDuplicateEmailsAndExport();
