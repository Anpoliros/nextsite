/** Vite 配置：浏览器资源与构建端渲染入口共用路径别名。 */
import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src/', import.meta.url)) } },
  build: { manifest: true },
});
