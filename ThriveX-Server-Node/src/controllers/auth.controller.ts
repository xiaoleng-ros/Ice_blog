import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { prisma } from '../utils/prisma';

class AuthController {
  async githubLogin(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { code } = req.body;

      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        }),
      });

      const tokenData: any = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      if (!accessToken) {
        sendError(res, 'GitHub登录失败', 401);
        return;
      }

      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const githubUser: any = await userResponse.json();

      sendSuccess(res, {
        githubId: githubUser.id,
        username: githubUser.login,
        avatar: githubUser.avatar_url,
        email: githubUser.email,
      });
    } catch (err) {
      console.error('githubLogin error:', err);
      sendError(res, 'GitHub登录失败', 500);
    }
  }

  /** GitHub 账号绑定 — 将 GitHub ID 保存到用户记录 */
  async githubBind(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { githubId, userId } = req.body;

      if (!githubId || !userId) {
        sendError(res, '缺少 githubId 或 userId', 400);
        return;
      }

      await prisma.user.update({
        where: { id: userId },
        data: { githubId: String(githubId) },
      });

      sendSuccess(res, { message: '绑定成功', githubId, userId });
    } catch (err) {
      console.error('githubBind error:', err);
      sendError(res, 'GitHub绑定失败', 500);
    }
  }
}

export default new AuthController();
