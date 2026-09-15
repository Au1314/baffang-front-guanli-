<template>
  <div class="data-screen-container">
    <!-- 顶部标题区域 -->
  <div class="screen-header">
    <div class="header-title">
      <span class="title-text">新能源汽车充电管理平台</span>
      <span class="title-sub">数据中心</span>
    </div>
    <div class="header-right">
      <el-button 
        type="primary" 
        icon="Refresh" 
        :loading="manualRefreshLoading"
        @click="handleManualRefresh"
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

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-content">
        <el-icon class="loading-icon"><Loading /></el-icon>
        <span class="loading-text">数据加载中...</span>
      </div>
    </div>

    <!-- 核心指标区域 -->
    <div class="core-metrics">
      <el-row :gutter="20">
        <el-col :span="4">
          <div class="metric-card">
            <div class="metric-icon user-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ metricsData.totalUsers.toLocaleString() }}</div>
              <div class="metric-label">用户总数</div>
              <div class="metric-trend up">
                <el-icon><Top /></el-icon>
                <span>+12.5%</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="metric-card">
            <div class="metric-icon active-icon">
              <el-icon><DataLine /></el-icon>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ metricsData.dailyActive.toLocaleString() }}</div>
              <div class="metric-label">日活用户</div>
              <div class="metric-trend up">
                <el-icon><Top /></el-icon>
                <span>+8.3%</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="metric-card">
            <div class="metric-icon monthly-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ metricsData.monthlyActive.toLocaleString() }}</div>
              <div class="metric-label">月活用户</div>
              <div class="metric-trend up">
                <el-icon><Top /></el-icon>
                <span>+15.2%</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="metric-card">
            <div class="metric-icon new-icon">
              <el-icon><Plus /></el-icon>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ metricsData.newUsers.toLocaleString() }}</div>
              <div class="metric-label">新增用户</div>
              <div class="metric-trend up">
                <el-icon><Top /></el-icon>
                <span>+23.1%</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="metric-card">
            <div class="metric-icon car-icon">
              <el-icon><Van /></el-icon>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ metricsData.carOwnerCert.toLocaleString() }}</div>
              <div class="metric-label">车主认证量</div>
              <div class="metric-trend up">
                <el-icon><Top /></el-icon>
                <span>+18.7%</span>
              </div>
            </div>
          </div>
        </el-col>
        <el-col :span="4">
          <div class="metric-card">
            <div class="metric-icon charge-icon">
              <el-icon><Lightning /></el-icon>
            </div>
            <div class="metric-content">
              <div class="metric-value">{{ metricsData.privatePileCert.toLocaleString() }}</div>
              <div class="metric-label">私桩认证量</div>
              <div class="metric-trend up">
                <el-icon><Top /></el-icon>
                <span>+9.4%</span>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 时间筛选器 -->
            <div class="time-filter">
              <el-radio-group v-model="timeRange" size="default" @change="handleTimeRangeChange">
                <el-radio-button label="day">日</el-radio-button>
                <el-radio-button label="week">周</el-radio-button>
                <el-radio-button label="month">月</el-radio-button>
                <el-radio-button label="year">年</el-radio-button>
              </el-radio-group>
            </div>

    <!-- 图表区域 -->
    <div class="charts-container">
      <!-- 第一行图表 -->
      <el-row :gutter="20" class="chart-row">
        <!-- 用户增长趋势 -->
        <el-col :span="8">
          <div class="chart-card">
            <div class="card-header">
              <span class="card-title">用户增长趋势</span>
              <div class="card-legend">
                <span class="legend-item"><span class="dot blue"></span>新增用户</span>
                <span class="legend-item"><span class="dot green"></span>活跃用户</span>
              </div>
            </div>
            <div ref="userGrowthChart" class="chart-content"></div>
          </div>
        </el-col>

        <!-- 认证量统计 -->
        <el-col :span="8">
          <div class="chart-card">
            <div class="card-header">
              <span class="card-title">认证量统计</span>
              <div class="card-legend">
                <span class="legend-item"><span class="dot blue"></span>车主认证</span>
                <span class="legend-item"><span class="dot yellow"></span>私桩认证</span>
              </div>
            </div>
            <div ref="certificationChart" class="chart-content"></div>
          </div>
        </el-col>

        <!-- 支付方式占比 -->
        <el-col :span="8">
          <div class="chart-card">
            <div class="card-header">
              <span class="card-title">支付方式占比</span>
            </div>
            <div ref="paymentChart" class="chart-content"></div>
          </div>
        </el-col>
      </el-row>

      <!-- 第二行图表 -->
      <el-row :gutter="20" class="chart-row">
        <!-- 交易数据分析 -->
        <el-col :span="12">
          <div class="chart-card">
            <div class="card-header">
              <span class="card-title">交易数据分析</span>
              <div class="card-legend">
                <span class="legend-item"><span class="dot blue"></span>日均订单量</span>
                <span class="legend-item"><span class="dot green"></span>客单价(元)</span>
              </div>
            </div>
            <div ref="transactionChart" class="chart-content"></div>
          </div>
        </el-col>

        <!-- V2V交易与私桩共享 -->
        <el-col :span="6">
          <div class="chart-card">
            <div class="card-header">
              <span class="card-title">V2V交易占比</span>
            </div>
            <div ref="v2vChart" class="chart-content-small"></div>
            <div class="chart-value">
              <span class="value-num">23.5%</span>
              <span class="value-label">环比增长</span>
            </div>
          </div>
        </el-col>

        <!-- 私桩共享订单占比 -->
        <el-col :span="6">
          <div class="chart-card">
            <div class="card-header">
              <span class="card-title">私桩共享占比</span>
            </div>
            <div ref="sharingChart" class="chart-content-small"></div>
            <div class="chart-value">
              <span class="value-num">18.2%</span>
              <span class="value-label">环比增长</span>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 第三行图表 -->
      <el-row :gutter="20" class="chart-row">
        <!-- 充电桩分布热力图 -->
        <el-col :span="16">
          <div class="chart-card">
            <div class="card-header">
              <span class="card-title">充电桩分布热力图</span>
              <div class="filter-tags">
                <el-tag type="primary" size="small">公桩</el-tag>
                <el-tag type="success" size="small">私桩</el-tag>
              </div>
            </div>
            <div ref="pileHeatmap" class="chart-content-large"></div>
          </div>
        </el-col>

        <!-- 区域统计 -->
        <el-col :span="8">
          <div class="chart-card">
            <div class="card-header">
              <span class="card-title">区域充电桩统计</span>
            </div>
            <div ref="regionChart" class="chart-content"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 底部实时数据 -->
    <div class="realtime-data">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="realtime-card">
            <div class="realtime-icon online-icon">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="realtime-info">
              <div class="realtime-value">{{ realtimeData.onlineUsers.toLocaleString() }}</div>
              <div class="realtime-label">当前在线用户</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="realtime-card">
            <div class="realtime-icon order-icon">
              <el-icon><ShoppingCart /></el-icon>
            </div>
            <div class="realtime-info">
              <div class="realtime-value">{{ realtimeData.currentOrders.toLocaleString() }}</div>
              <div class="realtime-label">当前预约量</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="realtime-card">
            <div class="realtime-icon pile-icon">
              <el-icon><Lightning /></el-icon>
            </div>
            <div class="realtime-info">
              <div class="realtime-value">{{ realtimeData.workingPiles.toLocaleString() }}</div>
              <div class="realtime-label">正在充电桩数</div>
            </div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="realtime-card">
            <div class="realtime-icon fault-icon">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="realtime-info">
              <div class="realtime-value">{{ realtimeData.faultReports }}</div>
              <div class="realtime-label">今日故障上报</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import echarts from '@/utils/echarts'
