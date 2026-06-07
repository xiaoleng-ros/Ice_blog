'use client';

import { useState, useEffect, useCallback } from 'react';
import { getArticleCommentListAPI } from '@/api/comment';

export default function CommentCount({ articleId }: { articleId: number }) {
  const [count, setCount] = useState<number | null>(null);

  const fetchCount = useCallback(async () => {
    try {
      const { data } = await getArticleCommentListAPI(articleId, { page: 1, size: 1 });
      if (data?.total !== undefined) setCount(data.total);
    } catch {
      // ignore
    }
  }, [articleId]);

  useEffect(() => { fetchCount(); }, [fetchCount]);

  // 评论提交后立即刷新计数
  useEffect(() => {
    const onComment = () => fetchCount();
    window.addEventListener('comment-submitted', onComment);
    return () => window.removeEventListener('comment-submitted', onComment);
  }, [fetchCount]);

  return <>{count ?? '...'}</>;
}
