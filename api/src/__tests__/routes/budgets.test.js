// FILE: api/src/__tests__/routes/budgets.test.js
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { setupTestDb, teardownTestDb, clearTestDb } from '../setup.js';
import { app, registerUser, authed } from '../helpers.js';

beforeAll(setupTestDb);
afterEach(clearTestDb);
afterAll(teardownTestDb);

async function firstExpenseCategory(token) {
  const cats = await request(app).get('/api/categories').set(authed(token));
  return cats.body.find((c) => c.type === 'expense')._id;
}

describe('Budgets routes', () => {
  it('creates a budget for a category/month', async () => {
    const { token } = await registerUser();
    const categoryId = await firstExpenseCategory(token);
    const res = await request(app).post('/api/budgets').set(authed(token)).send({ categoryId, month: '2026-01', amount: 200 });
    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(200);
  });

  it('rejects a budget with missing fields', async () => {
    const { token } = await registerUser();
    const res = await request(app).post('/api/budgets').set(authed(token)).send({ month: '2026-01' });
    expect(res.status).toBe(400);
  });

  it('upserts (overwrites) the budget for the same category/month', async () => {
    const { token } = await registerUser();
    const categoryId = await firstExpenseCategory(token);
    await request(app).post('/api/budgets').set(authed(token)).send({ categoryId, month: '2026-01', amount: 200 });
    const second = await request(app).post('/api/budgets').set(authed(token)).send({ categoryId, month: '2026-01', amount: 350 });
    expect(second.body.amount).toBe(350);
    const list = await request(app).get('/api/budgets?month=2026-01').set(authed(token));
    expect(list.body).toHaveLength(1);
  });

  it('deletes a budget', async () => {
    const { token } = await registerUser();
    const categoryId = await firstExpenseCategory(token);
    const create = await request(app).post('/api/budgets').set(authed(token)).send({ categoryId, month: '2026-01', amount: 100 });
    const del = await request(app).delete(`/api/budgets/${create.body._id}`).set(authed(token));
    expect(del.status).toBe(200);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/budgets');
    expect(res.status).toBe(401);
  });
});
