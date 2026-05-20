import { useState, useEffect, useRef } from 'react';
import { Spin } from 'antd';
import axios from 'axios';

import { Editor } from '@bytemd/react';
import plugins from './plugins';
import 'highlight.js/styles/vs2015.css';
import 'bytemd/dist/index.css';
import zh from 'bytemd/lib/locales/zh_Hans.json';

import type { BytemdEditorContext } from 'bytemd';

import { baseURL } from '@/utils/request';
import { useUserStore } from '@/stores';
import { logger } from '@/utils/logger';
import Material from '@/components/Material';

import './index.scss';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

// CodeMirror 编辑器实例的接口定义（bytemd 底层使用 CodeMirror 5）
interface CodeMirrorInstance {
  getCursor(): { line: number; ch: number };
  replaceRange(text: string, pos: { line: number; ch: number }): void;
  setCursor(pos: { line: number; ch: number }): void;
  focus(): void;
}

// 挂载了 CodeMirror 实例的 DOM 元素
interface CodeMirrorElement extends HTMLElement {
  CodeMirror: CodeMirrorInstance;
}

const EditorMD = ({ value, onChange }: Props) => {
  const store = useUserStore();
  const [loading, setLoading] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  // 使用 useRef 保存编辑器上下文和光标位置，避免弹窗导致焦点丢失后光标错位
  const currentCtxRef = useRef<BytemdEditorContext | null>(null);
  // 保存打开弹窗前的光标位置，弹窗期间编辑器失焦，getCursor() 不再准确
  const cursorPosRef = useRef<{ line: number; ch: number } | null>(null);

  useEffect(() => {
    const handleOpenMaterialModal = (event: CustomEvent) => {
      // 同时保存编辑器上下文和打开弹窗时的光标位置
      currentCtxRef.current = event.detail.ctx;
      cursorPosRef.current = event.detail.cursor;
      setIsMaterialModalOpen(true);
    };

    window.addEventListener('openMaterialModal', handleOpenMaterialModal as EventListener);

    return () => {
      window.removeEventListener('openMaterialModal', handleOpenMaterialModal as EventListener);
    };
  }, []);

  const uploadImages = async (files: File[]) => {
    // 在异步上传前保存光标位置，避免 bytemd 的 appendBlock 将图片插入到错误位置
    const cmElement = document.querySelector('.bytemd .CodeMirror') as CodeMirrorElement | null;
    const cm = cmElement?.CodeMirror;
    const cursor = cm?.getCursor();

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
        if (cursor && cm) {
          // 在光标位置插入图片，bypass bytemd 的 appendBlock
          insertImagesAtCursor(cm, cursor, result, files);
          return [];
        }
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
      if (cursor && cm) {
        insertImagesAtCursor(cm, cursor, Array.isArray(urls) ? urls : [urls], files);
        return [];
      }
      return Array.isArray(urls) ? urls.map(url => ({ url })) : [];
    } catch (error) {
      logger.error(error);
      setLoading(false);
      return [];
    }
  };

  const insertImagesAtCursor = (
    cm: CodeMirrorInstance,
    cursor: { line: number; ch: number },
    urls: string[],
    files: File[]
  ) => {
    const markdown = urls
      .map((url, i) => `![${files[i]?.name || '图片'}](${url})`)
      .join('\n');
    cm.replaceRange(markdown, cursor);
    // bytemd 的 handleImageUpload 会在 uploadImages 返回后同步执行
    // appendBlock/setSelection/focus，使用 setTimeout 将光标定位到插入内容之后
    setTimeout(() => {
      const endLine = cursor.line + markdown.split('\n').length;
      cm.setCursor({ line: endLine, ch: 0 });
      cm.focus();
    }, 0);
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
          const ctx = currentCtxRef.current;
          const cursor = cursorPosRef.current;
          if (ctx && cursor) {
            const editor = ctx.editor;
            // 恢复编辑器焦点，然后使用提前保存的光标位置插入图片
            editor.focus();
            const markdown = urls.map((url) => `![图片](${url})`).join('\n');
            editor.replaceRange(markdown, cursor);
          }
        }}
      />
    </>
  );
};

export default EditorMD;
