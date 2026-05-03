import { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import { App, Button, Card, Dropdown, MenuProps, Spin, Space, Modal, Tag } from 'antd';
import { BiSave } from 'react-icons/bi';
import { AiOutlineEdit, AiOutlineSend } from 'react-icons/ai';
import { CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';

import Title from '@/components/Title';
import useAssistant from '@/hooks/useAssistant';
import { Article } from '@/types/app/article';
import { getArticleDataAPI, addArticleDataAPI, editArticleDataAPI } from '@/api/article';
import { titleSty } from '@/styles/sty';

import Editor from './components/Editor';
import PublishForm from './components/PublishForm';

export default () => {
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [params] = useSearchParams();
  const id = +params.get('id')!;
  const isDraftParams = Boolean(params.get('draft'));

  const [data, setData] = useState<Article>({} as Article);
  const [content, setContent] = useState('');
  const [publishOpen, setPublishOpen] = useState(false);

  // 自动保存相关状态
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasUnsavedChanges = useRef(false);
  const initialContentRef = useRef('');

  // 下一步
  const nextBtn = () => {
    if (content.trim().length >= 1) {
      setData((prev) => ({ ...prev, content }));
      setPublishOpen(true);
    } else {
      message.error('请输入文章内容');
    }
  };

  // 获取文章数据
  const getArticleData = async () => {
    try {
      setLoading(true);

      const { data } = await getArticleDataAPI(id);
      setData(data);
      setContent(data.content);
      initialContentRef.current = data.content;

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // 回显数据
  useEffect(() => {
    setPublishOpen(false);

    // 有Id就回显指定的数据
    if (id) {
      getArticleData();
      return;
    }

    // 没有就回显本地保存的数据
    const savedContent = localStorage.getItem('article_content');

    if (savedContent) {
      setData((prev) => ({ ...prev, content: savedContent }));
      setContent(savedContent);
      initialContentRef.current = savedContent;
    }
  }, [id]);

  // 保存文章到草稿箱
  const saveBtn = useCallback(async () => {
    if (content.trim().length < 1) {
      message.error('请输入文章内容');
      return;
    }

    try {
      setLoading(true);

      if (id) {
        // 更新已有文章
        await editArticleDataAPI({
          ...data,
          content,
          config: {
            ...data.config,
            isDraft: 1,
            isDel: 0,
          },
        });
        message.success('草稿已更新');
      } else {
        // 新建草稿
        const now = new Date();
        const defaultTitle = `草稿 ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
        await addArticleDataAPI({
          title: data.title || defaultTitle,
          description: data.description || '',
          content,
          cover: data.cover || '',
          cateIds: data.cateIds || [],
          tagIds: data.tagIds || [],
          config: {
            ...data.config,
            password: '',
            isEncrypt: 0,
            isDraft: 1,
            isDel: 0,
          },
          createTime: Date.now().toString(),
        });
        message.success('已保存到草稿箱');
      }

      // 清除本地缓存
      localStorage.removeItem('article_content');
      hasUnsavedChanges.current = false;
      setAutoSaveStatus('saved');

      // 跳转到草稿箱
      navigate('/draft');
    } catch (error) {
      console.error(error);
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  }, [content, data, id, message, navigate]);

  // 自动保存到 localStorage（防抖，1秒延迟）
  useEffect(() => {
    // 如果内容和初始内容一致，不触发自动保存
    if (content === initialContentRef.current) return;

    hasUnsavedChanges.current = true;

    // 清除之前的定时器
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }

    // 设置新的定时器，1秒后自动保存
    saveTimerRef.current = setTimeout(() => {
      if (content.trim().length >= 1) {
        localStorage.setItem('article_content', content);
        hasUnsavedChanges.current = false;
        setAutoSaveStatus('saved');

        // 2秒后恢复空闲状态
        setTimeout(() => {
          setAutoSaveStatus('idle');
        }, 2000);
      }
    }, 1000);

    // 清理函数
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [content]);

  // 离开页面时提示未保存的内容
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges.current) {
        e.preventDefault();
        e.returnValue = '您有未保存的内容，确定要离开吗？';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // 路由切换时的拦截提示
  useEffect(() => {
    const handleRouteChange = () => {
      if (hasUnsavedChanges.current) {
        const confirmed = window.confirm('您有未保存的内容，确定要离开吗？');
        if (!confirmed) {
          // 阻止路由切换
          window.history.pushState(null, '', location.pathname);
        }
      }
    };

    window.addEventListener('popstate', handleRouteChange);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [location.pathname]);

  useEffect(() => {
    // 点击快捷键保存文章
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveBtn();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [saveBtn]);

  const { list, assistant, callAssistant } = useAssistant();

  // 解析 SSE 流式响应
  const processStream = async (
    reader: ReadableStreamDefaultReader<Uint8Array>,
    onData: (content: string) => void,
  ) => {
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith('data: ') || trimmed.includes('[DONE]')) continue;

        try {
          const data = JSON.parse(trimmed.replace('data: ', ''));
          const delta = data.choices?.[0]?.delta?.content;
          if (delta) onData(delta);
        } catch {
          // 忽略解析错误，可能是空行或不完整数据
        }
      }
    }
  };

  // 助手功能菜单
  const items: MenuProps['items'] = [
    {
      key: '1',
      label: '续写',
      onClick: async () => {
        try {
          setLoading(true);
          const reader = await callAssistant(
            [
              {
                role: 'system',
                content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。',
              },
              {
                role: 'user',
                content: `帮我续写：${content}`,
              },
            ],
            { stream: true, temperature: 0.3 },
          );

          if (!reader) return;

          let fullResponse = '';
          await processStream(reader, (delta) => {
            fullResponse += delta;
            setContent(content + fullResponse);
          });
        } catch (error) {
          console.error(error);
          message.error('调用助手失败');
        } finally {
          setLoading(false);
        }
      },
    },
    {
      key: '2',
      label: '优化',
      onClick: async () => {
        try {
          setLoading(true);
          const reader = await callAssistant(
            [
              {
                role: 'system',
                content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。',
              },
              {
                role: 'user',
                content: `帮我优化该文章，意思不变：${content}`,
              },
            ],
            { stream: true, temperature: 0.3 },
          );

          if (!reader) return;

          let fullResponse = '';
          await processStream(reader, (delta) => {
            fullResponse += delta;
            setContent(fullResponse);
          });
        } catch (error) {
          console.error(error);
          message.error('调用助手失败');
        } finally {
          setLoading(false);
        }
      },
    },
  ];

  return (
    <div>
      <Title value="创作">
        <div className="flex items-center space-x-4 w-[450px]">
          <Space.Compact>
            <Dropdown
              menu={{ items }}
              disabled={list.length === 0}
            >
              <Button onClick={() => {
                if (list.length === 0) {
                  message.error('请先在助手管理中添加助手');
                }
              }}>
                <AiOutlineEdit className="text-base" />
                {assistant ? list.find((a) => a.id === Number(assistant))?.name || '选择助手' : '选择助手'}
              </Button>
            </Dropdown>
          </Space.Compact>

          <Button className="w-full flex justify-between" onClick={saveBtn}>
            <BiSave className="text-base" /> 保存
          </Button>

          <Button size="large" type="primary" className="w-full flex justify-between" onClick={nextBtn}>
            <AiOutlineSend className="text-2xl" /> 发布
          </Button>

          {/* 自动保存状态指示器 */}
          <div className="flex items-center ml-2">
            {autoSaveStatus === 'saving' && (
              <Tag color="processing" icon={<SyncOutlined spin />}>
                自动保存中...
              </Tag>
            )}
            {autoSaveStatus === 'saved' && (
              <Tag color="success" icon={<CheckCircleOutlined />}>
                已自动保存
              </Tag>
            )}
          </div>
        </div>
      </Title>

      <Spin spinning={loading}>
        <Card className={`${titleSty} overflow-hidden rounded-2xl! min-h-[calc(100vh-160px)]`}>
          <Editor value={content} onChange={(value) => setContent(value)} />

          <Modal title={id && !isDraftParams ? '编辑文章' : '发布文章'} open={publishOpen} onCancel={() => setPublishOpen(false)} footer={null} width={600} styles={{ body: { padding: '12px 20px', maxHeight: '70vh', overflowY: 'auto' } }}>
            <PublishForm data={data} closeModel={() => setPublishOpen(false)} />
          </Modal>
        </Card>
      </Spin>
    </div>
  );
};
