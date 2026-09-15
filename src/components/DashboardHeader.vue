<template>
  <div class="dashboard-header">
    <div class="header-main">
      <div class="platform-info">
        <h1 class="platform-title">新能源汽车充电管理平台</h1>
        <div class="platform-subtitle">数据监控中心</div>
      </div>
      <div class="welcome-section">
        <div class="welcome-row">
          <span class="welcome-text">欢迎回来，</span>
          <span class="username">{{ adminInfo.username }}</span>
          <el-tag
            size="small"
            effect="light"
            :type="roleTagType(adminInfo.typeDesc)"
            :style="customTagStyle"
            class="role-tag"
          >
            {{ adminInfo.typeDesc }}
          </el-tag>
        </div>
        <div class="meta-row">
          <span class="meta-item">
            <el-icon><Clock /></el-icon>
            {{ currentTime }}
          </span>
          <span class="meta-divider">·</span>
          <span class="meta-item">上次登录：{{ lastLoginTime ? formatDateMinute(lastLoginTime) : '首次登录' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Clock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/authStore'
import { roleColorByDesc, roleTagType } from '@/utils/roleColors'
import { formatDateMinute } from '@/utils/dateFormat'

const authStore = useAuthStore()

const adminInfo = computed(() => authStore.getAdminBaseInfo)
const lastLoginTime = computed(() => adminInfo.value.updateTime || '')
const currentTime = ref('')

let timeInterval = null

const customTagStyle = computed(() => {
  const desc = adminInfo.value.typeDesc
  if (desc !== '论坛管理员') return {}
  const { main, light } = roleColorByDesc(desc)
  return {
    color: main,
    backgroundColor: light,
    borderColor: light
  }
})

const updateCurrentTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

onMounted(async () => {
  if (!authStore.adminInfo) {
    await authStore.getUserInfo()
  }
  updateCurrentTime()
  timeInterval = setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) clearInterval(timeInterval)
})
</script>

<style scoped>
.dashboard-header {
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: var(--space-5) var(--space-6);
  margin-bottom: var(--space-5);
  border: 1px solid var(--color-border-extra-light);
}

.header-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-5);
  flex-wrap: wrap;
}

.platform-info {
  min-width: 0;
}

.platform-title {
  margin: 0 0 6px 0;
  font-size: var(--font-size-xxl);
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: 1px;
}

.platform-subtitle {
  font-size: var(--font-size-base);
  color: var(--color-text-secondary);
}

.welcome-section {
  text-align: right;
  min-width: 0;
}

.welcome-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.welcome-text {
  font-size: var(--font-size-md);
  color: var(--color-text-regular);
}

.username {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
}

.role-tag {
  margin-left: var(--space-1);
}

.meta-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-divider {
  color: var(--color-text-placeholder);
}

@media (max-width: 768px) {
  .dashboard-header {
    padding: var(--space-4);
  }

  .platform-title {
    font-size: var(--font-size-xl);
  }

  .welcome-section {
    text-align: left;
    width: 100%;
  }

  .welcome-row,
  .meta-row {
    justify-content: flex-start;
  }
}
</style>
