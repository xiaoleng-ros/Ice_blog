'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaBook, FaBookmark, FaFileAlt, FaHashtag, FaLink, FaPaperclip, FaTag, FaFont } from 'react-icons/fa';
import { clsx } from 'clsx';

const icons = [FaBook, FaBookmark, FaFileAlt, FaHashtag, FaLink, FaPaperclip, FaTag, FaFont];

const getRandomIcon = (): React.ElementType => icons[Math.floor(Math.random() * icons.length)];
const getRandomTag = (tags: string[]): string => tags[Math.floor(Math.random() * tags.length)];

interface TagItemProps {
  icon: React.ElementType;
  text: string;
  isLeft: boolean;
  delay: number;
}

const TagItem: React.FC<TagItemProps> = ({ icon: Icon, text, isLeft, delay }) => (
  <motion.div initial={{ opacity: 0, x: isLeft ? 100 : -100 }} animate={{ opacity: [0, 0.8, 0], x: isLeft ? [-100, 0, 100] : [100, 0, -100] }} transition={{ duration: 5, delay, repeat: Infinity, repeatType: 'loop', ease: 'linear' }}>
    <div className={clsx('inline-flex items-center space-x-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-400 px-3 py-1 text-sm shadow-sm')}>
      <Icon size={14} />
      <span>{text}</span>
    </div>
  </motion.div>
);

interface TagRowProps {
  isLeft: boolean;
  rowIndex: number;
  tags: string[];
}

const TagRow: React.FC<TagRowProps> = ({ isLeft, rowIndex, tags }) => {
  const rowTags = Array.from({ length: 8 }, (_, i) => ({
    icon: getRandomIcon(),
    text: getRandomTag(tags),
    delay: i * 0.5 + rowIndex * 0.2,
  }));

  return (
    <div className={`flex ${isLeft ? 'justify-start' : 'justify-end'} space-x-4 my-8`}>
      {rowTags.map((tag, index) => (
        <TagItem key={index} {...tag} isLeft={isLeft} />
      ))}
    </div>
  );
};

interface Row {
  isLeft: boolean;
  index: number;
}

export default function TagCloudBackground({ tags }: { tags: string[] }) {
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    const numberOfRows = Math.ceil(window.innerHeight / 50); // Approximate row height
    setRows(Array.from({ length: numberOfRows }, (_, i) => ({ isLeft: i % 2 === 0, index: i })));
  }, []);

  return (
    <div className="absolute inset-1 h-screen overflow-hidden pointer-events-none z-0">
      {rows.map((row, index) => (
        <TagRow key={index} isLeft={row.isLeft} rowIndex={row.index} tags={tags} />
      ))}
    </div>
  );
}
