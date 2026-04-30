import Request from '@/utils/request'
import { AlbumCate, AlbumImage } from '@/types/app/album'

// 新增相册
export const addAlbumCateDataAPI = (data: AlbumCate) => Request('POST', '/album/cate', { data })

// 删除相册
export const delAlbumCateDataAPI = (id: number) => Request('DELETE', `/album/cate/${id}`)

// 修改相册
export const editAlbumCateDataAPI = (data: AlbumCate) => Request('PATCH', '/album/cate', { data })

// 获取相册
export const getAlbumCateDataAPI = (id?: number) => Request<AlbumCate>('GET', `/album/cate/${id}`)

// 获取相册列表
export const getAlbumCateListAPI = (data?: QueryData) => Request<AlbumCate[]>('GET', '/album/cate', {
  params: { ...data?.query }
});

// 分页获取相册列表
export const getAlbumCatePagingAPI = (data?: QueryData & { page?: number; size?: number }) => Request<Paginate<AlbumCate[]>>('GET', `/album/cate`, {
  params: { ...data?.query, page: data?.page, size: data?.size }
})

// 获取指定相册中的所有照片
export const getImagesByAlbumIdAPI = (id: number, page: number = 1, size: number = 10) =>
  Request<Paginate<AlbumImage[]>>('GET', `/album/cate/${id}/images`, {
    params: {
      page,
      size
    }
  })