<template>
  <div class="charts-layout">
    <!-- 第一行：三栏业务图 -->
    <div class="charts-row row-three">
      <div class="chart-card">
        <div class="card-header">
          <span class="card-title">区域充电桩分布</span>
          <div class="card-legend">
            <span class="legend-item"><span class="dot blue"></span>公桩</span>
            <span class="legend-item"><span class="dot green"></span>私桩</span>
          </div>
        </div>
        <div ref="regionChart" class="chart-body"></div>
      </div>

      <div class="chart-card">
        <div class="card-header">
          <span class="card-title">交易数据分析</span>
          <div class="card-legend">
            <span class="legend-item"><span class="dot blue"></span>订单量</span>
            <span class="legend-item"><span class="dot yellow"></span>交易额(元)</span>
          </div>
        </div>
        <div ref="transactionChart" class="chart-body"></div>
      </div>

      <div class="chart-card">
        <div class="card-header">
          <span class="card-title">用户增长趋势</span>
          <div class="card-legend">
            <span class="legend-item"><span class="dot blue"></span>新增用户</span>
            <span class="legend-item"><span class="dot cyan"></span>活跃用户</span>
          </div>
        </div>
        <div ref="userGrowthChart" class="chart-body"></div>
      </div>
    </div>

    <!-- 第二行：两栏（认证 + 占比tab） -->
    <div class="charts-row row-two">
      <div class="chart-card">
        <div class="card-header">
          <span class="card-title">认证量统计</span>
          <div class="card-legend">
            <span class="legend-item"><span class="dot blue"></span>车主认证</span>
            <span class="legend-item"><span class="dot green"></span>私桩认证</span>
          </div>
        </div>
        <div ref="certificationChart" class="chart-body"></div>
      </div>

      <div class="chart-card">
        <div class="card-header">
          <span class="card-title">占比分析</span>
          <el-radio-group v-model="proportionKey" size="small" class="proportion-tabs">
            <el-radio-button label="payment">支付方式</el-radio-button>
            <el-radio-button label="sharing">共享模式</el-radio-button>
            <el-radio-button label="v2v">V2V交易</el-radio-button>
          </el-radio-group>
        </div>
        <div ref="proportionChart" class="chart-body"></div>
      </div>
    </div>

    <!-- 第三行：通栏热力图 -->
    <div class="charts-row heat-row">
      <div class="chart-card">
        <div class="card-header">
          <span class="card-title">充电负荷热力图（24小时 × 周）</span>
        </div>
        <div ref="pileHeatmap" class="chart-heat"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import echarts from '@/utils/echarts'
import { getMockChartData } from './mockData'

const props = defineProps({
  timeRange: { type: String, default: 'month' },
  pileType: { type: String, default: 'public' },
  region: { type: String, default: '全国' }
})

// 图表引用
const regionChart = ref(null)
const transactionChart = ref(null)
const userGrowthChart = ref(null)
const certificationChart = ref(null)
const proportionChart = ref(null)
const pileHeatmap = ref(null)

// 占比分析的当前 tab
const proportionKey = ref('payment')

// 当前图表数据
const chartData = ref(getMockChartData(props.timeRange, { pileType: props.pileType, region: props.region }))

// —— 统一主题色 ——
const C = {
  blue: '#2178dd',
  blueLight: '#4a9de8',
  green: '#36d399',
  cyan: '#22d3ee',
  yellow: '#f5c842',
  purple: '#9f7aea',
  red: '#ff5c5c',
  axis: '#4a5568',
  label: '#8b96a8',
  split: 'rgba(255, 255, 255, 0.08)',
  tooltipBg: 'rgba(19, 26, 43, 0.95)',
  tooltipBorder: 'rgba(33, 120, 221, 0.4)'
}

const PROPORTION_COLORS = [C.blue, C.green, C.yellow, C.purple, C.cyan, C.red]

// 通用 tooltip
function tooltip(extra = {}) {
  return {
    backgroundColor: C.tooltipBg,
    borderColor: C.tooltipBorder,
    borderWidth: 1,
    textStyle: { color: '#e2e8f0' },
    ...extra
  }
}

// 通用直角坐标轴样式
function categoryAxis(data, extra = {}) {
  return {
    type: 'category',
    data,
    axisLine: { lineStyle: { color: C.axis } },
    axisLabel: { color: C.label },
    axisTick: { show: false },
    ...extra
  }
}

function valueAxis(extra = {}) {
  return {
    type: 'value',
    axisLine: { show: false },
    axisLabel: { color: C.label },
    splitLine: { lineStyle: { color: C.split, type: 'dashed' } },
    axisTick: { show: false },
    ...extra
  }
}

function gradient(top, bottom) {
  return new echarts.graphic.LinearGradient(0, 0, 0, 1, [
    { offset: 0, color: top },
    { offset: 1, color: bottom }
  ])
}

