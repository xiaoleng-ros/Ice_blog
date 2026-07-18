import { Metadata } from 'next';

import { getWebListAPI, getWebTypeListAPI } from '@/api/web';
import { Web as WebLink } from '@/types/app/web';

import Friend from './index';

export const metadata: Metadata = {
  title: '😇 朋友圈',
  description: '😇 朋友圈',
};

// 该页面依赖实时接口数据，强制动态渲染，避免构建时因后端未启动或动态 fetch 导致 DYNAMIC_SERVER_USAGE
export const dynamic = 'force-dynamic';

export default async () => {
  const linkRes = await getWebListAPI();
  const typeRes = await getWebTypeListAPI();
  // 防御式处理：后端异常时 data 可能不是数组，统一转为空数组
  const linkList = Array.isArray(linkRes?.data) ? linkRes.data : [];
  const typeList = Array.isArray(typeRes?.data) ? typeRes.data : [];

  let data: { [string: string]: { order: number; list: WebLink[] } } = {};

  linkList.sort((a: WebLink, b: WebLink) => a.order - b.order);

  // 给每个数据进行分组处理
  linkList?.forEach((item: WebLink) => {
    if (data[item.type.name]) {
      data[item.type.name].list.push(item);
    } else {
      // 查询出当前类型的排序
      const order = typeList.find(({ name }: { name: string }) => name === item.type.name)?.order ?? 0;
      data[item.type.name] = { order, list: [] };
      data[item.type.name].list = [item];
    }
  });

  // 根据order进行从小到大排序
  const dataTemp = Object.entries(data);
  dataTemp.sort((a, b) => a[1].order - b[1].order);
  data = Object.fromEntries(dataTemp);

  return <Friend data={data} />;
};
