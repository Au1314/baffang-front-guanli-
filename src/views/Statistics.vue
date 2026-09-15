<template>
  <div class="statistics-container">
    <el-card shadow="never" class="statistics-card">
      <template #header>
        <div class="card-header">
          <span>统计模块</span>
        </div>
      </template>
      
      <div class="action-bar">
        <el-tabs v-model="activeTab" class="statistics-tabs">
          <el-tab-pane label="分析工具">
            <div class="tab-buttons">
              <el-button type="success" @click="$router.push('/statistics/quick-analysis')">快速分析</el-button>
              <el-button type="info" @click="$router.push('/statistics/comprehensive')">综合数据分析</el-button>
              <el-button type="warning" @click="$router.push('/statistics/module-analysis')">模块数据分析</el-button>
              <el-button type="danger" @click="$router.push('/statistics/custom-analysis')">自定义问题分析</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="客服统计">
            <div class="tab-buttons">
              <el-button type="primary" plain @click="$router.push('/statistics/customer-service-overview')">客服统计概览</el-button>
              <el-button type="primary" plain @click="$router.push('/statistics/customer-service')">个人客服统计</el-button>
              <el-button type="primary" plain @click="$router.push('/statistics/all-customer-service')">所有客服统计</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="模块统计">
            <div class="tab-buttons">
              <el-button type="primary" plain @click="$router.push('/statistics/emergency')">紧急响应统计</el-button>
              <el-button type="primary" plain @click="$router.push('/statistics/forum')">论坛统计</el-button>
              <el-button type="primary" plain @click="$router.push('/statistics/audit')">审核统计</el-button>
              <el-button type="primary" plain @click="$router.push('/statistics/complaint')">故障/投诉统计</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="认证统计">
            <div class="tab-buttons">
              <el-button type="primary" plain @click="$router.push('/statistics/vehicle-audit')">车主审核认证统计</el-button>
              <el-button type="primary" plain @click="$router.push('/statistics/private-station-distribution')">私桩分布数据统计</el-button>
              <el-button type="primary" plain @click="$router.push('/statistics/platform')">用户日活/总数统计</el-button>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <!-- 核心统计指标 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="6" animated style="width: 100%;">
          <template #template>
            <el-skeleton-item variant="p" style="width: 100%; height: 160px; border-radius: 12px;" />
          </template>
        </el-skeleton>
      </div>
      <div v-else-if="error" class="error-container">
        <el-empty description="数据加载失败" :image-size="120">
          <el-button type="primary" @click="fetchStatisticsData">重新加载</el-button>
        </el-empty>
      </div>
      <StatisticsMetrics v-else :statistics-data="statisticsData" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import StatisticsMetrics from './StatisticsMetrics.vue'
import { authApi } from '@/api/auth'

// 统计数据
const statisticsData = reactive({
  totalUsers: 0,
  dailyActive: 0,
  monthlyActive: 0,
  newUsers: 0,
  privatePileCert: 0,
  carOwnerCert: 0
})

// 标签页激活状态
const activeTab = ref('0')

// 加载状态
const loading = ref(false)
const error = ref('')

// 获取统计数据
const fetchStatisticsData = async () => {
  try {
    loading.value = true
    error.value = ''
    const data = await authApi.getPlatformStats()
    // 更新统计数据
    Object.assign(statisticsData, data)
    ElMessage.success('数据加载成功')
  } catch (err) {
    console.error('获取统计数据失败:', err)
    error.value = '获取统计数据失败，请稍后重试'
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}



// 组件挂载时获取数据
onMounted(async () => {
  await fetchStatisticsData()
})
</script>

<style scoped>
.statistics-container {
  padding: 0 20px 20px;
}

.statistics-card {
  margin-bottom: 20px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.statistics-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.action-bar {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.statistics-tabs {
  width: 100%;
}

:deep(.statistics-tabs .el-tabs__header) {
  margin-bottom: 0;
  border-bottom: 1px solid var(--color-border-lighter);
}

:deep(.statistics-tabs .el-tabs__nav) {
  height: 48px;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

:deep(.statistics-tabs .el-tabs__item) {
  height: 48px;
  line-height: 48px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
  margin-right: 2px;
}

:deep(.statistics-tabs .el-tabs__item:hover) {
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

:deep(.statistics-tabs .el-tabs__item.is-active) {
  color: #fff;
  background-color: var(--color-primary);
  font-weight: 600;
  position: relative;
}

:deep(.statistics-tabs .el-tabs__item.is-active::after) {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background-color: var(--color-primary);
  border-radius: 3px 3px 0 0;
}

:deep(.statistics-tabs .el-tabs__active-bar) {
  display: none;
}

.tab-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 20px 0;
  background-color: #fafafa;
  border-radius: 0 0 8px 8px;
  padding: 20px;
}

.tab-buttons .el-button {
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.3s ease;
  border: 1px solid var(--color-border-base);
}

.tab-buttons .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.tab-buttons .el-button--success {
  background-color: var(--color-success);
  border-color: var(--color-success);
  color: #fff;
}

.tab-buttons .el-button--success:hover {
  background-color: #85ce61;
  border-color: #85ce61;
}

.tab-buttons .el-button--info {
  background-color: var(--color-text-secondary);
  border-color: var(--color-text-secondary);
  color: #fff;
}

.tab-buttons .el-button--info:hover {
  background-color: #a6a9ad;
  border-color: #a6a9ad;
}

.tab-buttons .el-button--warning {
  background-color: var(--color-warning);
  border-color: var(--color-warning);
  color: #fff;
}

.tab-buttons .el-button--warning:hover {
  background-color: #ebb563;
  border-color: #ebb563;
}

.tab-buttons .el-button--danger {
  background-color: var(--color-danger);
  border-color: var(--color-danger);
  color: #fff;
}

.tab-buttons .el-button--danger:hover {
  background-color: #f78989;
  border-color: #f78989;
}

.tab-buttons .el-button--primary.is-plain {
  background-color: var(--color-primary-light);
  border-color: #d9ecff;
  color: var(--color-primary);
}

.tab-buttons .el-button--primary.is-plain:hover {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.loading-container {
  padding: 30px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.error-container {
  padding: 60px 0;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .statistics-container {
    padding: 0 15px 15px;
  }
  
  .card-header {
    font-size: 16px;
  }
  
  :deep(.statistics-tabs .el-tabs__item) {
    padding: 0 18px;
    font-size: 13px;
  }
  
  .tab-buttons {
    gap: 10px;
    padding: 15px;
  }
  
  .tab-buttons .el-button {
    padding: 6px 12px;
    font-size: 12px;
  }
}

@media (max-width: 768px) {
  .statistics-container {
    padding: 0 10px 10px;
  }
  
  .action-bar {
    align-items: stretch;
  }
  
  :deep(.statistics-tabs .el-tabs__header) {
    padding: 0 10px;
  }
  
  :deep(.statistics-tabs .el-tabs__item) {
    padding: 0 12px;
    font-size: 12px;
    height: 40px;
    line-height: 40px;
  }
  
  .tab-buttons {
    flex-direction: column;
    gap: 8px;
    padding: 12px;
  }
  
  .tab-buttons .el-button {
    width: 100%;
    padding: 8px 12px;
    font-size: 13px;
  }
  
  .card-header {
    font-size: 14px;
    padding: 0 10px;
  }
}
</style>