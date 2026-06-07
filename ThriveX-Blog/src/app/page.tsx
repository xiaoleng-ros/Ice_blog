import Slide from '@/components/Slide';
import Typed from '@/components/Typed';
import Starry from '@/components/Starry';
import Container from '@/components/Container';
import ArticleLayout from '@/components/ArticleLayout';
import Sidebar from '@/components/Sidebar';

// ISR: 每60秒重新生成首页
export const revalidate = 60;

import { getThemeConfig } from '@/lib/data';

interface Props {
  searchParams: Promise<{ page: number }>;
}

export default async (props: Props) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ?? 1;
  const theme = await getThemeConfig();

  return (
    <>
      <Slide src={theme?.swiper_image}>
        <Starry />
        <Typed className="absolute top-[45%] sm:top-[40%] left-[50%] transform -translate-x-1/2 w-[80%] text-center text-white xs:text-xl sm:text-[30px] leading-7 sm:leading-[40px] md:leading-[50px] custom_text_shadow"></Typed>
      </Slide>

      <Container>
        <ArticleLayout page={page} theme={theme} />
        <Sidebar theme={theme} />
      </Container>
    </>
  );
};
