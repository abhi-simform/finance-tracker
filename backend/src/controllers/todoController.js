// HTTP request handlers for the Todo resource. Built via a factory so a
// TodoService instance (in-memory for tests, MongoDB-backed in production)
// can be injected.
export function createTodoController(service) {
  return {
    async list(req, res, next) {
      try {
        const todos = await service.getAll();
        res.status(200).json(todos);
      } catch (err) {
        next(err);
      }
    },

    async getOne(req, res, next) {
      try {
        const todo = await service.getAll().then((all) => all.find((t) => t.id === req.params.id));
        if (!todo) {
          const err = new Error('Todo not found');
          err.status = 404;
          throw err;
        }
        res.status(200).json(todo);
      } catch (err) {
        next(err);
      }
    },

    async create(req, res, next) {
      try {
        const todo = await service.create(req.body || {});
        res.status(201).json(todo);
      } catch (err) {
        next(err);
      }
    },

    async update(req, res, next) {
      try {
        const todo = await service.update(req.params.id, req.body || {});
        res.status(200).json(todo);
      } catch (err) {
        next(err);
      }
    },

    async remove(req, res, next) {
      try {
        await service.delete(req.params.id);
        res.status(204).send();
      } catch (err) {
        next(err);
      }
    },

    async clearCompleted(req, res, next) {
      try {
        const todos = await service.clearCompleted();
        res.status(200).json(todos);
      } catch (err) {
        next(err);
      }
    }
  };
}

export default createTodoController;
