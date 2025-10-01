/** @type {import('next').NextConfig} */
const nextConfig = {
    // 关闭严格模式
    reactStrictMode: false,
    // 启用standalone输出模式（Docker部署必需）
    output: 'standalone',
    // 配置图片来源
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'http',
                hostname: '**',
            }
        ],
    },
    eslint: {
        // 即使有 ESLint 错误，构建也会继续，不会因为 ESLint 报错而中断
        ignoreDuringBuilds: true,
    },
};

export default nextConfig;