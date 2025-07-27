import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

export const sql = postgres(process.env.DATABASE_URL, {
  ssl: 'require' // ou false, dependendo do seu banco
});
