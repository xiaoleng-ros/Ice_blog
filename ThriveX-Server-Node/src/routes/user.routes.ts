import { Router } from 'express';
import { body } from 'express-validator';
import UserController from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validator.middleware';

const router = Router();

router.get(
  '/author',
  UserController.getAuthor
);

router.get(
  '/check',
  UserController.checkToken
);

router.post(
  '/',
  authMiddleware,
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  validateRequest,
  UserController.addUser
);

router.delete(
  '/batch',
  authMiddleware,
  UserController.batchDeleteUser
);

router.patch(
  '/',
  authMiddleware,
  UserController.editUser
);

router.delete(
  '/:id',
  authMiddleware,
  UserController.deleteUser
);

router.get(
  '/:id',
  authMiddleware,
  UserController.getUser
);

router.post(
  '/list',
  authMiddleware,
  UserController.getUserList
);

router.post(
  '/paging',
  authMiddleware,
  UserController.getUserPaging
);

router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('用户名不能为空'),
    body('password').notEmpty().withMessage('密码不能为空'),
  ],
  validateRequest,
  UserController.login
);

router.patch(
  '/pass',
  authMiddleware,
  UserController.changePassword
);

router.post(
  '/loginout',
  authMiddleware,
  UserController.logout
);

router.get(
  '/info',
  authMiddleware,
  UserController.getUserInfo
);

export default router;