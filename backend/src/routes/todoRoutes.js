// Express routes for the Todo resource (shared list, no auth required).
import { Router } from 'express';

export function createTodoRoutes(controller) {
  const router = Router();
  router.get('/', controller.list);
  router.post('/clear-completed', controller.clearCompleted);
  router.get('/:id', controller.getOne);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);
  return router;
}

export default createTodoRoutes;
