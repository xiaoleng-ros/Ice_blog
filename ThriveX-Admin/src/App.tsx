import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useAuthRedirect from '@/hooks/useAuthRedirect';
import { App as AntdApp, ConfigProvider, theme, notification } from 'antd';
import RouteList from './components/RouteList';
import '@/styles/antd.scss';

import { getWebConfigDataAPI } from '@/api/config';
import { useWebStore, useUserStore, useConfigStore } from './stores';
import { Web } from './types/app/config';

import { setNotificationInstance } from '@/utils/notification';

import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';

function App() {
  useAuthRedirect();

  const token = useUserStore((state) => state.token);
  const colorMode = useConfigStore((state) => state.colorMode);
  const { pathname } = useLocation();

  const [notificationApi, notificationContextHolder] = notification.useNotification();

  useEffect(() => {
    setNotificationInstance(notificationApi);
  }, [notificationApi]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  const setWeb = useWebStore((state) => state.setWeb);
  const getWebData = async () => {
    if (!token) return;
    try {
      const { data } = await getWebConfigDataAPI<{ value: Web }>('web');
      // 如果配置存在且有效，则设置到 store 中
      if (data?.value) {
        setWeb(data.value);
      } else {
        console.warn('网站配置不存在或为空，使用默认配置');
      }
    } catch (err) {
      console.error('获取网站配置失败:', err);
    }
  };

  useEffect(() => {
    getWebData();
  }, [token]);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#60a5fa',
          borderRadius: 6,
          colorBgBase: colorMode === 'dark' ? '#263444' : '#ffffff',
          colorTextBase: colorMode === 'dark' ? '#e0e0e0' : '#000000',
          ...(colorMode === 'dark' && {
            colorBgLayout: '#263444',
            colorBgContainer: '#263444',
            colorBgElevated: '#263444',
            colorBgSpotlight: '#263444',
          }),
        },
        algorithm: colorMode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
      locale={zhCN}
    >
      <AntdApp>
        {notificationContextHolder}
        <RouteList />
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
