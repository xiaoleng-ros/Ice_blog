import { Photo, Cate } from '@/types/app/album'
import Request from '@/utils/request'

// 分页获取相册列表
export const getAlbumCatePagingAPI = (page: number = 1, size: number = 10) => Request<Paginate<Cate[]>>('POST', `/album/cate/paging?page=${page}&size=${size}`)

// 获取指定相册中的所有照片
export const getImagesByAlbumIdAPI = (id: number, page: number = 1, size: number = 10) =>
  Request<Paginate<Photo[]>>('GET', `/album/cate/${id}/images?page=${page}&size=${size}`)