// 初始化所有图表
const initCharts = () => {
  initRegionChart()
  initTransactionChart()
  initUserGrowthChart()
  initCertificationChart()
  initProportionChart()
  initPileHeatmap()
}

// 区域充电桩分布柱状图
const initRegionChart = () => {
  const chart = echarts.init(regionChart.value)
  const d = chartData.value.region
  chart.setOption({
    tooltip: tooltip({ trigger: 'axis', axisPointer: { type: 'shadow' } }),
    legend: { show: false },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: categoryAxis(d.xLabels, { axisLabel: { color: C.label, rotate: 30 } }),
    yAxis: valueAxis(),
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    series: [
      {
        name: '公桩',
        type: 'bar',
        barMaxWidth: 22,
        data: d.public,
        itemStyle: { color: gradient(C.blueLight, C.blue), borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '私桩',
        type: 'bar',
        barMaxWidth: 22,
        data: d.private,
        itemStyle: { color: gradient(C.green, '#10b981'), borderRadius: [4, 4, 0, 0] }
      }
    ]
  })
}

// 交易数据双轴图（订单量柱 + 交易额线）
const initTransactionChart = () => {
  const chart = echarts.init(transactionChart.value)
  const d = chartData.value.transaction
  chart.setOption({
    tooltip: tooltip({ trigger: 'axis', axisPointer: { type: 'cross' } }),
    legend: { show: false },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: categoryAxis(d.xLabels),
    yAxis: [
      valueAxis({ name: '订单量', nameTextStyle: { color: C.label } }),
      valueAxis({ name: '交易额', position: 'right', splitLine: { show: false }, nameTextStyle: { color: C.label } })
    ],
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    series: [
      {
        name: '订单量',
        type: 'bar',
        barMaxWidth: 20,
        data: d.orders,
        itemStyle: { color: gradient(C.blueLight, C.blue), borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '交易额',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: d.amount,
        lineStyle: { color: C.yellow, width: 3 },
        itemStyle: { color: C.yellow, borderColor: '#0b101c', borderWidth: 2 },
        areaStyle: { color: gradient('rgba(245, 200, 66, 0.35)', 'rgba(245, 200, 66, 0.02)') },
        symbol: 'circle',
        symbolSize: 7
      }
    ]
  })
}

// 用户增长趋势折线图
const initUserGrowthChart = () => {
  const chart = echarts.init(userGrowthChart.value)
  const d = chartData.value.userGrowth
  chart.setOption({
    tooltip: tooltip({ trigger: 'axis', axisPointer: { type: 'cross' } }),
    legend: { show: false },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: categoryAxis(d.xLabels, { boundaryGap: false }),
    yAxis: valueAxis(),
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    series: [
      {
        name: '新增用户',
        type: 'line',
        smooth: true,
        data: d.newUsers,
        lineStyle: { color: C.blue, width: 3 },
        itemStyle: { color: C.blue, borderColor: '#0b101c', borderWidth: 2 },
        areaStyle: { color: gradient('rgba(33, 120, 221, 0.4)', 'rgba(33, 120, 221, 0.02)') },
        symbol: 'circle',
        symbolSize: 7
      },
      {
        name: '活跃用户',
        type: 'line',
        smooth: true,
        data: d.activeUsers,
        lineStyle: { color: C.cyan, width: 3 },
        itemStyle: { color: C.cyan, borderColor: '#0b101c', borderWidth: 2 },
        areaStyle: { color: gradient('rgba(34, 211, 238, 0.35)', 'rgba(34, 211, 238, 0.02)') },
        symbol: 'circle',
        symbolSize: 7
      }
    ]
  })
}

// 认证量统计柱状图
const initCertificationChart = () => {
  const chart = echarts.init(certificationChart.value)
  const d = chartData.value.certification
  chart.setOption({
    tooltip: tooltip({ trigger: 'axis', axisPointer: { type: 'shadow' } }),
    legend: { show: false },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: categoryAxis(d.xLabels),
    yAxis: valueAxis(),
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    series: [
      {
        name: '车主认证',
        type: 'bar',
        barMaxWidth: 20,
        data: d.carOwner,
        itemStyle: { color: gradient(C.blueLight, C.blue), borderRadius: [4, 4, 0, 0] }
      },
      {
        name: '私桩认证',
        type: 'bar',
        barMaxWidth: 20,
        data: d.privatePile,
        itemStyle: { color: gradient(C.green, '#10b981'), borderRadius: [4, 4, 0, 0] }
      }
    ]
  })
}

// 占比环形图（tab 切换数据）
const initProportionChart = () => {
  const chart = echarts.init(proportionChart.value)
  const items = chartData.value.proportion[proportionKey.value] || []
  const total = items.reduce((sum, it) => sum + it.value, 0) || 1
  chart.setOption({
    tooltip: tooltip({
      trigger: 'item',
      formatter: (p) => `${p.name}: ${p.value.toLocaleString()} (${p.percent}%)`
    }),
    legend: {
      orient: 'vertical',
      right: '4%',
      top: 'center',
      textStyle: { color: C.label },
      itemGap: 14
    },
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    series: [
      {
        type: 'pie',
        radius: ['48%', '72%'],
        center: ['38%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: { borderColor: '#131a2b', borderWidth: 3, borderRadius: 6 },
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          scaleSize: 6,
          itemStyle: { shadowColor: 'rgba(33, 120, 221, 0.5)', shadowBlur: 18 }
        },
        data: items.map((it, i) => ({
          ...it,
          itemStyle: { color: PROPORTION_COLORS[i % PROPORTION_COLORS.length] }
        }))
      }
    ],
    graphic: [
      {
        type: 'text',
        left: '29%',
        top: '46%',
        style: {
          text: total.toLocaleString(),
          textAlign: 'center',
          fill: '#fff',
          fontSize: 22,
          fontWeight: 700
        }
      },
      {
        type: 'text',
        left: '29%',
        top: '56%',
        style: {
          text: '总量',
          textAlign: 'center',
          fill: C.label,
          fontSize: 12
        }
      }
    ]
  })
}

// 充电负荷热力图
const initPileHeatmap = () => {
  const chart = echarts.init(pileHeatmap.value)
  const hours = ['12a', '2a', '4a', '6a', '8a', '10a', '12p', '2p', '4p', '6p', '8p', '10p']
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  chart.setOption({
    tooltip: tooltip({ position: 'top' }),
    grid: { left: '6%', right: '6%', bottom: '18%', top: '6%' },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: { show: true, areaStyle: { color: ['rgba(33,120,221,0.04)', 'rgba(33,120,221,0.02)'] } },
      axisLine: { lineStyle: { color: C.axis } },
      axisLabel: { color: C.label },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: { show: true, areaStyle: { color: ['rgba(33,120,221,0.04)', 'rgba(33,120,221,0.02)'] } },
      axisLine: { lineStyle: { color: C.axis } },
      axisLabel: { color: C.label },
      axisTick: { show: false }
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      textStyle: { color: C.label },
      inRange: { color: ['#131a2b', '#1d3a5f', C.blue, C.cyan, C.yellow] },
      itemHeight: 14,
      itemWidth: 120
    },
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    series: [
      {
        type: 'heatmap',
        data: chartData.value.heatmap,
        label: { show: false },
        emphasis: { itemStyle: { shadowBlur: 15, shadowColor: 'rgba(33, 120, 221, 0.8)' } }
      }
    ]
  })
}

// 所有图表实例（用于 resize / dispose）
const chartRefs = [regionChart, transactionChart, userGrowthChart, certificationChart, proportionChart, pileHeatmap]

const handleResize = () => {
  chartRefs.forEach((ref) => {
    if (ref.value) echarts.getInstanceByDom(ref.value)?.resize()
  })
}

// 按当前筛选条件重新取数并渲染
const render = () => {
  chartData.value = getMockChartData(props.timeRange, { pileType: props.pileType, region: props.region })
  initCharts()
}

// 筛选条件变化时联动
watch(() => [props.timeRange, props.pileType, props.region], () => render())

// 占比 tab 切换时仅重绘饼图
watch(proportionKey, () => initProportionChart())

defineExpose({ render })

onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
  nextTick(() => handleResize())
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartRefs.forEach((ref) => {
    if (ref.value) echarts.getInstanceByDom(ref.value)?.dispose()
  })
})
</script>

