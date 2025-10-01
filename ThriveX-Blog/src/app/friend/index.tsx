'use client';

import Link from 'next/link';

import { ToastContainer } from 'react-toastify';

import Slide from '@/components/Slide';
import Starry from '@/components/Starry';
import ApplyForAdd from './components/ApplyForAdd';
import CopyableText from './components/CopyableText';

import { Web } from '@/types/app/web';

import { useConfigStore, useAuthorStore } from '@/stores';

export default ({ data }: { data: { [string: string]: { order: number; list: Web[] } } }) => {
  const web = useConfigStore((state) => state.web);
  const author = useAuthorStore((state) => state.author);

  return (
    <>
      <Slide isRipple={false}>
        {/* 星空背景组件 */}
        <Starry />

        <div className="absolute top-[30%] left-[50%] transform -translate-x-1/2 flex flex-col items-center">
          <div className="text-white text-[20px] xs:text-[25px] sm:text-[30px] whitespace-nowrap custom_text_shadow">一个人的寂寞，一群人的狂欢！</div>
          <div className="mt-4 sm:mt-8">
            <ApplyForAdd />
          </div>
        </div>
      </Slide>

      <div className="bg-[linear-gradient(180deg,#edf6ff_0%,#ffffff_100%)] dark:bg-[linear-gradient(to_right,#232931_0%,#232931_100%)]">
        <div className="relative -top-20 xs:-top-20 sm:-top-32 md:-top-36 w-[90%] xl:w-[1200px] p-10 pt-2 mx-auto bg-white dark:bg-black-b border dark:border-black-b rounded-2xl space-y-8  ">
          <div>
            <h3 className="w-full text-center text-xl p-4 dark:text-white  ">本站信息</h3>

            <div className="mx-auto p-3 space-y-2 border-l-[3px] border-primary bg-[#ecf7fe] dark:bg-[#333b48] rounded-md text-sm text-black-b dark:text-gray-300">
              <p>
                站点名称：<CopyableText text={web?.title}>{web?.title}</CopyableText>
              </p>
              <p>
                站点介绍：<CopyableText text={web?.description}>{web?.description}</CopyableText>
              </p>
              <p>
                站点图标：<CopyableText text={author?.avatar || ''}>{author?.avatar}</CopyableText>
              </p>
              <p>
                站点地址：<CopyableText text={web?.url}>{web?.url}</CopyableText>
              </p>
              <p>
                Rss地址：<CopyableText text={web?.url + '/api/rss'}>{web?.url + '/api/rss'}</CopyableText>
              </p>
            </div>
          </div>

          {Object.keys(data)?.map((type, index) => (
            <div key={index}>
              <h3 className="w-full text-center text-xl p-4 dark:text-white  ">{type}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {type === '全站置顶' && (
                  <Link href="https://liuyuyang.net" target="_blank" className="group">
                    <div className="flex items-center p-3 border group-hover:border-2 dark:border-[#3d4653] group-hover:!border-primary group-hover:shadow-[0_10px_20px_1px_rgb(83,157,253,.1)] rounded-md  ">
                      <img src="https://q1.qlogo.cn/g?b=qq&nk=3311118881&s=640" alt="项目作者" className="w-14 h-14 mr-4 rounded-full" />

                      <div className="flex flex-col space-y-2">
                        <h4 className="text-sm text-gray-700 dark:text-white group-hover:text-primary">宇阳</h4>
                        <p className="text-xs text-[#8c9ab1] line-clamp-2">ThriveX 博客管理系统作者</p>
                      </div>
                    </div>
                  </Link>
                )}

                {data[type].list?.map((item: Web) => (
                  <Link key={item.id} href={item.url} target="_blank" className="group">
                    <div key={item.id} className="flex items-center p-3 border group-hover:border-2 dark:border-[#3d4653] group-hover:!border-primary group-hover:shadow-[0_10px_20px_1px_rgb(83,157,253,.1)] rounded-md  ">
                      <img src={item.image} alt={item.title} className="w-14 h-14 mr-4 rounded-full" />

                      <div className="flex flex-col space-y-2">
                        <h4 className="text-sm text-gray-700 dark:text-white group-hover:text-primary">{item.title}</h4>
                        <p className="text-xs text-[#8c9ab1] line-clamp-2">{item.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <ToastContainer />
    </>
  );
};
