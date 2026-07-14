// FILE: api/src/__tests__/routes/accounts.test.js
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { setupTestDb, teardownTestDb, clearTestDb } from '../setup.js';
import { app, registerUser, authed } from '../helpers.js';

beforeAll(setupTestDb);
afterEach(clearTestDb);
afterAll(teardownTestDb);

describe('Accounts routes', () => {
  it('rejects all account routes without a token', async () => {
    expect((await request(app).get('/api/accounts')).status).toBe(401);
    expect((await request(app).post('/api/accounts').send({ name: 'x', type: 'bank' })).status).toBe(401);
  });

  it('creates an account and lists it with a computed balance', async () => {
    const { token } = await registerUser();
    const create = await request(app).post('/api/accounts').set(authed(token)).send({ name: 'Checking', type: 'bank' });
    expect(create.status).toBe(201);
    expect(create.body.name).toBe('Checking');

    const list = await request(app).get('/api/accounts').set(authed(token));
    expect(list.status).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].balance).toBe(0);
  });

  it('rejects account creation with missing fields', async () => {
    const { token } = await registerUser();
    const res = await request(app).post('/api/accounts').set(authed(token)).send({ name: 'No Type' });
    expect(res.status).toBe(400);
  });

  it('updates an account', async () => {
    const { token } = await registerUser();
    const create = await request(app).post('/api/accounts').set(authed(token)).send({ name: 'Old', type: 'cash' });
    const res = await request(app).put(`/api/accounts/${create.body._id}`).set(authed(token)).send({ name: 'New' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New');
  });

  it('archives (soft-deletes) an account', async () => {
    const { token } = await registerUser();
    const create = await request(app).post('/api/accounts').set(authed(token)).send({ name: 'ToArchive', type: 'cash' });
    const res = await request(app).delete(`/api/accounts/${create.body._id}`).set(authed(token));
    expect(res.status).toBe(200);
    expect(res.body.archivedAt).not.toBeNull();
  });

  it('returns 404 when updating another user account', async () => {
    const userA = await registerUser();
    const userB = await registerUser();
    const create = await request(app).post('/api/accounts').set(authed(userA.token)).send({ name: 'Mine', type: 'bank' });
    const res = await request(app).put(`/api/accounts/${create.body._id}`).set(authed(userB.token)).send({ name: 'Hacked' });
    expect(res.status).toBe(404);
  });
});
