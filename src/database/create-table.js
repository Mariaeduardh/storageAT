import { sql } from './bd.js';

async function createTable() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

    await sql`
      CREATE TABLE IF NOT EXISTS storage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        preco_compra NUMERIC(10, 2) NOT NULL,
        value NUMERIC(10, 2) NOT NULL,
        quantidade INTEGER NOT NULL DEFAULT 0
      )
    `;

    console.log('Tabela criada com sucesso!');
  } catch (error) {
    console.error('Erro ao criar a tabela:', error);
  }
  // Não feche a conexão aqui se for chamar isso junto com outros scripts
  // await sql.end();
}

createTable();
