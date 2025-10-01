import Image from 'next/image';
import { useEffect, useState } from 'react';
import { getTagListAPI } from '@/api/tag';
import { Tag } from '@/types/app/tag';
import { getRandom } from '@/utils';
import tag from './svg/tag.svg';

export default () => {
  const [list, setList] = useState<Tag[]>([]);
  const getTagData = async () => {
    const { data } = (await getTagListAPI()) || { data: [] as Tag[] };
    setList(data);
  };

  useEffect(() => {
    getTagData();
  }, []);

  const colors = [
    {
      color: '#0d6efd',
      backgroundColor: 'rgba(13, 110, 253, .2)',
    },
    {
      color: '#6610f2',
      backgroundColor: 'rgba(102, 16, 242, .2)',
    },
    {
      color: '#20c997',
      backgroundColor: 'rgba(32, 201, 151, .2)',
    },
    {
      color: '#dc3545',
      backgroundColor: 'rgba(220, 53, 69, .2)',
    },
    {
      color: '#fd7e14',
      backgroundColor: 'rgba(253, 126, 20, .2)',
    },
  ];

  return (
    <>
      <div className="flex flex-col items-center">
        <h3 className="flex items-center text-xl mb-5">
          <Image src={tag.src} alt="标签墙" width={25} height={25} className="mr-3" /> 标签墙
        </h3>

        <div className="overflow-auto h-[270px] pr-1 grid grid-cols-6 gap-2 hide_sliding">
          {list.map((item, index) => {
            const { color, backgroundColor } = colors[getRandom(0, colors.length - 1)];
            return (
              <span key={index} className="flex justify-center items-center px-4 h-8 text-xs rounded-md whitespace-nowrap line-clamp-1" style={{ color, backgroundColor }}>
                {item.name}
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
};
