<template>
  <el-dialog
    :model-value="modelValue"
    title="紧急呼叫详情"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div v-if="emergency">
      <div class="detail-header">
        <div class="detail-info">
          <span class="detail-id">呼叫ID: {{ emergency.id }}</span>
          <span class="detail-user">用户ID: {{ emergency.requestUserId }}</span>
          <el-tag
            :type="emergency.status === 0 ? 'warning' : emergency.status === 1 ? 'success' : 'info'"
          >
            {{ emergency.statusName }}
          </el-tag>
        </div>
        <div class="detail-time">
          <span>呼叫时间: {{ emergency.callTime }}</span>
        </div>
      </div>

      <!-- 基本信息 -->
      <div class="detail-section">
        <h4>基本信息</h4>
        <el-descriptions :column="2" border class="detail-descriptions">
          <el-descriptions-item label="用户姓名">{{ emergency.requestUserName || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="用户电话">{{ emergency.requestUserPhone || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="呼叫类型">{{ emergency.typeName }}</el-descriptions-item>
          <el-descriptions-item label="呼叫状态">{{ emergency.statusName }}</el-descriptions-item>
          <el-descriptions-item label="呼叫位置" :span="2">{{ emergency.callPosition || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="目标位置" :span="2">{{ emergency.targetPosition || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>

      <!-- 处理日志 -->
      <div class="detail-section">
        <h4>处理日志</h4>
        <el-scrollbar class="detail-log-scroll" max-height="300px">
          <div class="detail-log-list">
            <el-empty v-if="!logs.length" description="暂无处理日志" />
            <div
              v-for="log in logs"
              :key="log.id"
              class="log-item"
            >
              <div class="log-time">{{ log.createTime }}</div>
              <div class="log-content">{{ log.content }}</div>
            </div>
          </div>
        </el-scrollbar>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="emit('update:modelValue', false)">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  emergency: {
    type: Object,
    default: null
  },
  logs: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['update:modelValue'])
</script>

<style scoped>
/* 详情弹窗样式 */
.detail-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border-lighter);
}

.detail-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.detail-id,
.detail-user {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 16px;
}

.detail-time {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: var(--color-text-regular);
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-descriptions {
  margin-bottom: 0;
  border-radius: 6px;
  overflow: hidden;
}

.detail-log-scroll {
  margin-top: 16px;
  border: 1px solid var(--color-border-lighter);
  border-radius: 6px;
  background-color: #fafafa;
}

.detail-log-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

.log-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-left: 4px solid var(--color-primary);
  position: relative;
}

.log-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
  background-color: #fff;
}

.log-time {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.log-content {
  font-size: 14px;
  color: var(--color-text-regular);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 12px;
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #f0f2f5;
}

/* 标签样式统一 */
:deep(.el-tag) {
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}
</style>
