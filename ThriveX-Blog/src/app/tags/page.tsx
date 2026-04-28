import { getTagListWithArticleCountAPI } from '@/api/tag';
import { Metadata } from 'next';
import TagsPageClient from './components/TagsPageClient';

export const metadata: Metadata = {
  title: '🏷️ 标签墙',
  description: '🏷️ 标签墙',
};

export default async () => {
  const { data } = await getTagListWithArticleCountAPI();
  return <TagsPageClient tags={data ?? []} />;
};
