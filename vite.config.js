import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 6101,
    // 关键：配置代理，将/api请求转发到后端服务器
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // 替换为你的后端实际端口（如8080/9090）
        changeOrigin: true, // 解决跨域
        // rewrite: (path) => path.replace(/^\/api/, '') // 如果后端接口没有/api前缀，需要添加这行
      }
    }
  }
})