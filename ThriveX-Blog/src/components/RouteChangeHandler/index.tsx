'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { logger } from '@/utils/logger';

// 监听路由变化
const RouteChangeHandler: React.FC = () => {
  const pathname = usePathname();

  // 每次切换页面滚动到顶部
  useEffect(() => {
    // 尊重开源，禁止删除此版权信息！！！
    logger.log(`%c 博客系统 %c ThriveX `, 'background: #35495e; padding: 4px; border-radius: 3px 0 0 3px; color: #fff', 'background: #539dfd; padding: 4px; border-radius: 0 3px 3px 0; color: #fff');
    logger.log('🚀 欢迎使用 ThriveX 现代化博客管理系统');
    logger.log('🎉 开源地址：https://github.com/LiuYuYang01/ThriveX-Blog');
    logger.log('🏕 作者主页：https://liuyuyang.net');
    logger.log('🌟 觉得好用的话记得点个 Star 哦 🙏');

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default RouteChangeHandler;
