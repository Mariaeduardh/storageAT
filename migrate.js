import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL, {
  ssl: {
    rejectUnauthorized: false,
  },
});

async function runMigration() {
  try {
    await sql`
      ALTER TABLE storage ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 0;
    `;
    console.log('Coluna quantidade adicionada com sucesso (ou já existente)!');
  } catch (error) {
    console.error('Erro ao executar migration:', error);
  } finally {
    await sql.end(); // fecha conexão
  }
}

runMigration();
