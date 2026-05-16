import { useEffect, useState } from 'react';
import { Spin } from 'antd';
import CardDataStats from '@/components/CardDataStats';

import { AiOutlineEye, AiOutlineFileText, AiOutlineMessage, AiOutlineTags, AiOutlineAppstore } from 'react-icons/ai';
import { getVisitorStatisAPI, getArticleStatisAPI, getCommentStatisAPI, getCateStatisAPI, getTagStatisAPI } from '@/api/statis';
import { logger } from '@/utils/logger';

export default () => {
  const [loading, setLoading] = useState(false);

  const [stats, setStats] = useState({
    pv: 0,
    articleCount: 0,
    commentCount: 0,
    cateCount: 0,
    tagCount: 0,
  });

  // 获取统计数据
  const getDataList = async () => {
    try {
      setLoading(true);

      const [visitorRes, articleRes, commentRes, cateRes, tagRes] = await Promise.all([
        getVisitorStatisAPI(),
        getArticleStatisAPI(),
        getCommentStatisAPI(),
        getCateStatisAPI(),
        getTagStatisAPI(),
      ]);

      setStats({
        pv: visitorRes.data?.totalViews ?? 0,
        articleCount: articleRes.data?.total ?? 0,
        commentCount: commentRes.data?.total ?? 0,
        cateCount: cateRes.data?.length ?? 0,
        tagCount: tagRes.data?.length ?? 0,
      });

      setLoading(false);
    } catch (error) {
      logger.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getDataList();
  }, []);

  return (
    <Spin spinning={loading}>
      {/* 基本数据 */}
      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-4">
        <CardDataStats title="总浏览量" total={stats.pv + ''}>
          <AiOutlineEye className="fill-primary dark:fill-white text-2xl" />
        </CardDataStats>

        <CardDataStats title="文章数量" total={stats.articleCount + ''}>
          <AiOutlineFileText className="fill-primary dark:fill-white text-2xl" />
        </CardDataStats>

        <CardDataStats title="评论数量" total={stats.commentCount + ''}>
          <AiOutlineMessage className="fill-primary dark:fill-white text-2xl" />
        </CardDataStats>

        <CardDataStats title="分类数量" total={stats.cateCount + ''}>
          <AiOutlineAppstore className="fill-primary dark:fill-white text-2xl" />
        </CardDataStats>
      </div>

      <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
        <CardDataStats title="标签数量" total={stats.tagCount + ''}>
          <AiOutlineTags className="fill-primary dark:fill-white text-2xl" />
        </CardDataStats>
      </div>
    </Spin>
  );
};
