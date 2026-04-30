export interface Result<T = any> {
  code: number;
  message: string;
  data: T | null;
}

export interface ResultData {
  code: number;
  message: string;
  data: Record<string, any>;
}

export interface Paginate<T> {
  records: T[];
  total: number;
  page: number;
  size: number;
  totalPages: number;
}

export interface ArticleFilterVo {
  page?: number;
  size?: number;
  key?: string;
  cateId?: number;
  tagId?: number;
  status?: string;
  isDraft?: boolean;
  isDel?: boolean;
}

export interface UserFilterVo {
  username?: string;
  nickname?: string;
  role?: string;
  status?: number;
}
