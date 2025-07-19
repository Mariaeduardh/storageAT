import { sql } from './bd.js';

export class DatabasePostgres {
  async list(search) {
    let result;
    if (search) {
      result = await sql`
        SELECT * FROM storage
        WHERE title ILIKE ${'%' + search + '%'}
      `;
    } else {
      result = await sql`SELECT * FROM storage`;
    }

    return result;
  }

  async entries() {
    const result = await sql`SELECT * FROM storage`;
    return result.map(row => [row.id, row]);
  }

  async create(data) {
    const { title, description, value } = data;

    await sql`
      INSERT INTO storage (title, description, value)
      VALUES (${title}, ${description}, ${value})
    `;
  }

  async update(id, data) {
    const { title, description, value } = data;

    await sql`
      UPDATE storage
      SET title = ${title},
          description = ${description},
          value = ${value}
      WHERE id = ${id}
    `;
  }

  async delete(id) {
    await sql`
      DELETE FROM storage
      WHERE id = ${id}
    `;
  }
}
