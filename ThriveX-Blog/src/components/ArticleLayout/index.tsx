import Dynamic from './components/Dynamic';
import Swiper from '../Swiper';
import Classics from './Classics';
import Waterfall from './Waterfall';
import Card from './Card';
import Pagination from '../Pagination';

import { getArticlePagingAPI } from '@/api/article';
import { getWebConfigDataAPI } from '@/api/config';
import { Theme } from '@/types/app/config';
import { getSwiperListAPI } from '@/api/swiper';

export default async ({ page }: { page: number }) => {
  const { data: swiper } = await getSwiperListAPI();
  const themeResponse = await getWebConfigDataAPI<{ value: Theme }>('theme');
  const theme = themeResponse?.data?.value as Theme | undefined;
  const sidebar = theme?.right_sidebar ?? [];

  const isArticleLayout = theme?.is_article_layout ?? 'classics';
  const { data } = await getArticlePagingAPI({
    page,
    size: isArticleLayout === 'waterfall' ? 28 : 8
  });
  data.result = data?.result?.filter((item) => item.config.status !== 'no_home') ?? [];

  return (
    <div className={`w-full md:w-[90%] ${sidebar?.length ? 'lg:w-[68%] xl:w-[73%]' : 'w-full'} mx-auto transition-width`}>
      {!!swiper?.length && <Swiper data={swiper} />}
      <Dynamic className="my-2" />

      {isArticleLayout === 'classics' && <Classics data={data} />}
      {isArticleLayout === 'card' && <Card data={data} />}
      {isArticleLayout === 'waterfall' && <Waterfall data={data} />}

      {!!data.total && <Pagination total={data?.pages} page={page} className="flex justify-center mt-5" />}
    </div>
  );
};
