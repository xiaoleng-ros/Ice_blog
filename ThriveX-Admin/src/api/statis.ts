import Request from '@/utils/request';

// 获取访客统计 (PV量、IP量、跳出率、平均访问时长)
export const getVisitorStatisAPI = () => Request('GET', `/statis/visitor`)

// 获取文章统计
export const getArticleStatisAPI = () => Request('GET', `/statis/article`)

// 获取分类统计
export const getCateStatisAPI = () => Request('GET', `/statis/cate`)

// 获取标签统计
export const getTagStatisAPI = () => Request('GET', `/statis/tag`)

// 获取评论统计
export const getCommentStatisAPI = () => Request('GET', `/statis/comment`)