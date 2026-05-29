import { getArticleDataAPI, recordViewAPI } from '@/api/article';
import { getWebConfigDataAPI } from '@/api/config';
import { Web } from '@/types/app/config';
import { Metadata } from 'next';

import Starry from '@/components/Starry';
import Slide from '@/components/Slide';

import Tag from '../components/Tag';
import Copyright from '../components/Copyright';
import UpAndDown from '../components/UpAndDown';
import RandomArticle from '../components/RandomArticle';
import Comment from '../components/Comment';
import MD from '../components/MD';
import Summary from '../components/Summary';
import Nav from '../components/Nav';

import { IoMdPricetags } from 'react-icons/io';
import { FaHotjar } from 'react-icons/fa';
import { AiOutlineComment } from 'react-icons/ai';
import { LuTimer } from 'react-icons/lu';

import dayjs from 'dayjs';
import Encrypt from '@/components/Encrypt';
import NotFound from '@/app/not-found';

interface Props {
  params: Promise<{ id: number }>;
  searchParams: Promise<{ password: string }>;
}

// 生成文章页面的metadata
export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;

  const { data: article } = await getArticleDataAPI(id);
  const webResponse = await getWebConfigDataAPI<{ value: Web }>('web');
  const webConfig = webResponse?.data?.value as Web;

  const baseUrl = webConfig?.url ?? 'https://liuyuyang.net';

  if (!article?.title) {
    return {
      title: '文章未找到',
    };
  }

  return {
    title: article.title,
    description: article.description ?? article.title,
    keywords: article.articleTags?.map((at: {tag: {name: string}}) => at.tag.name).join(',') ?? '',
    authors: [{ name: webConfig?.title ?? 'ThriveX' }],
    openGraph: {
      type: 'article',
      locale: 'zh_CN',
      url: `${baseUrl}/article/${id}`,
      title: article.title,
      description: article.description ?? article.title,
      siteName: webConfig?.title ?? 'ThriveX',
      images: [
        {
          url: article.cover ?? webConfig?.favicon ?? '/favicon.ico',
          width: 1200,
          height: 630,
          alt: article.title,
        },
      ],
      publishedTime: new Date(+article.createTime).toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description ?? article.title,
      images: [article.cover ?? webConfig?.favicon ?? '/favicon.ico'],
    },
    alternates: {
      canonical: `/article/${id}`,
    },
  };
}

export default async (props: Props) => {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const id = params.id;
  const password = searchParams.password;

  const { code, data } = password ? await getArticleDataAPI(id, password) : await getArticleDataAPI(id);

  const errorCodes = [400, 404, 611];

  if (errorCodes.includes(code ?? 200)) {
    return <NotFound />;
  }

  // 记录文章访问量
  await recordViewAPI(id);

  // 图标样式
  const iconSty = 'flex justify-center items-center w-5 h-5 rounded-full text-xs mr-1';

  // 如果文章没有加密或者密码正确，则显示文章
  if ((data?.config?.isEncrypt !== 1) || (password && data?.config?.isEncrypt === 1)) {
    return (
      <>
        <title>{data.title}</title>
        <meta name="description" content={data.description} />

        <div className="ArticlePage">
          <Slide src={data?.cover || undefined}>
            {/* 星空背景组件 */}
            <Starry />

            <div className="absolute w-[80%] sm:w-[70%] lg:w-[60%] xl:w-[50%] top-[60%] md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-[65%] text-white custom_text_shadow">
              <div className="text-xl mb-5 sm:text-2xl lg:text-3xl xl:text-4xl text-center sm:mb-7 md:mb-10">{data?.title}</div>

              <div className="flex flex-wrap justify-between text-xs sm:text-sm">
                <div className="flex mb-2">
                  <span className={`${iconSty} bg-[#A543E6]`}>
                    <IoMdPricetags />
                  </span>
                  <span>所属分类：{data?.articleCates?.[0]?.cate?.name}</span>
                </div>

                <div className="flex mb-2">
                  <span className={`${iconSty} bg-[#EA3B24]`}>
                    <FaHotjar />
                  </span>
                  <span>阅读量：{data?.view}</span>
                </div>

                <div className="flex mb-2">
                  <span className={`${iconSty} bg-[#4FA759]`}>
                    <AiOutlineComment />
                  </span>
                  <span>评论数量：{data?.comment}</span>
                </div>

                <div className="flex mb-2">
                  <span className={`${iconSty} bg-[#5A9CF8]`}>
                    <LuTimer />
                  </span>
                  <span>发布时间：{dayjs(+data?.createTime).format('YYYY-MM-DD HH:mm')}</span>
                </div>
              </div>
            </div>
          </Slide>

          <div className="w-[90%] xl:w-4/5 xl:max-w-6xl mx-auto mt-12 relative flex gap-8">
            {/* 左侧目录 - 仅在大屏显示 */}
            <div className="hidden xl:block w-[220px] shrink-0">
              <Nav />
            </div>

            {/* 文章主体 */}
            <div className="flex-1 min-w-0">
              <Summary content={data?.description || ''} />
              <MD data={data?.content} />

              <div className="w-full">
                <Tag data={data?.articleTags?.map((at) => at.tag) ?? []} />

                <Copyright />
                <RandomArticle />
                <UpAndDown currentId={id} prev={data?.prev} next={data?.next} />
                <Comment articleId={id} articleTitle={data.title} />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  } else {
    return !password && <Encrypt id={id} />;
  }
};
