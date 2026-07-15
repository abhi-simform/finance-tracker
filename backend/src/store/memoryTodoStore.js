// In-memory Todo store used as the default store (e.g. for tests) and as a
// reference implementation of the store interface consumed by TodoService.
// All methods are async to match the real MongoDB-backed store's contract.
import { randomUUID } from 'crypto';

export function createMemoryTodoStore() {
  let todos = [];

  return {
    async getAll() {
      return [...todos];
    },

    async findById(id) {
      return todos.find((t) => t.id === id) || null;
    },

    async create({ text }) {
      const todo = {
        id: randomUUID(),
        text,
        completed: false,
        createdAt: new Date().toISOString()
      };
      todos.push(todo);
      return todo;
    },

    async update(id, updates) {
      const todo = todos.find((t) => t.id === id);
      if (!todo) return null;
      Object.assign(todo, updates);
      return todo;
    },

    async delete(id) {
      const idx = todos.findIndex((t) => t.id === id);
      if (idx === -1) return false;
      todos.splice(idx, 1);
      return true;
    },

    async clearCompleted() {
      todos = todos.filter((t) => !t.completed);
      return [...todos];
    }
  };
}

export default createMemoryTodoStore;
