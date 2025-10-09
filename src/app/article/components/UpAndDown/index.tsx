import React from 'react';
import Link from 'next/link';

interface info {
    id: number,
    title: string
};

interface Props {
    id: number,
    prev: info,
    next: info,
};

const btnSty = 'group w-full border hover:border-primary hover:bg-[#f8fbff] dark:bg-black-b dark:border-black-b dark:hover:border-primary transition rounded-md'
const titleSty = 'group-hover:text-primary text-center  '

export default ({ id, prev, next }: Props) => {
    return (
        <div className="UpAndDownComponent">
            <div className="flex justify-between mt-8 space-x-3">
                <Link href={`/article/${prev ? prev.id : id}`} className={`${btnSty} py-2 sm:py-4`}>
                    <p className={`${titleSty} text-lg sm:text-xl`}>上一篇</p>
                    <p className="text-center dark:text-[#8c9ab1] text-sm px-2.5 sm:text-base sm:p-0 line-clamp-1   mt-1 sm:mt-3">{prev ? prev.title : '没有上一篇文章了~'}</p>
                </Link>

                <Link href={`/article/${next ? next.id : id}`} className={`${btnSty} py-2 sm:py-4`}>
                    <p className={`${titleSty} text-lg sm:text-xl`}>下一篇</p>
                    <p className="text-center dark:text-[#8c9ab1] text-sm px-2.5 sm:text-base sm:p-0 line-clamp-1   mt-1 sm:mt-3">{next ? next.title : '没有下一篇文章了~'}</p>
                </Link>
            </div>
        </div>
    );
};