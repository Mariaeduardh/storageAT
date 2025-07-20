// src/routes/storage-routes.js
import { z } from 'zod';
import { DatabasePostgres } from '../database/database-postgres.js';

const database = new DatabasePostgres();

export async function storageRoutes(server) {
  // Criar item
  server.post('/storage', async (request, reply) => {
    const bodySchema = z.object({
      title: z.string().min(1, 'O título é obrigatório'),
      description: z.string().optional(),
      value: z.coerce.number().min(0.01, 'O valor deve ser maior que zero'),
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

      return reply.status(500).send({ error: 'Erro interno ao criar produto' });
    }
  });

  // Listar itens
  server.get('/storage', async (request, reply) => {
    try {
      const search = request.query.search;
      const storage = await database.list(search);

      return reply.send(storage);
    } catch (error) {
      return reply.status(500).send({ error: 'Erro ao listar produtos' });
    }
  });

  // Atualizar item
  server.put('/storage/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid('ID inválido'),
    });

    const bodySchema = z.object({
      title: z.string().min(1, 'O título é obrigatório'),
      description: z.string().optional(),
      value: z.coerce.number().min(0.01, 'O valor deve ser maior que zero'),
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

      return reply.status(500).send({ error: 'Erro ao atualizar produto' });
    }
  });

  // Remover item
  server.delete('/storage/:id', async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid('ID inválido'),
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

      return reply.status(500).send({ error: 'Erro ao deletar produto' });
    }
  });

  // 🔁 Nova rota de teste
  server.get('/ping', async (request, reply) => {
    try {
      await database.test(); // nova função no banco
      return reply.send({ message: 'Conexão com o banco funcionando!' });
    } catch (error) {
      return reply.status(500).send({ error: 'Falha ao conectar com o banco' });
    }
  });
}
