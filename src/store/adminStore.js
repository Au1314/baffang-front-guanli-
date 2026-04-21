import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'

// 管理员类型枚举
const AdminType = {
  SUPER_ADMIN: 0,
  NORMAL_ADMIN: 1,
  AUDITOR: 2,
  CUSTOMER_SERVICE: 3,
  EMERGENCY_RESPONDER: 4,
  FORUM_ADMIN: 5,
  UNASSIGNED: 10
}

// 类型描述映射
const typeDescription = {
  0: '超级管理员',
  1: '普通管理员',
  2: '审核员',
  3: '客服',
  4: '紧急响应人员',
  5: '论坛管理员',
  10: '未分配身份'
}

export const useAdminStore = defineStore('admin', () => {
  // 状态
  const token = ref('')
  const tokenType = ref('Bearer')
  const expiresIn = ref(0)
  const adminInfo = ref(null)
  const isLoggedIn = ref(false)

  // 从localStorage初始化
  const initFromStorage = () => {
    const storedToken = localStorage.getItem('admin_token')
    const storedTokenType = localStorage.getItem('admin_token_type')
    const storedExpiresIn = localStorage.getItem('admin_expires_in')
    const storedInfo = localStorage.getItem('admin_info')
    
    if (storedToken) {
      token.value = storedToken
      isLoggedIn.value = true
    }
    
    if (storedTokenType) {
      tokenType.value = storedTokenType
    }
    
    if (storedExpiresIn) {
      expiresIn.value = parseInt(storedExpiresIn) || 0
    }
    
    if (storedInfo) {
      try {
        const info = JSON.parse(storedInfo)
        // 确保有类型描述
        if (info.type && !info.typeDesc) {
          info.typeDesc = typeDescription[info.type] || '未知'
        }
        adminInfo.value = info
      } catch (e) {
        console.error('解析管理员信息失败', e)
        clearStorage()
      }
    }
  }

  // Getter计算属性
  const adminType = computed(() => adminInfo.value?.type || 0)
  const adminTypeDesc = computed(() => {
    const type = adminInfo.value?.type
    return typeDescription[type] || '未知'
  })

  const isSuperAdmin = computed(() => adminInfo.value?.type === AdminType.SUPER_ADMIN)
  const isNormalAdmin = computed(() => adminInfo.value?.type === AdminType.NORMAL_ADMIN)
  const isAuditor = computed(() => adminInfo.value?.type === AdminType.AUDITOR)
  const isCustomerService = computed(() => adminInfo.value?.type === AdminType.CUSTOMER_SERVICE)
  const isEmergencyResponder = computed(() => adminInfo.value?.type === AdminType.EMERGENCY_RESPONDER)
  const isForumAdmin = computed(() => adminInfo.value?.type === AdminType.FORUM_ADMIN)
  const isUnassigned = computed(() => adminInfo.value?.type === AdminType.UNASSIGNED)

  // 平台管理相关状态
  const memberList = ref([])
  const platformConfig = ref({})
  const logList = ref([])
  // 邀请码相关状态
  const inviteCodeList = ref([])
  const inviteCodeLoading = ref(false)

  // 权限检查方法，支持字符串或数组类型的权限检查
  const hasPermission = (requiredType) => {
    if (!adminInfo.value) return false
    
    // 超级管理员拥有所有权限
    if (adminInfo.value.type === AdminType.SUPER_ADMIN) {
      return true
    }
    
    // 如果是数组类型，检查是否有任意一个权限匹配
    if (Array.isArray(requiredType)) {
      const currentTypeDesc = typeDescription[adminInfo.value.type]
      return requiredType.includes(currentTypeDesc)
    }
    
    // 根据管理员类型检查权限
    switch (requiredType) {
      case 'manage_admins':
        // 只有超级管理员可以管理其他管理员
        return adminInfo.value.type === AdminType.SUPER_ADMIN
      case 'audit':
        // 审核员、客服、普通管理员和超级管理员可以审核
        return [AdminType.SUPER_ADMIN, AdminType.NORMAL_ADMIN, AdminType.AUDITOR, AdminType.CUSTOMER_SERVICE].includes(adminInfo.value.type)
      case 'customer_service':
        // 客服和超级管理员可以处理客服
        return [AdminType.SUPER_ADMIN, AdminType.CUSTOMER_SERVICE].includes(adminInfo.value.type)
      case 'emergency':
        // 紧急响应人员和超级管理员
        return [AdminType.SUPER_ADMIN, AdminType.EMERGENCY_RESPONDER].includes(adminInfo.value.type)
      case 'platform_manage':
        // 超级管理员和管理员可以平台管理
        return [AdminType.SUPER_ADMIN, AdminType.NORMAL_ADMIN].includes(adminInfo.value.type)
      case 'forum_manage':
        // 论坛管理员、普通管理员和超级管理员可以管理论坛
        return [AdminType.SUPER_ADMIN, AdminType.NORMAL_ADMIN, AdminType.FORUM_ADMIN].includes(adminInfo.value.type)
      default:
        return true
    }
  }

  // 平台管理方法
  const setMemberList = (list) => {
    memberList.value = list
  }

  const updateMember = (memberId, updates) => {
    const index = memberList.value.findIndex(member => member.id === memberId)
    if (index !== -1) {
      memberList.value[index] = { ...memberList.value[index], ...updates }
    }
  }

  const removeMember = (memberId) => {
    memberList.value = memberList.value.filter(member => member.id !== memberId)
  }

  const setPlatformConfig = (config) => {
    platformConfig.value = config
  }

  const updatePlatformConfig = (updates) => {
    platformConfig.value = { ...platformConfig.value, ...updates }
  }

  const setLogList = (list) => {
    logList.value = list
  }

  const addLog = (log) => {
    logList.value.unshift(log)
    // 限制日志数量
    if (logList.value.length > 100) {
      logList.value.pop()
    }
  }

  // 邀请码相关方法
  const generateInviteCode = async (data) => {
    try {
      inviteCodeLoading.value = true
      const response = await authApi.generateInviteCode(data)
      return response
    } catch (error) {
      console.error('生成邀请码失败:', error)
      throw error
    } finally {
      inviteCodeLoading.value = false
    }
  }

  const getInviteCodeList = async (params) => {
    try {
      inviteCodeLoading.value = true
      const response = await authApi.getInviteCodeList(params)
      // 注意：响应拦截器已经将成功响应的data提取出来，所以response直接是邀请码数组
      inviteCodeList.value = response || []
      return response
    } catch (error) {
      console.error('获取邀请码列表失败:', error)
      throw error
    } finally {
      inviteCodeLoading.value = false
    }
  }

  const setInviteCodeList = (list) => {
    inviteCodeList.value = list
  }
  
  // 修改邀请码状态
  const updateInviteCodeStatus = async (codeId, status) => {
    try {
      inviteCodeLoading.value = true
      const response = await authApi.updateInviteCodeStatus(codeId, status)
      // 更新本地邀请码列表
      const index = inviteCodeList.value.findIndex(code => code.id === codeId)
      if (index !== -1) {
        inviteCodeList.value[index].status = status
      }
      return response
    } catch (error) {
      console.error('修改邀请码状态失败:', error)
      throw error
    } finally {
      inviteCodeLoading.value = false
    }
  }
  
  // 删除邀请码
  const deleteInviteCode = async (codeId) => {
    try {
      inviteCodeLoading.value = true
      const response = await authApi.deleteInviteCode(codeId)
      // 从本地邀请码列表中移除
      inviteCodeList.value = inviteCodeList.value.filter(code => code.id !== codeId)
      return response
    } catch (error) {
      console.error('删除邀请码失败:', error)
      throw error
    } finally {
      inviteCodeLoading.value = false
    }
  }
  
  // 批量删除邀请码
  const batchDeleteInviteCode = async (ids) => {
    try {
      inviteCodeLoading.value = true
      const response = await authApi.batchDeleteInviteCode(ids)
      // 从本地邀请码列表中移除成功删除的邀请码
      // 只有当API请求成功时，才从本地列表中移除
      inviteCodeList.value = inviteCodeList.value.filter(code => !ids.includes(code.id))
      // 返回API响应或一个标准化的成功对象
      return response || { successCount: ids.length, failCount: 0, failIds: [] }
    } catch (error) {
      console.error('批量删除邀请码失败:', error)
      // 如果API请求失败，不更新本地列表，直接抛出错误
      throw error
    } finally {
      inviteCodeLoading.value = false
    }
  }

  // Actions
  const login = (response) => {
    // 详细日志，便于调试
    console.log('login方法接收的参数:', response)
    
    // 验证响应对象
    if (!response) {
      console.error('登录失败：响应对象为空')
      isLoggedIn.value = false
      return
    }
    
    // 验证必要字段 - 只需要token
    if (!response.token) {
      console.error('登录失败：缺少必要字段：token')
      isLoggedIn.value = false
      return
    }
    
    // 提取token信息
    const newToken = response.token
    const newTokenType = response.tokenType || 'Bearer'
    const newExpiresIn = response.expiresIn || 0
    const info = response.adminInfo || null
    
    // 更新状态
    token.value = newToken
    tokenType.value = newTokenType
    expiresIn.value = newExpiresIn
    isLoggedIn.value = true
    
    // 如果有adminInfo，直接存储
    if (info && typeof info === 'object') {
      // 验证adminInfo内部字段
      if (info.id !== undefined && info.id !== null && info.username) {
        adminInfo.value = {
          id: info.id,
          username: info.username,
          name: info.name || info.username, // 添加name字段
          type: info.type || 0,
          typeDesc: info.typeDesc || typeDescription[info.type] || '未知',
          createTime: info.createTime || new Date().toISOString(),
          updateTime: info.updateTime || new Date().toISOString(),
          avatar: info.avatar || ''
        }
        // 保存到localStorage
        localStorage.setItem('admin_info', JSON.stringify(adminInfo.value))
      }
    } else {
      // 如果没有adminInfo，初始化为空对象
      adminInfo.value = null
    }
    
    // 保存token信息到localStorage
    localStorage.setItem('admin_token', newToken)
    localStorage.setItem('admin_token_type', tokenType.value)
    localStorage.setItem('admin_expires_in', expiresIn.value)
  }

  // 获取用户信息
  const getUserInfo = async () => {
    try {
      const userInfo = await authApi.getAdminInfo()
      
      console.log('获取用户信息成功:', userInfo)
      
      // 更新用户信息
      if (userInfo && typeof userInfo === 'object' && userInfo.id && userInfo.username) {
        adminInfo.value = {
          id: userInfo.id,
          username: userInfo.username,
          type: userInfo.type || 0,
          typeDesc: userInfo.typeDesc || typeDescription[userInfo.type] || '未知',
          createTime: userInfo.createTime || new Date().toISOString(),
          updateTime: userInfo.updateTime || new Date().toISOString(),
          avatar: userInfo.avatar || ''
        }
        
        // 保存到localStorage
        localStorage.setItem('admin_info', JSON.stringify(adminInfo.value))
        return true
      } else {
        console.error('获取用户信息失败：用户信息不完整')
        return false
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      return false
    }
  }

  const logout = () => {
    token.value = ''
    tokenType.value = 'Bearer'
    expiresIn.value = 0
    adminInfo.value = null
    isLoggedIn.value = false
    
    // 清除localStorage
    clearStorage()
  }

  const updateAdminInfo = (info) => {
    if (adminInfo.value) {
      adminInfo.value = { 
        ...adminInfo.value, 
        ...info,
        typeDesc: info.type ? (typeDescription[info.type] || '未知') : adminInfo.value.typeDesc
      }
      localStorage.setItem('admin_info', JSON.stringify(adminInfo.value))
    }
  }

  const clearStorage = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_token_type')
    localStorage.removeItem('admin_expires_in')
    localStorage.removeItem('admin_info')
  }

  // 获取管理员基本信息（用于界面显示）
  const getAdminBaseInfo = computed(() => {
    if (!adminInfo.value) {
      return {
        username: '',
        typeDesc: '未知',
        updateTime: ''
      }
    }
    return {
      username: adminInfo.value.username || '',
      typeDesc: adminInfo.value.typeDesc || typeDescription[adminInfo.value.type] || '未知',
      updateTime: adminInfo.value.updateTime || '',
      avatar: adminInfo.value.avatar || ''
    }
  })

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch (e) {
      return dateString
    }
  }

  // 获取用户名首字母（用于头像）
  const getFirstChar = () => {
    if (!adminInfo.value?.username) return ''
    return adminInfo.value.username.charAt(0).toUpperCase()
  }

  // 初始化
  initFromStorage()

  return {
    // 状态
    token,
    tokenType,
    expiresIn,
    adminInfo,
    isLoggedIn,
    memberList,
    platformConfig,
    logList,
    inviteCodeList,
    inviteCodeLoading,
    
    // 计算属性
    adminType,
    adminTypeDesc,
    isSuperAdmin,
    isNormalAdmin,
    isAuditor,
    isCustomerService,
    isEmergencyResponder,
    isForumAdmin,
    isUnassigned,
    getAdminBaseInfo,
    
    // 方法
    login,
    getUserInfo,
    logout,
    updateAdminInfo,
    clearStorage,
    hasPermission,
    formatDate,
    getFirstChar,
    setMemberList,
    updateMember,
    removeMember,
    setPlatformConfig,
    updatePlatformConfig,
    setLogList,
    addLog,
    // 邀请码相关方法
    generateInviteCode,
    getInviteCodeList,
    setInviteCodeList,
    updateInviteCodeStatus,
    deleteInviteCode,
    batchDeleteInviteCode,
    
    // 常量
    AdminType
  }
})