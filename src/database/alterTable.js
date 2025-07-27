import { sql } from './bd.js';

async function alterarTabela() {
  try {
    // Adiciona a coluna preco_compra se não existir
    await sql`
      ALTER TABLE storage
      ADD COLUMN IF NOT EXISTS preco_compra NUMERIC(10, 2) NOT NULL DEFAULT 0
    `;

    // Adiciona a coluna quantidade se não existir
    await sql`
      ALTER TABLE storage
      ADD COLUMN IF NOT EXISTS quantidade INTEGER NOT NULL DEFAULT 0
    `;

    console.log('Colunas "preco_compra" e "quantidade" adicionadas com sucesso (ou já existiam).');
  } catch (error) {
    console.error('Erro ao alterar a tabela:', error);
  }
  // Não feche a conexão aqui se for chamar isso junto com outros scripts
  // await sql.end();
}

alterarTabela();
