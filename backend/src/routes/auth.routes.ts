// backend/src/routes/auth.routes.ts
import { Router } from 'express';
import { register, login, me, logout } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);

// Routes protégées (nécessitent authentification)
router.get('/me', authMiddleware, me);
router.post('/logout', authMiddleware, logout);

export default router;