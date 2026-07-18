import { getCateArticleListAPI } from '@/api/cate';
import Starry from '@/components/Starry';
import Slide from '@/components/Slide';
import Classics from '@/components/ArticleLayout/Classics';
import Pagination from '@/components/Pagination';
import { Article } from '@/types/app/article';

// ISR: 每60秒重新生成分类页面
export const revalidate = 60;

interface Props {
  params: Promise<{ id: number }>;
  searchParams: Promise<{ page: number; name: string }>;
}

export default async (props: Props) => {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const id = params.id;
  const page = searchParams.page ?? 1;
  const name = searchParams.name;

  const { data } = await getCateArticleListAPI(id, page);
  // 后端异常时 data 可能为 undefined，使用默认值避免渲染报错
  const cateData = data ?? ({ result: [], total: 0, pages: 0, next: false, prev: false, page: 1, size: 8 } as Paginate<Article[]>);

  return (
    <>
      <title>{`${name} - 分类`}</title>
      <meta name="description" content={name} />

      <div>
        <Slide isRipple={false}>
          {/* 星空背景组件 */}
          <Starry />

          {/* 分类信息 */}
          <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[80%] text-center text-white text-[20px] xs:text-[25px] sm:text-[30px] custom_text_shadow">
            <span>
              该分类：{name} ~ 共计{cateData?.total}篇文章
            </span>
          </div>
        </Slide>

        <div className="md:w-full lg:w-[900px] lg:mx-auto px-4 lg:p-0 my-5">
          <Classics data={cateData} />

          {!!cateData?.total && <Pagination total={cateData?.pages} page={page} path={`?name=${name}`} className="flex justify-center mt-5" />}
        </div>
      </div>
    </>
  );
};
