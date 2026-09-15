import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, '')

  return {
    plugins: [
      vue(),
      AutoImport({
        // 自动导入 vue / vue-router / pinia 的常用 API，可省略 import
        imports: ['vue', 'vue-router', 'pinia'],
        // 自动导入 Element Plus 的相关组件方法（ElMessage、ElMessageBox 等）
        resolvers: [ElementPlusResolver()],
        // 生成 auto-imports.d.ts 以获得 IDE 智能提示（非 TS 项目也无害）
        dts: 'src/auto-imports.d.ts',
        eslintrc: { enabled: false }
      }),
      Components({
        // Element Plus 组件自动按需导入（<el-button> 无需手动 register / import）
        resolvers: [ElementPlusResolver()],
        dts: 'src/components.d.ts',
        // 项目内 components 目录不使用自动全局注册（保持显式 import）
        dirs: []
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    server: {
      port: 6101,
      // 关键：配置代理，将 /api 请求转发到后端服务器
      // target 从 .env 读取，改后端地址只需改环境变量文件
      proxy: {
        '/api': {
          target: env.VITE_API_TARGET || 'http://localhost:8080',
          changeOrigin: true
        }
      }
    },
    build: {
      // 主 chunk ≈ 540KB，阈值提到 800，避免被单独超阈值的 vendor chunk 误伤
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          // 手动拆 vendor —— 让 element-plus / echarts / vue 家族独立缓存
          manualChunks(id) {
            if (!id.includes('node_modules')) return
            if (id.includes('echarts') || id.includes('zrender') || id.includes('tslib')) {
              return 'vendor-echarts'
            }
            if (id.includes('element-plus') || id.includes('@element-plus') || id.includes('@ctrl/tinycolor')) {
              return 'vendor-element'
            }
            if (id.includes('/vue/') || id.includes('vue-router') || id.includes('/pinia/') || id.includes('@vueuse')) {
              return 'vendor-vue'
            }
            if (id.includes('xlsx') || id.includes('cfb') || id.includes('crc-32') || id.includes('codepage')) {
              return 'vendor-xlsx'
            }
          }
        }
      }
    }
  }
})
