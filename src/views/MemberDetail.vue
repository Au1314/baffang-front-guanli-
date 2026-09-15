<template>
  <div class="member-detail-container">
    <el-card shadow="never" class="member-detail-card">
      <template #header>
        <div class="card-header">
          <el-button
            type="primary"
            plain
            @click="goBack"
          >
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <span class="card-title">管理员详情</span>
        </div>
      </template>
      
      <el-descriptions
        v-loading="loading"
        :column="1"
        border
        style="margin-top: 20px"
      >
        <el-descriptions-item label="用户名">{{ memberDetail.username }}</el-descriptions-item>
        <el-descriptions-item label="昵称">{{ memberDetail.name }}</el-descriptions-item>
        <el-descriptions-item label="角色">{{ memberDetail.typeName || getRoleTypeName(memberDetail.type) }}</el-descriptions-item>
        <el-descriptions-item label="ID">{{ memberDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="头像">{{ memberDetail.avatar || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ memberDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ memberDetail.updateTime }}</el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 响应式数据
const memberDetail = ref({})
const loading = ref(false)

// 获取角色类型名称
const getRoleTypeName = (type) => {
  const roleMap = {
    [authStore.AdminType.NORMAL_ADMIN]: '普通管理员',
    [authStore.AdminType.AUDITOR]: '审核员',
    [authStore.AdminType.CUSTOMER_SERVICE]: '客服',
    [authStore.AdminType.EMERGENCY_RESPONDER]: '紧急响应人员'
  }
  return roleMap[type] || '未知类型'
}

// 返回上一页
const goBack = () => {
  router.push('/platform-manage')
}

// 获取管理员详情
const fetchMemberDetail = async (id) => {
  try {
    loading.value = true
    const response = await authApi.getMemberDetail(id)
    memberDetail.value = response || {}
  } catch (error) {
    console.error('获取管理员详情失败:', error)
    ElMessage.error('获取管理员详情失败')
  } finally {
    loading.value = false
  }
}

// 页面加载时获取管理员详情
onMounted(() => {
  const memberId = route.params.id
  if (memberId) {
    fetchMemberDetail(memberId)
  } else {
    ElMessage.warning('未找到管理员ID')
    goBack()
  }
})
</script>

<style scoped>
.member-detail-container {
  padding: 20px;
}

.member-detail-card {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 20px;
}

.card-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--color-text-primary);
}

:deep(.el-descriptions-item__label) {
  font-weight: bold;
}
</style>