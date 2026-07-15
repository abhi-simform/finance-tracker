// HTTP request handlers for the Todo resource.
import * as todoService from '../services/todoService.js';

export function list(req, res) {
  try {
    const todos = todoService.listTodos(req.userId);
    return res.status(200).json(todos);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
}

export function getOne(req, res) {
  try {
    const todo = todoService.getTodo(req.params.id, req.userId);
    return res.status(200).json(todo);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
}

export function create(req, res) {
  try {
    const todo = todoService.createTodo(req.userId, req.body || {});
    return res.status(201).json(todo);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
}

export function update(req, res) {
  try {
    const todo = todoService.updateTodo(req.params.id, req.userId, req.body || {});
    return res.status(200).json(todo);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
}

export function remove(req, res) {
  try {
    todoService.deleteTodo(req.params.id, req.userId);
    return res.status(204).send();
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
}
