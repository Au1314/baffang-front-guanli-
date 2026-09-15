<template>
  <div class="screen-header">
    <div class="header-left">
      <el-button class="back-button" text @click="goBack" title="返回">
        <el-icon><ArrowLeft /></el-icon>
      </el-button>
      <div class="header-title">
        <span class="title-text">新能源汽车充电管理平台</span>
        <span class="title-sub">数据中心</span>
      </div>
    </div>

    <div class="header-center">
      <el-radio-group v-model="timeRangeModel" size="default">
        <el-radio-button label="day">日</el-radio-button>
        <el-radio-button label="week">周</el-radio-button>
        <el-radio-button label="month">月</el-radio-button>
        <el-radio-button label="year">年</el-radio-button>
      </el-radio-group>

      <el-select v-model="regionModel" class="region-select" :teleported="false" size="default">
        <el-option v-for="r in regionOptions" :key="r" :label="r" :value="r" />
      </el-select>

      <div class="pile-switch">
        <el-switch
          v-model="pileTypeModel"
          active-value="public"
          inactive-value="private"
          active-text="公桩"
          inactive-text="私桩"
        />
      </div>
    </div>

    <div class="header-right">
      <el-button
        type="primary"
        icon="Refresh"
        :loading="manualRefreshLoading"
        @click="emit('refresh')"
        class="refresh-button"
      >
        刷新数据
      </el-button>
      <div class="header-time">
        <span class="time-text">{{ currentTime }}</span>
        <span class="date-text">{{ currentDate }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const props = defineProps({
  currentTime: { type: String, default: '' },
  currentDate: { type: String, default: '' },
  manualRefreshLoading: { type: Boolean, default: false },
  timeRange: { type: String, default: 'month' },
  pileType: { type: String, default: 'public' },
  region: { type: String, default: '全国' }
})

const emit = defineEmits(['refresh', 'update:timeRange', 'update:pileType', 'update:region'])
const router = useRouter()

const regionOptions = ['全国', '北京', '上海', '广州', '深圳', '杭州', '成都']

const timeRangeModel = computed({
  get: () => props.timeRange,
  set: (val) => emit('update:timeRange', val)
})

const pileTypeModel = computed({
  get: () => props.pileType,
  set: (val) => emit('update:pileType', val)
})

const regionModel = computed({
  get: () => props.region,
  set: (val) => emit('update:region', val)
})

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.screen-header {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 14px 30px;
  background: linear-gradient(90deg, rgba(33, 120, 221, 0.12), transparent);
  border-bottom: 1px solid rgba(33, 120, 221, 0.3);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.back-button {
  color: #8b96a8;
  font-size: 20px;
  padding: 8px;
}

.back-button:hover {
  color: #2178dd;
  background: rgba(33, 120, 221, 0.1);
}

.header-center {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 14px;
}

.header-center :deep(.el-radio-button__inner) {
  background: rgba(33, 120, 221, 0.08);
  border: 1px solid rgba(33, 120, 221, 0.3);
  color: #8b96a8;
}

.header-center :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #2178dd;
  border-color: #2178dd;
  color: #fff;
  box-shadow: none;
}

.region-select {
  width: 120px;
}

.region-select :deep(.el-select__wrapper) {
  background: #131a2b;
  box-shadow: 0 0 0 1px rgba(33, 120, 221, 0.3) inset;
}

.region-select :deep(.el-select__wrapper .el-select__selection) {
  color: #e2e8f0;
}

.pile-switch {
  display: flex;
  align-items: center;
}

.pile-switch :deep(.el-switch__label) {
  color: #8b96a8;
  font-size: 13px;
}

.pile-switch :deep(.el-switch__label.is-active) {
  color: #e2e8f0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.refresh-button {
  margin-right: 10px;
}

.header-title {
  display: flex;
  align-items: baseline;
  gap: 15px;
}

.title-text {
  font-size: 30px;
  font-weight: 800;
  background: linear-gradient(90deg, #2178dd, #36d399);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
  white-space: nowrap;
}

.title-sub {
  font-size: 17px;
  color: #8b96a8;
  font-weight: 500;
}

.header-time {
  text-align: right;
}

.time-text {
  font-size: 26px;
  font-weight: 700;
  color: #2178dd;
  letter-spacing: 1px;
}

.date-text {
  display: block;
  font-size: 15px;
  color: #8b96a8;
  font-weight: 400;
}

/* 下拉面板（teleported=false 便于 scoped 定制） */
.region-select :deep(.el-select-dropdown) {
  background: #131a2b;
  border: 1px solid rgba(33, 120, 221, 0.3);
}

.region-select :deep(.el-select-dropdown__item) {
  color: #e2e8f0;
}

.region-select :deep(.el-select-dropdown__item.is-hovering),
.region-select :deep(.el-select-dropdown__item.is-selected) {
  background: rgba(33, 120, 221, 0.2);
  color: #fff;
}

@media screen and (max-width: 1200px) {
  .title-text { font-size: 26px; }
  .time-text { font-size: 22px; }
}

@media screen and (max-width: 992px) {
  .screen-header { padding: 12px 20px; }
  .title-text { font-size: 22px; }
  .title-sub { font-size: 15px; }
  .time-text { font-size: 19px; }
  .date-text { font-size: 13px; }
}
</style>
