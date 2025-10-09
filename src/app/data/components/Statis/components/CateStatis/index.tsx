import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { getCateArticleCountAPI } from '@/api/cate';
import cate from './svg/cate.svg';

import * as echarts from 'echarts/core';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import { LabelLayout } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';
import { CateArticleCount } from '@/types/app/cate';

echarts.use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer, LabelLayout]);

export default () => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [list, setList] = useState<{ value: number; name: string }[]>([]);

  const getCateArticleCount = async () => {
    const { data } = (await getCateArticleCountAPI()) || { data: [] as CateArticleCount[] };
    setList(data.map(({ count, name }) => ({ value: count, name })));
  };

  useEffect(() => {
    getCateArticleCount();
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      const myChart = echarts.init(chartRef.current);

      const option = {
        tooltip: {
          trigger: 'item',
        },
        legend: {
          show: false,
        },
        series: [
          {
            name: '数量统计',
            type: 'pie',
            radius: ['5%', '70%'],
            avoidLabelOverlap: false,
            padAngle: 5,
            itemStyle: {
              borderRadius: 10,
            },
            label: {
              show: false,
              position: 'center',
            },
            emphasis: {
              label: {
                show: false,
              },
            },
            labelLine: {
              show: false,
            },
            data: list,
          },
        ],
      };

      myChart.setOption(option);

      const handleResize = () => {
        myChart.resize();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        myChart.dispose();
      };
    }
  }, [list]);

  return (
    <div className="flex flex-col items-center mb-5 md:mb-0">
      <h3 className="flex items-center text-xl mb-5">
        <Image src={cate.src} alt="分类一览" width={25} height={25} className="mr-3" /> 分类一览
      </h3>

      <div ref={chartRef} className="min-w-[300px] h-[300px]"></div>
    </div>
  );
};
