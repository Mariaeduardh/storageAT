import { sql } from './database/bd.js';

async function createTable() {
  try {
    // Cria a extensão
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

    // Cria a tabela
    await sql`
      CREATE TABLE IF NOT EXISTS storage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        value NUMERIC(10, 2) NOT NULL
      );
    `;

    console.log('Tabela criada com sucesso!');
  } catch (error) {
    console.error('Erro ao criar a tabela:', error);
  } finally {
    await sql.end(); // fecha conexão
  }
}

createTable();
