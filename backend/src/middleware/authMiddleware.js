// Bearer-token auth middleware protecting the /api/todos routes.
import * as authService from '../services/authService.js';

export function requireAuth(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed authorization header' });
  }
  const token = header.slice('Bearer '.length).trim();
  const userId = authService.getUserIdFromToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.userId = userId;
  return next();
}
