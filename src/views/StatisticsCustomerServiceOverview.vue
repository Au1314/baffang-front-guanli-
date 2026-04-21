<template>
  <div class="customer-service-overview-container">
    <el-card shadow="never" class="customer-service-overview-card">
      <template #header>
        <div class="card-header">
          <span>客服统计概览</span>
        </div>
      </template>
      
      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="overview-info">
          <el-tag type="info">数据更新时间：{{ formatUpdateTime }}</el-tag>
        </div>
        <div class="refresh-btn">
          <el-button type="primary" @click="loadStatsOverview" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <el-skeleton :loading="loading" animated>
        <template #template>
          <div class="stats-grid">
            <div v-for="i in 8" :key="i" class="stats-item">
              <el-skeleton-item variant="text" style="width: 60%;" />
              <el-skeleton-item variant="text" style="width: 40%;" />
            </div>
          </div>
        </template>
        
        <!-- 统计数据展示 -->
        <div v-if="statsOverview" class="stats-content">
          <div class="stats-section">
            <h3 class="section-title">今日概览</h3>
            <div class="stats-grid">
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Calendar /></el-icon>
                  <span>今日接待量</span>
                </div>
                <div class="stats-item-value">{{ statsOverview.todayCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Check /></el-icon>
                  <span>今日完成量</span>
                </div>
                <div class="stats-item-value">{{ statsOverview.todayCompletedCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Timer /></el-icon>
                  <span>进行中量</span>
                </div>
                <div class="stats-item-value">{{ statsOverview.ongoingCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Bell /></el-icon>
                  <span>待处理量</span>
                </div>
                <div class="stats-item-value">{{ statsOverview.pendingCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Clock /></el-icon>
                  <span>平均响应时间</span>
                </div>
                <div class="stats-item-value">{{ formattedAvgResponseTime }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><ChatDotRound /></el-icon>
                  <span>今日消息量</span>
                </div>
                <div class="stats-item-value">{{ statsOverview.todayMessageCount }}</div>
              </el-card>
            </div>
          </div>
          
          <div class="stats-section">
            <h3 class="section-title">历史趋势</h3>
            <div class="stats-grid">
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><DataAnalysis /></el-icon>
                  <span>本周接待量</span>
                </div>
                <div class="stats-item-value">{{ statsOverview.weekCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Document /></el-icon>
                  <span>本月接待量</span>
                </div>
                <div class="stats-item-value">{{ statsOverview.monthCount }}</div>
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
            <el-button type="primary" @click="loadStatsOverview">重新加载</el-button>
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
        <el-button type="primary" @click="loadStatsOverview" style="margin-top: 16px;">
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
  Calendar, 
  Check, 
  Timer, 
  Bell, 
  Clock, 
  ChatDotRound, 
  DataAnalysis, 
  Document 
} from '@element-plus/icons-vue'

// 状态管理
const loading = ref(true)
const error = ref('')
const statsOverview = ref(null)
const updateTime = ref(new Date())

// 格式化更新时间
const formatUpdateTime = computed(() => {
  return updateTime.value.toLocaleString()
})

// 格式化平均响应时间（秒 -> 分:秒）
const formattedAvgResponseTime = computed(() => {
  if (!statsOverview.value) return '00:00'
  const seconds = statsOverview.value.avgResponseTime
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

// 加载统计概览数据
const loadStatsOverview = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await authApi.getCustomerServiceStatsOverview()
    statsOverview.value = data
    updateTime.value = new Date()
    ElMessage.success('数据加载成功')
  } catch (err) {
    console.error('加载客服统计概览数据失败:', err)
    error.value = '网络错误，请稍后重试'
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 页面挂载时加载数据
onMounted(() => {
  loadStatsOverview()
})
</script>

<style scoped>
.customer-service-overview-container {
  padding: 0 20px 20px;
}

.customer-service-overview-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
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
  color: #303133;
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 4px solid #409eff;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.stats-card-item {
  border: 1px solid #ebeef5;
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
  color: #606266;
  font-size: 14px;
  justify-content: center;
}

.stats-icon {
  margin-right: 8px;
  font-size: 18px;
  color: #409eff;
}

.stats-item-value {
  font-size: 36px;
  font-weight: bold;
  color: #303133;
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