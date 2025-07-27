import { z } from 'zod';
import { DatabasePostgres } from '../database/database-postgres.js';

const database = new DatabasePostgres();

function mapDbToApi(produto) {
  return {
    id: produto.id,
    title: produto.title,
    description: produto.description,
    precoCompra: Number(produto.preco_compra),
    value: Number(produto.value),
    quantidade: produto.quantidade,
  };
}

export async function storageRoutes(server) {
  // Criar item
  server.post('/storage', async (request, reply) => {
    const bodySchema = z.object({
      title: z.string().min(1, 'O título é obrigatório'),
      description: z.string().optional().default(''),
      precoCompra: z.coerce.number().min(0.01, 'O preço de compra deve ser maior que zero'),
      value: z.coerce.number().min(0.01, 'O valor deve ser maior que zero'),
      quantidade: z.coerce.number().min(0).optional().default(0),
    });

    try {
      const data = bodySchema.parse(request.body);
      await database.create(data);
      return reply.status(201).send({ message: 'Produto criado com sucesso' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Erro de validação',
          issues: error.issues,
        });
      }
      console.error('Erro ao criar produto:', error);
      return reply.status(500).send({ error: 'Erro interno ao criar produto' });
    }
  });

  // Listar itens com estoque disponível
  server.get('/storage', async (request, reply) => {
    try {
      const search = request.query.search;
      const storage = await database.list(search);
      const ativos = storage.filter(prod => prod.quantidade > 0);
      const produtosMapeados = ativos.map(mapDbToApi);
      return reply.send(produtosMapeados);
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      return reply.status(500).send({ error: 'Erro ao listar produtos' });
    }
  });

  // Atualizar item
  server.put('/storage/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().min(1, 'ID inválido'),
    });

    const bodySchema = z.object({
      title: z.string().min(1, 'O título é obrigatório'),
      description: z.string().optional().default(''),
      precoCompra: z.coerce.number().min(0.01, 'O preço de compra deve ser maior que zero'),
      value: z.coerce.number().min(0.01, 'O valor deve ser maior que zero'),
      quantidade: z.coerce.number().min(0).optional().default(0),
    });

    try {
      const { id } = paramsSchema.parse(request.params);
      const data = bodySchema.parse(request.body);

      await database.update(id, data);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'Erro de validação',
          issues: error.issues,
        });
      }
      console.error('Erro ao atualizar produto:', error);
      return reply.status(500).send({ error: 'Erro ao atualizar produto' });
    }
  });

  // Remover item
  server.delete('/storage/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().min(1, 'ID inválido'),
    });

    try {
      const { id } = paramsSchema.parse(request.params);
      await database.delete(id);
      return reply.status(204).send();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({
          error: 'ID inválido',
          issues: error.issues,
        });
      }
      console.error('Erro ao deletar produto:', error);
      return reply.status(500).send({ error: 'Erro ao deletar produto' });
    }
  });

  // PATCH para decrementar quantidade e deletar se zero
  server.patch('/storage/:id/decrement', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().min(1, 'ID inválido'),
    });

    try {
      const { id } = paramsSchema.parse(request.params);

      const [item] = await database.find(id);

      if (!item) {
        return reply.status(404).send({ error: 'Produto não encontrado' });
      }

      if (item.quantidade <= 0) {
        return reply.status(400).send({ error: 'Produto sem estoque' });
      }

      const novaQuantidade = item.quantidade - 1;

      if (novaQuantidade === 0) {
        await database.delete(id);
        return reply.status(200).send({ message: 'Produto removido por falta de estoque' });
      } else {
        const dadosUpdate = {
          title: item.title,
          description: item.description || '',
          precoCompra: Number(item.preco_compra),
          value: Number(item.value),
          quantidade: novaQuantidade,
        };

        await database.update(id, dadosUpdate);

        return reply.status(200).send({ message: 'Quantidade reduzida com sucesso' });
      }
    } catch (error) {
      console.error('Erro ao reduzir quantidade:', error);
      return reply.status(500).send({ error: 'Erro ao reduzir quantidade' });
    }
  });

  // Endpoint teste conexão banco
  server.get('/ping', async (request, reply) => {
    try {
      await database.test();
      return reply.send({ message: 'Conexão com o banco funcionando!' });
    } catch (error) {
      console.error('Falha ao conectar com o banco:', error);
      return reply.status(500).send({ error: 'Falha ao conectar com o banco' });
    }
  });
}
