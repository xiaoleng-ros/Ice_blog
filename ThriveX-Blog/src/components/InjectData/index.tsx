'use client';

import { useEffect } from 'react';

import { getWebConfigDataAPI } from '@/api/config';
import { useAuthorStore, useConfigStore } from '@/stores';
import { Web, Theme, Other } from '@/types/app/config';
import { getAuthorDataAPI } from '@/api/user';
import { User } from '@/types/app/user';

export default () => {
  const setAuthor = useAuthorStore((state) => state.setAuthor);

  // 获取作者信息
  const getAuthorData = async () => {
    const { data: user } = (await getAuthorDataAPI()) || { data: {} as User };
    setAuthor(user);
  };

  const { setWeb, setTheme, setOther } = useConfigStore();

  // 获取项目配置
  const getConfigData = async () => {
    const {
      data: { value: web },
    } = (await getWebConfigDataAPI<{ value: Web }>('web')) || { data: { value: {} as Web } };
    setWeb(web);

    const {
      data: { value: theme },
    } = (await getWebConfigDataAPI<{ value: Theme }>('theme')) || { data: { value: {} as Theme } };
    setTheme(theme);

    const {
      data: { value: other },
    } = (await getWebConfigDataAPI<{ value: Other }>('other')) || { data: { value: {} as Other } };
    setOther(other);
  };

  useEffect(() => {
    getAuthorData();
    getConfigData();
  }, []);

  return null;
};
