import { ElMessage } from 'element-plus'

/**
 * API错误处理器
 */
export class ApiErrorHandler {
  /**
   * 处理权限错误
   */
  static handlePermissionError(error) {
    console.error('权限错误:', error)
    
    if (error.response && error.response.data) {
      const data = error.response.data
      
      // 根据错误码显示不同的错误信息
      switch (data.code) {
        case 1000:
          ElMessage.error(data.msg || '权限不足')
          break
        case 1001:
          ElMessage.error(data.msg || '数据不存在或无权访问')
          break
        case 1002:
          ElMessage.error(data.msg || '部门权限限制')
          break
        case 1003:
          ElMessage.error(data.msg || '操作权限不足')
          break
        default:
          ElMessage.error(data.msg || '请求失败')
      }
    } else {
      ElMessage.error(error.message || '网络错误')
    }
    
    // 如果是权限错误，可能需要重定向
    if ([1000, 1001, 1002, 1003].includes(error.response?.data?.code)) {
      // 可以在这里添加重定向逻辑
    }
  }
  
  /**
   * 处理网络错误
   */
  static handleNetworkError(error) {
    console.error('网络错误:', error)
    
    if (!navigator.onLine) {
      ElMessage.error('网络连接已断开，请检查网络设置')
    } else if (error.message.includes('timeout')) {
      ElMessage.error('请求超时，请稍后重试')
    } else {
      ElMessage.error('网络错误，请稍后重试')
    }
  }
  
  /**
   * 处理服务器错误
   */
  static handleServerError(error) {
    console.error('服务器错误:', error)
    
    if (error.response) {
      switch (error.response.status) {
        case 500:
          ElMessage.error('服务器内部错误，请联系管理员')
          break
        case 502:
          ElMessage.error('服务器网关错误')
          break
        case 503:
          ElMessage.error('服务不可用')
          break
        case 504:
          ElMessage.error('网关超时')
          break
        default:
          ElMessage.error('服务器错误: ' + error.response.status)
      }
    }
  }
  
  /**
   * 通用错误处理
   */
  static handleError(error) {
    console.error('API错误:', error)
    
    if (error.response) {
      const status = error.response.status
      
      if (status === 401) {
        // 未授权，跳转到登录页
        localStorage.clear()
        window.location.href = '/login'
        return
      }
      
      if (status === 403) {
        // 权限不足
        this.handlePermissionError(error)
        return
      }
      
      if (status >= 500) {
        // 服务器错误
        this.handleServerError(error)
        return
      }
      
      // 其他HTTP错误
      ElMessage.error(error.response.data?.msg || `请求失败: ${status}`)
    } else if (error.request) {
      // 网络错误
      this.handleNetworkError(error)
    } else {
      // 其他错误
      ElMessage.error(error.message || '未知错误')
    }
  }
}

/**
 * 创建带有错误处理的API调用函数
 */
export function withErrorHandler(apiCall) {
  return async function(...args) {
    try {
      return await apiCall(...args)
    } catch (error) {
      ApiErrorHandler.handleError(error)
      throw error
    }
  }
}