// 定义照片类型
export interface Photo {
  id?: number;
  name: string;
  description: string;
  image: string;
  cateId: number;
  createTime: number;
}

interface Cate {
  id?: number;
  name: string;
  cover: string;
  images: string[];
}