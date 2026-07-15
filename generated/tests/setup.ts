// Shared test utilities: in-memory DB reset helper, auth token generator, fixtures.
import * as db from '../../backend/src/store/db.js';
import * as authService from '../../backend/src/services/authService.js';

export function resetTestDatabase() {
  db.resetStore();
}

export interface TestUser {
  id: string;
  email: string;
  token: string;
}

export function createTestUser(overrides: Partial<{ email: string; password: string }> = {}): TestUser {
  const email = overrides.email ?? `user_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
  const password = overrides.password ?? 'Sup3rSecret!';
  const { user, token } = authService.register({ email, password });
  return { id: user.id, email: user.email, token };
}

export const fixtures = {
  validTodoPayload: { text: 'Buy groceries' },
  invalidTodoPayload: { text: '   ' },
  updateCompletedPayload: { completed: true },
  invalidCompletedPayload: { completed: 'yes' }
};
