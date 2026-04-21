<template>
  <div class="statistics-panel">
    <h3 class="panel-title">{{ title }}</h3>
    <div class="stats-grid">
      <div 
        v-for="(card, index) in statsCards" 
        :key="index"
        class="stat-card"
        :class="`stat-card-${size}`"
        :style="getCardStyle(card)"
      >
        <div class="stat-icon">
          <el-icon :size="32"><component :is="card.icon" /></el-icon>
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
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAdminStore } from '@/store/adminStore'
import { User, Message } from '@element-plus/icons-vue'

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

const adminStore = useAdminStore()

// 图标映射（已简化为可用的图标）
const iconMap = {
  '总用户数': User,
  '在线用户': User,
  '系统状态': Message,
  '待处理任务': Message,
  '待审核工单': Message,
  '今日审核数': User,
  '审核通过率': Message,
  '待审核投诉': Message,
  '待处理工单': Message,
  '今日处理': User,
  '满意度': Message,
  '待跟进': User,
  '待处理事件': Message,
  '今日处理': User,
  '平均响应时间': Message,
  '已解决事件': Message,
  '待审核帖子': Message,
  '今日发帖': User,
  '待处理评论': Message,
  '活跃用户': User
}

// 角色颜色映射
const roleColors = {
  '超级管理员': '#1890ff',
  '普通管理员': '#40a9ff',
  '审核员': '#52c41a',
  '客服': '#fa8c16',
  '紧急响应人员': '#ff4d4f',
  '论坛管理员': '#722ed1'
}

// 统计卡片数据
const statsCards = computed(() => {
  if (props.customCards) {
    return props.customCards
  }
  
  const cards = []
  const role = adminStore.adminTypeDesc
  
  if (adminStore.isSuperAdmin || adminStore.isNormalAdmin) {
    // 管理员统计卡片
    cards.push(
      { title: '总用户数', value: 1258, description: '平台注册用户总数', icon: User, trend: 12 },
      { title: '在线用户', value: 12, description: '当前在线用户数', icon: User, trend: -5 },
      { title: '系统状态', value: '正常', description: '服务器运行状态', icon: Message },
      { title: '待处理任务', value: 23, description: '需要处理的系统任务', icon: Message, trend: 8 }
    )
  } else if (adminStore.isAuditor) {
    // 审核员统计卡片
    cards.push(
      { title: '待审核工单', value: 15, description: '需要审核的申请', icon: Message },
      { title: '今日审核数', value: 8, description: '今日已完成审核', icon: User },
      { title: '审核通过率', value: '92%', description: '历史审核通过比例', icon: Message },
      { title: '待审核投诉', value: 3, description: '需要处理的投诉', icon: Message }
    )
  } else if (adminStore.isCustomerService) {
    // 客服统计卡片
    cards.push(
      { title: '待处理工单', value: 21, description: '需要处理的客户工单', icon: Message },
      { title: '今日处理', value: 14, description: '今日已处理工单', icon: User },
      { title: '满意度', value: '95%', description: '客户满意度评分', icon: Message },
      { title: '待跟进', value: 7, description: '需要跟进的工单', icon: User }
    )
  } else if (adminStore.isEmergencyResponder) {
    // 紧急响应人员统计卡片
    cards.push(
      { title: '待处理事件', value: 4, description: '需要处理的紧急事件', icon: Message },
      { title: '今日处理', value: 2, description: '今日已处理事件', icon: User },
      { title: '平均响应时间', value: '15分钟', description: '事件平均响应时间', icon: Message },
      { title: '已解决事件', value: 89, description: '历史已解决事件', icon: Message }
    )
  } else if (adminStore.isForumAdmin) {
    // 论坛管理员统计卡片
    cards.push(
      { title: '待审核帖子', value: 12, description: '需要审核的论坛帖子', icon: Message },
      { title: '今日发帖', value: 45, description: '今日新增帖子数', icon: User },
      { title: '待处理评论', value: 8, description: '需要处理的评论', icon: Message },
      { title: '活跃用户', value: 128, description: '今日活跃用户数', icon: User }
    )
  } else {
    // 默认统计卡片
    cards.push(
      { title: '系统状态', value: '正常', description: '服务器运行状态', icon: Message },
      { title: '在线用户', value: 12, description: '当前在线用户数', icon: User },
      { title: '最近更新', value: '2024-01-10', description: '系统最近更新时间', icon: Message },
      { title: '帮助文档', value: '查看', description: '访问系统帮助文档', icon: User }
    )
  }
  
  return cards
})

