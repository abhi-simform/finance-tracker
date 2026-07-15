import { Router } from 'express';
import * as todoController from '../controllers/todoController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();
router.use(requireAuth);
router.get('/', todoController.list);
router.get('/:id', todoController.getOne);
router.post('/', todoController.create);
router.put('/:id', todoController.update);
router.delete('/:id', todoController.remove);

export default router;
