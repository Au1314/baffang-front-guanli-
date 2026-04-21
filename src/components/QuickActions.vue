<template>
  <div class="quick-actions">
    <h3 class="panel-title">{{ title }}</h3>
    <div class="action-buttons">
      <el-button 
        v-for="(action, index) in actions" 
        :key="index"
        @click="handleAction(action)"
        :type="action.type || 'primary'"
        :size="size"
        :class="`action-btn action-btn-${size}`"
        :style="getActionStyle(action)"
      >
        <el-icon v-if="action.icon" :size="20"><component :is="action.icon" /></el-icon>
        <span v-if="action.icon" class="action-icon-space"></span>
        {{ action.label }}
      </el-button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminStore } from '@/store/adminStore'
import { User, Message } from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    default: '快捷操作'
  },
  size: {
    type: String,
    default: 'large'
  },
  customActions: {
    type: Array,
    default: null
  }
})

const router = useRouter()
const adminStore = useAdminStore()

// 快捷操作数据
const actions = computed(() => {
  if (props.customActions) {
    return props.customActions
  }
  
  const actionList = []
  
  if (adminStore.isSuperAdmin || adminStore.isNormalAdmin) {
    // 管理员快捷操作
    actionList.push(
      { label: '用户管理', path: '/system/user', icon: User },
      { label: '角色管理', path: '/system/role', icon: User },
      { label: '平台管理', path: '/platform-manage', icon: Message },
      { label: '数据大屏', path: '/data-screen', icon: Message }
    )
  } else if (adminStore.isAuditor) {
    // 审核员快捷操作
    actionList.push(
      { label: '私人电桩审核', path: '/audit/private-station', icon: Message },
      { label: '车主认证审核', path: '/audit/car-owner', icon: Message },
      { label: '投诉审核', path: '/audit/charging-complaint', icon: Message },
      { label: '故障审核', path: '/audit/charging-fault', icon: Message }
    )
  } else if (adminStore.isCustomerService) {
    // 客服快捷操作
    actionList.push(
      { label: '工单管理', path: '/customer-service', icon: Message },
      { label: '投诉处理', path: '/audit/charging-complaint', icon: Message },
      { label: '用户反馈', path: '/audit/comment-report', icon: Message },
      { label: '交易申诉', path: '/audit/transaction-appeal', icon: User }
    )
  } else if (adminStore.isEmergencyResponder) {
    // 紧急响应人员快捷操作
    actionList.push(
      { label: '紧急事件', path: '/emergency', icon: Message },
      { label: '故障处理', path: '/audit/charging-fault', icon: Message },
      { label: '事件记录', path: '/emergency', icon: User },
      { label: '资源调度', path: '/emergency', icon: Message }
    )
  } else if (adminStore.isForumAdmin) {
    // 论坛管理员快捷操作
    actionList.push(
      { label: '论坛管理', path: '/forum-manage', icon: Message },
      { label: '帖子审核', path: '/forum-manage', icon: Message },
      { label: '评论管理', path: '/forum-manage', icon: Message },
      { label: '违规处理', path: '/forum-manage', icon: User }
    )
  } else {
    // 默认快捷操作
    actionList.push(
      { label: '个人中心', path: '/profile', icon: User },
      { label: '帮助文档', path: '/', icon: Message },
      { label: '系统设置', path: '/', icon: User },
      { label: '关于我们', path: '/', icon: Message }
    )
  }
  
  return actionList
})

// 获取操作按钮样式
const getActionStyle = (action) => {
  const role = adminStore.adminTypeDesc
  const roleColors = {
    '超级管理员': '#1890ff',
    '普通管理员': '#40a9ff',
    '审核员': '#52c41a',
    '客服': '#fa8c16',
    '紧急响应人员': '#ff4d4f',
    '论坛管理员': '#722ed1'
  }
  
  const color = roleColors[role] || '#1890ff'
  
  return {
    '--action-color': color
  }
}

// 处理操作点击
const handleAction = (action) => {
  if (action.path) {
    router.push(action.path)
  } else if (action.callback) {
    action.callback()
  }
}
</script>

<style scoped>
.quick-actions {
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

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 18px;
}

.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  border: 2px solid var(--action-color, #1890ff);
  background: white;
  color: var(--action-color, #1890ff);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(24, 144, 255, 0.1), transparent);
  transition: all 0.6s ease;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:hover {
  background: var(--action-color, #1890ff);
  color: white;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(24, 144, 255, 0.4);
  border-color: var(--action-color, #1890ff);
}

.action-btn:active {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
}

.action-btn-large {
  height: 72px;
  font-size: 16px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.action-btn-medium {
  height: 60px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.action-btn-small {
  height: 48px;
  font-size: 13px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.action-icon-space {
  width: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-buttons {
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  
  .action-btn-large {
    height: 64px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .action-btn-large {
    height: 56px;
  }
}
</style>