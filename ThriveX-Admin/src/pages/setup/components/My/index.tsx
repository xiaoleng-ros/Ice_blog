import { useEffect, useState } from 'react';
import { App, Form, Input, Button } from 'antd';

import { useUserStore } from '@/stores';
import { editUserDataAPI } from '@/api/user';
import { User } from '@/types/app/user';
import { logger } from '@/utils/logger';

interface UserForm {
  name: string;
  email: string;
  avatar: string;
}

export default () => {
  const [loading, setLoading] = useState<boolean>(false);

  const [form] = Form.useForm<UserForm>();
  const store = useUserStore();
  const { message } = App.useApp();

  // 从 store 中预填表单数据（登录时已存入）
  useEffect(() => {
    if (store.user?.id) {
      form.setFieldsValue({
        name: store.user.nickname || store.user.name,
        email: store.user.email,
        avatar: store.user.avatar,
      });
    }
  }, [store.user]);

  const onSubmit = async (values: UserForm) => {
    try {
      const userId = store.user?.id;
      if (!userId) {
        message.error('用户信息尚未加载，请刷新页面后重试');
        return;
      }

      setLoading(true);

      await editUserDataAPI({
        id: userId,
        nickname: values.name,
        email: values.email,
        avatar: values.avatar,
      });

      // 直接更新 store，右上角立即响应
      store.setUser({
        ...store.user,
        name: values.name,
        nickname: values.name,
        email: values.email,
        avatar: values.avatar,
      } as User);

      setLoading(false);
      message.success('🎉 修改用户信息成功');
    } catch (error) {
      logger.error(error);
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl pb-4">个人配置</h2>

      <Form form={form} size="large" layout="vertical" onFinish={onSubmit} className="w-full lg:w-[500px] md:ml-10">
        <Form.Item label="名称" name="name" rules={[{ required: true, message: '名称不能为空' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="邮箱" name="email" rules={[{ required: true, message: '邮箱不能为空' }]}>
          <Input />
        </Form.Item>

        <Form.Item label="头像" name="avatar" rules={[{ required: true, message: '头像不能为空' }]}>
          <Input />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="w-full">
            确定
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
