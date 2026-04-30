import { Router } from 'express';
import RecordController from '../controllers/record.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, RecordController.addRecord);
router.delete('/:id', authMiddleware, RecordController.deleteRecord);
router.patch('/', authMiddleware, RecordController.editRecord);
router.get('/', RecordController.getRecordList);
router.post('/list', RecordController.getRecordList);
router.post('/paging', RecordController.getRecordPaging);

export default router;
