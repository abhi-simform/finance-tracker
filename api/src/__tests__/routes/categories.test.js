// FILE: api/src/__tests__/routes/categories.test.js
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { setupTestDb, teardownTestDb, clearTestDb } from '../setup.js';
import { app, registerUser, authed } from '../helpers.js';

beforeAll(setupTestDb);
afterEach(clearTestDb);
afterAll(teardownTestDb);

describe('Categories routes', () => {
  it('seeds default categories on registration', async () => {
    const { token } = await registerUser();
    const res = await request(app).get('/api/categories').set(authed(token));
    expect(res.status).toBe(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.every((c) => c.isDefault)).toBe(true);
  });

  it('creates a custom category', async () => {
    const { token } = await registerUser();
    const res = await request(app).post('/api/categories').set(authed(token)).send({ name: 'Gym', type: 'expense' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Gym');
    expect(res.body.isDefault).toBe(false);
  });

  it('rejects a category without name or type', async () => {
    const { token } = await registerUser();
    const res = await request(app).post('/api/categories').set(authed(token)).send({ name: 'NoType' });
    expect(res.status).toBe(400);
  });

  it('deletes a category', async () => {
    const { token } = await registerUser();
    const create = await request(app).post('/api/categories').set(authed(token)).send({ name: 'Temp', type: 'expense' });
    const del = await request(app).delete(`/api/categories/${create.body._id}`).set(authed(token));
    expect(del.status).toBe(200);
    const list = await request(app).get('/api/categories').set(authed(token));
    expect(list.body.find((c) => c._id === create.body._id)).toBeUndefined();
  });

  it('requires authentication', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(401);
  });
});
