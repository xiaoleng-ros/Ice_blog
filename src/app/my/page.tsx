import bg from '@/assets/image/bg.png';

import Goals from './component/Goals';
import Character from './component/Character';
import Map from './component/Map';
import Technology from './component/Technology';
import Project from './component/Project';
import Calendar from './component/Calendar';
import InfoTwo from './component/InfoTwo';
import { getPageConfigDataByNameAPI } from '@/api/config';
import { Config } from '@/types/app/config';
import { MyData } from '@/types/app/my';
import InfoOne from './component/InfoOne';

export default async () => {
  const { data } = (await getPageConfigDataByNameAPI('my')) || { data: {} as Config };
  const { info_style, info_one, info_two, character, goals, project, technology_stack, hometown } = data.value as MyData;

  return (
    <>
      <title>👋 关于我</title>
      <meta name="description" content="👋 关于我" />

      <div className="bg-white dark:bg-black-a pt-20 bg-cover bg-center bg-fixed" style={{ backgroundImage: `url(${bg.src})` }}>
        <div className="w-[90%] lg:w-[950px] mx-auto">{info_style === 'info_one' ? <InfoOne data={info_one} /> : <InfoTwo data={info_two} />}</div>

        <div className="flex justify-center mt-24">
          <Calendar />
        </div>

        <div className="flex flex-col md:flex-row w-[90%] sm:w-9/12 mt-52 mx-auto">
          <Character data={character} />
          <Goals data={goals} />
        </div>

        <div className="flex flex-col md:flex-row w-[90%] sm:w-9/12 mt-52 mx-auto">
          <Map position={hometown}/>
          <Technology list={technology_stack} />
        </div>

        <div className="mt-52">
          <Project data={project} />
        </div>
      </div>
    </>
  );
};
