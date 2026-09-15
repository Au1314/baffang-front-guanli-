import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@/api/auth'

/**
 * 邀请码管理 store。原 authStore 里混着的一段业务态，独立出来给 PlatformManage 用。
 * 所有异步方法都会自动维护 loading，失败时抛出，成功时同步本地列表。
 */
export const useInviteCodeStore = defineStore('inviteCode', () => {
  const inviteCodeList = ref([])
  const inviteCodeLoading = ref(false)

  const setInviteCodeList = (list) => {
    inviteCodeList.value = list
  }

  const generateInviteCode = async (data) => {
    try {
      inviteCodeLoading.value = true
      return await authApi.generateInviteCode(data)
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
      // 响应拦截器已将 res.data 提取出来，此处 response 直接是数组
      inviteCodeList.value = response || []
      return response
    } catch (error) {
      console.error('获取邀请码列表失败:', error)
      throw error
    } finally {
      inviteCodeLoading.value = false
    }
  }

  const updateInviteCodeStatus = async (codeId, status) => {
    try {
      inviteCodeLoading.value = true
      const response = await authApi.updateInviteCodeStatus(codeId, status)
      const idx = inviteCodeList.value.findIndex(c => c.id === codeId)
      if (idx !== -1) inviteCodeList.value[idx].status = status
      return response
    } catch (error) {
      console.error('修改邀请码状态失败:', error)
      throw error
    } finally {
      inviteCodeLoading.value = false
    }
  }

  const deleteInviteCode = async (codeId) => {
    try {
      inviteCodeLoading.value = true
      const response = await authApi.deleteInviteCode(codeId)
      inviteCodeList.value = inviteCodeList.value.filter(c => c.id !== codeId)
      return response
    } catch (error) {
      console.error('删除邀请码失败:', error)
      throw error
    } finally {
      inviteCodeLoading.value = false
    }
  }

  const batchDeleteInviteCode = async (ids) => {
    try {
      inviteCodeLoading.value = true
      const response = await authApi.batchDeleteInviteCode(ids)
      inviteCodeList.value = inviteCodeList.value.filter(c => !ids.includes(c.id))
      return response || { successCount: ids.length, failCount: 0, failIds: [] }
    } catch (error) {
      console.error('批量删除邀请码失败:', error)
      throw error
    } finally {
      inviteCodeLoading.value = false
    }
  }

  return {
    inviteCodeList,
    inviteCodeLoading,
    setInviteCodeList,
    generateInviteCode,
    getInviteCodeList,
    updateInviteCodeStatus,
    deleteInviteCode,
    batchDeleteInviteCode
  }
})
