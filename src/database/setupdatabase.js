export async function setupDatabase(sql) {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS "pgcrypto"`;

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

    await sql`
      ALTER TABLE storage
      ADD COLUMN IF NOT EXISTS preco_compra NUMERIC(10, 2) NOT NULL DEFAULT 0
    `;

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
