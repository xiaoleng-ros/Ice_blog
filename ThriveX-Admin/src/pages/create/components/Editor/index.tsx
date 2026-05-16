import { useState, useEffect } from 'react';
import { Spin } from 'antd';
import axios from 'axios';

import { Editor } from '@bytemd/react';
import plugins from './plugins';
import 'highlight.js/styles/vs2015.css';
import 'bytemd/dist/index.css';
import zh from 'bytemd/lib/locales/zh_Hans.json';

import { baseURL } from '@/utils/request';
import { useUserStore } from '@/stores';
import { logger } from '@/utils/logger';
import Material from '@/components/Material';

import './index.scss';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const EditorMD = ({ value, onChange }: Props) => {
  const store = useUserStore();
  const [loading, setLoading] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [currentCtx, setCurrentCtx] = useState<{ appendBlock: (block: string) => void }>();

  useEffect(() => {
    const handleOpenMaterialModal = (event: CustomEvent) => {
      setCurrentCtx(event.detail.ctx);
      setIsMaterialModalOpen(true);
    };

    window.addEventListener('openMaterialModal', handleOpenMaterialModal as EventListener);

    return () => {
      window.removeEventListener('openMaterialModal', handleOpenMaterialModal as EventListener);
    };
  }, []);

  const uploadImages = async (files: File[]) => {
    try {
      setLoading(true);
      // 处理成后端需要的格式
      const formData = new FormData();
      formData.append('dir', 'article');
      for (let i = 0; i < files.length; i++) formData.append('files', files[i]);

      const response = await axios.post(`${baseURL}/file/upload`, formData, {
        headers: {
          Authorization: `Bearer ${store.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      setLoading(false);

      // 调试：打印完整的响应数据结构
      logger.log('上传响应:', response);
      logger.log('response.data:', response.data);
      logger.log('response.data 类型:', typeof response.data);

      // axios 直接请求返回的数据结构
      // 注意：这里用的是 axios 直接请求，没有经过 request 拦截器处理
      // 所以 response.data 是后端返回的完整对象 { code, message, data }
      const result = response.data;
      
      // 如果 result 是数组，说明直接返回了 URL 数组
      if (Array.isArray(result)) {
        logger.log('返回数组:', result);
        // bytemd 期望返回包含 url 属性的对象数组
        return result.map(url => ({ url }));
      }
      
      // 否则按标准响应格式 { code, message, data } 处理
      if (result.code !== 200 || !result.data) {
        logger.error('上传失败:', result.message);
        return [];
      }

      // 返回图片 URL 对象数组（bytemd 要求的格式）
      logger.log('返回 data:', result.data);
      const urls = result.data || [];
      // bytemd 期望返回包含 url 属性的对象数组
      return Array.isArray(urls) ? urls.map(url => ({ url })) : [];
    } catch (error) {
      logger.error(error);
      setLoading(false);
      return [];
    }
  };

  return (
    <>
      <Spin spinning={loading} description="图片上传中...">
        <Editor value={value} plugins={plugins} onChange={onChange} locale={zh} uploadImages={uploadImages} />
      </Spin>

      <Material
        open={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSelect={(urls) => {
          if (currentCtx) {
            // 在光标位置插入图片
            urls.forEach((url) => {
              currentCtx.appendBlock(`![图片](${url})`);
            });
          }
        }}
      />
    </>
  );
};

export default EditorMD;
