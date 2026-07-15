import request from 'supertest';
import { createApp } from '../../../../backend/src/app';
import { TodoService } from '../../../../backend/src/services/todoService';
import { todoFixtures } from '../../setup';

describe('Todo API routes (integration)', () => {
  let app: any;

  beforeEach(() => {
    // Story: US-006, AC: 1 — fresh isolated store per test
    app = createApp(new TodoService());
  });

  // Story: US-006, AC: 1
  it('GET /api/todos returns an empty list initially', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  // Story: US-001, AC: 1
  it('POST /api/todos creates a todo and returns 201', async () => {
    const res = await request(app).post('/api/todos').send(todoFixtures.validTodo);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.text).toBe(todoFixtures.validTodo.text);
    expect(res.body.completed).toBe(false);
  });

  // Story: US-001, AC: 2
  it('POST /api/todos returns 400 when text is missing', async () => {
    const res = await request(app).post('/api/todos').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  // Story: US-001, AC: 2
  it('POST /api/todos returns 400 when text is whitespace only', async () => {
    const res = await request(app).post('/api/todos').send(todoFixtures.whitespaceTodo);
    expect(res.status).toBe(400);
  });

  // Story: US-002, AC: 1
  it("PUT /api/todos/:id toggles a todo's completed status", async () => {
    const created = await request(app).post('/api/todos').send(todoFixtures.validTodo);
    const res = await request(app)
      .put(`/api/todos/${created.body.id}`)
      .send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  // Story: US-002, AC: 2
  it('PUT /api/todos/:id returns 404 for a non-existent id', async () => {
    const res = await request(app).put('/api/todos/does-not-exist').send({ completed: true });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Todo not found');
  });

  // Story: US-003, AC: 1
  it('DELETE /api/todos/:id removes a todo and returns 204', async () => {
    const created = await request(app).post('/api/todos').send(todoFixtures.validTodo);
    const res = await request(app).delete(`/api/todos/${created.body.id}`);
    expect(res.status).toBe(204);
    const list = await request(app).get('/api/todos');
    expect(list.body).toEqual([]);
  });

  // Story: US-003, AC: 2
  it('DELETE /api/todos/:id returns 404 for a non-existent id', async () => {
    const res = await request(app).delete('/api/todos/does-not-exist');
    expect(res.status).toBe(404);
  });

  // Story: US-005, AC: 1
  it('POST /api/todos/clear-completed removes only completed todos', async () => {
    const a = await request(app).post('/api/todos').send(todoFixtures.validTodo);
    const b = await request(app).post('/api/todos').send(todoFixtures.anotherValidTodo);
    await request(app).put(`/api/todos/${a.body.id}`).send({ completed: true });
    const res = await request(app).post('/api/todos/clear-completed');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].id).toBe(b.body.id);
  });

  // Story: US-006, AC: 3
  it('GET /api/todos reflects previously created todos (full CRUD cycle)', async () => {
    await request(app).post('/api/todos').send(todoFixtures.validTodo);
    await request(app).post('/api/todos').send(todoFixtures.anotherValidTodo);
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });
});
