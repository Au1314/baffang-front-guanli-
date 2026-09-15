<template>
  <div class="audit-statistics-container">
    <el-card shadow="never" class="audit-statistics-card">
      <template #header>
        <div class="card-header">
          <span>审核统计</span>
        </div>
      </template>
      
      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="overview-info">
          <el-tag type="info">数据更新时间：{{ formatUpdateTime }}</el-tag>
        </div>
        <div class="refresh-btn">
          <el-button type="primary" @click="loadAuditStatistics" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <el-skeleton :loading="loading" animated>
        <template #template>
          <div class="stats-content">
            <div class="stats-section">
              <div class="stats-grid">
                <div v-for="i in 6" :key="i" class="stats-item">
                  <el-skeleton-item variant="text" style="width: 60%;" />
                  <el-skeleton-item variant="text" style="width: 40%;" />
                </div>
              </div>
            </div>
            <div class="stats-section">
              <el-skeleton-item variant="text" style="width: 30%;" />
              <el-skeleton-item variant="table" style="width: 100%; height: 300px;" />
            </div>
          </div>
        </template>
        
        <!-- 统计数据展示 -->
        <div v-if="auditStats" class="stats-content">
          <!-- 审核状态统计 -->
          <div class="stats-section">
            <h3 class="section-title">审核状态统计</h3>
            <div class="stats-grid">
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Document /></el-icon>
                  <span>审核总数</span>
                </div>
                <div class="stats-item-value">{{ auditStats.totalCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Clock /></el-icon>
                  <span>待处理数</span>
                </div>
                <div class="stats-item-value">{{ auditStats.pendingCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Loading /></el-icon>
                  <span>处理中数</span>
                </div>
                <div class="stats-item-value">{{ auditStats.processingCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Check /></el-icon>
                  <span>已通过数</span>
                </div>
                <div class="stats-item-value">{{ auditStats.approvedCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Close /></el-icon>
                  <span>已拒绝数</span>
                </div>
                <div class="stats-item-value">{{ auditStats.rejectedCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Calendar /></el-icon>
                  <span>今日审核数</span>
                </div>
                <div class="stats-item-value">{{ auditStats.todayCount }}</div>
              </el-card>
            </div>
          </div>
          
          <!-- 审核类型统计 -->
          <div class="stats-section">
            <h3 class="section-title">审核类型统计</h3>
            <el-table :data="auditStats.typeStatistics" border style="width: 100%">
              <el-table-column prop="auditTypeName" label="审核类型" align="center" />
              <el-table-column prop="count" label="总数" align="center" />
              <el-table-column prop="pendingCount" label="待处理数" align="center" />
              <el-table-column label="处理率" align="center">
                <template #default="scope">
                  <el-progress 
                    :percentage="calculateProcessRate(scope.row)" 
                    :color="getProcessRateColor(scope.row)"
                    :stroke-width="8"
                  />
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        
        <!-- 空数据提示 -->
        <div v-else-if="!loading" class="empty-container">
          <el-empty
            description="暂无数据"
            image="empty"
          >
            <el-button type="primary" @click="loadAuditStatistics">重新加载</el-button>
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
        <el-button type="primary" @click="loadAuditStatistics" style="margin-top: 16px;">
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
  Document, 
  Clock, 
  Loading, 
  Check, 
  Close, 
  Calendar 
} from '@element-plus/icons-vue'

// 状态管理
const loading = ref(true)
const error = ref('')
const auditStats = ref(null)
const updateTime = ref(new Date())

// 格式化更新时间
const formatUpdateTime = computed(() => {
  return updateTime.value.toLocaleString()
})

// 计算处理率
const calculateProcessRate = (row) => {
  if (row.count === 0) return 0
  return Math.round(((row.count - row.pendingCount) / row.count) * 100)
}

// 获取处理率颜色
const getProcessRateColor = (row) => {
  const rate = calculateProcessRate(row)
  if (rate >= 90) return 'var(--color-success)'
  if (rate >= 70) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

// 加载审核统计数据
const loadAuditStatistics = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await authApi.getAuditStatistics()
    auditStats.value = data
    updateTime.value = new Date()
    ElMessage.success('数据加载成功')
  } catch (err) {
    console.error('加载审核统计数据失败:', err)
    error.value = '网络错误，请稍后重试'
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 页面挂载时加载数据
onMounted(() => {
  loadAuditStatistics()
})
</script>

<style scoped>
.audit-statistics-container {
  padding: 0 20px 20px;
}

.audit-statistics-card {
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