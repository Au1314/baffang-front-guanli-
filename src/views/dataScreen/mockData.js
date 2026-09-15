/**
 * 数据大屏的确定性 mock 数据源（充电业务口径）。
 * 后端充电统计接口就绪后，用真实响应替换本模块的返回值即可（调用方签名保持不变）。
 */

// 各时间范围的粒度与横轴标签
const RANGES = {
  day: {
    xLabels: Array.from({ length: 24 }, (_, i) => `${i}时`)
  },
  week: {
    xLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  },
  month: {
    xLabels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  },
  year: {
    xLabels: ['Q1', 'Q2', 'Q3', 'Q4']
  }
}

// 时间范围 → 数据量级系数
const RANGE_FACTOR = { day: 1, week: 2.2, month: 5.6, year: 12.4 }

// 桩类型 → 量级系数（公桩为基准，私桩体量较小）
const PILE_FACTOR = { public: 1, private: 0.42 }

// 区域 → 量级系数（全国为基准）
const REGION_FACTOR = {
  '全国': 1, '北京': 0.22, '上海': 0.21, '广州': 0.16, '深圳': 0.15, '杭州': 0.12, '成都': 0.14
}

// 核心指标基准值（月视图、公桩、全国口径）
const METRIC_BASE = {
  totalChargeEnergy: 286000,  // 总充电电量 kWh
  realtimePower: 1240,        // 实时充电功率 kW
  deviceOnlineRate: 98.6,     // 设备在线率 %
  faultPileCount: 18,         // 故障桩数量 台
  orderTotalAmount: 1520000,  // 订单总额 元
  totalUsers: 28600           // 总用户数 人
}

// 环比增长率（反推上期值；故障桩为负增长=下降）
const GROWTH_RATE = {
  totalChargeEnergy: 0.142,
  realtimePower: 0.086,
  deviceOnlineRate: 0.008,
  faultPileCount: -0.15,
  orderTotalAmount: 0.121,
  totalUsers: 0.093
}

// 生成确定性波动序列（同参数始终得到相同结果，避免每次刷新随机跳动）
function genSeries(count, base, amplitude, phase = 0) {
  return Array.from({ length: count }, (_, i) =>
    Math.round(base + amplitude * Math.sin((i / Math.max(count - 1, 1)) * Math.PI * 2 + phase) + (i % 5) * 11)
  )
}

// 生成 7天×24小时 的确定性热力图数据（白天高峰、夜间低谷、周末略高）
function genHeatmapData() {
  const data = []
  for (let d = 0; d < 7; d++) {
    for (let h = 0; h < 24; h++) {
      const dayFactor = d >= 5 ? 1.2 : 1
      const hourFactor = h >= 8 && h <= 22
        ? 0.6 + 0.8 * Math.sin(((h - 8) / 14) * Math.PI)
        : 0.15
      const value = Math.min(10, Math.round(dayFactor * hourFactor * 6 + (d + h) % 2))
      data.push([d, h, value])
    }
  }
  return data
}

// 归一化筛选条件为量级系数
function resolveFactors(timeRange, filters = {}) {
  const { pileType = 'public', region = '全国' } = filters
  return {
    time: RANGE_FACTOR[timeRange] || 1,
    pile: PILE_FACTOR[pileType] ?? 1,
    region: REGION_FACTOR[region] ?? 1
  }
}

// 指标取值规则：比例类指标不缩放；总用户不随桩类型缩放；故障桩随桩数缩放
function metricValue(key, { time, pile, region }) {
  const base = METRIC_BASE[key]
  switch (key) {
    case 'deviceOnlineRate':
      return base
    case 'totalUsers':
      return base * time * region
    case 'faultPileCount':
      return base * Math.max(pile, 0.4) * region
    default:
      return base * time * pile * region
  }
}

// 取整（在线率保留1位小数）
function roundMetric(key, value) {
  return key === 'deviceOnlineRate' ? Math.round(value * 10) / 10 : Math.round(value)
}

// 核心指标：返回当前值与上期值（用于计算环比趋势）
export function getMockMetrics(timeRange, filters = {}) {
  const factors = resolveFactors(timeRange, filters)
  const current = {}
  const prev = {}
  Object.keys(METRIC_BASE).forEach((key) => {
    const value = metricValue(key, factors)
    current[key] = roundMetric(key, value)
    prev[key] = roundMetric(key, value / (1 + GROWTH_RATE[key]))
  })
  return { current, prev }
}

// 实时数据
export function getMockRealtime(timeRange, filters = {}) {
  const { time, pile, region } = resolveFactors(timeRange, filters)
  return {
    onlineUsers: Math.round(1320 * time * region),
    currentOrders: Math.round(486 * time * pile * region),
    workingPiles: Math.round(3180 * time * pile * region),
    faultReports: Math.round(23 * Math.max(time, 1) * pile * region)
  }
}

// 图表数据
export function getMockChartData(timeRange, filters = {}) {
  const factors = resolveFactors(timeRange, filters)
  const { time, pile } = factors
  const { xLabels } = RANGES[timeRange] || RANGES.month
  const count = xLabels.length

  const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都']
  const months = ['1月', '2月', '3月', '4月', '5月', '6月']

  return {
    region: {
      xLabels: cities,
      public: [1250, 1380, 980, 1120, 760, 890].map((v) => Math.round(v * time)),
      private: [680, 720, 560, 620, 450, 520].map((v) => Math.round(v * time))
    },
    transaction: {
      xLabels,
      orders: genSeries(count, 160, 60).map((v) => Math.round(v * pile)),
      amount: genSeries(count, 48000, 9000, 0.5).map((v) => Math.round(v * time * pile))
    },
    userGrowth: {
      xLabels,
      newUsers: genSeries(count, 620, 280).map((v) => Math.round(v * time)),
      activeUsers: genSeries(count, 2100, 800, 1.2).map((v) => Math.round(v * time))
    },
    certification: {
      xLabels: months,
      carOwner: genSeries(6, 820, 140).map((v) => Math.round(v * time)),
      privatePile: genSeries(6, 430, 90, 0.8).map((v) => Math.round(v * time))
    },
    proportion: {
      payment: [
        { value: 4820, name: '微信支付' },
        { value: 3360, name: '支付宝' },
        { value: 2150, name: '平台余额' },
        { value: 980, name: '其他' }
      ],
      sharing: [
        { value: 5230, name: '私桩共享' },
        { value: 3680, name: '公共充电' },
        { value: 1450, name: '其他' }
      ],
      v2v: [
        { value: 2380, name: 'V2V交易' },
        { value: 7420, name: '常规交易' }
      ]
    },
    heatmap: genHeatmapData()
  }
}
