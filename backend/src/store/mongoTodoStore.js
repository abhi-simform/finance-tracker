// MongoDB-backed Todo store (via Mongoose). Implements the same async
// interface as memoryTodoStore.js so TodoService can use either one.
import { Todo } from '../models/Todo.js';

function toPlain(doc) {
  return {
    id: doc._id.toString(),
    text: doc.text,
    completed: doc.completed,
    createdAt: doc.createdAt
  };
}

export function createMongoTodoStore() {
  return {
    async getAll() {
      const docs = await Todo.find().sort({ createdAt: 1 });
      return docs.map(toPlain);
    },

    async findById(id) {
      try {
        const doc = await Todo.findById(id);
        return doc ? toPlain(doc) : null;
      } catch {
        return null; // invalid ObjectId format
      }
    },

    async create({ text }) {
      const doc = await Todo.create({ text });
      return toPlain(doc);
    },

    async update(id, updates) {
      try {
        const doc = await Todo.findByIdAndUpdate(id, updates, {
          new: true,
          runValidators: true
        });
        return doc ? toPlain(doc) : null;
      } catch {
        return null;
      }
    },

    async delete(id) {
      try {
        const doc = await Todo.findByIdAndDelete(id);
        return !!doc;
      } catch {
        return false;
      }
    },

    async clearCompleted() {
      await Todo.deleteMany({ completed: true });
      const docs = await Todo.find().sort({ createdAt: 1 });
      return docs.map(toPlain);
    }
  };
}

export default createMongoTodoStore;
