import Link from 'next/link';
import Pagination from '@/components/Pagination';
import AddWallInfo from '../components/AddWallInfo';
import { getCateListAPI, getCateWallListAPI } from '@/api/wall';
import dayjs from 'dayjs';
import { Cate } from '@/types/app/cate';
import { Wall } from '@/types/app/wall';

interface Props {
  params: Promise<{ cate: string }>;
  searchParams: Promise<{ page: number }>;
}

export default async (props: Props) => {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const cate = params.cate;
  const page = searchParams.page || 1;

  const active = '!text-primary !border-primary';

  // 提前把颜色写好，否则会导致样式丢失
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const colors = ['bg-[#fcafa24d]', 'bg-[#a8ed8a4d]', 'bg-[#caa7f74d]', 'bg-[#ffe3944d]', 'bg-[#92e6f54d]'];

  const { data: cateList } = (await getCateListAPI()) || { data: [] as Cate[] };

  const id = cateList.find((item) => item.mark === cate)?.id ?? 0;
  const { data: tallList } = (await getCateWallListAPI(id, page)) || { data: {} as Paginate<Wall[]> };

  cateList.sort((a, b) => a.order - b.order);

  return (
    <>
      <title>💌 留言墙</title>
      <meta name="description" content="💌 留言墙" />

      <div className="py-16 border-b dark:border-[#4e5969] bg-[linear-gradient(to_right,#fff1eb_0%,#d0edfb_100%)] dark:bg-[linear-gradient(to_right,#232931_0%,#232931_100%)]  ">
        <div className="flex flex-col items-center">
          <h2 className="text-5xl pt-24 mb-10">留言墙</h2>
          <p className="text-sm text-gray-600 mb-4">有什么想对我说的，来吧</p>
          {/* <Button color="primary" variant="shadow" onPress={onOpen}>
            留言
          </Button> */}

          <div className="mb-10">
            <AddWallInfo />
          </div>
        </div>

        <ul className="flex flex-col md:flex-row justify-center text-sm space-y-1 md:space-y-0">
          {cateList?.map((item) => (
            <li key={item.id} className={`py-2 px-4 mx-1 dark:text-[#8c9ab1] border-2 border-transparent rounded-full hover:!text-primary hover:border-primary ${item.mark === cate ? active : ''}  `}>
              <Link href={`/wall/${item.mark}`}>{item.name}</Link>
            </li>
          ))}
        </ul>

        <div className="w-[90%] xl:w-[1200px] mx-auto mt-12 grid grid-cols-1 gap-1 xs:grid-cols-2 xs:gap-2 md:grid-cols-3 md:gap-3 lg:grid-cols-4 lg:gap-4">
          {tallList.result?.map((item) => (
            <div key={item.id} className={`relative flex flex-col py-2 px-4 bg-[${item.color}] rounded-lg top-0 hover:-top-2 transition-[top]`}>
              <div className="flex justify-between items-center mt-2 text-xs text-gray-500 dark:text-[#8c9ab1]">
                <span>{dayjs(+item.createTime!).format('YYYY-MM-DD HH:mm')}</span>
                <span>{item.cate.name}</span>
              </div>

              <div className="hide_sliding overflow-auto h-32 text-sm my-4 text-gray-700 dark:text-[#cecece]">{item.content}</div>

              <div className="text-end text-[#5b5b5b] dark:text-[#A0A0A0]">{item.name ? item.name : '匿名'}</div>
            </div>
          ))}
        </div>

        {tallList.total && <Pagination total={tallList.pages} page={page} className="flex justify-center mt-5" />}
      </div>
    </>
  );
};
