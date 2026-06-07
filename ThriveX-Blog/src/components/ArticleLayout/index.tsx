import Dynamic from './components/Dynamic';
import Swiper from '../Swiper';
import Classics from './Classics';
import Waterfall from './Waterfall';
import Card from './Card';
import Pagination from '../Pagination';

import { getArticlePagingAPI } from '@/api/article';
import { getSwiperListAPI } from '@/api/swiper';
import { Theme } from '@/types/app/config';

interface Props {
  page: number;
  theme?: Theme;
}

export default async ({ page, theme }: Props) => {
  const sidebar = theme?.right_sidebar ?? [];
  const isArticleLayout = theme?.is_article_layout ?? 'classics';

  // 并行获取轮播图和文章列表，减少串行等待时间
  const [swiperRes, articleRes] = await Promise.all([
    getSwiperListAPI(),
    getArticlePagingAPI({
      page,
      size: isArticleLayout === 'waterfall' ? 28 : 8
    })
  ]);

  const swiper = swiperRes?.data;
  const { data } = articleRes;
  data.result = data?.result?.filter((item) => item.config?.status !== 'no_home') ?? [];

  return (
    <div className={`w-full md:w-[90%] ${sidebar?.length ? 'lg:w-[68%] xl:w-[73%]' : 'w-full'} mx-auto transition-width`}>
      {!!swiper?.length && <Swiper data={swiper} />}
      <Dynamic className="my-2" />

      {isArticleLayout === 'classics' && <Classics data={data} theme={theme} />}
      {isArticleLayout === 'card' && <Card data={data} theme={theme} />}
      {isArticleLayout === 'waterfall' && <Waterfall data={data} />}

      {!!data.total && <Pagination total={data?.pages} page={page} className="flex justify-center mt-5" />}
    </div>
  );
};
