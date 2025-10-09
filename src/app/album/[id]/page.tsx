'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { BsCalendar } from 'react-icons/bs';
import { Photo } from '@/types/app/album';
import { getImagesByAlbumIdAPI } from '@/api/album';
import Masonry from 'react-masonry-css';
import Empty from '@/components/Empty';
import dayjs from 'dayjs';
import './page.scss';

const breakpointColumnsObj = {
  default: 4,
  1024: 3,
  700: 2,
};

interface Props {
  params: Promise<{ id: number }>;
  searchParams: Promise<{ page: number; name: string }>;
}

export default function AlbumPage(props: Props) {
  const [list, setList] = useState<Photo[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [albumName, setAlbumName] = useState('');
  const [albumId, setAlbumId] = useState<number>(0);

  useEffect(() => {
    const initData = async () => {
      const searchParams = await props.searchParams;
      const params = await props.params;

      setAlbumName(searchParams.name);
      setAlbumId(params.id);
      await getImagesByAlbumId(params.id);
    };
    initData();
  }, [props.searchParams, props.params]);

  const getImagesByAlbumId = async (id: number, page: number = 1, isLoadMore: boolean = false) => {
    try {
      setLoading(true);
      const response = await getImagesByAlbumIdAPI(id, page);

      if (!response) return;

      const { data } = response;
      if (isLoadMore) {
        setList((prev) => [...prev, ...data.result]);
      } else {
        setList(data.result);
      }

      setHasMore(data.result.length === 10);
    } catch (error) {
      console.error('Failed to fetch images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = useCallback(() => {
    if (loading || !hasMore) return;

    const scrollHeight = document.documentElement.scrollHeight;
    const scrollTop = document.documentElement.scrollTop;
    const clientHeight = document.documentElement.clientHeight;

    if (scrollHeight - scrollTop - clientHeight < 300) {
      setPage((prev) => prev + 1);
      getImagesByAlbumId(albumId, page + 1, true);
    }
  }, [loading, hasMore, page, albumId]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const openPhoto = async (index: number) => {
    setCurrentPhotoIndex(index);
    setIsImageLoading(true);

    const img = new Image();
    img.src = list[index].image;

    await new Promise((resolve) => {
      img.onload = () => {
        resolve(true);
      };
    });

    setIsImageLoading(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setCurrentPhotoIndex(null);
  };

  const nextPhoto = () => {
    if (currentPhotoIndex !== null) {
      setCurrentPhotoIndex((currentPhotoIndex + 1) % list.length);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex !== null) {
      setCurrentPhotoIndex((currentPhotoIndex - 1 + list.length) % list.length);
    }
  };

  return (
    <>
      <title>{`📷 ${albumName} - 照片墙`}</title>
      <meta name="description" content={`📷 ${albumName} - 照片墙`} />

      <div className="container mx-auto px-4 py-8 pt-[90px]">
        {/* 移除最大高度限制 */}
        <div className="w-full">
          {list?.length === 0 ? (
            <Empty info="暂无照片" />
          ) : (
            <>
              <Masonry breakpointCols={breakpointColumnsObj} className="masonry-grid" columnClassName="masonry-grid_column">
                {list?.map((photo, index) => (
                  <motion.div key={photo.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="relative group overflow-hidden rounded-lg shadow-lg mb-6" onClick={() => openPhoto(index)}>
                    <div className="w-full cursor-pointer">
                      <img src={photo.image || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=3840&q=100'} alt={photo.name} className="w-full h-auto object-cover transform transition-transform   group-hover:scale-110" />
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <h3 className="text-white font-medium text-lg">{photo.name}</h3>
                    </div>
                  </motion.div>
                ))}
              </Masonry>
              {loading && (
                <div className="flex justify-center items-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
                </div>
              )}
              {!hasMore && list.length > 0 && <div className="text-center text-gray-500 py-4">没有更多照片了</div>}
            </>
          )}
        </div>

        {/* 照片查看模态框 */}
        <AnimatePresence>
          {showModal && currentPhotoIndex !== null && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50" onClick={closeModal}>
              <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="relative max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
                <div className="relative rounded-2xl overflow-hidden">
                  {isImageLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                    </div>
                  )}

                  <motion.div key={currentPhotoIndex} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3, ease: 'easeInOut' }} className="relative">
                    <img src={list[currentPhotoIndex].image} alt={list[currentPhotoIndex].name} className="w-full h-auto max-h-[80vh] rounded-2xl object-cover" />

                    {/* 导航按钮 */}
                    <button
                      className="flex justify-center items-center absolute left-4 top-1/2 z-10 -translate-y-1/2 p-2 rounded-full bg-[#fff3] hover:bg-black/50 backdrop-blur-md   duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevPhoto();
                      }}
                    >
                      <IoChevronBack className="w-8 h-8 text-white" />
                    </button>

                    <button
                      className="flex justify-center items-center absolute right-4 top-1/2 z-10 -translate-y-1/2 p-2 rounded-full bg-[#fff3] hover:bg-black/10 backdrop-blur-md   duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextPhoto();
                      }}
                    >
                      <IoChevronForward className="w-8 h-8 text-white" />
                    </button>

                    {/* 照片信息 */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                      <motion.div key={currentPhotoIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}>
                        <h3 className="text-white text-2xl font-medium mb-2">{list[currentPhotoIndex].name}</h3>

                        <p className="text-white/50 leading-relaxed mb-3">{list[currentPhotoIndex].description}</p>

                        <div className="flex items-center space-x-2 text-gray-400">
                          <BsCalendar className="w-4 h-4 text-gray-400" />
                          <p className="text-sm">{dayjs(+list[currentPhotoIndex].createTime).format('YYYY-MM-DD HH:mm')}</p>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
