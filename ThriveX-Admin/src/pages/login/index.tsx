import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'antd/es/form/Form';
import { App, Button, Form, Input } from 'antd';
import { UserOutlined, LockOutlined, EyeInvisibleOutlined } from '@ant-design/icons';

import { loginDataAPI } from '@/api/user';
import { useUserStore } from '@/stores';
import { logger } from '@/utils/logger';

export default () => {
  const navigate = useNavigate();
  const location = useLocation();
  const store = useUserStore();
  const { notification } = App.useApp();

  const [loading, setLoading] = useState(false);

  const [form] = useForm();

  const rawReturnUrl = new URLSearchParams(location.search).get('returnUrl') || '/';
  // 防止开放重定向：只允许相对路径
  const returnUrl = rawReturnUrl.startsWith('/') ? rawReturnUrl : '/';

  const onSubmit = async () => {
    try {
      setLoading(true);

      const values = await form.validateFields();
      const { data } = await loginDataAPI(values);

      // 将用户信息和token保存起来
      store.setToken(data.token);
      if (data.userInfo) {
        store.setUser(data.userInfo);
      }
      if (data.userInfo?.role) {
        store.setRole(data.userInfo.role);
      }

      notification.success({
        title: ' 登录成功',
        description: `Hello ${data.userInfo?.nickname || '用户'} 欢迎回来`,
      });

      setLoading(false);
      navigate(returnUrl);
    } catch (error) {
      logger.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1a1040]">
      {/* 背景渐变层 */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2d1b69] via-[#1e1550] to-[#0f172a]" />
        {/* 顶部光晕 */}
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[90%] h-[70%] rounded-full bg-purple-600/15 blur-[180px]" />
        {/* 底部光晕 */}
        <div className="absolute bottom-[-15%] left-[15%] w-[55%] h-[55%] rounded-full bg-blue-600/10 blur-[160px]" />
      </div>

      {/* 点阵网格 */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />

      {/* 装饰线条 */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[25%] left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/15 to-transparent" />
      </div>

      {/* 星星粒子 */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/15 animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* 主内容 */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* 标题区域 */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold tracking-[0.25em] mb-2"
            style={{
              fontFamily: "'Ma Shan Zheng', cursive",
              color: '#818cf8',
            }}
          >
            云岫小筑
          </h1>
          <p className="text-sm tracking-[0.15em] text-slate-400/60" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>云端栖息之所</p>
          {/* 标题下划线装饰 */}
          <div className="mt-3 mx-auto w-12 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
        </div>

        {/* 登录卡片 */}
        <div className="relative rounded-2xl border border-white/[0.06] bg-white/[0.03] backdrop-blur-xl p-8 shadow-2xl shadow-black/30">
          <Form form={form} size="large" layout="vertical" onFinish={onSubmit} className="space-y-1">
            <Form.Item
              name="username"
              label={
                <span className="text-slate-300/80 font-medium text-sm" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                  账号
                </span>
              }
              rules={[{ required: true, message: '请输入账号' }]}
              className="mb-5"
            >
              <Input
                prefix={<UserOutlined className="text-slate-400" />}
                placeholder="请输入用户名"
                className="h-12 rounded-xl bg-[#e8eaf6]/90 border-transparent text-slate-800 placeholder:text-slate-400 focus:border-purple-400/50 focus:bg-[#e8eaf6] transition-all duration-300"
                styles={{ input: { color: '#1e293b' } }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-slate-300/80 font-medium text-sm" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>
                  密码
                </span>
              }
              rules={[{ required: true, message: '请输入密码' }]}
              className="mb-6"
            >
              <Input.Password
                prefix={<LockOutlined className="text-slate-400" />}
                placeholder="请输入密码"
                className="h-12 rounded-xl bg-[#e8eaf6]/90 border-transparent text-slate-800 placeholder:text-slate-400 focus:border-purple-400/50 focus:bg-[#e8eaf6] transition-all duration-300"
                iconRender={(visible) => (visible ? <EyeInvisibleOutlined className="text-slate-400" /> : <EyeInvisibleOutlined className="text-slate-400" />)}
                styles={{ input: { color: '#1e293b' } }}
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 rounded-xl font-medium text-base text-white border-none shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 tracking-wider"
                style={{
                  fontFamily: "'Noto Sans SC', sans-serif",
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                }}
                block
              >
                {loading ? '登录中...' : '登 录'}
              </Button>
            </Form.Item>
          </Form>
        </div>

        {/* 底部状态栏 */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-emerald-500/15 bg-emerald-500/[0.05] backdrop-blur-sm shadow-lg shadow-emerald-500/10">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400/70 tracking-wider" style={{ fontFamily: "'Noto Sans SC', sans-serif" }}>服务运行正常</span>
          </div>
        </div>
      </div>
    </div>
  );
};
