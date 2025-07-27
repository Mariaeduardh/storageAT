import { sql } from './bd.js';

export async function setupDatabase() {
  try {
    // Habilita extensão para gerar UUIDs
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

    // Cria tabela caso não exista, com todas colunas obrigatórias
    await sql`
      CREATE TABLE IF NOT EXISTS storage (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        preco_compra NUMERIC(10, 2) NOT NULL DEFAULT 0,
        value NUMERIC(10, 2) NOT NULL DEFAULT 0,
        quantidade INTEGER NOT NULL DEFAULT 0
      )
    `;

    // Garante que a coluna preco_compra exista (adiciona se faltar)
    await sql`
      ALTER TABLE storage
      ADD COLUMN IF NOT EXISTS preco_compra NUMERIC(10, 2) NOT NULL DEFAULT 0
    `;

    // Garante que a coluna quantidade exista (adiciona se faltar)
    await sql`
      ALTER TABLE storage
      ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 0
    `;

    console.log('✅ Tabela e colunas configuradas corretamente!');
  } catch (error) {
    console.error('❌ Erro ao configurar banco de dados:', error);
    throw error;
  }
}