import { 
  User, DataLine, Calendar, Plus, Van, Lightning,
  Top, Connection, ShoppingCart, Warning, Refresh, Loading
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'

const currentTime = ref('')
const currentDate = ref('')
const timeRange = ref('month')
const loading = ref(false)
const manualRefreshLoading = ref(false)

// 自动刷新定时器（3分钟）
const refreshInterval = ref(null)

// 核心指标数据 - 包含模板中使用的所有字段
const metricsData = reactive({
  totalUsers: 0,
  dailyActive: 0,
  monthlyActive: 0,
  newUsers: 0,
  privatePileCert: 0,
  carOwnerCert: 0
})



// 实时数据
const realtimeData = reactive({
  onlineUsers: 0,
  currentOrders: 0,
  workingPiles: 0,
  faultReports: 0
})

// 图表引用
const userGrowthChart = ref(null)
const certificationChart = ref(null)
const paymentChart = ref(null)
const transactionChart = ref(null)
const v2vChart = ref(null)
const sharingChart = ref(null)
const pileHeatmap = ref(null)
const regionChart = ref(null)

// 更新时间
const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  currentDate.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

// 初始化所有图表
const initCharts = () => {
  initUserGrowthChart()
  initCertificationChart()
  initPaymentChart()
  initTransactionChart()
  initV2vChart()
  initSharingChart()
  initPileHeatmap()
  initRegionChart()
  
  // 确保图表在窗口大小变化时正确调整
  window.addEventListener('resize', handleResize)
}

// 用户增长趋势图
const initUserGrowthChart = () => {
  const chart = echarts.init(userGrowthChart.value)
  const option = {
    tooltip: { 
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: 'rgba(106, 121, 133, 0.9)',
          color: '#fff',
          padding: [8, 12],
          borderRadius: 6
        }
      },
      backgroundColor: 'rgba(26, 32, 44, 0.9)',
      borderColor: 'rgba(66, 153, 225, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0' }
    },
    legend: { show: false },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
      axisLine: { lineStyle: { color: '#4a5568' } },
      axisLabel: { color: '#a0aec0' },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#a0aec0' },
      splitLine: { 
        lineStyle: { 
          color: '#2d3748',
          type: 'dashed'
        } 
      },
      axisTick: { show: false }
    },
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    animationDelay: function(idx) {
      return idx * 100
    },
    series: [
      {
        name: '新增用户',
        type: 'line',
        smooth: true,
        data: [320, 380, 420, 480, 520, 580, 620, 680, 720, 780, 820, 890],
        lineStyle: { 
          color: '#1e90ff', 
          width: 3,
          shadowColor: 'rgba(30, 144, 255, 0.5)',
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(30, 144, 255, 0.4)' },
            { offset: 1, color: 'rgba(30, 144, 255, 0.05)' }
          ])
        },
        itemStyle: { 
          color: '#1e90ff',
          borderColor: '#fff',
          borderWidth: 2,
          shadowColor: 'rgba(30, 144, 255, 0.8)',
          shadowBlur: 8
        },
        emphasis: {
          focus: 'series',
          lineStyle: {
            width: 5,
            color: '#36cfc9'
          },
          itemStyle: {
            color: '#36cfc9',
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 12
          }
        },
        symbol: 'circle',
        symbolSize: 8,
        symbolOffset: [0, -5]
      },
      {
        name: '活跃用户',
        type: 'line',
        smooth: true,
        data: [1200, 1380, 1520, 1680, 1820, 1980, 2150, 2320, 2480, 2650, 2820, 3000],
        lineStyle: { 
          color: '#36cfc9', 
          width: 3,
          shadowColor: 'rgba(54, 207, 201, 0.5)',
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(54, 207, 201, 0.4)' },
            { offset: 1, color: 'rgba(54, 207, 201, 0.05)' }
          ])
        },
        itemStyle: { 
          color: '#36cfc9',
          borderColor: '#fff',
          borderWidth: 2,
          shadowColor: 'rgba(54, 207, 201, 0.8)',
          shadowBlur: 8
        },
        emphasis: {
          focus: 'series',
          lineStyle: {
            width: 5,
            color: '#1e90ff'
          },
          itemStyle: {
            color: '#1e90ff',
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 12
          }
        },
        symbol: 'circle',
        symbolSize: 8,
        symbolOffset: [0, -5]
      }
    ]
  }
  chart.setOption(option)
}

