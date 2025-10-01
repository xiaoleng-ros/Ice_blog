import { Metadata } from 'next';

import { getWebListAPI, getWebTypeListAPI } from '@/api/web';
import { Web as WebLink, WebType } from '@/types/app/web';

import Friend from './index';

export const metadata: Metadata = {
  title: '😇 朋友圈',
  description: '😇 朋友圈',
};

export default async () => {
  const { data: linkList } = (await getWebListAPI()) || { data: [] as WebLink[] };
  const { data: typeList } = (await getWebTypeListAPI()) || { data: [] as WebType[] };

  let data: { [string: string]: { order: number; list: WebLink[] } } = {};

  linkList.sort((a: WebLink, b: WebLink) => a.order - b.order);

  // 给每个数据进行分组处理
  linkList?.forEach((item: WebLink) => {
    if (data[item.type.name]) {
      data[item.type.name].list.push(item);
    } else {
      // 查询出当前类型的排序
      const order = typeList.find(({ name }) => name === item.type.name)?.order ?? 0;
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
