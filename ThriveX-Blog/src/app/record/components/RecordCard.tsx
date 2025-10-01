import ImageList from './ImageList';
import Editor from './Editor';
import { dayFormat } from '@/utils';
import { User } from '@/types/app/user';

interface RecordItemProps {
  id: number | string;
  content: string;
  images: string | string[] | null;
  createTime?: string | number | Date;
  user: Pick<User, 'avatar' | 'name'> | null;
}

export default function RecordCard({ id, content, images, createTime, user }: RecordItemProps) {
  const imageList: string[] = Array.isArray(images) ? images : JSON.parse((images as string) || '[]');

  return (
    <div key={id} className="flex flex-col sm:flex-row">
      <img src={user?.avatar} alt="作者头像" width={56} height={56} className="hidden sm:block rounded-lg border dark:border-black-b h-14 mr-2" />

      <div className="flex sm:hidden">
        <img src={user?.avatar} alt="作者头像" width={44} height={44} className="rounded-lg border dark:border-black-b h-11 mr-2" />

        <div className="flex sm:hidden items-center my-1.5 ml-2 space-x-4">
          <h3>{user?.name}</h3>
          <span className="text-xs">{dayFormat(createTime as any)}</span>
        </div>
      </div>

      <div className="mt-2 sm:mt-0 w-full">
        <div className="hidden sm:flex items-center my-1.5 ml-4 space-x-4">
          <h3>{user?.name}</h3>
          <span className="text-xs">{dayFormat(createTime as any)}</span>
        </div>

        <div className="w-full p-4 border dark:border-black-b rounded-3xl rounded-tl-none bg-[rgba(255,255,255,0.7)] dark:bg-[rgba(30,36,46,0.9)] backdrop-blur-sm">
          <Editor value={content} />

          <ImageList list={imageList} />
        </div>
      </div>
    </div>
  );
}
