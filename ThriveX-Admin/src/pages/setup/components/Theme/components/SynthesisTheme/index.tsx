import { useEffect, useState } from 'react';

import { Alert, App, Button, Checkbox, Divider, Form, Input, Modal, Space } from 'antd';
import { CloudUploadOutlined, PictureOutlined } from '@ant-design/icons';

import { Theme } from '@/types/app/config';
import { editWebConfigDataAPI, getWebConfigDataAPI } from '@/api/config';
import { logger } from '@/utils/logger';
import Material from '@/components/Material';
import { ThemeFormValues } from './type';

export default () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>('');
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [theme, setTheme] = useState<Theme>({} as Theme);
  const { notification } = App.useApp();

  const [form] = Form.useForm();

  const [currentUploadType, setCurrentUploadType] = useState<string>('');

  const getLayoutData = async () => {
    try {
      setLoading(true);

      const res = await getWebConfigDataAPI<{ value: Theme }>('theme');

      if (!res?.data?.value) {
        setLoading(false);
        return;
      }

      const theme = res.data.value;

      setTheme(theme);

      form.setFieldsValue({
        ...theme,
        social: theme.social?.map((item) => JSON.stringify(item)).join('\n') || '',
        swiper_text: theme.swiper_text?.join('\n') || '',
        covers: theme.covers?.join('\n') || '',
        reco_article: theme.reco_article?.join('\n') || '',
      });

      setLoading(false);
    } catch (error) {
      logger.error(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getLayoutData();
  }, []);

  const editThemeData = async (values: ThemeFormValues) => {
    try {
      setLoading(true);

      const updatedLayout = {
        ...theme,
        ...values,
        social: values.social
          ? values.social
              .split('\n')
              .map((item: string) => item.trim())
              .filter((item: string) => item)
              .map((item: string) => {
                // 去掉常见的 markdown 符号（反引号、星号等）
                const cleanLine = item.replace(/[`*]/g, '').trim();

                // 优先尝试标准 JSON 解析
                try {
                  const obj = JSON.parse(cleanLine);
                  return {
                    name: String(obj.name || '').trim(),
                    url: String(obj.url || '').trim(),
                  };
                } catch {
                  // JSON 解析失败，宽松提取 "name" 和 "url" 字段
                  const nameMatch = cleanLine.match(/"name"\s*:\s*"([^"]*)"/);
                  const urlMatch = cleanLine.match(/"url"\s*:\s*"([^"]*)"/);
                  if (nameMatch && urlMatch) {
                    return { name: nameMatch[1].trim(), url: urlMatch[1].trim() };
                  }

                  // 兜底：尝试按 "name url" 空格分隔
                  const parts = cleanLine.split(/\s+/);
                  if (parts.length >= 2) {
                    return { name: parts[0].trim(), url: parts.slice(1).join(' ').trim() };
                  }
                  return { name: cleanLine, url: cleanLine };
                }
              })
              .filter((item: { name: string; url: string }) => item.name && item.url)
          : [],
        swiper_text: values.swiper_text ? values.swiper_text.split('\n').filter((item: string) => item.trim()) : [],
        covers: values.covers ? values.covers.split('\n').filter((item: string) => item.trim()) : [],
        reco_article: values.reco_article
          ? values.reco_article
              .split('\n')
              .filter((item: string) => item.trim())
              .map((item: string) => Number(item))
          : [],
      };

      await editWebConfigDataAPI('theme', updatedLayout);

      notification.success({
        title: '成功',
        description: '🎉 修改主题成功',
      });

      setLoading(false);
    } catch (error) {
      logger.error(error);
      setLoading(false);
    }
  };

  const getFile = (name: string) => {
    return new URL(`../../image/${name}.png`, import.meta.url).href;
  };

  const handlePreviewLayout = (item: string) => {
    setPreviewImage(getFile(item));
    setPreviewTitle(item === 'classics' ? '经典布局' : item === 'card' ? '卡片布局' : '瀑布流布局');
    setIsPreviewModalOpen(true);
  };

  const UploadBtn = ({ type }: { type: string }) => (
    <CloudUploadOutlined
      className="text-xl cursor-pointer"
      onClick={() => {
        setCurrentUploadType(type);
        setIsMaterialModalOpen(true);
      }}
    />
  );

  return (
    <div>
      <h2 className="text-xl py-4">综合配置</h2>

      <div className="w-full lg:w-[500px]">
        <Form form={form} onFinish={editThemeData} layout="vertical">
          <Divider>亮色主题 Logo</Divider>
          <Form.Item name="light_logo" label="亮色主题 Logo">
            <Space.Compact style={{ width: '100%' }}>
              <Input prefix={<PictureOutlined />} size="large" placeholder="请输入亮色Logo地址" />
              <UploadBtn type="light_logo" />
            </Space.Compact>
          </Form.Item>
          <img src={form.getFieldValue('light_logo')} alt="" className="w-1/3 mt-4 rounded-sm" />

          <Divider>暗色主题 Logo</Divider>
          <Form.Item name="dark_logo" label="暗色主题 Logo">
            <Space.Compact style={{ width: '100%' }}>
              <Input prefix={<PictureOutlined />} size="large" placeholder="请输入暗色Logo地址" />
              <UploadBtn type="dark_logo" />
            </Space.Compact>
          </Form.Item>
          <img src={form.getFieldValue('dark_logo')} alt="" className="w-1/3 mt-4 rounded-sm" />

          <Divider>首页背景图</Divider>
          <Form.Item name="swiper_image" label="首页背景图">
            <Space.Compact style={{ width: '100%' }}>
              <Input prefix={<PictureOutlined />} size="large" placeholder="请输入背景图地址" />
              <UploadBtn type="swiper_image" />
            </Space.Compact>
          </Form.Item>
          <img src={form.getFieldValue('swiper_image')} alt="" className="w-1/3 mt-4 rounded-sm" />

          <Divider>打字机文本</Divider>
          <Form.Item name="swiper_text" label="打字机文本">
            <Input.TextArea autoSize={{ minRows: 2, maxRows: 4 }} size="large" placeholder="请输入打字机文本" />
          </Form.Item>
          <Alert title="以换行分隔，每行表示一段文本" type="info" className="mt-2" />

          <Divider>社交网站</Divider>
          <Form.Item name="social" label="社交网站">
            <Input.TextArea
              autoSize={{ minRows: 4, maxRows: 8 }}
              size="large"
              placeholder={'每行一个，格式为 JSON，例如：\n{"name": "GitHub", "url": "https://github.com/xxx"}\n{"name": "RedBook", "url": "https://www.xiaohongshu.com/user/xxx"}\n{"name": "Bilibili", "url": "https://space.bilibili.com/xxx"}\n\n内置 name：CSDN / Douyin / GitHub / Gitee / Juejin / QQ / Weixin / RedBook / Bilibili（区分大小写）。url 不要加反引号。'}
            />
          </Form.Item>
          <Alert
            title='每行一条 JSON：{"name":"图标名","url":"链接"}，name 必须是 CSDN / Douyin / GitHub / Gitee / Juejin / QQ / Weixin / RedBook / Bilibili 之一；url 不要用反引号包裹。name 允许前后空格，会自动 trim。'
            type="info"
            className="mt-2"
          />

          <Divider>文章随机封面</Divider>
          <Form.Item name="covers" label="文章随机封面">
            <Input.TextArea
              autoSize={{ minRows: 3, maxRows: 6 }}
              size="large"
              placeholder={'每行一个图片地址，文章没有封面时从中随机抽取，例如：\nhttps://example.com/cover1.jpg\nhttps://example.com/cover2.png'}
            />
          </Form.Item>
          <Alert title="每行一个图片 URL（http/https 链接），文章未设置封面时随机展示，建议至少 3 张以上" type="info" className="mt-2" />

          <Divider>作者推荐文章</Divider>
          <Form.Item name="reco_article" label="作者推荐文章">
            <Input.TextArea
              autoSize={{ minRows: 3, maxRows: 6 }}
              size="large"
              placeholder={'每行一个文章 ID，可到 文章管理 列表中查看，例如：\n1\n5\n12'}
            />
          </Form.Item>
          <Alert title="每行一个文章 ID（数字），用于侧边栏「作者推荐」模块按顺序展示，ID 不存在则跳过" type="info" className="mt-2" />

          <Divider>侧边栏</Divider>
          <Checkbox.Group
            value={theme.right_sidebar}
            onChange={(right_sidebar) => {
              setTheme({ ...theme, right_sidebar });
            }}
          >
            <div className="grid grid-cols-4 gap-2">
              <Checkbox value="author">作者信息模块</Checkbox>
              <Checkbox value="runTime">站点时间模块</Checkbox>
              <Checkbox value="randomArticle">随机推荐模块</Checkbox>
              <Checkbox value="newComments">最新评论模块</Checkbox>
              <Checkbox value="hotArticle">作者推荐模块</Checkbox>
              <Checkbox value="study">装饰模块</Checkbox>
            </div>
          </Checkbox.Group>

          <Divider>文章布局</Divider>
          <div className="overflow-x-auto w-full pb-2">
            <div className="article flex min-w-fit gap-6 justify-center">
              {['classics', 'card', 'waterfall'].map((item) => (
                <div key={item} className="flex flex-col items-center">
                  <div
                    onClick={() => setTheme({ ...theme, is_article_layout: item })}
                    className={`item flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-lg ${theme.is_article_layout === item ? 'border-primary shadow-md' : 'border-stroke'}`}
                  >
                    <p className={`text-base mb-3 ${theme.is_article_layout === item ? 'text-primary' : 'text-gray-500'}`}>{item === 'classics' ? '经典布局' : item === 'card' ? '卡片布局' : '瀑布流布局'}</p>

                    <img
                      src={`${getFile(item)}`}
                      alt=""
                      className="w-[320px] rounded-md cursor-zoom-in"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePreviewLayout(item);
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="primary" size="large" className="w-full mt-4" htmlType="submit" loading={loading}>
            确定
          </Button>
        </Form>
      </div>

      <Modal
        open={isPreviewModalOpen}
        title={previewTitle}
        footer={null}
        onCancel={() => setIsPreviewModalOpen(false)}
        width={800}
      >
        <img src={previewImage} alt={previewTitle} className="w-full rounded-lg" />
      </Modal>

      <Material
        open={isMaterialModalOpen}
        onClose={() => {
          setIsMaterialModalOpen(false);
          setCurrentUploadType('');
        }}
        onSelect={(url: string[]) => {
          if (currentUploadType) {
            form.setFieldValue(currentUploadType, url[0]);
            form.validateFields([currentUploadType]);
            setTheme({ ...theme, [currentUploadType]: url[0] });
          }
        }}
      />
    </div>
  );
};
