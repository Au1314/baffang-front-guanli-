<template>
  <div class="platform-statistics-container">
    <el-card shadow="never" class="platform-statistics-card">
      <template #header>
        <div class="card-header">
          <span>用户日活/总数统计</span>
        </div>
      </template>
      
      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="overview-info">
          <el-tag type="info" v-if="platformStats">统计日期：{{ platformStats.statsDate }}</el-tag>
          <el-tag type="info">数据更新时间：{{ formatUpdateTime }}</el-tag>
        </div>
        <div class="refresh-btn">
          <el-button type="primary" @click="loadPlatformStats" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <el-skeleton :loading="loading" animated>
        <template #template>
          <div class="stats-grid">
            <div v-for="i in 4" :key="i" class="stats-item">
              <el-skeleton-item variant="text" style="width: 60%;" />
              <el-skeleton-item variant="text" style="width: 40%;" />
            </div>
          </div>
        </template>
        
        <!-- 统计数据展示 -->
        <div v-if="platformStats" class="stats-content">
          <div class="stats-grid">
            <el-card shadow="hover" class="stats-card-item">
              <div class="stats-item-header">
                <el-icon class="stats-icon"><User /></el-icon>
                <span>总用户数</span>
              </div>
              <div class="stats-item-value">{{ platformStats.totalUsers }}</div>
            </el-card>
            
            <el-card shadow="hover" class="stats-card-item">
              <div class="stats-item-header">
                <el-icon class="stats-icon"><Avatar /></el-icon>
                <span>日活跃用户数</span>
              </div>
              <div class="stats-item-value">{{ platformStats.dailyActiveUsers }}</div>
            </el-card>
            
            <el-card shadow="hover" class="stats-card-item">
              <div class="stats-item-header">
                <el-icon class="stats-icon"><Location /></el-icon>
                <span>认证私桩数</span>
              </div>
              <div class="stats-item-value">{{ platformStats.authenticatedStations }}</div>
            </el-card>
            
            <el-card shadow="hover" class="stats-card-item">
              <div class="stats-item-header">
                <el-icon class="stats-icon"><Van /></el-icon>
                <span>认证车辆数</span>
              </div>
              <div class="stats-item-value">{{ platformStats.authenticatedCars }}</div>
            </el-card>
          </div>
        </div>
        
        <!-- 空数据提示 -->
        <div v-else-if="!loading" class="empty-container">
          <el-empty
            description="暂无数据"
            image="empty"
          >
            <el-button type="primary" @click="loadPlatformStats">重新加载</el-button>
          </el-empty>
        </div>
      </el-skeleton>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-container">
        <el-alert
          title="数据加载失败"
          :description="error"
          type="error"
          show-icon
          :closable="false"
        />
        <el-button type="primary" @click="loadPlatformStats" style="margin-top: 16px;">
          重新加载
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'
import { 
  Refresh, 
  User, 
  Avatar, 
  Location, 
  Van 
} from '@element-plus/icons-vue'

// 状态管理
const loading = ref(true)
const error = ref('')
const platformStats = ref(null)
const updateTime = ref(new Date())

// 格式化更新时间
const formatUpdateTime = computed(() => {
  return updateTime.value.toLocaleString()
})

// 加载平台统计数据
const loadPlatformStats = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await authApi.getPlatformStats()
    platformStats.value = data
    updateTime.value = new Date()
    ElMessage.success('数据加载成功')
  } catch (err) {
    console.error('加载平台统计数据失败:', err)
    error.value = '网络错误，请稍后重试'
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 页面挂载时加载数据
onMounted(() => {
  loadPlatformStats()
})
</script>

<style scoped>
.platform-statistics-container {
  padding: 0 20px 20px;
}

.platform-statistics-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.overview-info {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.refresh-btn {
  margin-left: auto;
}

.stats-content {
  padding: 20px 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.stats-card-item {
  border: 1px solid var(--color-border-lighter);
  transition: all 0.3s ease;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stats-card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.stats-item-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  color: var(--color-text-regular);
  font-size: 14px;
  justify-content: center;
}

.stats-icon {
  margin-right: 8px;
  font-size: 18px;
  color: var(--color-primary);
}

.stats-item-value {
  font-size: 36px;
  font-weight: bold;
  color: var(--color-text-primary);
  text-align: center;
}

.empty-container {
  text-align: center;
  padding: 40px 0;
}

.error-container {
  text-align: center;
  padding: 40px 0;
}
</style>