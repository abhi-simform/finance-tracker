// FILE: api/src/__tests__/routes/auth.test.js
import { describe, it, expect, beforeAll, afterAll, afterEach } from 'vitest';
import request from 'supertest';
import { setupTestDb, teardownTestDb, clearTestDb } from '../setup.js';
import { app } from '../helpers.js';

beforeAll(setupTestDb);
afterEach(clearTestDb);
afterAll(teardownTestDb);

describe('POST /api/auth/register', () => {
  it('creates a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@test.com', password: 'password123' });
    expect(res.status).toBe(201);
    expect(res.body.token).toBeTypeOf('string');
    expect(res.body.user.email).toBe('a@test.com');
  });

  it('rejects missing email or password', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@test.com' });
    expect(res.status).toBe(400);
  });

  it('rejects passwords shorter than 6 characters', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@test.com', password: '123' });
    expect(res.status).toBe(400);
  });

  it('rejects duplicate email registration', async () => {
    await request(app).post('/api/auth/register').send({ email: 'dup@test.com', password: 'password123' });
    const res = await request(app).post('/api/auth/register').send({ email: 'dup@test.com', password: 'password123' });
    expect(res.status).toBe(409);
  });
});

describe('POST /api/auth/login', () => {
  it('logs in with correct credentials', async () => {
    await request(app).post('/api/auth/register').send({ email: 'login@test.com', password: 'password123' });
    const res = await request(app).post('/api/auth/login').send({ email: 'login@test.com', password: 'password123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTypeOf('string');
  });

  it('rejects wrong password', async () => {
    await request(app).post('/api/auth/register').send({ email: 'login2@test.com', password: 'password123' });
    const res = await request(app).post('/api/auth/login').send({ email: 'login2@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('rejects unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'nope@test.com', password: 'password123' });
    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('returns the current user with a valid token', async () => {
    const reg = await request(app).post('/api/auth/register').send({ email: 'me@test.com', password: 'password123' });
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${reg.body.token}`);
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe('me@test.com');
  });
});
