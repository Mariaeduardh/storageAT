import { sql } from './bd.js';

export class DatabasePostgres {
  async list(search) {
    try {
      if (search) {
        return await sql`
          SELECT * FROM storage
          WHERE title ILIKE ${'%' + search + '%'}
        `;
      }
      return await sql`SELECT * FROM storage ORDER BY title`;
    } catch (error) {
      console.error('Erro no list:', error);
      throw error;
    }
  }

  async find(id) {
    try {
      const results = await sql`
        SELECT * FROM storage WHERE id = ${id} LIMIT 1
      `;
      return results[0];
    } catch (error) {
      console.error('Erro no find:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const {
        title,
        description = '',
        precoCompra,
        value,
        quantidade = 0
      } = data;

      if (
        !title ||
        precoCompra === undefined ||
        value === undefined ||
        quantidade === undefined
      ) {
        throw new Error('Campos obrigatórios estão ausentes ou inválidos.');
      }

      console.log('🔍 Dados recebidos para INSERT:', {
        title, description, precoCompra, value, quantidade
      });

      await sql`
        INSERT INTO storage (title, description, preco_compra, value, quantidade)
        VALUES (${title}, ${description}, ${precoCompra}, ${value}, ${quantidade})
      `;
    } catch (error) {
      console.error('❌ Erro no método create:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const { title, description = '', precoCompra, value, quantidade = 0 } = data;

      await sql`
        UPDATE storage
        SET title = ${title},
            description = ${description},
            preco_compra = ${precoCompra},
            value = ${value},
            quantidade = ${quantidade}
        WHERE id = ${id}
      `;
    } catch (error) {
      console.error('Erro no update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      await sql`
        DELETE FROM storage WHERE id = ${id}
      `;
    } catch (error) {
      console.error('Erro no delete:', error);
      throw error;
    }
  }

  async decrement(id) {
    try {
      const result = await sql`
        UPDATE storage
        SET quantidade = quantidade - 1
        WHERE id = ${id} AND quantidade > 0
        RETURNING *
      `;

      if (result.length === 0) {
        throw new Error('Produto não encontrado ou quantidade já é 0');
      }
    } catch (error) {
      console.error('Erro no decrement:', error);
      throw error;
    }
  }

  async test() {
    try {
      await sql`SELECT 1`;
    } catch (error) {
      console.error('Erro no test:', error);
      throw error;
    }
  }
}