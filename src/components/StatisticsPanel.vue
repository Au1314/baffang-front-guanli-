<template>
  <div class="statistics-panel">
    <h3 class="panel-title">{{ title }}</h3>
    <el-skeleton :loading="loading" animated>
      <template #template>
        <div class="stats-grid">
          <div v-for="i in 4" :key="i" class="stat-card">
            <el-skeleton-item variant="circle" style="width: 48px; height: 48px; flex-shrink: 0;" />
            <div class="stat-content">
              <el-skeleton-item variant="text" style="width: 50%;" />
              <el-skeleton-item variant="text" style="width: 36%; margin-top: 10px;" />
              <el-skeleton-item variant="text" style="width: 72%; margin-top: 8px;" />
            </div>
          </div>
        </div>
      </template>

      <div class="stats-grid">
        <div
          v-for="(card, index) in statsCards"
          :key="index"
          class="stat-card"
          :class="`stat-card-${size}`"
          :style="getCardStyle(card)"
        >
          <div class="stat-icon">
            <el-icon :size="22"><component :is="card.icon" /></el-icon>
          </div>
          <div class="stat-content">
            <h4 class="stat-title">{{ card.title }}</h4>
            <div class="stat-value">
              {{ card.value }}
              <span v-if="card.trend" class="stat-trend" :class="getTrendClass(card.trend)">
                {{ card.trend > 0 ? '+' : '' }}{{ card.trend }}%
              </span>
            </div>
            <div class="stat-desc">{{ card.description }}</div>
          </div>
        </div>
      </div>
    </el-skeleton>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth'
import {
  User, UserFilled, Tickets, DocumentChecked, Warning, ChatDotRound,
  Clock, CircleCheck, CircleClose, Odometer, Van, Lightning, Bell, Document
} from '@element-plus/icons-vue'
import { roleColorByDesc } from '@/utils/roleColors'

const props = defineProps({
  title: {
    type: String,
    default: '统计概览'
  },
  size: {
    type: String,
    default: 'default'
  },
  customCards: {
    type: Array,
    default: null
  }
})

const authStore = useAuthStore()

// 传入 customCards 时不拉接口；否则进入骨架屏等待真实数据
const loading = ref(!props.customCards)
const statsData = ref(null)

