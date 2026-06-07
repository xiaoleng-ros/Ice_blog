import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { App, Form, Input, Button, Select, DatePicker, Cascader, Switch, Radio, Space } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { RuleObject } from 'antd/es/form';
import dayjs from 'dayjs';
import { CloudUploadOutlined, PictureOutlined } from '@ant-design/icons';

import { addArticleDataAPI, editArticleDataAPI } from '@/api/article';
import { logger } from '@/utils/logger';
import { getCateListAPI } from '@/api/cate';
import useAssistant from '@/hooks/useAssistant';
import { addTagDataAPI, getTagPagingAPI } from '@/api/tag';

import { Cate } from '@/types/app/cate';
import { Tag } from '@/types/app/tag';
import { Article, Status } from '@/types/app/article';

import Material from '@/components/Material';

import './index.scss';

// API 返回数据兼容类型
interface ApiResponse<T> {
  result?: T;
}

interface Props {
  data: Article;
  closeModel: () => void;
}

interface FieldType {
  title: string;
  createTime: number;
  cateIds: number[];
  tagIds: (number | string)[];
  cover: string;
  description: string;
  config: {
    top: boolean;
    status: Status;
    password: string;
    isEncrypt: number;
  };
}

interface AssistantResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const PublishForm = ({ data, closeModel }: Props) => {
  const [params] = useSearchParams();
  // 优先使用 data.id（新建草稿后返回的 id），其次从 URL 参数读取
  const id = data?.id || +params.get('id')!;
  const isDraftParams = Boolean(params.get('draft'));

