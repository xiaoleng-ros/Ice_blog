import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';

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
        res.json(error('GitHub登录失败'));
        return;
      }

      const userResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const githubUser: any = await userResponse.json();

      res.json(success({
        githubId: githubUser.id,
        username: githubUser.login,
        avatar: githubUser.avatar_url,
        email: githubUser.email,
      }));
    } catch (err) {
      console.error('githubLogin error:', err);
      res.json(error('GitHub登录失败'));
    }
  }

  async githubBind(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { githubId, userId } = req.body;

      res.json(success({
        message: '绑定成功',
        githubId,
        userId,
      }));
    } catch (err) {
      console.error('githubBind error:', err);
      res.json(error('GitHub绑定失败'));
    }
  }
}

export default new AuthController();
