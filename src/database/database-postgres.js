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
      return await sql`SELECT * FROM storage`;
    } catch (error) {
      console.error('Erro no list:', error);
      throw error;
    }
  }

  async entries() {
    try {
      const result = await sql`SELECT * FROM storage`;
      return result.map(row => [row.id, row]);
    } catch (error) {
      console.error('Erro no entries:', error);
      throw error;
    }
  }

  async find(id) {
    try {
      return await sql`
        SELECT * FROM storage WHERE id = ${id}
      `;
    } catch (error) {
      console.error('Erro no find:', error);
      throw error;
    }
  }

  async create(data) {
    try {
      const { title, description, value, quantidade = 0 } = data;
      console.log('Produto recebido para inserir no banco:', data);

      await sql`
        INSERT INTO storage (title, description, value, quantidade)
        VALUES (${title}, ${description}, ${value}, ${quantidade})
      `;
    } catch (error) {
      console.error('Erro no create:', error);
      throw error;
    }
  }

  async update(id, data) {
    try {
      const { title, description, value, quantidade = 0 } = data;

      await sql`
        UPDATE storage
        SET title = ${title},
            description = ${description},
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
        DELETE FROM storage
        WHERE id = ${id}
      `;
    } catch (error) {
      console.error('Erro no delete:', error);
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