// 认证量统计柱状图
const initCertificationChart = () => {
  const chart = echarts.init(certificationChart.value)
  const option = {
    tooltip: { 
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        label: {
          backgroundColor: 'rgba(106, 121, 133, 0.9)',
          color: '#fff',
          padding: [8, 12],
          borderRadius: 6
        }
      },
      backgroundColor: 'rgba(26, 32, 44, 0.9)',
      borderColor: 'rgba(66, 153, 225, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0' }
    },
    legend: { show: false },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月'],
      axisLine: { lineStyle: { color: '#4a5568' } },
      axisLabel: { color: '#a0aec0' },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#a0aec0' },
      splitLine: { 
        lineStyle: { 
          color: '#2d3748',
          type: 'dashed'
        } 
      },
      axisTick: { show: false }
    },
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    animationDelay: function(idx) {
      return idx * 100
    },
    series: [
      {
        name: '车主认证',
        type: 'bar',
        data: [680, 720, 780, 820, 890, 950],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#4299e1' },
            { offset: 1, color: '#3182ce' }
          ]),
          borderRadius: [4, 4, 0, 0],
          shadowColor: 'rgba(66, 153, 225, 0.5)',
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#63b3ed' },
              { offset: 1, color: '#4299e1' }
            ]),
            shadowBlur: 15
          }
        }
      },
      {
        name: '私桩认证',
        type: 'bar',
        data: [320, 360, 400, 450, 490, 520],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#36cfc9' },
            { offset: 1, color: '#28a745' }
          ]),
          borderRadius: [4, 4, 0, 0],
          shadowColor: 'rgba(54, 207, 201, 0.5)',
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#63e6e6' },
              { offset: 1, color: '#36cfc9' }
            ]),
            shadowBlur: 15
          }
        }
      }
    ]
  }
  chart.setOption(option)
}

// 支付方式占比饼图
const initPaymentChart = () => {
  const chart = echarts.init(paymentChart.value)
  const option = {
    tooltip: { 
      trigger: 'item', 
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: 'rgba(26, 32, 44, 0.9)',
      borderColor: 'rgba(66, 153, 225, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0' }
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#a0aec0' }
    },
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    series: [{
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['35%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#1a202c',
        borderWidth: 2,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowBlur: 10
      },
      label: { show: false },
      emphasis: {
        label: {
          show: true,
          fontSize: 16,
          fontWeight: 'bold',
          color: '#fff',
          shadowColor: 'rgba(0, 0, 0, 0.5)',
          shadowBlur: 5
        },
        itemStyle: {
          shadowColor: 'rgba(66, 153, 225, 0.8)',
          shadowBlur: 20
        }
      },
      labelLine: { show: false },
      data: [
        { value: 7820, name: '平台支付', itemStyle: { color: '#4299e1' } },
        { value: 2180, name: '线下支付', itemStyle: { color: '#36cfc9' } }
      ]
    }]
  }
  chart.setOption(option)
}

