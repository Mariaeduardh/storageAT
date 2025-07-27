export async function storageRoutes(server) {
  const sql = server.sql;

  // GET - Listar produtos
  server.get('/storage', async (request, reply) => {
    try {
      const produtos = await sql`SELECT * FROM storage ORDER BY title`;
      return produtos;
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      return reply.status(500).send({ error: 'Erro ao listar produtos' });
    }
  });

  // POST - Criar produto
  server.post('/storage', async (request, reply) => {
    const { title, description = '', precoCompra, value, quantidade = 0 } = request.body;

    // Validação básica
    if (
      !title ||
      precoCompra === undefined ||
      value === undefined ||
      quantidade < 0 ||
      isNaN(precoCompra) ||
      isNaN(value) ||
      isNaN(quantidade)
    ) {
      return reply.status(400).send({ error: 'Campos obrigatórios ausentes ou inválidos.' });
    }

    try {
      await sql`
        INSERT INTO storage (title, description, preco_compra, value, quantidade)
        VALUES (${title}, ${description}, ${precoCompra}, ${value}, ${quantidade})
      `;
      return reply.status(201).send({ message: 'Produto adicionado com sucesso.' });
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      return reply.status(500).send({ error: 'Erro interno ao adicionar produto.' });
    }
  });

  // PATCH - Vender (decrementar quantidade)
  server.patch('/storage/:id/decrement', async (request, reply) => {
    const { id } = request.params;

    try {
      const [produto] = await sql`SELECT * FROM storage WHERE id = ${id}`;
      if (!produto) return reply.status(404).send({ error: 'Produto não encontrado.' });

      if (produto.quantidade <= 0) {
        return reply.status(400).send({ error: 'Estoque esgotado.' });
      }

      await sql`UPDATE storage SET quantidade = quantidade - 1 WHERE id = ${id}`;
      return reply.send({ message: 'Produto vendido com sucesso.' });
    } catch (error) {
      console.error('Erro ao vender produto:', error);
      return reply.status(500).send({ error: 'Erro interno ao vender produto.' });
    }
  });

  // DELETE - Excluir produto
  server.delete('/storage/:id', async (request, reply) => {
    const { id } = request.params;

    try {
      await sql`DELETE FROM storage WHERE id = ${id}`;
      return reply.send({ message: 'Produto excluído com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      return reply.status(500).send({ error: 'Erro interno ao excluir produto.' });
    }
  });
}
