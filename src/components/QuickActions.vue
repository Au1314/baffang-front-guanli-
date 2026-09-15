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
import { useAuthStore } from '@/store/authStore'
import {
  User, UserFilled, OfficeBuilding, Monitor, DocumentChecked, Van,
  Warning, Tickets, ChatDotRound, Document, Tools, Timer, ChatLineSquare, InfoFilled
} from '@element-plus/icons-vue'
import { roleColorByDesc } from '@/utils/roleColors'

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
const authStore = useAuthStore()

// 快捷操作数据
const actions = computed(() => {
  if (props.customActions) {
    return props.customActions
  }

  const actionList = []

  if (authStore.isSuperAdmin || authStore.isNormalAdmin) {
    // 管理员快捷操作
    actionList.push(
      { label: '用户管理', path: '/system/user', icon: User },
      { label: '角色管理', path: '/system/role', icon: UserFilled },
      { label: '平台管理', path: '/platform-manage', icon: OfficeBuilding },
      { label: '数据大屏', path: '/data-screen', icon: Monitor }
    )
  } else if (authStore.isAuditor) {
    // 审核员快捷操作
    actionList.push(
      { label: '私人电桩审核', path: '/audit/private-station', icon: DocumentChecked },
      { label: '车主认证审核', path: '/audit/car-owner', icon: Van },
      { label: '投诉审核', path: '/audit/charging-complaint', icon: Warning },
      { label: '故障审核', path: '/audit/charging-fault', icon: Tools }
    )
  } else if (authStore.isCustomerService) {
    // 客服快捷操作
    actionList.push(
      { label: '工单管理', path: '/customer-service', icon: Tickets },
      { label: '投诉处理', path: '/audit/charging-complaint', icon: Warning },
      { label: '用户反馈', path: '/audit/comment-report', icon: ChatDotRound },
      { label: '交易申诉', path: '/audit/transaction-appeal', icon: Document }
    )
  } else if (authStore.isEmergencyResponder) {
    // 紧急响应人员快捷操作
    actionList.push(
      { label: '紧急事件', path: '/emergency', icon: Warning },
      { label: '故障处理', path: '/audit/charging-fault', icon: Tools },
      { label: '事件记录', path: '/emergency', icon: Document },
      { label: '资源调度', path: '/emergency', icon: Timer }
    )
  } else if (authStore.isForumAdmin) {
    // 论坛管理员快捷操作
    actionList.push(
      { label: '论坛管理', path: '/forum-manage', icon: ChatDotRound },
      { label: '帖子审核', path: '/forum-manage', icon: DocumentChecked },
      { label: '评论管理', path: '/forum-manage', icon: ChatLineSquare },
      { label: '违规处理', path: '/forum-manage', icon: Warning }
    )
  } else {
    // 默认快捷操作
    actionList.push(
      { label: '个人中心', path: '/profile', icon: User },
      { label: '帮助文档', path: '/', icon: Document },
      { label: '系统设置', path: '/', icon: Tools },
      { label: '关于我们', path: '/', icon: InfoFilled }
    )
  }

  return actionList
})

// 获取操作按钮样式：用角色色作为按钮边/字强调色
const getActionStyle = () => {
  const { main, light } = roleColorByDesc(authStore.adminTypeDesc)
  return {
    '--action-color': main,
    '--action-color-light': light
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

.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-3);
}

.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid var(--color-border-light);
  background: var(--color-bg-card);
  color: var(--color-text-regular);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast),
              background var(--transition-fast),
              color var(--transition-fast);
}

.action-btn:hover {
  border-color: var(--action-color, var(--color-primary));
  background: var(--action-color-light, var(--color-primary-light));
  color: var(--action-color, var(--color-primary));
}

.action-btn:focus-visible {
  outline: 2px solid var(--action-color, var(--color-primary));
  outline-offset: 2px;
}

.action-btn-large {
  height: 56px;
  font-size: var(--font-size-base);
  font-weight: 500;
}

.action-btn-medium {
  height: 48px;
  font-size: var(--font-size-base);
  font-weight: 500;
}

.action-btn-small {
  height: 40px;
  font-size: var(--font-size-sm);
  font-weight: 500;
}

.action-icon-space {
  width: 2px;
}

@media (max-width: 768px) {
  .action-buttons {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .action-buttons {
    grid-template-columns: 1fr;
  }
}
</style>