// 交易数据分析折线图
const initTransactionChart = () => {
  const chart = echarts.init(transactionChart.value)
  const option = {
    tooltip: { 
      trigger: 'axis', 
      axisPointer: { 
        type: 'cross',
        label: {
          backgroundColor: 'rgba(106, 121, 133, 0.9)',
          color: '#fff',
          padding: [8, 12],
          borderRadius: 6
        }
      },
      backgroundColor: 'rgba(26, 32, 44, 0.9)',
      borderColor: 'rgba(66, 153, 225, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0' }
    },
    legend: { 
      show: true, 
      textStyle: { color: '#a0aec0' }, 
      bottom: 0,
      icon: 'circle'
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      axisLine: { lineStyle: { color: '#4a5568' } },
      axisLabel: { color: '#a0aec0' },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '订单量',
        position: 'left',
        axisLine: { show: false },
        axisLabel: { color: '#a0aec0' },
        splitLine: { 
          lineStyle: { 
            color: '#2d3748',
            type: 'dashed'
          } 
        },
        axisTick: { show: false }
      },
      {
        type: 'value',
        name: '客单价',
        position: 'right',
        axisLine: { show: false },
        axisLabel: { color: '#a0aec0' },
        splitLine: { show: false },
        axisTick: { show: false }
      }
    ],
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    animationDelay: function(idx) {
      return idx * 100
    },
    series: [
      {
        name: '日均订单量',
        type: 'bar',
        data: [120, 132, 101, 134, 190, 230, 210],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#4299e1' },
            { offset: 1, color: '#3182ce' }
          ]),
          borderRadius: [4, 4, 0, 0],
          shadowColor: 'rgba(66, 153, 225, 0.5)',
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#63b3ed' },
              { offset: 1, color: '#4299e1' }
            ]),
            shadowBlur: 15
          }
        }
      },
      {
        name: '客单价(元)',
        type: 'line',
        yAxisIndex: 1,
        smooth: true,
        data: [45, 48, 46, 50, 52, 55, 53],
        lineStyle: { 
          color: '#36cfc9', 
          width: 3,
          shadowColor: 'rgba(54, 207, 201, 0.5)',
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        itemStyle: { 
          color: '#36cfc9',
          borderColor: '#fff',
          borderWidth: 2,
          shadowColor: 'rgba(54, 207, 201, 0.8)',
          shadowBlur: 8
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(54, 207, 201, 0.4)' },
            { offset: 1, color: 'rgba(54, 207, 201, 0.05)' }
          ])
        },
        emphasis: {
          focus: 'series',
          lineStyle: {
            width: 5,
            color: '#1e90ff'
          },
          itemStyle: {
            color: '#1e90ff',
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 12
          }
        },
        symbol: 'circle',
        symbolSize: 8,
        symbolOffset: [0, -5]
      }
    ]
  }
  chart.setOption(option)
}

// V2V交易占比饼图
const initV2vChart = () => {
  const chart = echarts.init(v2vChart.value)
  const option = {
    tooltip: { 
      trigger: 'item', 
      formatter: '{b}: {d}%',
      backgroundColor: 'rgba(26, 32, 44, 0.9)',
      borderColor: 'rgba(66, 153, 225, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0' }
    },
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    series: [{
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8, 
        borderColor: '#1a202c', 
        borderWidth: 2,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowBlur: 10
      },
      label: { show: false },
      emphasis: {
        label: { show: false },
        itemStyle: {
          shadowColor: 'rgba(66, 153, 225, 0.8)',
          shadowBlur: 20
        }
      },
      labelLine: { show: false },
      data: [
        { value: 235, name: 'V2V交易', itemStyle: { color: '#4299e1' } },
        { value: 765, name: '其他交易', itemStyle: { color: '#2d3748' } }
      ]
    }]
  }
  chart.setOption(option)
}

// 私桩共享占比饼图
const initSharingChart = () => {
  const chart = echarts.init(sharingChart.value)
  const option = {
    tooltip: { 
      trigger: 'item', 
      formatter: '{b}: {d}%',
      backgroundColor: 'rgba(26, 32, 44, 0.9)',
      borderColor: 'rgba(66, 153, 225, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0' }
    },
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    series: [{
      type: 'pie',
      radius: ['50%', '75%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 8, 
        borderColor: '#1a202c', 
        borderWidth: 2,
        shadowColor: 'rgba(0, 0, 0, 0.3)',
        shadowBlur: 10
      },
      label: { show: false },
      emphasis: {
        label: { show: false },
        itemStyle: {
          shadowColor: 'rgba(54, 207, 201, 0.8)',
          shadowBlur: 20
        }
      },
      labelLine: { show: false },
      data: [
        { value: 182, name: '私桩共享', itemStyle: { color: '#36cfc9' } },
        { value: 818, name: '普通订单', itemStyle: { color: '#2d3748' } }
      ]
    }]
  }
  chart.setOption(option)
}

