<template>
  <div class="emergency-statistics-container">
    <el-card shadow="never" class="emergency-statistics-card">
      <template #header>
        <div class="card-header">
          <span>紧急响应统计</span>
        </div>
      </template>
      
      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="overview-info">
          <el-tag type="info">数据更新时间：{{ formatUpdateTime }}</el-tag>
        </div>
        <div class="refresh-btn">
          <el-button type="primary" @click="loadEmergencyStatistics" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <el-skeleton :loading="loading" animated>
        <template #template>
          <div class="stats-grid">
            <div v-for="i in 9" :key="i" class="stats-item">
              <el-skeleton-item variant="text" style="width: 60%;" />
              <el-skeleton-item variant="text" style="width: 40%;" />
            </div>
          </div>
        </template>
        
        <!-- 统计数据展示 -->
        <div v-if="emergencyStats" class="stats-content">
          <!-- 总览统计 -->
          <div class="stats-section">
            <h3 class="section-title">总览统计</h3>
            <div class="stats-grid">
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Bell /></el-icon>
                  <span>总呼叫量</span>
                </div>
                <div class="stats-item-value">{{ emergencyStats.totalCallCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Calendar /></el-icon>
                  <span>今日呼叫量</span>
                </div>
                <div class="stats-item-value">{{ emergencyStats.todayCallCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Clock /></el-icon>
                  <span>平均响应时间</span>
                </div>
                <div class="stats-item-value">{{ formattedAvgResponseTime }}</div>
              </el-card>
            </div>
          </div>
          
          <!-- 状态统计 -->
          <div class="stats-section">
            <h3 class="section-title">状态统计</h3>
            <div class="stats-grid">
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Warning /></el-icon>
                  <span>待处理呼叫量</span>
                </div>
                <div class="stats-item-value">{{ emergencyStats.pendingCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><ArrowRight /></el-icon>
                  <span>正在响应呼叫量</span>
                </div>
                <div class="stats-item-value">{{ emergencyStats.respondingCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Check /></el-icon>
                  <span>已完成呼叫量</span>
                </div>
                <div class="stats-item-value">{{ emergencyStats.completedCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Close /></el-icon>
                  <span>已取消呼叫量</span>
                </div>
                <div class="stats-item-value">{{ emergencyStats.cancelledCount }}</div>
              </el-card>
            </div>
          </div>
          
          <!-- 个人响应统计 -->
          <div class="stats-section">
            <h3 class="section-title">个人响应统计</h3>
            <div class="stats-grid">
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><UserFilled /></el-icon>
                  <span>今日我响应的呼叫量</span>
                </div>
                <div class="stats-item-value">{{ emergencyStats.myTodayResponseCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><User /></el-icon>
                  <span>我总共响应的呼叫量</span>
                </div>
                <div class="stats-item-value">{{ emergencyStats.myTotalResponseCount }}</div>
              </el-card>
            </div>
          </div>
        </div>
        
        <!-- 空数据提示 -->
        <div v-else-if="!loading" class="empty-container">
          <el-empty
            description="暂无数据"
            image="empty"
          >
            <el-button type="primary" @click="loadEmergencyStatistics">重新加载</el-button>
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
        <el-button type="primary" @click="loadEmergencyStatistics" style="margin-top: 16px;">
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
  Bell, 
  Calendar, 
  Clock, 
  Warning, 
  ArrowRight, 
  Check, 
  Close, 
  UserFilled, 
  User 
} from '@element-plus/icons-vue'

// 状态管理
const loading = ref(true)
const error = ref('')
const emergencyStats = ref(null)
const updateTime = ref(new Date())

// 格式化更新时间
const formatUpdateTime = computed(() => {
  return updateTime.value.toLocaleString()
})

// 格式化平均响应时间（秒 -> 时:分:秒）
const formattedAvgResponseTime = computed(() => {
  if (!emergencyStats.value) return '00:00:00'
  const seconds = emergencyStats.value.avgResponseTime
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

// 加载紧急响应统计数据
const loadEmergencyStatistics = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await authApi.getEmergencyStatistics()
    emergencyStats.value = data
    updateTime.value = new Date()
    ElMessage.success('数据加载成功')
  } catch (err) {
    console.error('加载紧急响应统计数据失败:', err)
    error.value = '网络错误，请稍后重试'
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 页面挂载时加载数据
onMounted(() => {
  loadEmergencyStatistics()
})
</script>

<style scoped>
.emergency-statistics-container {
  padding: 0 20px 20px;
}

.emergency-statistics-card {
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

.stats-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text-primary);
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 4px solid var(--color-primary);
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