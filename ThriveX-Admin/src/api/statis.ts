import Request from '@/utils/request';
import { VisitorStats, ArticleStats, CommentStats, CateStats, TagStats } from '@/types/app/statis';

// 获取访客统计 (PV量、IP量、跳出率、平均访问时长)
export const getVisitorStatisAPI = () => Request<VisitorStats>('GET', `/statis/visitor`)

// 获取文章统计
export const getArticleStatisAPI = () => Request<ArticleStats>('GET', `/statis/article`)

// 获取分类统计
export const getCateStatisAPI = () => Request<CateStats>('GET', `/statis/cate`)

// 获取标签统计
export const getTagStatisAPI = () => Request<TagStats>('GET', `/statis/tag`)

// 获取评论统计
export const getCommentStatisAPI = () => Request<CommentStats>('GET', `/statis/comment`)

// 通用统计数据查询（按类型映射到对应接口）
export const getStatisAPI = (type: string, startDate?: string, endDate?: string) => {
  const routeMap: Record<string, string> = {
    'basic-overview': 'visitor',
    'new-visitor': 'visitor',
  };
  const route = routeMap[type] || type;
  return Request<unknown>('GET', `/statis/${route}`, { params: { startDate, endDate } });
}