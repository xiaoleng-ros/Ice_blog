import { Config } from '@/types/app/config';
import { getPageConfigDataByNameAPI } from '@/api/config';
import Resume from './resume';

export default async () => {
  const { data } = (await getPageConfigDataByNameAPI('resume')) || { data: {} as Config };

  return <Resume data={data.value} />;
};
