/** @type {import('next').NextConfig} */
const nextConfig = {
    // 自定义构建输出目录
    // distDir: 'next',
    // 关闭严格模式
    reactStrictMode: false,
    // 启用 standalone 输出模式（用于 Docker 部署）
    output: 'standalone',
    // 配置图片来源
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.liuyuyang.net',
            },
            {
                protocol: 'https',
                hostname: '**.liuyuyang.net',
            },
            {
                protocol: 'https',
                hostname: 'liuyuyang.net',
            },
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
    // 构建配置：生产环境自动移除 console.log/info/debug，保留 warn/error
    webpack: (config, { dev, isServer }) => {
        if (!dev && !isServer) {
            // 仅在生产环境客户端构建时生效
            config.optimization.minimizer.forEach((minimizer) => {
                if (minimizer.constructor.name === 'TerserPlugin') {
                    minimizer.options.terserOptions.compress = {
                        ...minimizer.options.terserOptions?.compress,
                        pure_funcs: ['console.log', 'console.info', 'console.debug'],
                    };
                }
            });
        }
        return config;
    },
};

export default nextConfig;