import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'

// 管理员类型枚举 —— 单一来源
export const AdminType = {
  SUPER_ADMIN: 0,
  NORMAL_ADMIN: 1,
  AUDITOR: 2,
  CUSTOMER_SERVICE: 3,
  EMERGENCY_RESPONDER: 4,
  FORUM_ADMIN: 5,
  UNASSIGNED: 10
}

const typeDescription = {
  0: '超级管理员',
  1: '普通管理员',
  2: '审核员',
  3: '客服',
  4: '紧急响应人员',
  5: '论坛管理员',
  10: '未分配身份'
}

/**
 * 认证 / 当前登录管理员的 store。
 * 单纯覆盖 token + adminInfo + 权限判断，业务态（邀请码等）已拆出。
 */
export const useAuthStore = defineStore('auth', () => {
  // ── 状态 ────────────────────────────────────────────────
  const token = ref('')
  const tokenType = ref('Bearer')
  const expiresIn = ref(0)
  const adminInfo = ref(null)
  const isLoggedIn = ref(false)

  // ── localStorage 同步 ────────────────────────────────────
  const clearStorage = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_token_type')
    localStorage.removeItem('admin_expires_in')
    localStorage.removeItem('admin_info')
  }

  const initFromStorage = () => {
    const storedToken = localStorage.getItem('admin_token')
    const storedTokenType = localStorage.getItem('admin_token_type')
    const storedExpiresIn = localStorage.getItem('admin_expires_in')
    const storedInfo = localStorage.getItem('admin_info')

    if (storedToken) {
      token.value = storedToken
      isLoggedIn.value = true
    }
    if (storedTokenType) tokenType.value = storedTokenType
    if (storedExpiresIn) expiresIn.value = parseInt(storedExpiresIn) || 0

    if (storedInfo) {
      try {
        const info = JSON.parse(storedInfo)
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

  // ── 计算属性 ────────────────────────────────────────────
  const adminType = computed(() => adminInfo.value?.type || 0)
  const adminTypeDesc = computed(() => typeDescription[adminInfo.value?.type] || '未知')

  const isSuperAdmin = computed(() => adminInfo.value?.type === AdminType.SUPER_ADMIN)
  const isNormalAdmin = computed(() => adminInfo.value?.type === AdminType.NORMAL_ADMIN)
  const isAuditor = computed(() => adminInfo.value?.type === AdminType.AUDITOR)
  const isCustomerService = computed(() => adminInfo.value?.type === AdminType.CUSTOMER_SERVICE)
  const isEmergencyResponder = computed(() => adminInfo.value?.type === AdminType.EMERGENCY_RESPONDER)
  const isForumAdmin = computed(() => adminInfo.value?.type === AdminType.FORUM_ADMIN)
  const isUnassigned = computed(() => adminInfo.value?.type === AdminType.UNASSIGNED)

  const getAdminBaseInfo = computed(() => {
    if (!adminInfo.value) {
      return { username: '', typeDesc: '未知', updateTime: '', avatar: '' }
    }
    return {
      username: adminInfo.value.username || '',
      typeDesc: adminInfo.value.typeDesc || typeDescription[adminInfo.value.type] || '未知',
      updateTime: adminInfo.value.updateTime || '',
      avatar: adminInfo.value.avatar || ''
    }
  })

  // ── 权限 ────────────────────────────────────────────────
  // 接受字符串（预设 action）或中文角色 label 数组
  const hasPermission = (requiredType) => {
    if (!adminInfo.value) return false
    if (adminInfo.value.type === AdminType.SUPER_ADMIN) return true

    if (Array.isArray(requiredType)) {
      const currentTypeDesc = typeDescription[adminInfo.value.type]
      return requiredType.includes(currentTypeDesc)
    }

    switch (requiredType) {
      case 'manage_admins':
        return adminInfo.value.type === AdminType.SUPER_ADMIN
      case 'audit':
        return [AdminType.SUPER_ADMIN, AdminType.NORMAL_ADMIN, AdminType.AUDITOR, AdminType.CUSTOMER_SERVICE].includes(adminInfo.value.type)
      case 'customer_service':
        return [AdminType.SUPER_ADMIN, AdminType.CUSTOMER_SERVICE].includes(adminInfo.value.type)
      case 'emergency':
        return [AdminType.SUPER_ADMIN, AdminType.EMERGENCY_RESPONDER].includes(adminInfo.value.type)
      case 'platform_manage':
        return [AdminType.SUPER_ADMIN, AdminType.NORMAL_ADMIN].includes(adminInfo.value.type)
      case 'forum_manage':
        return [AdminType.SUPER_ADMIN, AdminType.NORMAL_ADMIN, AdminType.FORUM_ADMIN].includes(adminInfo.value.type)
      default:
        return true
    }
  }

  // ── Actions ─────────────────────────────────────────────
  const login = (response) => {
    if (!response) {
      console.error('登录失败：响应对象为空')
      isLoggedIn.value = false
      return
    }
    if (!response.token) {
      console.error('登录失败：缺少必要字段：token')
      isLoggedIn.value = false
      return
    }

    token.value = response.token
    tokenType.value = response.tokenType || 'Bearer'
    expiresIn.value = response.expiresIn || 0
    isLoggedIn.value = true

    const info = response.adminInfo
    if (info && typeof info === 'object' && info.id != null && info.username) {
      adminInfo.value = {
        id: info.id,
        username: info.username,
        name: info.name || info.username,
        type: info.type || 0,
        typeDesc: info.typeDesc || typeDescription[info.type] || '未知',
        createTime: info.createTime || new Date().toISOString(),
        updateTime: info.updateTime || new Date().toISOString(),
        avatar: info.avatar || ''
      }
      localStorage.setItem('admin_info', JSON.stringify(adminInfo.value))
    } else {
      adminInfo.value = null
    }

    localStorage.setItem('admin_token', token.value)
    localStorage.setItem('admin_token_type', tokenType.value)
    localStorage.setItem('admin_expires_in', expiresIn.value)
  }

  const getUserInfo = async () => {
    try {
      const userInfo = await authApi.getProfile()
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
        localStorage.setItem('admin_info', JSON.stringify(adminInfo.value))
        return true
      }
      console.error('获取用户信息失败：用户信息不完整')
      return false
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

  const getFirstChar = () => {
    if (!adminInfo.value?.username) return ''
    return adminInfo.value.username.charAt(0).toUpperCase()
  }

  // 构造即初始化
  initFromStorage()

  return {
    // 状态
    token,
    tokenType,
    expiresIn,
    adminInfo,
    isLoggedIn,
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
    getFirstChar,
    // 常量
    AdminType
  }
})
