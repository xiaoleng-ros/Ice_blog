import { useEffect, useRef } from 'react';
import DefaultLayout from '@/layout/DefaultLayout';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import Home from '@/pages/dashboard';
import Create from '@/pages/create';
import CreateRecord from '@/pages/create_record';
import Cate from '@/pages/cate';
import Article from '@/pages/article';
import Comment from '@/pages/comment';
import Wall from '@/pages/wall';
import Tag from '@/pages/tag';
import Web from '@/pages/web';
import Swiper from '@/pages/swiper';
import Footprint from '@/pages/footprint';
import Setup from '@/pages/setup';
import File from '@/pages/file';
import Iterative from '@/pages/iterative';
import Login from '@/pages/login';
import Work from '@/pages/work';
import Draft from '@/pages/draft';
import Decycle from '@/pages/decycle';
import Record from '@/pages/record';
import Storage from '@/pages/storage';
import Assistant from '@/pages/assistant';
import Config from '@/pages/config';

import PageTitle from '../PageTitle';

import { useUserStore } from '@/stores';
import { checkTokenAPI } from '@/api/user';
import NotFound from '../NotFound';

const routeConfigs = [
  { path: '/', title: '仪表盘', Component: Home },
  { path: '/create', title: '发挥灵感', Component: Create },
  { path: '/create_record', title: '闪念', Component: CreateRecord },
  { path: '/draft', title: '草稿箱', Component: Draft },
  { path: '/recycle', title: '回收站', Component: Decycle },
  { path: '/cate', title: '导航管理', Component: Cate },
  { path: '/article', title: '文章管理', Component: Article },
  { path: '/record', title: '说说管理', Component: Record },
  { path: '/tag', title: '标签管理', Component: Tag },
  { path: '/comment', title: '评论管理', Component: Comment },
  { path: '/wall', title: '评论管理', Component: Wall },
  { path: '/web', title: '网站管理', Component: Web },
  { path: '/swiper', title: '轮播图管理', Component: Swiper },
  { path: '/footprint', title: '足迹管理', Component: Footprint },
  { path: '/storage', title: '存储管理', Component: Storage },
  { path: '/setup', title: '项目配置', Component: Setup },
  { path: '/file', title: '文件管理', Component: File },
  { path: '/iter', title: '项目更新记录', Component: Iterative },
  { path: '/work', title: '工作台', Component: Work },
  { path: '/assistant', title: '助手管理', Component: Assistant },
  { path: '/config', title: '项目配置', Component: Config },
];

export default () => {
  const navigate = useNavigate();
  const store = useUserStore();
  const { pathname } = useLocation();
  const isLoginRoute = pathname === '/login' || pathname === '/auth';

  useEffect(() => {
    // 如果没有token并且不在登录相关页面就跳转到登录页
    if (!store.token && !isLoginRoute) return navigate('/login');
  }, [store, isLoginRoute]);

  // 只在页面初始化时校验一次 Token，不阻塞后续操作
  const hasChecked = useRef(false);
  useEffect(() => {
    if (store.token && !hasChecked.current) {
      hasChecked.current = true;
      checkTokenAPI(store.token).catch(() => {});
    }
  }, [store.token]);

  if (isLoginRoute) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <>
              <PageTitle title="云岫小筑" />
              <Login />
            </>
          }
        />
      </Routes>
    );
  }

  return (
    <DefaultLayout>
      <Routes>
        {routeConfigs.map(({ path, title, Component }) => (
          <Route
            key={path}
            path={path}
            element={
              <>
                <PageTitle title={`云岫小筑 - ${title}`} />
                <Component />
              </>
            }
          />
        ))}

        <Route path="*" element={<NotFound />} />
      </Routes>
    </DefaultLayout>
  );
};
