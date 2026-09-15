<template>
  <div class="activity-timeline">
    <h3 class="panel-title">{{ title }}</h3>
    <el-timeline>
      <el-timeline-item
        v-for="(activity, index) in activities"
        :key="index"
        :timestamp="activity.time"
        :type="getActivityType(activity)"
        :icon="getActivityIcon(activity) + ''"
      >
        <div class="activity-content">
          <div class="activity-text">{{ activity.content }}</div>
          <div class="activity-meta">{{ activity.meta }}</div>
        </div>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/store/authStore'

const props = defineProps({
  title: {
    type: String,
    default: '最近动态'
  },
  customActivities: {
    type: Array,
    default: null
  }
})

const authStore = useAuthStore()

// 生成相对当前时间的格式化时间戳，避免写死的陈旧日期
const pad = (n) => String(n).padStart(2, '0')
const formatTime = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
const minutesAgo = (mins) => formatTime(new Date(Date.now() - mins * 60 * 1000))

const activities = computed(() => {
  if (props.customActivities) return props.customActivities

  if (authStore.isSuperAdmin || authStore.isNormalAdmin) {
    return [
      { content: '新增用户注册：张三', time: minutesAgo(5), type: 'primary', meta: '用户管理' },
      { content: '系统配置更新成功', time: minutesAgo(30), type: 'success', meta: '系统设置' },
      { content: '角色权限调整完成', time: minutesAgo(75), type: 'info', meta: '权限管理' },
      { content: '用户李四登录系统', time: minutesAgo(120), type: 'warning', meta: '安全监控' }
    ]
  }
  if (authStore.isAuditor) {
    return [
      { content: '新提交的审核申请：私人电桩认证', time: minutesAgo(3), type: 'warning', meta: '审核队列' },
      { content: '审核通过：用户王五的车主认证', time: minutesAgo(40), type: 'success', meta: '审核历史' },
      { content: '新投诉：充电桩故障', time: minutesAgo(90), type: 'danger', meta: '投诉处理' },
      { content: '处理完成：用户赵六的申诉', time: minutesAgo(130), type: 'info', meta: '申诉处理' }
    ]
  }
  if (authStore.isCustomerService) {
    return [
      { content: '新工单：用户咨询充电桩使用', time: minutesAgo(2), type: 'warning', meta: '工单管理' },
      { content: '解决工单：用户反馈支付问题', time: minutesAgo(35), type: 'success', meta: '工单处理' },
      { content: '新工单：用户投诉充电速度慢', time: minutesAgo(80), type: 'danger', meta: '投诉处理' },
      { content: '跟进工单：用户申请退款', time: minutesAgo(125), type: 'info', meta: '工单跟进' }
    ]
  }
  if (authStore.isEmergencyResponder) {
    return [
      { content: '新紧急事件：充电桩起火', time: minutesAgo(10), type: 'danger', meta: '紧急事件' },
      { content: '处理完成：充电桩故障修复', time: minutesAgo(55), type: 'success', meta: '故障处理' },
      { content: '新通知：系统预警', time: minutesAgo(100), type: 'warning', meta: '系统通知' },
      { content: '事件记录：用户被困电梯', time: minutesAgo(140), type: 'info', meta: '事件记录' }
    ]
  }
  if (authStore.isForumAdmin) {
    return [
      { content: '新帖子：分享充电体验', time: minutesAgo(4), type: 'info', meta: '内容管理' },
      { content: '删除违规评论：广告内容', time: minutesAgo(45), type: 'danger', meta: '违规处理' },
      { content: '置顶帖子：系统公告', time: minutesAgo(85), type: 'success', meta: '内容管理' },
      { content: '新举报：侮辱性言论', time: minutesAgo(135), type: 'warning', meta: '举报处理' }
    ]
  }
  return [
    { content: '系统更新：v1.0.0 版本发布', time: minutesAgo(60), type: 'success', meta: '系统通知' },
    { content: '欢迎使用后台管理系统', time: minutesAgo(180), type: 'info', meta: '系统通知' },
    { content: '系统初始化完成', time: minutesAgo(1440), type: 'success', meta: '系统通知' },
    { content: '账户创建成功', time: minutesAgo(2880), type: 'success', meta: '账户管理' }
  ]
})

const getActivityType = (activity) => {
  return activity.type || 'info'
}

const getActivityIcon = (activity) => {
  const typeIcons = {
    'primary': 'UserFilled',
    'success': 'Check',
    'warning': 'Warning',
    'danger': 'Close',
    'info': 'InfoFilled'
  }
  return typeIcons[activity.type] || 'InfoFilled'
}
</script>

<style scoped>
.activity-timeline {
  margin-bottom: var(--space-5);
}

.panel-title {
  margin: 0 0 var(--space-4) 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-lg);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.panel-title::before {
  content: '';
  display: inline-block;
  width: 3px;
  height: 18px;
  background: var(--color-primary);
  border-radius: 2px;
}

.activity-content {
  padding: var(--space-3) 0;
}

.activity-text {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  margin-bottom: 6px;
  line-height: 1.5;
}

.activity-meta {
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--color-info-light);
  padding: 2px 8px;
  border-radius: var(--radius-pill);
}

:deep(.el-timeline) {
  padding-left: var(--space-2);
}

:deep(.el-timeline-item__timestamp) {
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  margin-top: 6px;
}

:deep(.el-timeline-item__tail) {
  border-left-color: var(--color-border-lighter);
}

:deep(.el-timeline-item__node) {
  width: 10px;
  height: 10px;
  border: 2px solid var(--color-bg-card);
  box-shadow: 0 0 0 1px var(--color-border-light);
}

:deep(.el-timeline-item--primary .el-timeline-item__node) {
  background-color: var(--color-primary);
  box-shadow: 0 0 0 1px var(--color-primary);
}

:deep(.el-timeline-item--success .el-timeline-item__node) {
  background-color: var(--color-success);
  box-shadow: 0 0 0 1px var(--color-success);
}

:deep(.el-timeline-item--warning .el-timeline-item__node) {
  background-color: var(--color-warning);
  box-shadow: 0 0 0 1px var(--color-warning);
}

:deep(.el-timeline-item--danger .el-timeline-item__node) {
  background-color: var(--color-danger);
  box-shadow: 0 0 0 1px var(--color-danger);
}

:deep(.el-timeline-item--info .el-timeline-item__node) {
  background-color: var(--color-info);
  box-shadow: 0 0 0 1px var(--color-info);
}

@media (max-width: 768px) {
  .activity-text {
    font-size: var(--font-size-sm);
  }
}
</style>
