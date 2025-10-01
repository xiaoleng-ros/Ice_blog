'use client';

import { useAuthorStore } from '@/stores';

const Copyright = async () => {
  const author = useAuthorStore((state) => state.author);

  return (
    <div className="p-3 space-y-2 border-l-[3px] border-primary bg-[#ecf7fe] rounded-md text-sm text-black-b">
      <p>作者：{author?.name}</p>
      <p>版权：此文章版权归 {author?.name} 所有，如有转载，请注明出处!</p>
    </div>
  );
};

export default Copyright;
