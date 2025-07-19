import { randomUUID } from 'node:crypto';

export class DatabaseMemory {
  #storage = new Map();

  list(search) {
    return Array.from(this.#storage.values()).filter(storage => {
      if (search) {
        return storage.title.includes(search);
      }
      return true;
    });
  }

  entries() {
    return Array.from(this.#storage.entries());
  }

  create(data) {
    const id = randomUUID();
    this.#storage.set(id, data);
  }

  update(id, data) {
    this.#storage.set(id, data);
  }

  delete(id) {
    this.#storage.delete(id);
  }
}
