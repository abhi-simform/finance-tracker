// FILE: api/src/app.js
import express from 'express';
import cors from 'cors';
import routes from './routes.js';

/** Builds the Express app without starting a listener, so tests can import
 * and exercise it directly via supertest without binding a real port. */
export function createApp() {
  const app = express();
  app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
  app.use(express.json());

  app.get('/health', (req, res) => res.json({ ok: true }));
  app.use('/api', routes);

  app.use((req, res) => res.status(404).json({ error: 'Not found' }));
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
