import axios from 'axios'
import { useAuthStore } from '@/store/authStore'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建axios实例
const service = axios.create({
  baseURL: '/api/v1/admin',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 直接从localStorage获取token，避免在拦截器中使用Pinia Hook
    const token = localStorage.getItem('admin_token')
    const tokenType = localStorage.getItem('admin_token_type') || 'Bearer'
    if (token) {
      config.headers = config.headers || {}
      config.headers['Authorization'] = `${tokenType} ${token}`
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const res = response.data

    // 如果返回的是文件流，直接返回
    if (response.config.responseType === 'blob') {
      return res
    }

    // 处理业务逻辑
    if (res.code === 200) {
      // 对于登出和响应紧急呼叫接口，返回完整响应对象，以便获取message字段
    if (response.config.url.includes('/auth/logout') || response.config.url.includes('/emergency/call/') && response.config.url.includes('/respond')) {
      return res
    }
    return res.data
    } else {
      console.error('API错误响应:', res)
      ElMessage({
        message: res.message || '请求失败',
        type: 'error',
        duration: 3000
      })
      
      // 401未授权，跳转到登录页
      if (res.code === 401) {
        const authStore = useAuthStore()
        authStore.logout()
        router.push('/login')
      }
      
      return Promise.reject(new Error(res.message || '请求失败'))
    }
  },
  (error) => {
    console.error('响应错误:', error)
    
    if (error.response) {
      // 服务器返回错误状态码
      const status = error.response.status
      const message = error.response.data?.message || '请求失败'
      
      switch (status) {
        case 400:
          ElMessage.error('请求参数错误：' + message)
          break
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          const authStore = useAuthStore()
          authStore.logout()
          router.push('/login')
          break
        case 403:
          // ElMessage.error('没有权限访问') // 未完全实现功能，隐藏报错提示
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(`请求失败 (${status})：${message}`)
      }
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      console.error('网络错误，请求未收到响应:', error.request)
      ElMessage.error('网络错误：无法连接到服务器，请检查网络连接')
    } else {
      // 请求配置错误
      console.error('请求配置错误:', error.message)
      ElMessage.error('请求配置错误：' + error.message)
    }
    
    return Promise.reject(error)
  }
)

export default service