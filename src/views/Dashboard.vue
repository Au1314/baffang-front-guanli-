<template>
  <div class="dashboard-container">
    <!-- 头部：欢迎信息 -->
    <DashboardHeader />

    <!-- 统计卡片 -->
    <StatisticsPanel />

    <!-- 主要内容区 -->
    <div class="main-content">
      <div class="content-section">
        <QuickActions />
      </div>
      <div class="content-section">
        <ActivityTimeline />
      </div>
    </div>

    <!-- 底部：系统信息 -->
    <div class="system-info">
      <RoleBasedCard header="系统信息">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">当前版本</span>
            <span class="value">v1.0.0</span>
          </div>
          <div class="info-item">
            <span class="label">在线用户数</span>
            <span class="value">{{ onlineUsers }}</span>
          </div>
          <div class="info-item">
            <span class="label">系统状态</span>
            <el-tag type="success" size="small" effect="light">正常</el-tag>
          </div>
          <div class="info-item">
            <span class="label">最后更新</span>
            <span class="value">{{ lastLoginTime ? formatDateTime(lastLoginTime) : '暂无' }}</span>
          </div>
        </div>
      </RoleBasedCard>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DashboardHeader from '@/components/DashboardHeader.vue'
import StatisticsPanel from '@/components/StatisticsPanel.vue'
import QuickActions from '@/components/QuickActions.vue'
import ActivityTimeline from '@/components/ActivityTimeline.vue'
import RoleBasedCard from '@/components/permission/RoleBasedCard.vue'
import { formatDateTime } from '@/utils/dateFormat'
import { useAuthStore } from '@/store/authStore'

const authStore = useAuthStore()

// 最后更新：取当前管理员信息里的更新时间
const lastLoginTime = computed(() => authStore.getAdminBaseInfo.updateTime || '')

// 在线用户数（模拟数据）
const onlineUsers = ref(12)
</script>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-5);
  margin-bottom: var(--space-5);
}

.content-section {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border-extra-light);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  box-shadow: var(--shadow-card);
  transition: box-shadow var(--transition-base);
}

.content-section:hover {
  box-shadow: var(--shadow-card-hover);
}

.system-info {
  margin-top: var(--space-5);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-3) var(--space-5);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border-lighter);
}

.info-item:last-child,
.info-item:nth-last-child(2) {
  border-bottom: none;
}

.info-item .label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.info-item .value {
  color: var(--color-text-primary);
  font-weight: 500;
  font-size: var(--font-size-base);
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .content-section {
    padding: var(--space-4);
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style>