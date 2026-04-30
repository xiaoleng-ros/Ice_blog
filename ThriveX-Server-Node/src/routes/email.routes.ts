import { Router } from 'express';
import EmailController from '../controllers/email.controller';

const router = Router();

router.post('/send', EmailController.sendEmail);
router.post('/dismiss', EmailController.sendDismissEmail);
router.post('/reply_wall', EmailController.sendWallReplyEmail);

export default router;
