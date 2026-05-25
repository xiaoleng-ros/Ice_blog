import { Router } from 'express';
import EmailController from '../controllers/email.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/send', authMiddleware, EmailController.sendEmail);
router.post('/dismiss', authMiddleware, EmailController.sendDismissEmail);
router.post('/reply_wall', authMiddleware, EmailController.sendWallReplyEmail);

export default router;
