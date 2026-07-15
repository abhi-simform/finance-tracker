import express from 'express';
import cors from 'cors';
import { TodoService } from './services/todoService.js';
import { createTodoController } from './controllers/todoController.js';
import { createTodoRoutes } from './routes/todoRoutes.js';

// createApp accepts an injected TodoService so tests can use a fresh
// in-memory store per test, while server.js injects a MongoDB-backed one.
export function createApp(todoService = new TodoService()) {
  const app = express();
  app.use(cors());
  app.use(express.json());

  const todoController = createTodoController(todoService);
  app.use('/api/todos', createTodoRoutes(todoController));

  app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  });
  return app;
}

export default createApp;