// 充电桩分布热力图
const initPileHeatmap = () => {
  const chart = echarts.init(pileHeatmap.value)
  const hours = ['12a', '2a', '4a', '6a', '8a', '10a', '12p', '2p', '4p', '6p', '8p', '10p']
  const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
  const data = [[0,0,5],[0,1,1],[0,2,0],[0,3,0],[0,4,0],[0,5,0],[0,6,0],[0,7,0],[0,8,0],[0,9,0],[0,10,0],[0,11,2],[0,12,4],[0,13,1],[0,14,1],[0,15,3],[0,16,4],[0,17,6],[0,18,4],[0,19,4],[0,20,3],[0,21,3],[0,22,2],[0,23,5],[1,0,7],[1,1,0],[1,2,0],[1,3,0],[1,4,0],[1,5,0],[1,6,0],[1,7,0],[1,8,0],[1,9,0],[1,10,5],[1,11,2],[1,12,2],[1,13,6],[1,14,9],[1,15,11],[1,16,6],[1,17,7],[1,18,8],[1,19,12],[1,20,5],[1,21,5],[1,22,7],[1,23,2],[2,0,1],[2,1,1],[2,2,0],[2,3,0],[2,4,0],[2,5,0],[2,6,0],[2,7,0],[2,8,0],[2,9,0],[2,10,3],[2,11,2],[2,12,1],[2,13,9],[2,14,8],[2,15,10],[2,16,6],[2,17,5],[2,18,5],[2,19,5],[2,20,7],[2,21,4],[2,22,2],[2,23,4],[3,0,7],[3,1,3],[3,2,0],[3,3,0],[3,4,0],[3,5,0],[3,6,0],[3,7,0],[3,8,1],[3,9,0],[3,10,5],[3,11,4],[3,12,7],[3,13,14],[3,14,13],[3,15,12],[3,16,9],[3,17,5],[3,18,5],[3,19,10],[3,20,6],[3,21,4],[3,22,4],[3,23,1],[4,0,1],[4,1,3],[4,2,0],[4,3,0],[4,4,0],[4,5,1],[4,6,0],[4,7,0],[4,8,0],[4,9,2],[4,10,4],[4,11,4],[4,12,2],[4,13,4],[4,14,4],[4,15,14],[4,16,12],[4,17,1],[4,18,8],[4,19,5],[4,20,3],[4,21,7],[4,22,3],[4,23,0],[5,0,2],[5,1,1],[5,2,0],[5,3,3],[5,4,0],[5,5,0],[5,6,0],[5,7,0],[5,8,2],[5,9,0],[5,10,4],[5,11,1],[5,12,5],[5,13,10],[5,14,5],[5,15,7],[5,16,11],[5,17,6],[5,18,0],[5,19,5],[5,20,3],[5,21,4],[5,22,2],[5,23,0],[6,0,1],[6,1,0],[6,2,0],[6,3,0],[6,4,0],[6,5,0],[6,6,0],[6,7,0],[6,8,0],[6,9,0],[6,10,1],[6,11,0],[6,12,2],[6,13,1],[6,14,3],[6,15,4],[6,16,0],[6,17,0],[6,18,0],[6,19,0],[6,20,1],[6,21,2],[6,22,2],[6,23,6]]
  
  const option = {
    tooltip: { 
      position: 'top',
      backgroundColor: 'rgba(26, 32, 44, 0.9)',
      borderColor: 'rgba(66, 153, 225, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0' }
    },
    grid: { left: '10%', right: '10%', bottom: '15%', top: '10%' },
    xAxis: {
      type: 'category',
      data: hours,
      splitArea: { 
        show: true,
        areaStyle: {
          color: ['rgba(66, 153, 225, 0.05)', 'rgba(66, 153, 225, 0.02)']
        }
      },
      axisLine: { lineStyle: { color: '#4a5568' } },
      axisLabel: { color: '#a0aec0' },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'category',
      data: days,
      splitArea: { 
        show: true,
        areaStyle: {
          color: ['rgba(66, 153, 225, 0.05)', 'rgba(66, 153, 225, 0.02)']
        }
      },
      axisLine: { lineStyle: { color: '#4a5568' } },
      axisLabel: { color: '#a0aec0' },
      axisTick: { show: false }
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      textStyle: { color: '#a0aec0' },
      inRange: { 
        color: ['#1a202c', '#2d3748', '#4299e1', '#36cfc9', '#ecc94b'] 
      },
      itemHeight: 15,
      itemWidth: 100
    },
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    series: [{
      type: 'heatmap',
      data: data,
      label: { show: false },
      emphasis: { 
        itemStyle: { 
          shadowBlur: 15, 
          shadowColor: 'rgba(66, 153, 225, 0.8)' 
        }
      }
    }]
  }
  chart.setOption(option)
}

// 区域统计柱状图
const initRegionChart = () => {
  const chart = echarts.init(regionChart.value)
  const option = {
    tooltip: { 
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
        label: {
          backgroundColor: 'rgba(106, 121, 133, 0.9)',
          color: '#fff',
          padding: [8, 12],
          borderRadius: 6
        }
      },
      backgroundColor: 'rgba(26, 32, 44, 0.9)',
      borderColor: 'rgba(66, 153, 225, 0.3)',
      borderWidth: 1,
      textStyle: { color: '#e2e8f0' }
    },
    legend: { 
      show: true, 
      textStyle: { color: '#a0aec0' }, 
      bottom: 0,
      icon: 'circle'
    },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['北京', '上海', '广州', '深圳', '杭州', '成都'],
      axisLine: { lineStyle: { color: '#4a5568' } },
      axisLabel: { color: '#a0aec0', rotate: 30 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisLabel: { color: '#a0aec0' },
      splitLine: { 
        lineStyle: { 
          color: '#2d3748',
          type: 'dashed'
        } 
      },
      axisTick: { show: false }
    },
    animation: true,
    animationDuration: 1500,
    animationEasing: 'cubicOut',
    animationDelay: function(idx) {
      return idx * 100
    },
    series: [
      {
        name: '公桩数量',
        type: 'bar',
        data: [1250, 1380, 980, 1120, 760, 890],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#4299e1' },
            { offset: 1, color: '#3182ce' }
          ]),
          borderRadius: [4, 4, 0, 0],
          shadowColor: 'rgba(66, 153, 225, 0.5)',
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#63b3ed' },
              { offset: 1, color: '#4299e1' }
            ]),
            shadowBlur: 15
          }
        }
      },
      {
        name: '私桩数量',
        type: 'bar',
        data: [680, 720, 560, 620, 450, 520],
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#36cfc9' },
            { offset: 1, color: '#28a745' }
          ]),
          borderRadius: [4, 4, 0, 0],
          shadowColor: 'rgba(54, 207, 201, 0.5)',
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#63e6e6' },
              { offset: 1, color: '#36cfc9' }
            ]),
            shadowBlur: 15
          }
        }
      }
    ]
  }
  chart.setOption(option)
}

// 实时数据更新已移除，改为从API获取真实数据

// 时间更新定时器
const timeInterval = setInterval(updateTime, 1000)

