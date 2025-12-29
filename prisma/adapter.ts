import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

export const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
