// In-memory data store acting as the "database" for the Todo API.
// Kept intentionally simple and dependency-free so it can be swapped for a
// real database (Postgres/Mongo) later without changing service logic.
let users = [];
let todos = [];
let tokens = new Map(); // token -> userId
let userIdSeq = 1;
let todoIdSeq = 1;

export function resetStore() {
  users = [];
  todos = [];
  tokens = new Map();
  userIdSeq = 1;
  todoIdSeq = 1;
}

export function findUserByEmail(email) {
  return users.find((u) => u.email === email);
}

export function createUser({ email, passwordHash }) {
  const user = { id: String(userIdSeq++), email, passwordHash };
  users.push(user);
  return user;
}

export function saveToken(token, userId) {
  tokens.set(token, userId);
}

export function getUserIdByToken(token) {
  return tokens.get(token);
}

export function revokeToken(token) {
  tokens.delete(token);
}

export function listTodosByUser(userId) {
  return todos.filter((t) => t.userId === userId);
}

export function findTodoById(id, userId) {
  return todos.find((t) => t.id === id && t.userId === userId);
}

export function createTodo({ userId, text }) {
  const todo = {
    id: String(todoIdSeq++),
    userId,
    text,
    completed: false,
    createdAt: new Date().toISOString()
  };
  todos.push(todo);
  return todo;
}

export function updateTodo(id, userId, updates) {
  const todo = findTodoById(id, userId);
  if (!todo) return null;
  Object.assign(todo, updates);
  return todo;
}

export function deleteTodo(id, userId) {
  const idx = todos.findIndex((t) => t.id === id && t.userId === userId);
  if (idx === -1) return false;
  todos.splice(idx, 1);
  return true;
}
