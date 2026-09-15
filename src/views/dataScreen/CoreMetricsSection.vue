<template>
  <div class="core-metrics">
    <el-row :gutter="16">
      <el-col v-for="card in cards" :key="card.key" :span="4">
        <div class="kpi-card" :class="[`tone-${card.tone}`, { 'is-empty': card.empty }]">
          <div class="kpi-icon">
            <el-icon><component :is="card.icon" /></el-icon>
          </div>
          <div class="kpi-body">
            <div class="kpi-value">
              <template v-if="card.empty">暂无数据</template>
              <template v-else>
                {{ card.display }}<span class="kpi-unit">{{ card.unit }}</span>
              </template>
            </div>
            <div class="kpi-label">{{ card.label }}</div>
            <div class="kpi-trend" :class="card.trend.none ? 'none' : (card.trend.up ? 'up' : 'down')">
              <template v-if="!card.trend.none">
                <el-icon><component :is="card.trend.up ? Top : Bottom" /></el-icon>
                <span>{{ card.trend.text }}</span>
              </template>
              <template v-else><span>—</span></template>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Odometer, Lightning, Monitor, Warning, Coin, User, Top, Bottom } from '@element-plus/icons-vue'
import { useCountUp } from './useCountUp'

const props = defineProps({
  metricsData: {
    type: Object,
    required: true
  },
  metricsPrev: {
    type: Object,
    default: () => ({})
  }
})

// 卡片配置：invert 表示“数值下降才是利好”（故障桩）
const CARD_DEFS = [
  { key: 'totalChargeEnergy', label: '总充电电量', unit: 'kWh', icon: Odometer, tone: 'blue' },
  { key: 'realtimePower', label: '实时充电功率', unit: 'kW', icon: Lightning, tone: 'cyan' },
  { key: 'deviceOnlineRate', label: '设备在线率', unit: '%', icon: Monitor, tone: 'green', decimals: 1 },
  { key: 'faultPileCount', label: '故障桩数量', unit: '台', icon: Warning, tone: 'red', invert: true },
  { key: 'orderTotalAmount', label: '订单总额', unit: '元', icon: Coin, tone: 'yellow' },
  { key: 'totalUsers', label: '总用户数', unit: '人', icon: User, tone: 'purple' }
]

// 整数指标走数字滚动动画；比例类指标直接展示（保留一位小数）
const countUpRefs = {
  totalChargeEnergy: useCountUp(() => props.metricsData.totalChargeEnergy || 0),
  realtimePower: useCountUp(() => props.metricsData.realtimePower || 0),
  faultPileCount: useCountUp(() => props.metricsData.faultPileCount || 0),
  orderTotalAmount: useCountUp(() => props.metricsData.orderTotalAmount || 0),
  totalUsers: useCountUp(() => props.metricsData.totalUsers || 0)
}

// 环比趋势：current/prev 任一为 0 时不计算，返回「—」避免异常 -100%
function trendText(current, prev, invert = false) {
  if (!prev || prev <= 0 || current <= 0) return { text: '—', up: true, none: true }
  const rate = (current - prev) / prev
  const good = invert ? rate <= 0 : rate >= 0
  return { text: `${rate >= 0 ? '+' : ''}${(rate * 100).toFixed(1)}%`, up: good, none: false }
}

const cards = computed(() => {
  const d = props.metricsData
  const p = props.metricsPrev || {}
  return CARD_DEFS.map((def) => {
    const src = d[def.key]
    const display = def.decimals != null
      ? (src ?? 0).toFixed(def.decimals)
      : countUpRefs[def.key].value.toLocaleString()
    return {
      ...def,
      empty: !src,
      display,
      trend: trendText(src, p[def.key], def.invert)
    }
  })
})
</script>

<style scoped>
.core-metrics {
  flex: 0 0 auto;
}

.kpi-card {
  height: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  background: #131a2b;
  border: 1px solid rgba(33, 120, 221, 0.25);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  transition: all 0.3s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  border-color: rgba(33, 120, 221, 0.55);
  box-shadow: 0 6px 25px rgba(33, 120, 221, 0.25);
}

.kpi-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.kpi-icon .el-icon {
  font-size: 24px;
  color: #fff;
}

.tone-blue .kpi-icon { background: linear-gradient(135deg, #2178dd, #1a5fb8); }
.tone-cyan .kpi-icon { background: linear-gradient(135deg, #22d3ee, #0ea5e9); }
.tone-green .kpi-icon { background: linear-gradient(135deg, #36d399, #10b981); }
.tone-yellow .kpi-icon { background: linear-gradient(135deg, #f5c842, #d69e2e); }
.tone-purple .kpi-icon { background: linear-gradient(135deg, #9f7aea, #805ad5); }

/* 故障桩：红色告警 */
.tone-red.kpi-card { border-color: rgba(255, 92, 92, 0.4); }
.tone-red .kpi-icon { background: linear-gradient(135deg, #ff5c5c, #e53e3e); }
.tone-red .kpi-value { color: #ff5c5c; }

.kpi-body {
  flex: 1;
  min-width: 0;
}

.kpi-value {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.kpi-unit {
  font-size: 13px;
  font-weight: 500;
  color: #8b96a8;
  margin-left: 4px;
}

.kpi-label {
  font-size: 14px;
  color: #8b96a8;
  margin-top: 4px;
  font-weight: 500;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  margin-top: 4px;
  font-weight: 500;
}

.kpi-trend.up { color: #36d399; }
.kpi-trend.down { color: #ff5c5c; }
.kpi-trend.none { color: #4a5568; }

.is-empty .kpi-value {
  color: #4a5568;
  font-size: 22px;
  font-weight: 500;
}

@media screen and (max-width: 1200px) {
  .kpi-value { font-size: 24px; }
}

@media screen and (max-width: 992px) {
  .kpi-card { padding: 12px 14px; }
  .kpi-value { font-size: 20px; }
  .kpi-label { font-size: 13px; }
}
</style>
