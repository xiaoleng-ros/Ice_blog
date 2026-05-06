import { Cate } from './cate';
import { Tag } from './tag';

// 访客统计数据
export interface VisitorStats {
  totalViews: number;
  totalIps: number;
  bounceRate: number;
  avgVisitDuration: number;
}

// 文章统计数据
export interface ArticleStats {
  total: number;
}

// 评论统计数据
export interface CommentStats {
  total: number;
}

// 分类统计数据（分类列表）
export type CateStats = Cate[];

// 标签统计数据（标签列表）
export type TagStats = Tag[];