<style scoped>
.charts-layout {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1 1 auto;
  min-height: 0;
}

.charts-row {
  flex: 1 1 0;
  min-height: 0;
  display: grid;
  gap: 16px;
}

.row-three { grid-template-columns: repeat(3, 1fr); }
.row-two { grid-template-columns: repeat(2, 1fr); }

.heat-row {
  flex: 0 0 auto;
  grid-template-columns: 1fr;
}

.chart-card {
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #131a2b;
  border: 1px solid rgba(33, 120, 221, 0.25);
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
  transition: all 0.3s ease;
}

.chart-card:hover {
  border-color: rgba(33, 120, 221, 0.55);
  box-shadow: 0 6px 25px rgba(33, 120, 221, 0.2);
}

.card-header {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
}

.card-legend {
  display: flex;
  gap: 14px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #8b96a8;
  font-weight: 500;
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.dot.blue { background: #2178dd; }
.dot.green { background: #36d399; }
.dot.cyan { background: #22d3ee; }
.dot.yellow { background: #f5c842; }

.chart-body {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
}

.chart-heat {
  height: 190px;
  width: 100%;
}

.proportion-tabs :deep(.el-radio-button__inner) {
  background: rgba(33, 120, 221, 0.08);
  border: 1px solid rgba(33, 120, 221, 0.3);
  color: #8b96a8;
  padding: 6px 12px;
}

.proportion-tabs :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #2178dd;
  border-color: #2178dd;
  color: #fff;
  box-shadow: none;
}
</style>
