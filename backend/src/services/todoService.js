// Business logic for Todo CRUD operations. Persistence is delegated to an
// injected store (in-memory by default, MongoDB in production) so the same
// service works in tests and against a real database.
import { createMemoryTodoStore } from '../store/memoryTodoStore.js';

export class TodoService {
  constructor(store = createMemoryTodoStore()) {
    this.store = store;
  }

  async getAll() {
    return this.store.getAll();
  }

  async create({ text } = {}) {
    if (!text || !text.trim()) {
      const err = new Error('Text is required');
      err.status = 400;
      throw err;
    }
    return this.store.create({ text: text.trim() });
  }

  async update(id, updates = {}) {
    const allowed = {};
    if (updates.text !== undefined) {
      if (!updates.text.trim()) {
        const err = new Error('Text cannot be empty');
        err.status = 400;
        throw err;
      }
      allowed.text = updates.text.trim();
    }
    if (updates.completed !== undefined) {
      if (typeof updates.completed !== 'boolean') {
        const err = new Error('completed must be a boolean');
        err.status = 400;
        throw err;
      }
      allowed.completed = updates.completed;
    }
    const todo = await this.store.update(id, allowed);
    if (!todo) {
      const err = new Error('Todo not found');
      err.status = 404;
      throw err;
    }
    return todo;
  }

  async delete(id) {
    const success = await this.store.delete(id);
    if (!success) {
      const err = new Error('Todo not found');
      err.status = 404;
      throw err;
    }
    return true;
  }

  async clearCompleted() {
    return this.store.clearCompleted();
  }
}

export default TodoService;
