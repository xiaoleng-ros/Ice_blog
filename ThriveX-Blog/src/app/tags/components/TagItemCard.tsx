'use client';

import React from 'react';
import Link from 'next/link';
import { LiaTagsSolid } from 'react-icons/lia';
import { Tag } from '@/types/app/tag';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

const TagItemCard = ({ data, count, index }: { data: Tag; count: number; index: number }) => {
  const colors = ['bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-red-400', 'bg-indigo-400', 'bg-purple-400', 'bg-pink-400'];
  const color = colors[index % colors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100, mass: 0.8, delay: index * 0.05 }}
      whileHover={{
        scale: 1.05,
        transition: { duration: 0.2 },
      }}
    >
      <Link
        href={`/tag/${data?.id}?name=${data?.name}`}
        className={clsx('flex h-10 bg-opacity-20 backdrop-blur', color)}
        style={{
          borderRadius: '0.5rem',
          backdropFilter: 'blur(10px)',
          margin: '0.5rem',
          padding: '0 1rem',
          alignItems: 'center',
        }}
      >
        <LiaTagsSolid className="h-4 w-4 text-gray-400" aria-hidden="true" />
        <span className="ml-2">{data?.name}</span>
        <span className="ml-4 text-sm text-gray-400 dark:text-gray-500">{count}</span>
      </Link>
    </motion.div>
  );
};

export default TagItemCard;
