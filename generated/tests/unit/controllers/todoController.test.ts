import { createTodoController } from '../../../../backend/src/controllers/todoController';
import { todoFixtures, makeTodo } from '../../setup';

function mockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
}

describe('TodoController (unit, mocked service)', () => {
  let service: any;
  let controller: any;
  let next: jest.Mock;

  beforeEach(() => {
    service = {
      getAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      clearCompleted: jest.fn(),
    };
    controller = createTodoController(service);
    next = jest.fn();
  });

  // Story: US-006, AC: 1
  it('list() returns all todos as JSON', async () => {
    const todos = [makeTodo({ id: '1' }), makeTodo({ id: '2' })];
    service.getAll.mockResolvedValue(todos);
    const res = mockRes();
    await controller.list({}, res, next);
    expect(res.json).toHaveBeenCalledWith(todos);
  });

  // Story: US-006, AC: 2 (500 error path)
  it('list() forwards unexpected errors to next()', async () => {
    const err = new Error('Unexpected failure');
    service.getAll.mockRejectedValue(err);
    const res = mockRes();
    await controller.list({}, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  // Story: US-001, AC: 1
  it('create() responds 201 with the created todo', async () => {
    const created = makeTodo({ id: 'new-1' });
    service.create.mockResolvedValue(created);
    const req: any = { body: todoFixtures.validTodo };
    const res = mockRes();
    await controller.create(req, res, next);
    expect(service.create).toHaveBeenCalledWith(todoFixtures.validTodo);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(created);
  });

  // Story: US-001, AC: 2 (400 validation error path)
  it('create() forwards validation errors to next()', async () => {
    const err: any = new Error('Text is required');
    err.status = 400;
    service.create.mockRejectedValue(err);
    const req: any = { body: todoFixtures.emptyTodo };
    const res = mockRes();
    await controller.create(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
    expect(res.json).not.toHaveBeenCalled();
  });

  // Story: US-002, AC: 1
  it('update() responds with the updated todo', async () => {
    const updated = makeTodo({ id: '1', completed: true });
    service.update.mockResolvedValue(updated);
    const req: any = { params: { id: '1' }, body: { completed: true } };
    const res = mockRes();
    await controller.update(req, res, next);
    expect(service.update).toHaveBeenCalledWith('1', { completed: true });
    expect(res.json).toHaveBeenCalledWith(updated);
  });

  // Story: US-002, AC: 2 (404 not-found error path)
  it('update() forwards not-found errors to next()', async () => {
    const err: any = new Error('Todo not found');
    err.status = 404;
    service.update.mockRejectedValue(err);
    const req: any = { params: { id: 'missing' }, body: { completed: true } };
    const res = mockRes();
    await controller.update(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  // Story: US-003, AC: 1
  it('remove() responds 204 on successful delete', async () => {
    service.delete.mockResolvedValue(true);
    const req: any = { params: { id: '1' } };
    const res = mockRes();
    await controller.remove(req, res, next);
    expect(service.delete).toHaveBeenCalledWith('1');
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });

  // Story: US-003, AC: 2 (404 not-found error path)
  it('remove() forwards not-found errors to next()', async () => {
    const err: any = new Error('Todo not found');
    err.status = 404;
    service.delete.mockRejectedValue(err);
    const req: any = { params: { id: 'missing' } };
    const res = mockRes();
    await controller.remove(req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  // Story: US-005, AC: 1
  it('clearCompleted() responds with the remaining todos', async () => {
    const remaining = [makeTodo({ id: '2' })];
    service.clearCompleted.mockResolvedValue(remaining);
    const res = mockRes();
    await controller.clearCompleted({}, res, next);
    expect(res.json).toHaveBeenCalledWith(remaining);
  });
});
