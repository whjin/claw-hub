import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 配置@别名，方便组件和工具函数引入
    },
  },
  server: {
    port: 8080, // 前端开发端口（避免与后端3000端口冲突）
    proxy: {
      // 代理HTTP请求（获取模型列表接口）
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
      },
      // 代理WebSocket请求（实时聊天通信）
      '/ws': {
        target: 'ws://localhost:3000',
        changeOrigin: true,
        ws: true,
        rewrite: (path) => path.replace(/^\/ws/, ''),
      },
    },
  },
});
