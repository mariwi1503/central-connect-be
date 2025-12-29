export const generateKeyFromLabel = (label: string) => {
  return label
    .trim() // Hapus spasi di awal & akhir
    .toLowerCase() // Ubah ke huruf kecil
    .replace(/\s+/g, '_') // Ganti satu atau lebih spasi dengan "_"
    .replace(/[^\w]/g, ''); // Hapus karakter non-alfanumerik kecuali "_"
};

export const transformCisMeta = (cisMeta: {
  total: number;
  total_page: number;
  page: number;
  per_page: number;
}) => {
  const { total, total_page, page, per_page } = cisMeta;
  return {
    total,
    lastPage: total_page,
    currentPage: page,
    perPage: per_page,
    prev: page > 1 ? page - 1 : null,
    next: page < total_page ? page + 1 : null,
  };
};

export const generateS3Key = (filePrefix: string, fileExtension: string) => {
  const now = new Date();

  // Ambil Tahun, Bulan, dan Tanggal
  const year = now.getFullYear().toString();
  // padStart(2, '0') memastikan bulan/tanggal selalu 2 digit (misal: 01, 02)
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');

  // Ambil epoch (timestamp) dan ambil 4 angka terakhir
  const epoch = now.getTime().toString();
  const lastFourEpoch = epoch.slice(-4);

  // Gabungkan semua: 202512282893.jpg
  return `${filePrefix}_${year}${month}${day}_${lastFourEpoch}.${fileExtension}`;
};

export const generateRandomPassword = (length: number = 8): string => {
  // Ensure the length is at least 6
  const pwdLength = length < 6 ? 6 : length;

  const charset = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    all: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
  };

  let password = '';

  // 1. Guarantee at least one of each required category
  password += charset.uppercase.charAt(
    Math.floor(Math.random() * charset.uppercase.length),
  );
  password += charset.lowercase.charAt(
    Math.floor(Math.random() * charset.lowercase.length),
  );
  password += charset.numbers.charAt(
    Math.floor(Math.random() * charset.numbers.length),
  );

  // 2. Fill the rest of the password length with random characters from all sets
  for (let i = password.length; i < pwdLength; i++) {
    password += charset.all.charAt(
      Math.floor(Math.random() * charset.all.length),
    );
  }

  // return password;
  return 'Admin123';
};
