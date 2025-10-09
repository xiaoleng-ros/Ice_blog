import RecordCard from './components/RecordCard';
import { getRecordPagingAPI } from '@/api/record';
import { getAuthorDataAPI } from '@/api/user';
import { Record } from '@/types/app/record';
import { User } from '@/types/app/user';
import Pagination from '@/components/Pagination';
import Empty from '@/components/Empty';
import Show from '@/components/Show';
import { getWebConfigDataAPI } from '@/api/config';
import { Theme } from '@/types/app/config';

interface Props {
  searchParams: Promise<{ page: number }>;
}

export default async (props: Props) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page || 1;

  const { data: user } = (await getAuthorDataAPI()) || { data: {} as User };
  const { data: record } = (await getRecordPagingAPI({ pagination: { page, size: 8 } })) || { data: {} as Paginate<Record[]> };
  const {
    data: { value: theme },
  } = (await getWebConfigDataAPI<{ value: Theme }>('theme')) || { data: { value: {} as Theme } };

  return (
    <>
      <title>🏕️ 闪念</title>
      <meta name="description" content="🏕️ 闪念" />

      <div className="bg-[linear-gradient(to_right,#fff1eb_0%,#d0edfb_100%)] dark:bg-[linear-gradient(to_right,#232931_0%,#232931_100%)]">
        <div className="w-full lg:w-[800px] px-6 lg:px-0 mx-auto pt-24 pb-10">
          <div className="flex items-center flex-col p-4 mb-10 border dark:border-black-b rounded-lg bg-white dark:bg-black-b bg-[url('https://bu.dusays.com/2024/11/27/6746e3ec88c4f.jpg')] bg-no-repeat bg-center bg-cover  ">
            <img src={user?.avatar} alt="作者头像" width={80} height={80} className="w-20 h-20 rounded-full avatar-animation shadow-[5px_11px_30px_20px_rgba(255,255,255,0.3)]" />
            <h2 className="my-2 text-white">{theme?.record_name}</h2>
            <h4 className="text-xs text-gray-300">{theme?.record_info}</h4>
          </div>

          <div className="space-y-12">
            {!!record?.result?.length &&
              record?.result.map((item) => (
                <RecordCard
                  key={item.id}
                  id={item.id as any}
                  content={item.content as any}
                  images={item.images as any}
                  createTime={item.createTime as any}
                  user={user as any}
                />
              ))}

            <Show is={!record?.result?.length}>
              <Empty info="闪念为空~" />
            </Show>
          </div>

          {record?.total && <Pagination total={record?.pages} page={page} className="flex justify-center mt-5" />}
        </div>
      </div>
    </>
  );
};
