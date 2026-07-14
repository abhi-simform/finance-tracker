// FILE: api/src/__tests__/routes/dashboard.test.js
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { setupTestDb, teardownTestDb, clearTestDb } from '../setup.js';
import { app, registerUser, authed } from '../helpers.js';

beforeAll(setupTestDb);
afterEach(clearTestDb);
afterAll(teardownTestDb);

describe('Dashboard routes', () => {
  it('computes income/expense/net summary for a month', async () => {
    const { token } = await registerUser();
    const account = await request(app).post('/api/accounts').set(authed(token)).send({ name: 'Acc', type: 'bank' });
    const accountId = account.body._id;
    await request(app).post('/api/transactions').set(authed(token)).send({ accountId, amount: 500, type: 'income', date: '2026-01-05' });
    await request(app).post('/api/transactions').set(authed(token)).send({ accountId, amount: 150, type: 'expense', date: '2026-01-06' });

    const res = await request(app).get('/api/dashboard/summary?month=2026-01').set(authed(token));
    expect(res.status).toBe(200);
    expect(res.body.income).toBe(500);
    expect(res.body.expense).toBe(150);
    expect(res.body.net).toBe(350);
  });

  it('returns an empty summary when no transactions exist for the month', async () => {
    const { token } = await registerUser();
    const res = await request(app).get('/api/dashboard/summary?month=2099-12').set(authed(token));
    expect(res.status).toBe(200);
    expect(res.body.income).toBe(0);
    expect(res.body.expense).toBe(0);
    expect(res.body.budgetVsActual).toEqual([]);
  });

  it('returns a trend series of the requested length', async () => {
    const { token } = await registerUser();
    const res = await request(app).get('/api/dashboard/trend?months=3').set(authed(token));
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/dashboard/summary');
    expect(res.status).toBe(401);
  });
});
