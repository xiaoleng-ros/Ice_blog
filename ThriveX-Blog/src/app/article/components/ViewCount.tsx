'use client';

import { useState, useEffect } from 'react';
import { getArticleDataAPI, recordViewAPI } from '@/api/article';

const VIEWED_KEY = 'viewed_articles';

function getViewed(): Record<number, string> {
  try {
    return JSON.parse(localStorage.getItem(VIEWED_KEY) || '{}');
  } catch {
    return {};
  }
}

function markViewed(articleId: number) {
  const viewed = getViewed();
  viewed[articleId] = new Date().toISOString().slice(0, 10);
  localStorage.setItem(VIEWED_KEY, JSON.stringify(viewed));
}

function wasViewedToday(articleId: number): boolean {
  return getViewed()[articleId] === new Date().toISOString().slice(0, 10);
}

export default function ViewCount({ articleId }: { articleId: number }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      if (!wasViewedToday(articleId)) {
        await recordViewAPI(articleId);
        markViewed(articleId);
      }

      const { data } = await getArticleDataAPI(articleId);
      if (!cancelled && data?.view !== undefined) {
        setCount(data.view);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [articleId]);

  return <>{count ?? '...'}</>;
}
