'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import statis from './svg/statis.svg';
import article from './svg/article.svg';
import cate from './svg/cate.svg';
import comment from './svg/comment.svg';
import friend from './svg/friend.svg';

import { Cate } from '@/types/app/cate';
import { Comment } from '@/types/app/comment';
import { Web } from '@/types/app/web';

import { getCateListAPI } from '@/api/cate';
import { getCommentListAPI } from '@/api/comment';
import { getWebListAPI } from '@/api/web';

import CateStatis from './components/CateStatis';
import TagStatis from './components/TagStatus';

interface Props {
  aTotal: number;
}

export default ({ aTotal }: Props) => {
  const [cateList, setCateList] = useState<Cate[]>([]);
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [linkList, setLinkList] = useState<Web[]>([]);

  const getData = async () => {
    await Promise.all([getCateListAPI(), getCommentListAPI(), getWebListAPI()]).then(([cateList, commentList, linkList]) => {
      setCateList((cateList as null | { data: Cate[] })?.data || []);
      setCommentList((commentList as null | { data: Comment[] })?.data || []);
      setLinkList((linkList as null | { data: Web[] })?.data || []);
    });
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <h3 className="flex items-center text-2xl mb-3">
        <Image src={statis.src} alt="统计" width={36} height={36} className="mr-3" /> 数据统计
      </h3>

      <div className="mb-10 mt-5">
        <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 md:grid-cols-4 md:gap-4">
          <div className="flex justify-between items-center px-4 sm:px-5 h-20 sm:h-24 border-2 border-[#0EA5E9] rounded-lg bg-[#F0F9FF]">
            <Image src={article} alt="文章" />

            <div className="flex flex-col">
              <h3 className="text-2xl sm:text-3xl font-sans text-[#0EA5E9] text-end">{aTotal}</h3>
              <p className="text-[#0EA5E9]">文章总计</p>
            </div>
          </div>

          <div className="flex justify-between items-center px-4 sm:px-5 h-20 sm:h-24 border-2 border-[#F59E0B] rounded-lg bg-[#FFFBEB]">
            <Image src={comment} alt="" />

            <div className="flex flex-col">
              <h3 className="text-2xl sm:text-3xl font-sans text-[#F59E0B] text-end">{commentList.length}</h3>
              <p className="text-[#F59E0B]">评论总计</p>
            </div>
          </div>

          <div className="flex justify-between items-center px-4 sm:px-5 h-20 sm:h-24 border-2 border-[#0E9F6E] rounded-lg bg-[#F3FAF7]">
            <Image src={cate} alt="分类" />

            <div className="flex flex-col">
              <h3 className="text-2xl sm:text-3xl font-sans text-[#0E9F6E] text-end">{cateList.length}</h3>
              <p className="text-[#0E9F6E]">分类总计</p>
            </div>
          </div>

          <div className="flex justify-between items-center px-4 sm:px-5 h-20 sm:h-24 border-2 border-[#EC160F] rounded-lg bg-[#FFF0F0]">
            <Image src={friend} alt="友联" />

            <div className="flex flex-col">
              <h3 className="text-2xl sm:text-3xl font-sans text-[#EC160F] text-end">{linkList.length}</h3>
              <p className="text-[#EC160F]">友联总计</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between my-14">
          <CateStatis />
          <TagStatis />
        </div>
      </div>
    </>
  );
};
