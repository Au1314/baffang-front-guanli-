<template>
  <div class="dashboard-header" :style="headerStyle">
    <div class="header-left">
      <div class="platform-info">
        <h1 class="platform-title">新能源汽车充电管理平台</h1>
        <div class="platform-subtitle">数据监控中心</div>
      </div>
      <div class="welcome-section">
        <h3>欢迎回来，{{ adminInfo.username }}</h3>
        <div class="info-row">
          <span class="role-info">身份：{{ adminInfo.typeDesc }}</span>
          <span class="time-info">{{ currentTime }}</span>
        </div>
        <p class="login-info">上次登录时间：{{ formatDate(lastLoginTime) }}</p>
      </div>
    </div>
    <div class="header-right">
      <el-button type="primary" plain @click="handleRefresh" class="refresh-button">
        <el-icon><Refresh /></el-icon>
        刷新
      </el-button>
      <el-dropdown>
        <div class="user-info">
          <el-avatar :size="40" :src="adminInfo.avatar" :alt="adminInfo.username">
            {{ getFirstChar }}
          </el-avatar>
          <span class="username">{{ adminInfo.username }}</span>
          <span class="el-icon--right">▼</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleProfile">个人中心</el-dropdown-item>
            <el-dropdown-item @click="handleSettings">系统设置</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/store/adminStore'
import { Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const adminStore = useAdminStore()

// 用户信息
const adminInfo = computed(() => adminStore.getAdminBaseInfo)

// 上次登录时间（模拟数据，实际应从后端获取）
const lastLoginTime = ref('2024-01-10 14:30:00')

// 当前时间
const currentTime = ref('')

// 定时器
let timeInterval = null

// 获取用户名首字母
const getFirstChar = computed(() => adminStore.getFirstChar())

// 处理刷新
const handleRefresh = () => {
  ElMessage.success('数据已刷新')
  // 实际项目中这里会调用 API 刷新数据
}

// 更新当前时间
const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 头部样式
const headerStyle = computed(() => {
  const roleColors = {
    '超级管理员': '#1890ff',
    '普通管理员': '#40a9ff',
    '审核员': '#52c41a',
    '客服': '#fa8c16',
    '紧急响应人员': '#ff4d4f',
    '论坛管理员': '#722ed1'
  }
  
  const color = roleColors[adminInfo.value.typeDesc] || '#1890ff'
  
  return {
    '--header-color': color
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

// 处理个人中心
const handleProfile = () => {
  router.push('/profile')
}

// 处理系统设置
const handleSettings = () => {
  router.push('/system/settings')
}

// 处理退出登录
const handleLogout = () => {
  adminStore.logout()
  ElMessage.success('退出登录成功')
  router.push('/login')
}

// 组件挂载时获取用户信息
onMounted(async () => {
  if (!adminStore.adminInfo) {
    await adminStore.getUserInfo()
  }
  
  // 初始化时间
  updateCurrentTime()
  // 启动定时器
  timeInterval = setInterval(updateCurrentTime, 1000)
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})
</script>

<style scoped>
.dashboard-header {
  background: linear-gradient(135deg, #0f2027 0%, #1a2e45 50%, #0f2027 100%);
  color: white;
  padding: 40px 30px;
  border-radius: 16px;
  margin-bottom: 30px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(30, 144, 255, 0.3);
}

.dashboard-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, #1e90ff 0%, #36cfc9 100%);
}

.dashboard-header::after {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(30, 144, 255, 0.1) 0%, transparent 70%);
  transform: rotate(45deg);
  animation: float 6s ease-in-out infinite;
}

.platform-info {
  margin-bottom: 24px;
}

.platform-title {
  margin: 0 0 8px 0;
  font-size: 36px;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  background: linear-gradient(90deg, #1e90ff 0%, #36cfc9 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.platform-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  margin: 0;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 24px;
  margin: 12px 0;
}

.time-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  background: rgba(30, 144, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid rgba(30, 144, 255, 0.3);
}

.refresh-button {
  margin-right: 20px;
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
  transition: all 0.3s ease;
}

.refresh-button:hover {
  border-color: #1e90ff;
  background: rgba(30, 144, 255, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 144, 255, 0.3);
}

@keyframes float {
  0% { transform: rotate(45deg) translate(0, 0); }
  50% { transform: rotate(45deg) translate(-20px, -20px); }
  100% { transform: rotate(45deg) translate(0, 0); }
}

.dashboard-header:hover {
  box-shadow: 0 16px 48px rgba(24, 144, 255, 0.4);
  transform: translateY(-2px);
}

.header-left {
  flex: 1;
  z-index: 1;
}

.header-title {
  margin: 0 0 24px 0;
  font-size: 32px;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.welcome-section h3 {
  margin: 0 0 12px 0;
  font-size: 22px;
  font-weight: 600;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.welcome-section p {
  margin: 6px 0;
  opacity: 0.95;
  font-size: 14px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  display: flex;
  align-items: center;
  gap: 8px;
}

.welcome-section p::before {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
}

.header-right {
  display: flex;
  align-items: center;
  z-index: 1;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 28px;
  padding: 12px 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.header-right:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.username {
  margin: 0 12px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .platform-title {
    font-size: 32px;
  }
  
  .platform-subtitle {
    font-size: 14px;
  }
  
  .info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    padding: 30px 20px;
  }
  
  .header-right {
    align-self: flex-end;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  
  .platform-title {
    font-size: 28px;
  }
  
  .welcome-section h3 {
    font-size: 20px;
  }
  
  .refresh-button {
    margin-right: 0;
  }
}

@media (max-width: 480px) {
  .dashboard-header {
    padding: 24px 16px;
  }
  
  .platform-title {
    font-size: 24px;
  }
  
  .platform-subtitle {
    font-size: 12px;
  }
  
  .welcome-section h3 {
    font-size: 18px;
  }
  
  .header-right {
    padding: 10px 16px;
  }
  
  .username {
    margin: 0 8px;
    font-size: 13px;
  }
  
  .refresh-button {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>