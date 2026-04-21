<template>
  <div class="dashboard-container">
    <!-- 头部：欢迎信息和用户信息 -->
    <DashboardHeader />
    
    <!-- 统计卡片 -->
    <StatisticsPanel />
    
    <!-- 主要内容区 -->
    <div class="main-content">
      <!-- 左侧：快捷操作 -->
      <div class="content-section">
        <QuickActions />
      </div>
      
      <!-- 右侧：最近动态 -->
      <div class="content-section">
        <ActivityTimeline />
      </div>
    </div>
    
    <!-- 底部：系统信息 -->
    <div class="system-info">
      <RoleBasedCard header="系统信息">
        <div class="info-grid">
          <div class="info-item">
            <span class="label">当前版本：</span>
            <span class="value">v1.0.0</span>
          </div>
          <div class="info-item">
            <span class="label">在线用户数：</span>
            <span class="value">{{ onlineUsers }}</span>
          </div>
          <div class="info-item">
            <span class="label">系统状态：</span>
            <span class="value status-normal">正常</span>
          </div>
          <div class="info-item">
            <span class="label">最后更新：</span>
            <span class="value">{{ formatDate(lastLoginTime) }}</span>
          </div>
        </div>
      </RoleBasedCard>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import DashboardHeader from '@/components/DashboardHeader.vue'
import StatisticsPanel from '@/components/StatisticsPanel.vue'
import QuickActions from '@/components/QuickActions.vue'
import ActivityTimeline from '@/components/ActivityTimeline.vue'
import RoleBasedCard from '@/components/permission/RoleBasedCard.vue'

// 上次登录时间（模拟数据，实际应从后端获取）
const lastLoginTime = ref('2024-01-10 14:30:00')

// 在线用户数（模拟数据）
const onlineUsers = ref(12)

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}
</script>

<style scoped>
.dashboard-container {
  --primary-color: #1e90ff;
  --secondary-color: #36cfc9;
  --accent-color: #40c4ff;
  --success-color: #67c23a;
  --warning-color: #e6a23c;
  --danger-color: #f56c6c;
  --text-primary: #e2e8f0;
  --text-secondary: #a0aec0;
  --text-muted: #718096;
  --bg-primary: #0a1929;
  --bg-secondary: #1a2e45;
  --bg-card: rgba(26, 46, 69, 0.8);
  --border-color: rgba(30, 144, 255, 0.2);
  --shadow-color: rgba(0, 0, 0, 0.15);
  --glow-color: rgba(30, 144, 255, 0.2);
  
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
  min-height: calc(100vh - 80px);
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 50%, var(--bg-primary) 100%);
  position: relative;
  overflow: hidden;
}

.dashboard-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    linear-gradient(rgba(10, 25, 41, 0.8) 1px, transparent 1px),
    linear-gradient(90deg, rgba(10, 25, 41, 0.8) 1px, transparent 1px);
  background-size: 20px 20px;
  pointer-events: none;
  z-index: 0;
}

.dashboard-container::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(30, 144, 255, 0.1) 0%, transparent 70%);
  animation: pulse 8s ease-in-out infinite;
  pointer-events: none;
  z-index: 0;
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.5; }
  100% { transform: scale(1); opacity: 0.3; }
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
}

.content-section {
  height: 100%;
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 16px var(--shadow-color);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.content-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  opacity: 0.5;
}

.content-section:hover {
  box-shadow: 0 8px 24px var(--glow-color);
  transform: translateY(-2px);
  border-color: rgba(30, 144, 255, 0.4);
}

.system-info {
  margin-top: 30px;
  position: relative;
  z-index: 1;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 24px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item:hover {
  background: rgba(30, 144, 255, 0.1);
  padding-left: 12px;
  border-radius: 8px;
}

.info-item .label {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.info-item .value {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 14px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.info-item .status-normal {
  color: var(--success-color);
  font-weight: 600;
  background: rgba(103, 194, 58, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid rgba(103, 194, 58, 0.2);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .dashboard-container {
    padding: 20px;
    max-width: 100%;
  }
  
  .main-content {
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .main-content {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .content-section {
    padding: 20px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 12px;
  }
  
  .content-section {
    padding: 16px;
  }
  
  .info-grid {
    gap: 16px;
  }
}
</style>