// 从API获取平台统计数据
const fetchPlatformStats = async () => {
  try {
    loading.value = true
    // 尝试传递时间范围参数
    const response = await authApi.getPlatformStats({ timeRange: timeRange.value })
    if (response) {
      // 更新核心指标数据
      metricsData.totalUsers = response.totalUsers || 0
      metricsData.dailyActive = response.dailyActive || 0
      metricsData.monthlyActive = response.monthlyActive || 0
      metricsData.newUsers = response.newUsers || 0
      metricsData.privatePileCert = response.privatePileCert || 0
      metricsData.carOwnerCert = response.carOwnerCert || 0
      
      // 更新实时数据
      realtimeData.onlineUsers = response.onlineUsers || 0
      realtimeData.currentOrders = response.currentOrders || 0
      realtimeData.workingPiles = response.workingPiles || 0
      realtimeData.faultReports = response.faultReports || 0
    }
  } catch (error) {
    console.error('获取平台统计数据失败:', error)
    ElMessage.error('获取平台统计数据失败')
  } finally {
    loading.value = false
  }
}

// 从API获取客服统计数据
const fetchCustomerServiceStats = async () => {
  try {
    // 尝试传递时间范围参数
    const response = await authApi.getCustomerServiceStatsOverview({ timeRange: timeRange.value })
    if (response) {
      // 这里可以更新客服相关的图表数据
      // 例如，更新用户增长趋势图中的数据
      if (userGrowthChart.value) {
        const chart = echarts.getInstanceByDom(userGrowthChart.value)
        if (chart) {
          // 假设response中有用户增长数据
          const newUserData = response.newUsers || []
          const activeUserData = response.activeUsers || []
          
          if (newUserData.length > 0 && activeUserData.length > 0) {
            chart.setOption({
              series: [
                {
                  name: '新增用户',
                  data: newUserData
                },
                {
                  name: '活跃用户',
                  data: activeUserData
                }
              ]
            })
          }
        }
      }
    }
  } catch (error) {
    console.error('获取客服统计数据失败:', error)
    // 不显示错误提示，避免影响用户体验
  }
}

// 从API获取其他统计数据
const fetchOtherStats = async () => {
  try {
    // 并行获取其他统计数据，尝试传递时间范围参数
    const [emergencyStats, forumStats, auditStats] = await Promise.all([
      authApi.getEmergencyStatistics({ timeRange: timeRange.value }),
      authApi.getForumStatistics({ timeRange: timeRange.value }),
      authApi.getAuditStatistics({ timeRange: timeRange.value })
    ])
    
    
    // 更新紧急响应相关图表数据
    if (emergencyStats) {
      // 这里可以更新交易数据分析图表
      if (transactionChart.value) {
        const chart = echarts.getInstanceByDom(transactionChart.value)
        if (chart) {
          // 假设emergencyStats中有相关数据
          const orderData = emergencyStats.dailyOrders || []
          const priceData = emergencyStats.averagePrice || []
          
          if (orderData.length > 0 && priceData.length > 0) {
            chart.setOption({
              series: [
                {
                  name: '日均订单量',
                  data: orderData
                },
                {
                  name: '客单价(元)',
                  data: priceData
                }
              ]
            })
          }
        }
      }
    }
    
    // 更新论坛相关图表数据
    if (forumStats) {
      // 这里可以更新支付方式占比图表
      if (paymentChart.value) {
        const chart = echarts.getInstanceByDom(paymentChart.value)
        if (chart) {
          // 假设forumStats中有支付方式数据
          const paymentData = forumStats.paymentMethods || [
            { value: 7820, name: '平台支付' },
            { value: 2180, name: '线下支付' }
          ]
          
          chart.setOption({
            series: [{
              data: paymentData.map(item => ({
                ...item,
                itemStyle: {
                  color: item.name === '平台支付' ? '#4299e1' : '#48bb78'
                }
              }))
            }]
          })
        }
      }
    }
    
    // 更新审核相关图表数据
    if (auditStats) {
      // 这里可以更新认证量统计图表
      if (certificationChart.value) {
        const chart = echarts.getInstanceByDom(certificationChart.value)
        if (chart) {
          // 假设auditStats中有认证数据
          const carOwnerData = auditStats.carOwnerCert || []
          const privatePileData = auditStats.privatePileCert || []
          
          if (carOwnerData.length > 0 && privatePileData.length > 0) {
            chart.setOption({
              series: [
                {
                  name: '车主认证',
                  data: carOwnerData
                },
                {
                  name: '私桩认证',
                  data: privatePileData
                }
              ]
            })
          }
        }
      }
    }
  } catch (error) {
    console.error('获取其他统计数据失败:', error)
    // 不显示错误提示，避免影响用户体验
  }
}

// 监听时间范围变化
const handleTimeRangeChange = () => {
  // 根据时间范围更新数据和图表
  updateChartDataByTimeRange()
  ElMessage.success(`数据已切换到${timeRange.value === 'day' ? '日' : timeRange.value === 'week' ? '周' : timeRange.value === 'month' ? '月' : '年'}视图`)
}

// 根据时间范围更新图表数据
const updateChartDataByTimeRange = async () => {
  // 这里可以根据时间范围重新请求数据或更新图表
  // 重新获取数据，确保一个接口失败不影响其他接口
  try {
    await fetchPlatformStats()
  } catch (error) {
    console.error('获取平台统计数据失败:', error)
    // 不显示错误提示，避免影响用户体验
  }
  
  try {
    await fetchCustomerServiceStats()
  } catch (error) {
    console.error('获取客服统计数据失败:', error)
    // 不显示错误提示，避免影响用户体验
  }
  
  try {
    await fetchOtherStats()
  } catch (error) {
    console.error('获取其他统计数据失败:', error)
    // 不显示错误提示，避免影响用户体验
  }
  
  // 重新初始化图表
  initCharts()
}

