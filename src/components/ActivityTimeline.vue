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
import { useAdminStore } from '@/store/adminStore'
import { User, Message } from '@element-plus/icons-vue'

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

const adminStore = useAdminStore()

// 活动数据
const activities = computed(() => {
  if (props.customActivities) {
    return props.customActivities
  }
  
  const activityList = []
  
  if (adminStore.isSuperAdmin || adminStore.isNormalAdmin) {
    // 管理员最近动态
    activityList.push(
      { content: '新增用户注册：张三', time: '2024-01-10 14:25:30', type: 'primary', meta: '用户管理' },
      { content: '系统配置更新成功', time: '2024-01-10 13:45:12', type: 'success', meta: '系统设置' },
      { content: '角色权限调整完成', time: '2024-01-10 12:30:45', type: 'info', meta: '权限管理' },
      { content: '用户李四登录系统', time: '2024-01-10 11:15:20', type: 'warning', meta: '安全监控' }
    )
  } else if (adminStore.isAuditor) {
    // 审核员最近动态
    activityList.push(
      { content: '新提交的审核申请：私人电桩认证', time: '2024-01-10 14:30:00', type: 'warning', meta: '审核队列' },
      { content: '审核通过：用户王五的车主认证', time: '2024-01-10 13:20:15', type: 'success', meta: '审核历史' },
      { content: '新投诉：充电桩故障', time: '2024-01-10 12:10:30', type: 'danger', meta: '投诉处理' },
      { content: '处理完成：用户赵六的申诉', time: '2024-01-10 11:05:45', type: 'info', meta: '申诉处理' }
    )
  } else if (adminStore.isCustomerService) {
    // 客服最近动态
    activityList.push(
      { content: '新工单：用户咨询充电桩使用', time: '2024-01-10 14:40:20', type: 'warning', meta: '工单管理' },
      { content: '解决工单：用户反馈支付问题', time: '2024-01-10 13:50:10', type: 'success', meta: '工单处理' },
      { content: '新工单：用户投诉充电速度慢', time: '2024-01-10 12:45:30', type: 'danger', meta: '投诉处理' },
      { content: '跟进工单：用户申请退款', time: '2024-01-10 11:30:25', type: 'info', meta: '工单跟进' }
    )
  } else if (adminStore.isEmergencyResponder) {
    // 紧急响应人员最近动态
    activityList.push(
      { content: '新紧急事件：充电桩起火', time: '2024-01-10 14:15:00', type: 'danger', meta: '紧急事件' },
      { content: '处理完成：充电桩故障修复', time: '2024-01-10 13:10:45', type: 'success', meta: '故障处理' },
      { content: '新通知：系统预警', time: '2024-01-10 12:05:20', type: 'warning', meta: '系统通知' },
      { content: '事件记录：用户被困电梯', time: '2024-01-10 11:25:15', type: 'info', meta: '事件记录' }
    )
  } else if (adminStore.isForumAdmin) {
    // 论坛管理员最近动态
    activityList.push(
      { content: '新帖子：分享充电体验', time: '2024-01-10 14:50:30', type: 'info', meta: '内容管理' },
      { content: '删除违规评论：广告内容', time: '2024-01-10 13:35:20', type: 'danger', meta: '违规处理' },
      { content: '置顶帖子：系统公告', time: '2024-01-10 12:20:10', type: 'success', meta: '内容管理' },
      { content: '新举报：侮辱性言论', time: '2024-01-10 11:40:05', type: 'warning', meta: '举报处理' }
    )
  } else {
    // 默认最近动态
    activityList.push(
      { content: '系统更新：v1.0.0 版本发布', time: '2024-01-10 10:00:00', type: 'success', meta: '系统通知' },
      { content: '欢迎使用后台管理系统', time: '2024-01-10 09:00:00', type: 'info', meta: '系统通知' },
      { content: '系统初始化完成', time: '2024-01-09 18:00:00', type: 'success', meta: '系统通知' },
      { content: '账户创建成功', time: '2024-01-09 17:30:00', type: 'success', meta: '账户管理' }
    )
  }
  
  return activityList
})

// 获取活动类型
const getActivityType = (activity) => {
  return activity.type || 'info'
}

// 获取活动图标
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
  margin-bottom: 30px;
}

.panel-title {
  margin: 0 0 24px 0;
  color: #303133;
  font-size: 20px;
  font-weight: 600;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  border-radius: 2px;
}

.activity-content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--activity-color, #1890ff);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.activity-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: var(--activity-color, #1890ff);
  border-radius: 4px 4px 0 0;
}

.activity-content:hover {
  transform: translateX(8px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.activity-text {
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  line-height: 1.5;
}

.activity-meta {
  font-size: 12px;
  color: #909399;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-meta::before {
  content: '';
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--activity-color, #1890ff);
  opacity: 0.6;
}

:deep(.el-timeline-item__timestamp) {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  display: flex;
  align-items: center;
  gap: 6px;
}

:deep(.el-timeline-item__timestamp)::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #909399;
}

:deep(.el-timeline-item__node) {
  box-shadow: 0 0 0 6px rgba(24, 144, 255, 0.1);
  transition: all 0.3s ease;
}

:deep(.el-timeline-item:hover .el-timeline-item__node) {
  transform: scale(1.2);
  box-shadow: 0 0 0 8px rgba(24, 144, 255, 0.15);
}

/* 不同类型的时间线节点样式 */
:deep(.el-timeline-item--primary .el-timeline-item__node) {
  background-color: #1890ff;
  box-shadow: 0 0 0 6px rgba(24, 144, 255, 0.1);
}

:deep(.el-timeline-item--success .el-timeline-item__node) {
  background-color: #67c23a;
  box-shadow: 0 0 0 6px rgba(103, 194, 58, 0.1);
}

:deep(.el-timeline-item--warning .el-timeline-item__node) {
  background-color: #e6a23c;
  box-shadow: 0 0 0 6px rgba(230, 162, 60, 0.1);
}

:deep(.el-timeline-item--danger .el-timeline-item__node) {
  background-color: #f56c6c;
  box-shadow: 0 0 0 6px rgba(245, 108, 108, 0.1);
}

:deep(.el-timeline-item--info .el-timeline-item__node) {
  background-color: #909399;
  box-shadow: 0 0 0 6px rgba(144, 147, 153, 0.1);
}

/* 不同类型的内容边框颜色 */
:deep(.el-timeline-item--primary .activity-content) {
  --activity-color: #1890ff;
}

:deep(.el-timeline-item--success .activity-content) {
  --activity-color: #67c23a;
}

:deep(.el-timeline-item--warning .activity-content) {
  --activity-color: #e6a23c;
}

:deep(.el-timeline-item--danger .activity-content) {
  --activity-color: #f56c6c;
}

:deep(.el-timeline-item--info .activity-content) {
  --activity-color: #909399;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .activity-content {
    padding: 16px;
  }
  
  .activity-text {
    font-size: 13px;
  }
  
  :deep(.el-timeline-item__timestamp) {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .activity-content {
    padding: 14px;
  }
  
  .activity-text {
    font-size: 12px;
  }
}
</style>