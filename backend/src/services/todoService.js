// Business logic for Todo CRUD operations, scoped per authenticated user.
import * as db from '../store/db.js';

export function listTodos(userId) {
  return db.listTodosByUser(userId);
}

export function getTodo(id, userId) {
  const todo = db.findTodoById(id, userId);
  if (!todo) {
    const err = new Error('Todo not found');
    err.status = 404;
    throw err;
  }
  return todo;
}

export function createTodo(userId, { text } = {}) {
  if (!text || !text.trim()) {
    const err = new Error('Text is required');
    err.status = 400;
    throw err;
  }
  return db.createTodo({ userId, text: text.trim() });
}

export function updateTodo(id, userId, updates = {}) {
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
  const todo = db.updateTodo(id, userId, allowed);
  if (!todo) {
    const err = new Error('Todo not found');
    err.status = 404;
    throw err;
  }
  return todo;
}

export function deleteTodo(id, userId) {
  const success = db.deleteTodo(id, userId);
  if (!success) {
    const err = new Error('Todo not found');
    err.status = 404;
    throw err;
  }
  return true;
}
