// HTTP request handlers for authentication endpoints.
import * as authService from '../services/authService.js';

export function register(req, res) {
  try {
    const result = authService.register(req.body || {});
    return res.status(201).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
}

export function login(req, res) {
  try {
    const result = authService.login(req.body || {});
    return res.status(200).json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
  }
}
