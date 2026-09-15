<template>
  <div class="emergency-container">
    <el-card shadow="never" class="emergency-card">
      <template #header>
        <div class="card-header">
          <span>紧急响应</span>
        </div>
      </template>

      <!-- 标签页导航 -->
      <el-tabs v-model="activeTab" class="emergency-tabs">
        <el-tab-pane label="响应紧急呼叫" name="respond">
          <EmergencyRespondPanel />
        </el-tab-pane>

        <el-tab-pane label="管理紧急呼叫" name="manage">
          <EmergencyManagePanel @view-detail="handleViewDetail" />
        </el-tab-pane>

        <el-tab-pane label="查看呼叫记录" name="records">
          <EmergencyRecordsPanel @view-detail="handleViewDetail" />
        </el-tab-pane>

        <el-tab-pane label="我的响应记录" name="myResponses">
          <EmergencyMyResponsesPanel @view-detail="handleViewDetail" />
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 查看紧急呼叫详情弹窗 -->
    <EmergencyDetailDialog
      v-model="showEmergencyDetail"
      :emergency="currentEmergencyDetail"
      :logs="emergencyDetailLogs"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EmergencyRespondPanel from './emergency/EmergencyRespondPanel.vue'
import EmergencyManagePanel from './emergency/EmergencyManagePanel.vue'
import EmergencyRecordsPanel from './emergency/EmergencyRecordsPanel.vue'
import EmergencyMyResponsesPanel from './emergency/EmergencyMyResponsesPanel.vue'
import EmergencyDetailDialog from './emergency/EmergencyDetailDialog.vue'

// 当前激活的标签页
const activeTab = ref('respond')

// 详情弹窗
const showEmergencyDetail = ref(false)
const currentEmergencyDetail = ref(null)
const emergencyDetailLogs = ref([])

// 查看紧急呼叫详情
const handleViewDetail = (row, logs) => {
  currentEmergencyDetail.value = row
  emergencyDetailLogs.value = logs
  showEmergencyDetail.value = true
}
</script>

<style scoped>
/* 紧急响应模块主样式 */
.emergency-container {
  padding: 20px;
  min-height: calc(100vh - 120px);
  background-color: var(--color-bg-page);
}

.emergency-card {
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.emergency-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-lighter);
}

.emergency-tabs {
  margin-top: 0;
  border-bottom: 1px solid var(--color-border-light);
}

:deep(.el-tabs__header) {
  margin: 0;
  padding: 0 20px;
  background-color: #fafafa;
  border-bottom: 1px solid var(--color-border-light);
}

:deep(.el-tabs__nav) {
  margin: 0;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-tabs__item) {
  padding: 0 20px;
  height: 56px;
  line-height: 56px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-regular);
  transition: all 0.3s ease;
  border-radius: 8px 8px 0 0;
  margin: 0 4px;
}

:deep(.el-tabs__item:hover) {
  color: var(--color-primary);
  background-color: rgba(64, 158, 255, 0.05);
}

:deep(.el-tabs__item.is-active) {
  color: var(--color-primary);
  background-color: #fff;
  border: 1px solid var(--color-border-light);
  border-bottom-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

:deep(.el-tabs__active-bar) {
  background-color: var(--color-primary);
  height: 3px;
  border-radius: 3px;
  bottom: 0;
}

:deep(.el-tabs__content) {
  padding: 20px;
  background-color: #fff;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .emergency-container {
    padding: 10px;
  }
}
</style>
