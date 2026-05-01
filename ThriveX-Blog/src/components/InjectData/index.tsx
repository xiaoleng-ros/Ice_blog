'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

import { getWebConfigDataAPI } from '@/api/config';
import { useAuthorStore, useConfigStore } from '@/stores';
import { Web, Theme, Other } from '@/types/app/config';
import { getAuthorDataAPI } from '@/api/user';

export default () => {
  const pathname = usePathname();
  const setAuthor = useAuthorStore((state) => state.setAuthor);

  // 获取作者信息
  const getAuthorData = useCallback(async () => {
    const { data: user } = await getAuthorDataAPI();
    setAuthor(user);
  }, [setAuthor]);

  const { setWeb, setTheme, setOther } = useConfigStore();

  // 获取项目配置
  const getConfigData = useCallback(async () => {
    const webResponse = await getWebConfigDataAPI<{ value: Web }>('web');
    const web = webResponse?.data?.value as Web;
    setWeb(web);

    const themeResponse = await getWebConfigDataAPI<{ value: Theme }>('theme');
    const theme = themeResponse?.data?.value as Theme;
    setTheme(theme);

    const otherResponse = await getWebConfigDataAPI<{ value: Other }>('other');
    const other = otherResponse?.data?.value as Other;
    setOther(other);
  }, [setWeb, setTheme, setOther]);

  useEffect(() => {
    getAuthorData();
    getConfigData();
  }, [pathname, getAuthorData, getConfigData]);

  return null;
};
