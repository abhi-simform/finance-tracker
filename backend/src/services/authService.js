// Business logic for user registration and login.
import crypto from 'crypto';
import * as db from '../store/db.js';

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  const hashBuf = Buffer.from(hash, 'hex');
  const checkBuf = Buffer.from(check, 'hex');
  if (hashBuf.length !== checkBuf.length) return false;
  return crypto.timingSafeEqual(hashBuf, checkBuf);
}

export function generateToken() {
  return crypto.randomBytes(24).toString('hex');
}

export function register({ email, password } = {}) {
  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.status = 400;
    throw err;
  }
  if (db.findUserByEmail(email)) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }
  const passwordHash = hashPassword(password);
  const user = db.createUser({ email, passwordHash });
  const token = generateToken();
  db.saveToken(token, user.id);
  return { user: { id: user.id, email: user.email }, token };
}

export function login({ email, password } = {}) {
  if (!email || !password) {
    const err = new Error('Email and password are required');
    err.status = 400;
    throw err;
  }
  const user = db.findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }
  const token = generateToken();
  db.saveToken(token, user.id);
  return { user: { id: user.id, email: user.email }, token };
}

export function getUserIdFromToken(token) {
  return db.getUserIdByToken(token);
}