// 秒 -> 分:秒（超过 1 小时显示 时:分:秒）
const formatDuration = (seconds) => {
  if (seconds == null || isNaN(seconds)) return '--'
  const s = Math.floor(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}

// 兜底模拟卡片（接口失败 / 未实现时回退，保证页面不空白）
const fallbackCards = () => {
  if (authStore.isSuperAdmin || authStore.isNormalAdmin) {
    return [
      { title: '总用户数', value: 1258, description: '平台注册用户总数', icon: User, trend: 12 },
      { title: '在线用户', value: 12, description: '当前在线用户数', icon: UserFilled, trend: -5 },
      { title: '认证私桩', value: 336, description: '已认证私人电桩', icon: Lightning },
      { title: '认证车辆', value: 892, description: '已认证车辆', icon: Van, trend: 8 }
    ]
  }
  if (authStore.isAuditor) {
    return [
      { title: '待审核工单', value: 15, description: '需要审核的申请', icon: DocumentChecked },
      { title: '今日审核数', value: 8, description: '今日已完成审核', icon: Clock },
      { title: '已通过数', value: 121, description: '历史审核通过', icon: CircleCheck },
      { title: '已拒绝数', value: 18, description: '历史审核拒绝', icon: CircleClose }
    ]
  }
  if (authStore.isCustomerService) {
    return [
      { title: '待处理工单', value: 21, description: '需要处理的客户工单', icon: Tickets },
      { title: '今日接待', value: 14, description: '今日已接待客户', icon: ChatDotRound },
      { title: '今日完成', value: 11, description: '今日已完成工单', icon: CircleCheck },
      { title: '平均响应', value: '01:20', description: '平均响应时长', icon: Odometer }
    ]
  }
  if (authStore.isEmergencyResponder) {
    return [
      { title: '待处理事件', value: 4, description: '待处理紧急呼叫', icon: Warning },
      { title: '今日呼叫', value: 2, description: '今日紧急呼叫量', icon: Bell },
      { title: '平均响应', value: '15:00', description: '平均响应时长', icon: Odometer },
      { title: '已解决事件', value: 89, description: '历史已解决事件', icon: CircleCheck }
    ]
  }
  if (authStore.isForumAdmin) {
    return [
      { title: '待审核帖子', value: 12, description: '需要审核的论坛帖子', icon: DocumentChecked },
      { title: '今日发帖', value: 45, description: '今日新增帖子数', icon: ChatDotRound },
      { title: '待处理举报', value: 8, description: '待处理举报', icon: Warning },
      { title: '活跃用户', value: 128, description: '今日活跃用户数', icon: UserFilled }
    ]
  }
  return [
    { title: '系统状态', value: '正常', description: '服务器运行状态', icon: CircleCheck },
    { title: '在线用户', value: 12, description: '当前在线用户数', icon: UserFilled },
    { title: '最近更新', value: '2024-01-10', description: '系统最近更新时间', icon: Clock },
    { title: '帮助文档', value: '查看', description: '访问系统帮助文档', icon: Document }
  ]
}

// 用后端真实数据组装卡片
const buildCards = (data) => {
  if (authStore.isSuperAdmin || authStore.isNormalAdmin) {
    return [
      { title: '总用户数', value: data.totalUsers, description: '平台注册用户总数', icon: User },
      { title: '日活跃用户', value: data.dailyActiveUsers, description: '今日活跃用户数', icon: UserFilled },
      { title: '认证私桩', value: data.authenticatedStations, description: '已认证私人电桩', icon: Lightning },
      { title: '认证车辆', value: data.authenticatedCars, description: '已认证车辆', icon: Van }
    ]
  }
  if (authStore.isAuditor) {
    return [
      { title: '待审核工单', value: data.pendingCount, description: '需要审核的申请', icon: DocumentChecked },
      { title: '今日审核数', value: data.todayCount, description: '今日已完成审核', icon: Clock },
      { title: '已通过数', value: data.approvedCount, description: '历史审核通过', icon: CircleCheck },
      { title: '已拒绝数', value: data.rejectedCount, description: '历史审核拒绝', icon: CircleClose }
    ]
  }
  if (authStore.isCustomerService) {
    return [
      { title: '待处理工单', value: data.pendingCount, description: '待处理客户工单', icon: Tickets },
      { title: '今日接待', value: data.todayCount, description: '今日已接待客户', icon: ChatDotRound },
      { title: '今日完成', value: data.todayCompletedCount, description: '今日已完成工单', icon: CircleCheck },
      { title: '平均响应', value: formatDuration(data.avgResponseTime), description: '平均响应时长', icon: Odometer }
    ]
  }
  if (authStore.isEmergencyResponder) {
    return [
      { title: '待处理事件', value: data.pendingCount, description: '待处理紧急呼叫', icon: Warning },
      { title: '今日呼叫', value: data.todayCallCount, description: '今日紧急呼叫量', icon: Bell },
      { title: '平均响应', value: formatDuration(data.avgResponseTime), description: '平均响应时长', icon: Odometer },
      { title: '已完成事件', value: data.completedCount, description: '已完成呼叫量', icon: CircleCheck }
    ]
  }
  if (authStore.isForumAdmin) {
    return [
      { title: '总帖子数', value: data.totalPostCount, description: '论坛帖子总数', icon: Document },
      { title: '今日发帖', value: data.todayPostCount, description: '今日新增帖子', icon: ChatDotRound },
      { title: '待处理举报', value: data.pendingPostReportCount, description: '待处理帖子举报', icon: Warning },
      { title: '本月处理举报', value: data.monthProcessedReportCount, description: '本月已处理举报', icon: CircleCheck }
    ]
  }
  return fallbackCards()
}

const statsCards = computed(() => {
  if (props.customCards) return props.customCards
  return statsData.value ? buildCards(statsData.value) : fallbackCards()
})

const fetchStats = async () => {
  loading.value = true
  try {
    let data = null
    if (authStore.isSuperAdmin || authStore.isNormalAdmin) {
      data = await authApi.getPlatformStats()
    } else if (authStore.isAuditor) {
      data = await authApi.getAuditStatistics()
    } else if (authStore.isCustomerService) {
      data = await authApi.getCustomerServiceStatsOverview()
    } else if (authStore.isEmergencyResponder) {
      data = await authApi.getEmergencyStatistics()
    } else if (authStore.isForumAdmin) {
      data = await authApi.getForumStatistics()
    }
    if (data && typeof data === 'object') statsData.value = data
  } catch (err) {
    console.warn('统计卡片数据加载失败，回退到模拟数据:', err)
    statsData.value = null
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!props.customCards) fetchStats()
})

// 获取卡片样式：使用角色色作为图标强调色
const getCardStyle = () => {
  const { main, light } = roleColorByDesc(authStore.adminTypeDesc)
  return {
    '--card-color': main,
    '--card-color-light': light
  }
}

// 获取趋势样式类
const getTrendClass = (trend) => {
  if (trend > 0) return 'positive'
  else if (trend < 0) return 'negative'
  else return 'neutral'
}
</script>

<style scoped>
.statistics-panel {
  margin-bottom: var(--space-5);
}

.panel-title {
  margin: 0 0 var(--space-4) 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.panel-title::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 18px;
  background: var(--color-primary);
  border-radius: 2px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-4);
}

.stat-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-extra-light);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-card);
  transition: box-shadow var(--transition-base), border-color var(--transition-base);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.stat-card:hover {
  box-shadow: var(--shadow-card-hover);
  border-color: var(--color-border-light);
}

.stat-card-small {
  padding: var(--space-4);
  gap: var(--space-3);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  background: var(--card-color-light, var(--color-primary-light));
  color: var(--card-color, var(--color-primary));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-card-small .stat-icon {
  width: 40px;
  height: 40px;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-title {
  margin: 0 0 6px 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.stat-value {
  font-size: var(--font-size-xxl);
  font-weight: 600;
  color: var(--color-text-primary);
  line-height: 1.2;
  display: flex;
  align-items: baseline;
  gap: var(--space-2);
}

.stat-card-small .stat-value {
  font-size: var(--font-size-xl);
}

.stat-trend {
  font-size: var(--font-size-xs);
  font-weight: 500;
  padding: 2px var(--space-2);
  border-radius: var(--radius-pill);
}

.stat-trend.positive {
  background: var(--color-success-light);
  color: var(--color-success);
}

.stat-trend.negative {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.stat-trend.neutral {
  background: var(--color-info-light);
  color: var(--color-info);
}

.stat-desc {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  margin-top: 6px;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
