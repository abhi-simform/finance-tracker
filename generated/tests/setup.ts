// Shared backend test utilities: in-memory store factory and todo fixtures.
import { createMemoryTodoStore } from '../../backend/src/store/memoryTodoStore.js';

export function createTestStore() {
  return createMemoryTodoStore();
}

export const todoFixtures = {
  validTodo: { text: 'Buy groceries' },
  anotherValidTodo: { text: 'Walk the dog' },
  emptyTodo: { text: '' },
  whitespaceTodo: { text: '   ' }
};

export interface TestTodo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

export function makeTodo(overrides: Partial<TestTodo> = {}): TestTodo {
  return {
    id: overrides.id ?? 'test-id',
    text: overrides.text ?? 'Sample todo',
    completed: overrides.completed ?? false,
    createdAt: overrides.createdAt ?? new Date().toISOString()
  };
}
