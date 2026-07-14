// FILE: api/src/__tests__/routes/transactions.test.js
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { setupTestDb, teardownTestDb, clearTestDb } from '../setup.js';
import { app, registerUser, authed } from '../helpers.js';

beforeAll(setupTestDb);
afterEach(clearTestDb);
afterAll(teardownTestDb);

async function makeAccount(token, name = 'Checking') {
  const res = await request(app).post('/api/accounts').set(authed(token)).send({ name, type: 'bank' });
  return res.body._id;
}

describe('Transactions routes', () => {
  it('creates an income transaction', async () => {
    const { token } = await registerUser();
    const accountId = await makeAccount(token);
    const res = await request(app).post('/api/transactions').set(authed(token))
      .send({ accountId, amount: 100, type: 'income', date: '2026-01-01' });
    expect(res.status).toBe(201);
    expect(res.body.amount).toBe(100);
  });

  it('rejects missing required fields', async () => {
    const { token } = await registerUser();
    const res = await request(app).post('/api/transactions').set(authed(token)).send({ amount: 10 });
    expect(res.status).toBe(400);
  });

  it('rejects a non-positive amount', async () => {
    const { token } = await registerUser();
    const accountId = await makeAccount(token);
    const res = await request(app).post('/api/transactions').set(authed(token))
      .send({ accountId, amount: 0, type: 'expense', date: '2026-01-01' });
    expect(res.status).toBe(400);
  });

  it('rejects a future-dated transaction', async () => {
    const { token } = await registerUser();
    const accountId = await makeAccount(token);
    const future = new Date(Date.now() + 86400000 * 30).toISOString();
    const res = await request(app).post('/api/transactions').set(authed(token))
      .send({ accountId, amount: 10, type: 'expense', date: future });
    expect(res.status).toBe(400);
  });

  it('requires transferAccountId for transfer type', async () => {
    const { token } = await registerUser();
    const accountId = await makeAccount(token);
    const res = await request(app).post('/api/transactions').set(authed(token))
      .send({ accountId, amount: 10, type: 'transfer', date: '2026-01-01' });
    expect(res.status).toBe(400);
  });

  it('lists transactions filtered by account and date range', async () => {
    const { token } = await registerUser();
    const accountId = await makeAccount(token);
    await request(app).post('/api/transactions').set(authed(token))
      .send({ accountId, amount: 50, type: 'expense', date: '2026-02-01' });
    const res = await request(app).get(`/api/transactions?accountId=${accountId}&from=2026-01-01&to=2026-03-01`).set(authed(token));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });

  it('updates and deletes a transaction', async () => {
    const { token } = await registerUser();
    const accountId = await makeAccount(token);
    const create = await request(app).post('/api/transactions').set(authed(token))
      .send({ accountId, amount: 20, type: 'expense', date: '2026-01-01' });
    const update = await request(app).put(`/api/transactions/${create.body._id}`).set(authed(token)).send({ amount: 30 });
    expect(update.body.amount).toBe(30);
    const del = await request(app).delete(`/api/transactions/${create.body._id}`).set(authed(token));
    expect(del.status).toBe(200);
  });

  it('bulk imports valid rows and reports errors for invalid ones', async () => {
    const { token } = await registerUser();
    const accountId = await makeAccount(token);
    const res = await request(app).post('/api/transactions/import').set(authed(token)).send({
      rows: [
        { date: '2026-01-01', amount: 10, type: 'expense', accountId },
        { date: '2026-01-02', amount: 5 },
      ],
    });
    expect(res.status).toBe(200);
    expect(res.body.inserted).toBe(1);
    expect(res.body.errors).toHaveLength(1);
  });
});
