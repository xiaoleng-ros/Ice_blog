/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import sassDts from 'vite-plugin-sass-dts';
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), sassDts()],
  // 配置快捷路径
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '~': path.resolve(__dirname, 'src')
    },
  },
  // 配置scss样式自动引入
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [path.resolve(__dirname, 'src/styles')],
        additionalData: `@use "var.scss" as *;`
      }
    }
  },
  server: {
    port: 9001,
  },
  // 构建配置：生产环境自动移除 console.log/info/debug，保留 warn/error
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false, // 不全部移除，手动控制
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // 仅移除这些
      },
    },
  },
})
