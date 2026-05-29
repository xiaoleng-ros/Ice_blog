'use client';

import Image from 'next/image';
import { useEffect, useState, useCallback } from 'react';
import directory from '@/assets/svg/other/directory.svg';

import './index.scss';

interface NavItem {
  name: string;
  href: string;
  start: number;
  end?: number;
  className: string;
}

const OFFSET = 85;

const ContentNav = () => {
  const [navs, setNavs] = useState<NavItem[]>([]);
  const [active, setActive] = useState(0);

  const buildNavs = useCallback(() => {
    const list = document.querySelectorAll<HTMLHeadingElement>(
      '.content h1, .content h2, .content h3, .content h4, .content h5, .content h6'
    );

    list?.forEach((nav, index) => {
      const tag = nav.tagName.toLowerCase();
      nav.setAttribute('id', nav.textContent! + index);
      nav.setAttribute('class', tag);
    });

    const titles = Array.from(list).map((t) => {
      const top = t.getBoundingClientRect().top + window.scrollY;
      return {
        href: t.textContent!,
        top,
        className: t.className,
      };
    });

    const titlesList: NavItem[] = titles.map((title, index) => ({
      name: title.href,
      href: title.href + index,
      start: title.top - OFFSET,
      end: index < titles.length - 1 ? titles[index + 1].top - OFFSET : Infinity,
      className: title.className,
    }));

    return titlesList;
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const titlesList = buildNavs();
      setNavs(titlesList);

      const onScroll = () => {
        const scrollPosition = window.scrollY;
        const activeIndex = titlesList.findIndex(
          (item) => scrollPosition >= item.start && scrollPosition < item.end!
        );
        if (activeIndex !== -1) {
          setActive(activeIndex);
        }
      };

      onScroll();
      window.addEventListener('scroll', onScroll);
      return () => window.removeEventListener('scroll', onScroll);
    }, 0);
  }, [buildNavs]);

  const onHandleToNavItem = (index: number, href: string) => {
    const element = document.getElementById(href);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - OFFSET;
      window.scrollTo({
        top,
        behavior: 'smooth',
      });
      setActive(index);
    }
  };

  if (!navs?.length) return null;

  return (
    <div className="ContentNavSidebar">
      <div className="flex items-center gap-2 mb-4 px-3 py-2">
        <Image src={directory} alt="" width={18} height={18} />
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">目录</span>
      </div>

      <div className="text-[#4d4d4d] dark:text-[#8c9ab1] text-base w-full overflow-y-auto flex-1">
        {navs.map((item, index) => (
          <a
            key={index}
            href={`#${item.href}`}
            onClick={(e) => {
              e.preventDefault();
              onHandleToNavItem(index, item.href);
            }}
            className={`nav_item block p-1 pl-5 mb-[5px] hover:text-primary cursor-pointer transition-colors ${
              active === index
                ? 'text-primary pl-[30px] rounded-[10px] text-[15px] dark:bg-[#313d4e99] before:!left-4'
                : ''
            } ${item.className}`}
          >
            {item.name}
          </a>
        ))}
      </div>
    </div>
  );
};

export default ContentNav;