// 数据刷新
const refreshData = async () => {
  // 获取最新数据，确保一个接口失败不影响其他接口
  try {
    await fetchPlatformStats()
  } catch (error) {
    console.error('获取平台统计数据失败:', error)
    // 不显示错误提示，避免影响用户体验
  }
  
  try {
    await fetchCustomerServiceStats()
  } catch (error) {
    console.error('获取客服统计数据失败:', error)
    // 不显示错误提示，避免影响用户体验
  }
  
  try {
    await fetchOtherStats()
  } catch (error) {
    console.error('获取其他统计数据失败:', error)
    // 不显示错误提示，避免影响用户体验
  }
  
  // 更新图表
  initCharts()
}

// 手动刷新数据
const handleManualRefresh = async () => {
  try {
    manualRefreshLoading.value = true
    await refreshData()
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('手动刷新数据失败:', error)
    ElMessage.error('数据刷新失败')
  } finally {
    manualRefreshLoading.value = false
  }
}

// 窗口大小改变时调整图表
const handleResize = () => {
  const charts = [
    userGrowthChart, certificationChart, paymentChart,
    transactionChart, v2vChart, sharingChart, pileHeatmap, regionChart
  ]
  charts.forEach(chartRef => {
    if (chartRef.value) {
      echarts.getInstanceByDom(chartRef.value)?.resize()
    }
  })
}



onMounted(async () => {
  updateTime()
  // 获取初始数据
  await fetchPlatformStats()
  await fetchCustomerServiceStats()
  await fetchOtherStats()
  await nextTick()
  initCharts()
  window.addEventListener('resize', handleResize)
  
  // 启动3分钟自动刷新
  refreshInterval.value = setInterval(refreshData, 3 * 60 * 1000)
})

onUnmounted(() => {
  clearInterval(timeInterval)
  clearInterval(refreshInterval.value)
  window.removeEventListener('resize', handleResize)
  
  // 销毁所有图表实例
  const charts = [
    userGrowthChart, certificationChart, paymentChart,
    transactionChart, v2vChart, sharingChart, pileHeatmap, regionChart
  ]
  charts.forEach(chartRef => {
    if (chartRef.value) {
      echarts.getInstanceByDom(chartRef.value)?.dispose()
    }
  })
})
</script>

<style scoped>
.data-screen-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f1724 0%, #1a202c 50%, #0f1724 100%);
  padding: 20px;
  color: #e2e8f0;
}

/* 顶部标题区域 */
.screen-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background: linear-gradient(90deg, rgba(66, 153, 225, 0.1), transparent);
  border-bottom: 1px solid rgba(66, 153, 225, 0.3);
  margin-bottom: 20px;
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
  font-size: 32px;
  font-weight: 800;
  background: linear-gradient(90deg, #4299e1, #36cfc9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.title-sub {
  font-size: 18px;
  color: #718096;
  font-weight: 500;
}

.header-time {
  text-align: right;
}

.time-text {
  font-size: 28px;
  font-weight: 700;
  color: #4299e1;
  letter-spacing: 1px;
}

.date-text {
  display: block;
  font-size: 16px;
  color: #718096;
  font-weight: 400;
}

/* 核心指标区域 */
.core-metrics {
  margin-bottom: 20px;
}

.metric-card {
  background: linear-gradient(135deg, rgba(66, 153, 225, 0.1), rgba(66, 153, 225, 0.05));
  border: 1px solid rgba(66, 153, 225, 0.3);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 4px 20px rgba(66, 153, 225, 0.15);
  transition: all 0.3s ease;
}

.metric-card:hover {
  box-shadow: 0 6px 25px rgba(66, 153, 225, 0.25);
  transform: translateY(-2px);
  border-color: rgba(66, 153, 225, 0.5);
}

.metric-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-icon .el-icon {
  font-size: 24px;
  color: white;
}

