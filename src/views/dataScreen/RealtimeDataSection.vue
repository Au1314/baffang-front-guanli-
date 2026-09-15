<template>
  <div class="realtime-data">
    <el-row :gutter="16">
      <el-col v-for="card in cards" :key="card.key" :span="6">
        <div class="realtime-card" :class="`tone-${card.tone}`">
          <div class="realtime-icon">
            <el-icon><component :is="card.icon" /></el-icon>
          </div>
          <div class="realtime-info">
            <div class="realtime-value" :class="{ 'is-empty': card.empty }">
              {{ card.empty ? '暂无数据' : card.value.toLocaleString() }}
            </div>
            <div class="realtime-label">{{ card.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Connection, ShoppingCart, Lightning, Warning } from '@element-plus/icons-vue'
import { useCountUp } from './useCountUp'

const props = defineProps({
  realtimeData: {
    type: Object,
    required: true
  }
})

const CARDS = [
  { key: 'onlineUsers', label: '当前在线用户', icon: Connection, tone: 'blue' },
  { key: 'currentOrders', label: '当前预约量', icon: ShoppingCart, tone: 'green' },
  { key: 'workingPiles', label: '正在充电桩数', icon: Lightning, tone: 'yellow' },
  { key: 'faultReports', label: '今日故障上报', icon: Warning, tone: 'red' }
]

const countUpRefs = {
  onlineUsers: useCountUp(() => props.realtimeData.onlineUsers || 0),
  currentOrders: useCountUp(() => props.realtimeData.currentOrders || 0),
  workingPiles: useCountUp(() => props.realtimeData.workingPiles || 0),
  faultReports: useCountUp(() => props.realtimeData.faultReports || 0)
}

const cards = computed(() =>
  CARDS.map((card) => ({
    ...card,
    empty: !props.realtimeData[card.key],
    value: countUpRefs[card.key].value
  }))
)
</script>

<style scoped>
.realtime-data {
  background: rgba(19, 26, 43, 0.7);
  border: 1px solid rgba(33, 120, 221, 0.2);
  border-radius: 12px;
  padding: 14px 16px;
}

.realtime-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  background: #131a2b;
  border: 1px solid rgba(33, 120, 221, 0.25);
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  transition: all 0.3s ease;
}

.realtime-card:hover {
  transform: translateY(-2px);
  border-color: rgba(33, 120, 221, 0.55);
  box-shadow: 0 6px 25px rgba(33, 120, 221, 0.2);
}

.realtime-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.realtime-icon .el-icon {
  font-size: 22px;
  color: #fff;
}

.tone-blue .realtime-icon { background: linear-gradient(135deg, #2178dd, #1a5fb8); }
.tone-green .realtime-icon { background: linear-gradient(135deg, #36d399, #10b981); }
.tone-yellow .realtime-icon { background: linear-gradient(135deg, #f5c842, #d69e2e); }
.tone-red .realtime-icon { background: linear-gradient(135deg, #ff5c5c, #e53e3e); }

.tone-red.realtime-card { border-color: rgba(255, 92, 92, 0.4); }
.tone-red .realtime-value { color: #ff5c5c; }

.realtime-value {
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}

.realtime-value.is-empty {
  color: #4a5568;
  font-size: 20px;
  font-weight: 500;
}

.realtime-label {
  font-size: 15px;
  color: #8b96a8;
  font-weight: 500;
}

@media screen and (max-width: 1200px) {
  .realtime-value { font-size: 22px; }
}

@media screen and (max-width: 992px) {
  .realtime-card { padding: 12px; }
  .realtime-value { font-size: 20px; }
  .realtime-label { font-size: 13px; }
}
</style>