  const [btnLoading, setBtnLoading] = useState(false);

  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);

  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { message } = App.useApp();

  const [cateList, setCateList] = useState<Cate[]>([]);
  const [tagList, setTagList] = useState<Tag[]>([]);
  const [isEncryptEnabled, setIsEncryptEnabled] = useState(false);
  // 标记标签列表是否已加载完成
  const [tagListLoaded, setTagListLoaded] = useState(false);
  // 标记文章数据是否已加载完成
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    if (!id) return form.resetFields();

    // 把数据处理成[[1], [4, 5], [4, 6]]格式
    const cateIds = data?.cateList?.flatMap((item) => {
      if (item?.children?.length) {
        return item.children.map((child) => [item.id, child.id]);
      } else {
        return [[item.id]];
      }
    });

    logger.log(data,data.tagList);

    // 不在这设置 tagIds，等 tagList 加载完成后在独立 useEffect 中设置
    const formValues = {
      ...data,
      status: data.config?.status ?? 'default',
      password: data.config?.password ?? '',
      isEncrypt: !!data.config?.isEncrypt,
      cateIds,
      tagIds: [],
      createTime: dayjs(+(data.createTime ?? Date.now())),
    };

    form.setFieldsValue(formValues);
    // 设置初始的加密状态
    setIsEncryptEnabled(!!formValues.isEncrypt);
    // 设置封面预览
    setCoverPreview(data?.cover || '');
    // 标记文章数据已加载
    setDataLoaded(true);
  }, [data, id]);

  // 标签列表加载完成后，再设置表单中的标签值，确保 Select 能映射到标签名称
  // 同时监听 data 变化，当文章数据从后端加载完成后重新设置
  useEffect(() => {
    if (!id || !tagList.length || !dataLoaded) return;

    const tagIds = data?.tagList?.map((item: Tag) => item.id) ?? [];
    form.setFieldsValue({ tagIds });
  }, [tagListLoaded, dataLoaded, data]);

  const getCateList = async () => {
    try {
      const { data } = await getCateListAPI({ pattern: 'tree' });
      // 后端返回的 data 可能是数组或 { result: [] } 格式，兼容处理
      const cateData = Array.isArray(data) ? data : data?.result || [];
      setCateList(cateData.filter((item: Cate) => item.type === 'cate'));
    } catch (error) {
      logger.error('获取分类列表失败:', error);
    }
  };

  const getTagList = async () => {
    try {
      const { data } = await getTagPagingAPI({ page: 1, size: 100 });
      // 后端 GET /tag 返回的是扁平数组，兼容处理
      const tagData = Array.isArray(data) ? data : data?.result || [];
      logger.log('解析后的标签列表:', JSON.stringify(tagData));
      setTagList(tagData as Tag[]);
      // 标记标签列表已加载完成，触发设置表单标签值
      setTagListLoaded(true);
    } catch (error) {
      logger.error('获取标签列表失败:', error);
      setTagListLoaded(true);
    }
  };

  useEffect(() => {
    getCateList();
    getTagList();
  }, []);

  // 校验文章封面
  const validateURL = (_: RuleObject, value: string) => {
    return !value || /^(https?:\/\/)/.test(value) ? Promise.resolve() : Promise.reject(new Error('请输入有效的封面链接'));
  };

  const onSubmit = async (values: FieldType, isDraft?: boolean) => {
    setBtnLoading(true);

    values.config.isEncrypt = values.config.isEncrypt ? 1 : 0;

    try {
      // 如果是文章标签，则先判断是否存在，如果不存在则添加
      const tagIds: number[] = [];
      for (const item of values.tagIds ? values.tagIds : []) {
        if (typeof item === 'string') {
          // 如果已经有这个标签了，就没必要再创建一个了
          // 先转换为大写进行查找，否则会出现大小写不匹配问题
          const tag1 = tagList.find((t) => t.name.toUpperCase() === item.toUpperCase())?.id;

          if (tag1) {
            tagIds.push(tag1);
            continue;
          }

          // 创建新标签，用返回值直接取 id（不能依赖 tagList state，闭包中是旧值）
          const tagRes = await addTagDataAPI({ name: item });
          const newTagId = tagRes?.data?.id;
          if (newTagId) tagIds.push(newTagId);
        } else {
          tagIds.push(item);
        }
      }

      values.createTime = values.createTime.valueOf();
      values.cateIds = [...new Set(values.cateIds?.flat())];

      if (id && !isDraftParams) {
        await editArticleDataAPI({
          id,
          ...values,
          content: data.content,
          tagIds,
          createTime: values.createTime.toString(),
          config: {
            isDraft: 0,
            isDel: 0,
            ...values.config,
          },
        } as Article);
        message.success('🎉 编辑成功');
      } else {
        if (!isDraftParams) {
          await addArticleDataAPI({
            id,
            ...values,
            content: data.content,
            tagIds,
            config: {
              isDraft: isDraft ? 1 : 0,
              isDel: 0,
              ...values.config,
            },
            createTime: values.createTime.toString(),
          });

          if (isDraft) {
            message.success(' 保存为草稿成功');
          } else {
            message.success('🎉 发布成功');
          }
        } else {
          // 修改草稿状态为发布文章
          await editArticleDataAPI({
            id,
            ...values,
            content: data.content,
            tagIds,
            createTime: values.createTime.toString(),
            config: {
              isDraft: isDraft ? 1 : 0,
              isDel: 0,
              ...values.config,
            },
          } as Article);
        }
      }

      // 关闭弹框
      closeModel();
      // 清除本地持久化的数据
      localStorage.removeItem('article_content');
      // 如果是草稿就跳转到草稿页，否则文章页
      if (isDraft) {
        navigate('/draft');
      } else {
        navigate('/article');
      }
      // 初始化表单
      form.resetFields();
    } catch (error) {
      logger.error(error);
      setBtnLoading(false);
    }

    setBtnLoading(false);
  };

  // 初始表单数据
  const initialValues = {
    config: {
      top: false,
      status: 'default',
      password: '',
      isEncrypt: 0,
    },
    createTime: dayjs(new Date()),
  };

  const { callAssistant } = useAssistant();
  const [generating, setGenerating] = useState(false);

  // 调用助手API生成标题和简介
  const generateTitleAndDescription = async (retryCount = 0) => {
    const MAX_RETRIES = 2;
    const RETRY_DELAY = 3000; // 3秒后重试

    try {
      setGenerating(true);

      const content = data.content || '';
      if (!content) {
        message.error('请先输入文章内容');
        return;
      }

      const prompt = `请根据以下文章内容生成一个合适的标题和简短的简介：
文章内容：
${content}

要求：
1. 标题要简洁有力，不超过20个字
2. 简介要概括文章主要内容，不超过100字
3. 返回格式为JSON对象，包含title和description字段`;

      const response = await callAssistant(
        [
          {
            role: 'system',
            content: '你是 Kimi，由 Moonshot AI 提供的人工智能助手，你更擅长中文和英文的对话。你会为用户提供安全，有帮助，准确的回答。',
          },
          { role: 'user', content: prompt },
        ],
        { max_tokens: 200, temperature: 0.3 },
      );

      if (response) {
        const result = (response as AssistantResponse).choices?.[0]?.message?.content?.trim();
        if (result) {
          try {
            let jsonStr = result;
            if (jsonStr.startsWith('```json')) {
              jsonStr = jsonStr
                .replace(/```json/g, '')
                .replace(/```/g, '')
                .trim();
            }

            const { title, description } = JSON.parse(jsonStr);
            form.setFieldsValue({
              title: title || '',
              description: description || '',
            });
            message.success('标题和简介生成成功');
          } catch (e) {
            logger.error('Failed to parse response:', e);
            message.error('解析生成结果失败，请检查助手返回格式');
          }
        } else {
          message.error('生成失败，请重试');
        }
      }
    } catch (error) {
      logger.error(error);

      const errorMessage = error instanceof Error ? error.message : String(error);

      // 如果是 429 频率限制错误，尝试重试
      if (errorMessage.includes('429') || errorMessage.includes('访问量过大')) {
        if (retryCount < MAX_RETRIES) {
          message.warning(`AI 服务繁忙，${RETRY_DELAY / 1000}秒后自动重试（${retryCount + 1}/${MAX_RETRIES}）...`);
          setTimeout(() => {
            generateTitleAndDescription(retryCount + 1);
          }, RETRY_DELAY);
          return;
        } else {
          message.error('AI 服务当前访问量过大，请稍后再试或手动填写标题和简介');
        }
      } else {
        message.error('调用助手失败');
      }
    } finally {
      setGenerating(false);
    }
  };

  // 封面预览状态
  const [coverPreview, setCoverPreview] = useState<string>('');

  // 文件上传
  const UploadBtn = () => <CloudUploadOutlined className="text-xl cursor-pointer" onClick={() => setIsMaterialModalOpen(true)} />;

  // 处理封面选择
  const handleCoverSelect = (url: string[]) => {
    const coverUrl = url[0];
    form.setFieldValue('cover', coverUrl);
    setCoverPreview(coverUrl);
    form.validateFields(['cover']); // 手动触发 cover 字段的校验
  };

  // 清除封面
  const handleClearCover = () => {
    form.setFieldValue('cover', '');
    setCoverPreview('');
  };

  return (
    <div>
      <Form form={form} name="basic" size="large" layout="vertical" onFinish={onSubmit} autoComplete="off" initialValues={initialValues}>
        <Form.Item label="文章标题" name="title" rules={[{ required: true, message: '请输入文章标题' }]}>
          <Input placeholder="请输入文章标题" />
        </Form.Item>

        <Form.Item label="文章简介" name="description">
          <TextArea autoSize={{ minRows: 2, maxRows: 5 }} showCount placeholder="请输入文章简介" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={() => generateTitleAndDescription()} loading={generating}>
            一键生成标题和简介
          </Button>
        </Form.Item>

        <Form.Item label="文章封面" name="cover" rules={[{ validator: validateURL }]}>
          <div className="space-y-2">
            <Space.Compact style={{ width: '100%' }}>
              <Input placeholder="请输入文章封面" prefix={<PictureOutlined />} />
              <UploadBtn />
            </Space.Compact>
            {coverPreview && (
              <div className="relative inline-block">
                <img src={coverPreview} alt="封面预览" className="w-40 h-24 object-cover rounded-md border border-gray-200" />
                <Button
                  size="small"
                  danger
                  className="absolute top-1 right-1 w-5 h-5 p-0 flex items-center justify-center rounded-full"
                  onClick={handleClearCover}
                >
                  ×
                </Button>
              </div>
            )}
          </div>
        </Form.Item>

        <Form.Item label="选择分类" name="cateIds" rules={[{ required: true, message: '请选择文章分类' }]}>
          <Cascader
            options={cateList}
            maxTagCount="responsive"
            multiple
            fieldNames={{ label: 'name', value: 'id' }}
            placeholder="请选择文章分类"
            className="w-full"
            classNames={{ popup: { root: 'article-cate-cascader' } }}
            displayRender={(labels) => labels.join(' / ')}
            changeOnSelect
          />
        </Form.Item>

        <Form.Item label="选择标签" name="tagIds">
          <Select allowClear mode="tags" options={tagList} fieldNames={{ label: 'name', value: 'id' }} filterOption={(input, option) => !!option?.name.includes(input)} placeholder="请选择文章标签" className="w-full" />
        </Form.Item>

        <Form.Item label="选择发布时间" name="createTime">
          <DatePicker showTime placeholder="选择文章发布时间" className="w-full" />
        </Form.Item>

        {/* <Form.Item label="是否置顶" name={["config", "top"]} valuePropName="checked">
          <Switch />
        </Form.Item> */}

        <Form.Item label="状态" name={['config', 'status']}>
          <Radio.Group>
            <Radio value="default">正常</Radio>
            <Radio value="no_home">不在首页显示</Radio>
            <Radio value="hide">全站隐藏</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="是否加密" name={['config', 'isEncrypt']} valuePropName="checked">
          <Switch onChange={(checked: boolean) => setIsEncryptEnabled(checked)} />
        </Form.Item>

        {isEncryptEnabled && (
          <Form.Item label="访问密码" name={['config', 'password']} rules={[{ required: isEncryptEnabled, message: '请输入访问密码' }]}>
            <Input.Password placeholder="请输入访问密码" />
          </Form.Item>
        )}

        <Form.Item className="mb-0!">
          <Button type="primary" htmlType="submit" loading={btnLoading} className="w-full">
            {id && !isDraftParams ? '编辑文章' : '发布文章'}
          </Button>
        </Form.Item>

        {/* 草稿和编辑状态下不再显示保存草稿按钮 */}
        {((isDraftParams && id) || !id) && (
          <Form.Item className="mt-2! mb-0!">
            <Button className="w-full" onClick={() => form.validateFields().then((values) => onSubmit(values, true))}>
              {isDraftParams ? '保存' : '保存为草稿'}
            </Button>
          </Form.Item>
        )}
      </Form>

      <Material
        // multiple
        open={isMaterialModalOpen}
        onClose={() => setIsMaterialModalOpen(false)}
        onSelect={handleCoverSelect}
      />
    </div>
  );
};

export default PublishForm;
