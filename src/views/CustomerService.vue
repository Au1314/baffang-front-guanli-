<template>
  <div class="customer-service-container">
    <el-card shadow="never" class="customer-service-card">
      <template #header>
        <div class="card-header">
          <span>客服管理</span>
        </div>
      </template>

      <!-- 标签页导航 -->
      <el-tabs v-model="activeTab" class="service-tabs">
        <!-- AI客服配置 -->
        <el-tab-pane label="AI客服配置" name="ai-config">
          <AIConfigPanel />
        </el-tab-pane>

        <!-- 人工客服对话 -->
        <el-tab-pane label="人工客服对话" name="chat" v-if="false">
          <ChatPanel />
        </el-tab-pane>

        <!-- 对话记录 -->
        <el-tab-pane label="对话记录" name="records">
          <RecordsPanel />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AIConfigPanel from './customerService/AIConfigPanel.vue'
import ChatPanel from './customerService/ChatPanel.vue'
import RecordsPanel from './customerService/RecordsPanel.vue'

// 当前激活的标签页
const activeTab = ref('ai-config')
</script>

<style scoped>
.customer-service-container {
  padding: 24px;
  min-height: calc(100vh - 120px);
  background-color: var(--color-bg-page);
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.customer-service-card {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
}

.card-header {
  font-size: 20px;
  font-weight: 600;
  color: var(--color-text-primary);
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border-light);
  background-color: #ffffff;
  border-radius: 12px 12px 0 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-tabs {
  margin-top: 0;
  background-color: #ffffff;
  overflow: hidden;
}

.service-tabs :deep(.el-tabs__header) {
  padding: 0 24px;
  margin: 0;
  border-bottom: 1px solid var(--color-border-light);
}

.service-tabs :deep(.el-tabs__content) {
  padding: 24px;
}

.service-tabs :deep(.el-tab-pane) {
  animation: tabContentFadeIn 0.3s ease-out;
}

@keyframes tabContentFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: all 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .customer-service-container {
    padding: 12px;
    min-height: calc(100vh - 100px);
  }

  .card-header {
    font-size: 18px;
    padding: 16px 20px;
  }

  .service-tabs :deep(.el-tabs__header) {
    padding: 0 12px;
  }

  .service-tabs :deep(.el-tabs__content) {
    padding: 16px 12px;
  }
}

@media (max-width: 480px) {
  .customer-service-container {
    padding: 8px;
  }

  .service-tabs :deep(.el-tabs__content) {
    padding: 12px 8px;
  }
}
</style>
