import { useState, useEffect, useRef } from 'react';

import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { App, Form, Input, Button, Modal, Spin, Dropdown, Card, MenuProps, Popconfirm, Radio, Select, Skeleton } from 'antd';

import { Cate } from '@/types/app/cate';
import { addCateDataAPI, delCateDataAPI, editCateDataAPI, getCateDataAPI, getCateListAPI } from '@/api/cate';
import { logger } from '@/utils/logger';
import Title from '@/components/Title';

export default () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const isFirstLoadRef = useRef<boolean>(true);
  const { message } = App.useApp();

  const [isModelOpen, setIsModelOpen] = useState(false);
  const [cate, setCate] = useState<Cate>({} as Cate);
  const [list, setList] = useState<Cate[]>([]);
  const [isMethod, setIsMethod] = useState<'create' | 'edit'>('create');
  const [isCateShow, setIsCateShow] = useState(false);
  const [expandedCates, setExpandedCates] = useState<Set<number>>(new Set());
  const [form] = Form.useForm();

  const getCateList = async () => {
    try {
      if (isFirstLoadRef.current) {
        setInitialLoading(true);
      } else {
        setLoading(true);
      }

      const { data } = await getCateListAPI({ pattern: 'tree' });
      const cateList = Array.isArray(data) ? data : data?.result || [];
      if (cateList.length) {
        cateList.sort((a: Cate, b: Cate) => a.order - b.order);
        setList(cateList);
      }
      isFirstLoadRef.current = false;
    } catch (error) {
      logger.error(error);
    } finally {
      setInitialLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getCateList();
  }, []);

  const addCateData = (id: number) => {
    setIsMethod('create');
    setIsModelOpen(true);
    setIsCateShow(false);
    form.resetFields();
    setCate({ ...cate, level: id, type: 'cate' });
  };

  const editCateData = async (id: number) => {
    try {
      setEditLoading(true);

      setIsMethod('edit');
      setIsModelOpen(true);

      const { data } = await getCateDataAPI(id);
      setIsCateShow(data.type === 'cate' ? false : true);
      setCate(data);
      form.setFieldsValue(data);

      setEditLoading(false);
    } catch (error) {
      logger.error(error);
      setEditLoading(false);
    }
  };

  const delCateData = async (id: number) => {
    try {
      setLoading(true);

      await delCateDataAPI(id);
      await getCateList();
      message.success('🎉 删除分类成功');
    } catch (error) {
      logger.error(error);
      setLoading(false);
    }
  };

  const onSubmit = async () => {
    setBtnLoading(true);

    try {
      const values = await form.validateFields();
      if (values.type === 'cate') values.url = '/';

      // 将 order 和 level 转为数字类型，避免 Prisma Int 字段类型校验失败
      values.order = Number(values.order) || 0;
      values.level = Number(values.level);

      if (isMethod === 'edit') {
        await editCateDataAPI({ ...cate, ...values });
        message.success('🎉 修改分类成功');
      } else {
        await addCateDataAPI({ ...cate, ...values });
        message.success('🎉 新增分类成功');
      }

      await getCateList();

      form.resetFields();
      setCate({} as Cate);

      setIsModelOpen(false);
      setIsMethod('create');
    } catch (error: unknown) {
      const err = error as { message?: string };
      logger.error(err);
      message.error(err?.message || '操作失败');
    } finally {
      setBtnLoading(false);
    }
  };

  const closeModel = () => {
    setIsCateShow(false);
    setIsMethod('create');
    setIsModelOpen(false);
    form.resetFields();
    setCate({} as Cate);
  };

  // 渲染子分类列表
  const renderChildren = (children: Cate[] | undefined, isExpanded: boolean) => {
    if (!children || children.length === 0) return null;

    return (
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'
        }`}
      >
        <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-700/50">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px flex-1 bg-gradient-to-r from-slate-200 to-transparent dark:from-slate-700" />
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500">子分类</span>
            <span className="h-px flex-1 bg-gradient-to-l from-slate-200 to-transparent dark:from-slate-700" />
          </div>
          {children.map((child) => {
            const childItems: MenuProps['items'] = [
              {
                key: '1',
                label: (
                  <span className="flex items-center gap-2 py-1.5">
                    <PlusOutlined className="text-md text-blue-500" />
                    <span className="text-slate-700">新增子分类</span>
                  </span>
                ),
                onClick: () => addCateData(child.id!),
              },
              {
                key: '2',
                label: (
                  <span className="flex items-center gap-2 py-1.5">
                    <EditOutlined className="text-md text-indigo-500" />
                    <span className="text-slate-700">编辑</span>
                  </span>
                ),
                onClick: () => editCateData(child.id!),
              },
              {
                key: '3',
                label: (
                  <Popconfirm
                    title="删除确认"
                    description="确定要删除该分类吗？删除后不可恢复"
                    okText="确定"
                    cancelText="取消"
                    okButtonProps={{ danger: true }}
                    onConfirm={() => delCateData(child.id!)}
                  >
                    <span className="flex items-center gap-2 py-1.5 text-red-500 hover:text-red-600">
                      <DeleteOutlined className="text-md" />
                      <span>删除</span>
                    </span>
                  </Popconfirm>
                ),
              },
            ];

            return (
              <div
                key={child.id}
                className="group flex items-center justify-between gap-3 rounded-xl bg-slate-50/50 px-4 py-2.5 transition-all duration-200 hover:bg-slate-100/80 dark:bg-white/5 dark:hover:bg-white/10"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {/* 连接线装饰 */}
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <svg className="h-4 w-4 text-slate-300 dark:text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                  {/* 小图标 */}
                  <span className="text-base opacity-70">{child.icon || ''}</span>
                  {/* 名称 */}
                  <span className="truncate text-sm font-medium text-slate-600 transition-colors group-hover:text-indigo-600 dark:text-slate-300 dark:group-hover:text-indigo-400">
                    {child.name}
                  </span>
                  {/* 标识 */}
                  <span className="hidden shrink-0 items-center gap-1 rounded-full bg-slate-200/50 px-2 py-0.5 text-xs text-slate-400 sm:inline-flex dark:bg-slate-700/50 dark:text-slate-500">
                    {child.mark}
                  </span>
                </div>

                {/* 操作按钮（hover 时显示） */}
                <Dropdown menu={{ items: childItems }} trigger={['click']} placement="bottomRight">
                  <Button
                    type="text"
                    size="small"
                    className="flex shrink-0 items-center gap-1 rounded-lg px-2 text-xs text-slate-400 opacity-0 transition-all duration-200 hover:bg-indigo-50 hover:text-indigo-600 group-hover:opacity-100 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                  >
                    操作
                  </Button>
                </Dropdown>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // 渲染一级分类卡片
  const renderCategoryCard = (item: Cate) => {
    const isExpanded = expandedCates.has(item.id!);
    const hasChildren = item.children && item.children.length > 0;

    const toggleExpand = () => {
      setExpandedCates((prev) => {
        const next = new Set(prev);
        if (next.has(item.id!)) {
          next.delete(item.id!);
        } else {
          next.add(item.id!);
        }
        return next;
      });
    };

    const items: MenuProps['items'] = [
      {
        key: '1',
        label: (
          <span className="flex items-center gap-2 py-1.5">
            <PlusOutlined className="text-md text-blue-500" />
            <span className="text-slate-700">新增子分类</span>
          </span>
        ),
        onClick: () => addCateData(item.id!),
      },
      {
        key: '2',
        label: (
          <span className="flex items-center gap-2 py-1.5">
            <EditOutlined className="text-md text-indigo-500" />
            <span className="text-slate-700">编辑</span>
          </span>
        ),
        onClick: () => editCateData(item.id!),
      },
      {
        key: '3',
        label: (
          <Popconfirm
            title="删除确认"
            description="确定要删除该分类吗？删除后不可恢复"
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => delCateData(item.id!)}
          >
            <span className="flex items-center gap-2 py-1.5 text-red-500 hover:text-red-600">
              <DeleteOutlined className="text-md" />
              <span>删除</span>
            </span>
          </Popconfirm>
        ),
      },
    ];

    return (
      <div key={item.id} className="group relative mb-4 last:mb-0">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-100/50 dark:border-slate-700/50 dark:bg-boxdark/80 dark:hover:border-indigo-500/40 dark:hover:shadow-indigo-900/20">
          {/* 左侧装饰条 */}
          <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-indigo-400 to-purple-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-indigo-500 dark:to-purple-500" />

          {/* 分类头部 */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              {/* 图标容器 */}
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 text-2xl shadow-sm ring-1 ring-indigo-100/50 transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md dark:from-indigo-900/30 dark:via-purple-900/30 dark:to-pink-900/30 dark:ring-indigo-800/30">
                {item.icon || ''}
                {/* 图标光晕效果 */}
                <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-400/0 to-purple-400/0 transition-all duration-300 group-hover:from-indigo-400/10 group-hover:to-purple-400/10" />
              </span>

              {/* 文字信息 */}
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <span className="truncate text-lg font-semibold text-slate-800 transition-colors group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
                  {item.name}
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {/* 标识标签 */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500 ring-1 ring-slate-200/50 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700/50">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" />
                    {item.mark}
                  </span>
                  {/* 类型标签 */}
                  {item.type === 'nav' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600 ring-1 ring-amber-200/50 dark:bg-amber-900/20 dark:text-amber-400 dark:ring-amber-800/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      导航
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-600 ring-1 ring-indigo-200/50 dark:bg-indigo-900/20 dark:text-indigo-400 dark:ring-indigo-800/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      分类
                    </span>
                  )}
                  {/* 顺序标签 */}
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 ring-1 ring-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:ring-emerald-800/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    顺序 {item.order || 0}
                  </span>
                  {/* 子分类数量 */}
                  {hasChildren && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-600 ring-1 ring-violet-200/50 dark:bg-violet-900/20 dark:text-violet-400 dark:ring-violet-800/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                      {item.children!.length} 个子分类
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {/* 展开/收起按钮 */}
              {hasChildren && (
                <Button
                  type="text"
                  size="small"
                  onClick={toggleExpand}
                  className={`flex items-center gap-1 rounded-xl border px-3 text-xs font-medium transition-all duration-200 ${
                    isExpanded
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-800/50 dark:bg-indigo-900/30 dark:text-indigo-400'
                      : 'border-slate-200 bg-white text-slate-400 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-600 dark:bg-boxdark dark:text-slate-500 dark:hover:border-indigo-800/50 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400'
                  }`}
                >
                  <svg
                    className={`h-3.5 w-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  <span>{isExpanded ? '收起' : '展开'}</span>
                </Button>
              )}

              {/* 操作按钮 */}
              <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
                <Button
                  type="text"
                  size="middle"
                  className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-500 shadow-sm ring-1 ring-slate-100 transition-all duration-300 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 hover:shadow-md dark:border-slate-600 dark:bg-boxdark dark:text-slate-400 dark:ring-slate-700/50 dark:hover:border-indigo-500/40 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400"
                >
                  <span>操作</span>
                  <svg className="h-4 w-4 transition-transform group-hover:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              </Dropdown>
            </div>
          </div>

          {/* 子分类列表 */}
          {renderChildren(item.children, isExpanded)}
        </div>
      </div>
    );
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const toCascaderOptions: any = (data: Cate[], isRoot: boolean = true) => [
    ...(isRoot ? [{ value: 0, label: '一级分类' }] : []),
    ...data.map((item) => ({
      value: item.id!,
      label: item.name,
      children: item.children ? toCascaderOptions(item.children, false) : undefined,
    })),
  ];

  if (initialLoading) {
    return (
      <div className="space-y-2">
        <Card className="rounded-xl! border-stroke! shadow-xs! [&>.ant-card-body]:p-4! dark:border-strokedark!">
          <div className="flex items-center justify-between">
            <Skeleton.Input active size="large" className="h-9! w-40!" />
            <Skeleton.Button active size="large" className="h-10! w-28!" />
          </div>
        </Card>

        <Card className="min-h-[calc(100vh-160px)]! rounded-xl! border-stroke! shadow-xs! [&>.ant-card-body]:p-6! dark:border-strokedark!">
          <div className="space-y-5">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="space-y-2">
                <div className="flex items-center justify-between">
                  <Skeleton.Input active className="h-6! w-48!" />
                  <Skeleton.Button active size="small" className="h-6! w-14!" />
                </div>
                {item <= 3 && (
                  <div className="ml-6 space-y-2">
                    {[1, 2, 3].map((child) => (
                      <div key={child} className="flex items-center justify-between">
                        <Skeleton.Input active size="small" className="h-5! w-36!" />
                        <Skeleton.Button active size="small" className="h-5! w-12!" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Title value="分类管理">
        <Button
          type="primary"
          onClick={() => addCateData(0)}
        >
          新增分类
        </Button>
      </Title>

      <Card
        className={`CatePage min-h-[calc(100vh-160px)]! rounded-xl! border! border-stroke! bg-white! shadow-xs! [&>.ant-card-body]:p-6! dark:border-strokedark! dark:bg-boxdark!`}
      >
        <Spin spinning={loading} className="min-h-[280px]">
          {list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <svg className="mb-4 h-16 w-16 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <p className="text-sm">暂无分类，点击右上角按钮新增</p>
            </div>
          ) : (
            <div className="space-y-1">
              {list.map((item) => renderCategoryCard(item))}
            </div>
          )}
        </Spin>
      </Card>

      <Modal
        open={isModelOpen}
        onCancel={closeModel}
        footer={null}
        title={isMethod === 'edit' ? '编辑分类' : '新增分类'}
        loading={editLoading}
        className="[&_.ant-modal-content]:rounded-2xl!"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={cate}
          size="large"
          preserve={false}
          className="mt-2 [&_.ant-input]:rounded-lg! [&_.ant-select-selector]:rounded-lg!"
        >
          <div className="grid gap-x-4 sm:grid-cols-2">
            <Form.Item label="名称" name="name" rules={[{ required: true, message: '分类名称不能为空' }]}>
              <Input placeholder="请输入分类名称" />
            </Form.Item>
            <Form.Item label="标识" name="mark" rules={[{ required: true, message: '分类标识不能为空' }]}>
              <Input placeholder="请输入分类标识" />
            </Form.Item>
          </div>

          <Form.Item label="图标" name="icon">
            <Input placeholder="请输入分类图标（如 emoji 或图标名）" />
          </Form.Item>

          {isCateShow && (
            <Form.Item label="链接" name="url">
              <Input placeholder="请输入分类链接" />
            </Form.Item>
          )}

          <div className="grid gap-x-4 sm:grid-cols-2">
            <Form.Item label="顺序" name="order">
              <Input placeholder="值越小越靠前" />
            </Form.Item>
            <Form.Item label="级别" name="level">
              <Select options={toCascaderOptions(list)} placeholder="请选择分类级别" />
            </Form.Item>
          </div>

          <Form.Item label="模式" name="type">
            <Radio.Group
              className="flex! gap-4!"
              onChange={(e) => {
                const type = e.target.value;
                setIsCateShow(type === 'nav');
              }}
            >
              <Radio value="cate" className="m-0!">
                分类
              </Radio>
              <Radio value="nav" className="m-0!">
                导航
              </Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item className="mb-0!">
            <Button type="primary" onClick={onSubmit} loading={btnLoading} className="w-full">
              确定
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