.user-icon { background: linear-gradient(135deg, #4299e1, #3182ce); }
.active-icon { background: linear-gradient(135deg, #48bb78, #38a169); }
.monthly-icon { background: linear-gradient(135deg, #9f7aea, #805ad5); }
.new-icon { background: linear-gradient(135deg, #ed8936, #dd6b20); }
.car-icon { background: linear-gradient(135deg, #f56565, #e53e3e); }
.charge-icon { background: linear-gradient(135deg, #ecc94b, #d69e2e); }

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 30px;
  font-weight: 700;
  color: #fff;
  line-height: 1.2;
  letter-spacing: 0.5px;
}

.metric-label {
  font-size: 16px;
  color: #a0aec0;
  margin-top: 4px;
  font-weight: 500;
}

.metric-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  margin-top: 4px;
  font-weight: 500;
}

.metric-trend.up { color: #48bb78; }
.metric-trend.down { color: #f56565; }

/* 时间筛选器 */
.time-filter {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.time-filter :deep(.el-radio-button__inner) {
  background: rgba(66, 153, 225, 0.1);
  border: 1px solid rgba(66, 153, 225, 0.3);
  color: #a0aec0;
}

.time-filter :deep(.el-radio-button__original-checked + .el-radio-button__inner) {
  background: #4299e1;
  border-color: #4299e1;
  color: white;
}

/* 图表区域 */
.charts-container {
  margin-bottom: 20px;
}

.chart-row {
  margin-bottom: 20px;
}

.chart-card {
  background: rgba(26, 32, 44, 0.9);
  border: 1px solid rgba(66, 153, 225, 0.3);
  border-radius: 12px;
  padding: 20px;
  height: 100%;
  box-shadow: 0 4px 20px rgba(66, 153, 225, 0.15);
  transition: all 0.3s ease;
}

.chart-card:hover {
  box-shadow: 0 6px 25px rgba(66, 153, 225, 0.25);
  border-color: rgba(66, 153, 225, 0.5);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.5px;
}

.card-legend {
  display: flex;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #a0aec0;
  font-weight: 500;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot.blue { background: #4299e1; }
.dot.green { background: #48bb78; }
.dot.yellow { background: #ecc94b; }

.filter-tags {
  display: flex;
  gap: 8px;
}

.chart-content {
  height: 250px;
}

.chart-content-small {
  height: 150px;
}

.chart-content-large {
  height: 300px;
}

.chart-value {
  text-align: center;
  margin-top: 10px;
}

.value-num {
  font-size: 32px;
  font-weight: 700;
  color: #48bb78;
  display: block;
  letter-spacing: 0.5px;
}

.value-label {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

/* 实时数据区域 */
.realtime-data {
  background: rgba(26, 32, 44, 0.8);
  border: 1px solid rgba(66, 153, 225, 0.2);
  border-radius: 12px;
  padding: 20px;
}

.realtime-card {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px;
  background: linear-gradient(135deg, rgba(66, 153, 225, 0.1), rgba(66, 153, 225, 0.05));
  border: 1px solid rgba(66, 153, 225, 0.3);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(66, 153, 225, 0.15);
  transition: all 0.3s ease;
}

.realtime-card:hover {
  box-shadow: 0 6px 25px rgba(66, 153, 225, 0.25);
  transform: translateY(-2px);
  border-color: rgba(66, 153, 225, 0.5);
}

.realtime-icon {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.realtime-icon .el-icon {
  font-size: 22px;
  color: white;
}

.online-icon { background: linear-gradient(135deg, #4299e1, #3182ce); }
.order-icon { background: linear-gradient(135deg, #48bb78, #38a169); }
.pile-icon { background: linear-gradient(135deg, #ecc94b, #d69e2e); }
.fault-icon { background: linear-gradient(135deg, #f56565, #e53e3e); }

.realtime-value {
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  letter-spacing: 0.5px;
}

.realtime-label {
  font-size: 16px;
  color: #a0aec0;
  font-weight: 500;
}

/* 加载状态 */
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 36, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(5px);
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px;
  background: rgba(26, 32, 44, 0.95);
  border: 1px solid rgba(66, 153, 225, 0.3);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(66, 153, 225, 0.2);
}

.loading-icon {
  font-size: 48px;
  color: #4299e1;
  animation: spin 2s linear infinite;
}

.loading-text {
  font-size: 18px;
  color: #a0aec0;
  font-weight: 500;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 250px;
  gap: 15px;
  color: #718096;
}

.empty-icon {
  font-size: 48px;
  color: #4a5568;
}

.empty-text {
  font-size: 16px;
  font-weight: 500;
}

.empty-desc {
  font-size: 14px;
  color: #718096;
  text-align: center;
  max-width: 300px;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .title-text {
    font-size: 28px;
  }
  
  .time-text {
    font-size: 24px;
  }
  
  .metric-value {
    font-size: 26px;
  }
  
  .card-title {
    font-size: 16px;
  }
  
  .value-num {
    font-size: 28px;
  }
  
  .realtime-value {
    font-size: 24px;
  }
}

@media screen and (max-width: 992px) {
  .data-screen-container {
    padding: 15px;
  }
  
  .screen-header {
    padding: 15px 20px;
  }
  
  .title-text {
    font-size: 24px;
  }
  
  .title-sub {
    font-size: 16px;
  }
  
  .time-text {
    font-size: 20px;
  }
  
  .date-text {
    font-size: 14px;
  }
  
  .metric-card {
    padding: 15px;
  }
  
  .metric-value {
    font-size: 24px;
  }
  
  .metric-label {
    font-size: 14px;
  }
  
  .chart-card {
    padding: 15px;
  }
  
  .chart-content {
    height: 200px;
  }
  
  .chart-content-large {
    height: 250px;
  }
  
  .realtime-card {
    padding: 12px;
  }
  
  .realtime-value {
    font-size: 22px;
  }
  
  .realtime-label {
    font-size: 14px;
  }
}

@media screen and (max-width: 768px) {
  .screen-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .metric-card {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
  
  .chart-content {
    height: 180px;
  }
  
  .chart-content-large {
    height: 200px;
  }
  
  .realtime-card {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }
}

@media screen and (max-width: 576px) {
  .data-screen-container {
    padding: 10px;
  }
  
  .title-text {
    font-size: 20px;
  }
  
  .title-sub {
    font-size: 14px;
  }
  
  .time-text {
    font-size: 18px;
  }
  
  .metric-value {
    font-size: 20px;
  }
  
  .card-title {
    font-size: 14px;
  }
  
  .value-num {
    font-size: 24px;
  }
  
  .realtime-value {
    font-size: 20px;
  }
  
  .chart-content {
    height: 150px;
  }
  
  .chart-content-large {
    height: 180px;
  }
}
</style>