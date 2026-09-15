<template>
  <div class="screen-scale-wrapper">
    <div class="screen-content" :style="{ transform: `scale(${scale})` }">
      <DataScreenHeader
        v-model:time-range="filters.timeRange"
        v-model:pile-type="filters.pileType"
        v-model:region="filters.region"
        :current-time="currentTime"
        :current-date="currentDate"
        :manual-refresh-loading="manualRefreshLoading"
        @refresh="handleManualRefresh"
      />

      <CoreMetricsSection :metrics-data="metricsData" :metrics-prev="metricsPrev" />

      <DataChartsSection
        ref="chartsRef"
        :time-range="filters.timeRange"
        :pile-type="filters.pileType"
        :region="filters.region"
      />

      <RealtimeDataSection :realtime-data="realtimeData" />
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span class="loading-text">数据加载中...</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'
import { getMockMetrics, getMockRealtime } from './dataScreen/mockData'
import { useScreenScale } from './dataScreen/useScreenScale'
import DataScreenHeader from './dataScreen/DataScreenHeader.vue'
import CoreMetricsSection from './dataScreen/CoreMetricsSection.vue'
import DataChartsSection from './dataScreen/DataChartsSection.vue'
import RealtimeDataSection from './dataScreen/RealtimeDataSection.vue'

const { scale } = useScreenScale(1920, 1080)

const currentTime = ref('')
const currentDate = ref('')
const loading = ref(false)
const manualRefreshLoading = ref(false)

// 大屏筛选条件
const filters = reactive({
  timeRange: 'month',
  pileType: 'public',
  region: '全国'
})

// 图表子组件引用
const chartsRef = ref(null)

// 自动刷新定时器（3分钟）
const refreshInterval = ref(null)

// 核心指标数据（充电业务口径）
const metricsData = reactive({
  totalChargeEnergy: 0,
  realtimePower: 0,
  deviceOnlineRate: 0,
  faultPileCount: 0,
  orderTotalAmount: 0,
  totalUsers: 0
})

// 上期指标（用于计算环比趋势）
const metricsPrev = reactive({
  totalChargeEnergy: 0,
  realtimePower: 0,
  deviceOnlineRate: 0,
  faultPileCount: 0,
  orderTotalAmount: 0,
  totalUsers: 0
})

// 实时数据
const realtimeData = reactive({
  onlineUsers: 0,
  currentOrders: 0,
  workingPiles: 0,
  faultReports: 0
})

const RANGE_LABEL = { day: '日', week: '周', month: '月', year: '年' }

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 时间更新定时器
const timeInterval = setInterval(updateTime, 1000)

// 用 mock 数据填充指标与实时数据（充电业务指标后端暂未提供）
const applyMockData = () => {
  const { current, prev } = getMockMetrics(filters.timeRange, filters)
  Object.assign(metricsData, current)
  Object.assign(metricsPrev, prev)
  Object.assign(realtimeData, getMockRealtime(filters.timeRange, filters))
}

// 后端实时字段仅在「有效（>0）」时覆盖，避免未实现接口返回全 0 造成异常
const overrideRealtime = (response) => {
  if (!response) return
  ;['onlineUsers', 'currentOrders', 'workingPiles', 'faultReports'].forEach((key) => {
    const value = Number(response[key])
    if (Number.isFinite(value) && value > 0) realtimeData[key] = value
  })
}

// 拉取数据：mock 兜底 + 后端实时字段尽力覆盖
const fetchData = async () => {
  loading.value = true
  try {
    applyMockData()
    const response = await authApi.getPlatformStats()
    overrideRealtime(response)
  } catch (error) {
    console.error('获取平台统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

// 数据刷新（含图表动画重放）
const refreshData = async () => {
  await fetchData()
  chartsRef.value?.render()
}

// 手动刷新数据
const handleManualRefresh = async () => {
  try {
    manualRefreshLoading.value = true
    await refreshData()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('手动刷新数据失败:', error)
    ElMessage.error('数据刷新失败')
  } finally {
    manualRefreshLoading.value = false
  }
}

// 时间范围变化时联动指标
watch(() => filters.timeRange, () => {
  fetchData()
  ElMessage.success(`数据已切换到${RANGE_LABEL[filters.timeRange] || filters.timeRange}视图`)
})

// 桩类型 / 区域变化时静默刷新
watch(() => [filters.pileType, filters.region], () => {
  fetchData()
})

onMounted(async () => {
  updateTime()
  await fetchData()

  // 启动3分钟自动刷新
  refreshInterval.value = setInterval(refreshData, 3 * 60 * 1000)
})

onUnmounted(() => {
  clearInterval(timeInterval)
  clearInterval(refreshInterval.value)
})
</script>

<style scoped>
.screen-scale-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #0b101c;
  display: flex;
  align-items: center;
  justify-content: center;
}

.screen-content {
  width: 1920px;
  height: 1080px;
  transform-origin: center center;
  background: linear-gradient(135deg, #0b101c 0%, #0f1626 50%, #0b101c 100%);
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  color: #e2e8f0;
}

.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(11, 16, 28, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px;
  background: rgba(19, 26, 43, 0.95);
  border: 1px solid rgba(33, 120, 221, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(33, 120, 221, 0.2);
}

.loading-icon {
  font-size: 48px;
  color: #2178dd;
  animation: spin 2s linear infinite;
}

.loading-text {
  font-size: 18px;
  color: #8b96a8;
  font-weight: 500;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
