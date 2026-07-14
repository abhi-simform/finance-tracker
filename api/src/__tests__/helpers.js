// FILE: api/src/__tests__/helpers.js
import request from 'supertest';
import { createApp } from '../app.js';

export const app = createApp();

/** Registers a fresh user and returns { token, userId, agent } for authenticated requests. */
export async function registerUser(email = `user${Date.now()}${Math.random()}@test.com`, password = 'password123') {
  const res = await request(app).post('/api/auth/register').send({ email, password });
  return { token: res.body.token, userId: res.body.user.id, email };
}

export function authed(token) {
  return { Authorization: `Bearer ${token}` };
}
