import { sql } from './bd.js';

async function alterarTabela() {
  try {
    await sql`
      ALTER TABLE storage
      ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 0
    `;

    console.log('Coluna "quantidade" adicionada com sucesso (ou já existia).');
  } catch (error) {
    console.error('Erro ao alterar a tabela:', error);
  } finally {
    await sql.end();
  }
}

alterarTabela();