// 获取卡片样式
const getCardStyle = (card) => {
  const role = adminStore.adminTypeDesc
  const color = roleColors[role] || '#1890ff'
  
  return {
    '--card-color': color
  }
}

// 获取趋势样式类
const getTrendClass = (trend) => {
  if (trend > 0) {
    return 'positive'
  } else if (trend < 0) {
    return 'negative'
  } else {
    return 'neutral'
  }
}
</script>

<style scoped>
.statistics-panel {
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.panel-title {
  margin: 0 0 24px 0;
  color: #e2e8f0;
  font-size: 24px;
  font-weight: 600;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  display: flex;
  align-items: center;
  gap: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.panel-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #1e90ff 0%, #36cfc9 100%);
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(30, 144, 255, 0.5);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.stat-card {
  background: rgba(26, 46, 69, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 24px;
  border: 1px solid rgba(30, 144, 255, 0.2);
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: linear-gradient(90deg, var(--card-color, #1e90ff) 0%, #36cfc9 100%);
  border-radius: 4px 4px 0 0;
}

.stat-card::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 100% 0%, rgba(30, 144, 255, 0.1) 0%, transparent 70%);
  pointer-events: none;
}

.stat-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 32px rgba(30, 144, 255, 0.2);
  border-color: rgba(30, 144, 255, 0.4);
}

.stat-card-small {
  padding: 20px;
  gap: 16px;
}

.stat-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--card-color, #1e90ff) 0%, rgba(30, 144, 255, 0.8) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 16px rgba(30, 144, 255, 0.4);
  transition: all 0.3s ease;
  position: relative;
}

.stat-icon::before {
  content: '';
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  background: linear-gradient(135deg, var(--card-color, #1e90ff) 0%, #36cfc9 100%);
  border-radius: 50%;
  opacity: 0.3;
  z-index: -1;
  animation: pulse 2s ease-in-out infinite;
}

.stat-card:hover .stat-icon {
  transform: scale(1.1);
  box-shadow: 0 6px 24px rgba(30, 144, 255, 0.5);
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.5; }
  100% { transform: scale(1); opacity: 0.3; }
}

.stat-card-small .stat-icon {
  width: 56px;
  height: 56px;
}

.stat-content {
  flex: 1;
}

.stat-title {
  margin: 0 0 12px 0;
  color: #a0aec0;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 8px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  display: flex;
  align-items: baseline;
  gap: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
}

.stat-value::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, var(--card-color, #1e90ff) 0%, transparent 100%);
  border-radius: 1px;
}

.stat-trend {
  font-size: 12px;
  font-weight: 500;
  padding: 4px 12px;
  border-radius: 16px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.stat-trend.positive {
  background: rgba(103, 194, 58, 0.1);
  color: #67c23a;
  border-color: rgba(103, 194, 58, 0.2);
}

.stat-trend.negative {
  background: rgba(245, 108, 108, 0.1);
  color: #f56c6c;
  border-color: rgba(245, 108, 108, 0.2);
}

.stat-trend.neutral {
  background: rgba(144, 147, 153, 0.1);
  color: #909399;
  border-color: rgba(144, 147, 153, 0.2);
}

.stat-card-small .stat-value {
  font-size: 28px;
}

.stat-desc {
  font-size: 13px;
  color: #718096;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  line-height: 1.4;
  margin-top: 8px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  }
  
  .panel-title {
    font-size: 20px;
  }
  
  .stat-value {
    font-size: 32px;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .stat-value {
    justify-content: center;
  }
  
  .stat-value::after {
    left: 50%;
    transform: translateX(-50%);
  }
}

@media (max-width: 480px) {
  .panel-title {
    font-size: 18px;
  }
  
  .stat-card {
    padding: 24px;
  }
  
  .stat-icon {
    width: 64px;
    height: 64px;
  }
  
  .stat-value {
    font-size: 28px;
  }
  
  .stat-title {
    font-size: 13px;
  }
  
  .stat-desc {
    font-size: 12px;
  }
}
</style>