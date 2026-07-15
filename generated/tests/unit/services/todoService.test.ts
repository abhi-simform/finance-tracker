import { TodoService } from '../../../../backend/src/services/todoService';
import { createTestStore, todoFixtures } from '../../setup';

describe('TodoService (unit)', () => {
  let service: any;

  beforeEach(() => {
    service = new TodoService(createTestStore());
  });

  // Story: US-001, AC: 1
  it('creates a new todo with trimmed text and completed=false', () => {
    const todo = service.create({ text: '  Buy milk  ' });
    expect(todo).toHaveProperty('id');
    expect(todo.text).toBe('Buy milk');
    expect(todo.completed).toBe(false);
  });

  // Story: US-001, AC: 2
  it('rejects creating a todo with empty text', () => {
    expect(() => service.create({ text: todoFixtures.emptyTodo.text })).toThrow('Text is required');
  });

  // Story: US-001, AC: 2
  it('rejects creating a todo with whitespace-only text', () => {
    expect(() => service.create({ text: todoFixtures.whitespaceTodo.text })).toThrow('Text is required');
  });

  // Story: US-006, AC: 1
  it('lists all created todos', () => {
    service.create(todoFixtures.validTodo);
    service.create(todoFixtures.anotherValidTodo);
    const all = service.getAll();
    expect(all).toHaveLength(2);
    expect(all.map((t: any) => t.text)).toEqual(
      expect.arrayContaining([todoFixtures.validTodo.text, todoFixtures.anotherValidTodo.text])
    );
  });

  // Story: US-002, AC: 1
  it('toggles completed state on update', () => {
    const created = service.create(todoFixtures.validTodo);
    const updated = service.update(created.id, { completed: true });
    expect(updated.completed).toBe(true);
  });

  // Story: US-002, AC: 2
  it('throws a 404 error when updating a non-existent todo', () => {
    expect.assertions(2);
    try {
      service.update('does-not-exist', { completed: true });
    } catch (err: any) {
      expect(err.status).toBe(404);
      expect(err.message).toBe('Todo not found');
    }
  });

  // Story: US-001, AC: 3
  it('rejects updating a todo to empty text', () => {
    const created = service.create(todoFixtures.validTodo);
    expect(() => service.update(created.id, { text: '   ' })).toThrow('Text cannot be empty');
  });

  // Story: US-003, AC: 1
  it('deletes an existing todo', () => {
    const created = service.create(todoFixtures.validTodo);
    const result = service.delete(created.id);
    expect(result).toBe(true);
    expect(service.getAll()).toHaveLength(0);
  });

  // Story: US-003, AC: 2
  it('throws a 404 error when deleting a non-existent todo', () => {
    expect.assertions(2);
    try {
      service.delete('missing-id');
    } catch (err: any) {
      expect(err.status).toBe(404);
      expect(err.message).toBe('Todo not found');
    }
  });

  // Story: US-005, AC: 1
  it('clears only completed todos', () => {
    const a = service.create(todoFixtures.validTodo);
    const b = service.create(todoFixtures.anotherValidTodo);
    service.update(a.id, { completed: true });
    const remaining = service.clearCompleted();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(b.id);
  });
});
