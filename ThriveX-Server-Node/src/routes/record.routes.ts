import { Router } from 'express';
import RecordController from '../controllers/record.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, RecordController.addRecord);
router.delete('/:id', authMiddleware, RecordController.deleteRecord);
router.patch('/', authMiddleware, RecordController.editRecord);
router.get('/', RecordController.getRecordList);
router.get('/list', RecordController.getRecordList);
router.get('/paging', RecordController.getRecordPaging);

export default router;
