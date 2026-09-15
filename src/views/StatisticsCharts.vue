<template>
  <div class="statistics-charts">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="10" animated />
    </div>
    
    <!-- 图表内容 -->
    <div v-else>
      <el-row :gutter="20" style="margin-top: 20px">
        <!-- 私桩分布数据 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>私桩分布数据</span>
              </div>
            </template>
            <div ref="pileDistributionChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <!-- 交易数据 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>交易数据</span>
              </div>
            </template>
            <div ref="transactionChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 新增图表行 -->
      <el-row :gutter="20" style="margin-top: 20px">
        <!-- 用户增长趋势 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>用户增长趋势</span>
              </div>
            </template>
            <div ref="userGrowthChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <!-- 客服工作概览 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>客服工作概览</span>
              </div>
            </template>
            <div ref="customerServiceChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 新增图表行 -->
      <el-row :gutter="20" style="margin-top: 20px">
        <!-- 紧急响应统计 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>紧急响应统计</span>
              </div>
            </template>
            <div ref="emergencyChart" class="chart-container"></div>
          </el-card>
        </el-col>
        <!-- 论坛统计 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>论坛统计</span>
              </div>
            </template>
            <div ref="forumChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 新增图表行 -->
      <el-row :gutter="20" style="margin-top: 20px">
        <!-- 审核统计 -->
        <el-col :span="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>审核统计</span>
              </div>
            </template>
            <div ref="auditChart" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import echarts from '@/utils/echarts'
import { authApi } from '@/api/auth'

// 图表引用
const pileDistributionChart = ref(null)
const transactionChart = ref(null)
const userGrowthChart = ref(null)
const customerServiceChart = ref(null)
const emergencyChart = ref(null)
const forumChart = ref(null)
const auditChart = ref(null)

// 数据状态
const loading = ref(true)
const pileData = ref([])
const platformData = ref({})
const customerServiceData = ref({})
const emergencyData = ref({})
const forumData = ref({})
const auditData = ref({})

// API数据获取
const fetchChartData = async () => {
  try {
    loading.value = true
    
    // 并行请求所有图表数据
    const [
      pileDistribution,
      platformStats,
      customerServiceStats,
      emergencyStats,
      forumStats,
      auditStats
    ] = await Promise.all([
      authApi.getPrivateStationDistribution(),
      authApi.getPlatformStats(),
      authApi.getCustomerServiceStatsOverview(),
      authApi.getEmergencyStatistics(),
      authApi.getForumStatistics(),
      authApi.getAuditStatistics()
    ])
    
    pileData.value = pileDistribution
    platformData.value = platformStats
    customerServiceData.value = customerServiceStats
    emergencyData.value = emergencyStats
    forumData.value = forumStats
    auditData.value = auditStats
    
    // 初始化图表
    await nextTick()
    initCharts()
  } catch (error) {
    console.error('获取图表数据失败:', error)
    ElMessage.error('获取图表数据失败')
    
    // 即使API请求失败，也要显示默认数据的图表
    await nextTick()
    initCharts()
  } finally {
    loading.value = false
  }
}

// 初始化图表
const initCharts = () => {
  // 1. 私桩分布图表
  if (pileDistributionChart.value) {
    const chart = echarts.init(pileDistributionChart.value)
    
    // 增强数据适配逻辑，处理多种可能的数据结构
    let distributionData = []
    
    // 处理不同的数据结构
    if (Array.isArray(pileData.value)) {
      // 如果直接返回数组
      distributionData = pileData.value
    } else if (pileData.value?.regionDistribution) {
      // 按地区分布
      distributionData = Array.isArray(pileData.value.regionDistribution) ? pileData.value.regionDistribution : []
    } else if (pileData.value?.statusDistribution) {
      // 按状态分布
      distributionData = Array.isArray(pileData.value.statusDistribution) ? pileData.value.statusDistribution : []
    } else if (pileData.value?.typeDistribution) {
      // 按类型分布
      distributionData = Array.isArray(pileData.value.typeDistribution) ? pileData.value.typeDistribution : []
    } else if (pileData.value?.data) {
      // 如果数据在data字段中
      distributionData = Array.isArray(pileData.value.data) ? pileData.value.data : []
    } else {
      // 尝试直接将对象转换为数组形式
      const keys = Object.keys(pileData.value || {})
      if (keys.length > 0) {
        // 处理对象形式的数据，如 { region1: 100, region2: 200 }
        distributionData = keys.map(key => {
          const value = pileData.value[key]
          if (typeof value === 'number') {
            return { name: key, value }
          } else if (typeof value === 'object' && value !== null) {
            return { 
              name: key, 
              value: value.count || value.value || 0 
            }
          }
          return null
        }).filter(item => item !== null)
      } else {
        // 默认空数据
        distributionData = []
      }
    }
    
    
    // 确保数据格式正确
    const chartData = distributionData.map(item => ({
      name: item.region || item.statusName || item.typeName || item.name || '未知',
      value: item.count || item.value || 0
    })).filter(item => item.value > 0) // 过滤掉值为0的数据
    
    // 如果没有有效数据，使用默认数据
    const finalData = chartData.length > 0 ? chartData : [
      { name: '北京', value: 120 },
      { name: '上海', value: 80 },
      { name: '广州', value: 60 },
      { name: '深圳', value: 90 },
      { name: '杭州', value: 70 }
    ]
    
    
    const option = {
      tooltip: { trigger: 'axis' },
      xAxis: {
        type: 'category',
        data: finalData.map(item => item.name),
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { color: '#a0aec0' }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: '#a0aec0' },
        splitLine: { lineStyle: { color: '#e2e8f0' } }
      },
      series: [{
        data: finalData.map(item => item.value),
        type: 'bar',
        itemStyle: { color: '#4299e1', borderRadius: [4, 4, 0, 0] }
      }]
    }
    chart.setOption(option)
  }
  
  // 2. 交易数据图表（模拟数据）
  if (transactionChart.value) {
    const chart = echarts.init(transactionChart.value)
    const option = {
      tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
      legend: { show: true, textStyle: { color: '#4a5568' }, bottom: 0 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { color: '#a0aec0' }
      },
      yAxis: [
        {
          type: 'value',
          name: '订单量',
          position: 'left',
          axisLine: { show: false },
          axisLabel: { color: '#a0aec0' },
          splitLine: { lineStyle: { color: '#e2e8f0' } }
        },
        {
          type: 'value',
          name: '客单价',
          position: 'right',
          axisLine: { show: false },
          axisLabel: { color: '#a0aec0' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '日均订单量',
          type: 'bar',
          data: [120, 132, 101, 134, 190, 230, 210],
          itemStyle: { color: '#4299e1', borderRadius: [4, 4, 0, 0] }
        },
        {
          name: '客单价(元)',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: [45, 48, 46, 50, 52, 55, 53],
          lineStyle: { color: '#48bb78', width: 3 }
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 3. 用户增长趋势图表
  if (userGrowthChart.value) {
    const chart = echarts.init(userGrowthChart.value)
    
    // 增强数据处理逻辑
    let processedData = {
      dailyActiveTrend: [],
      monthlyActiveTrend: [],
      newUsersTrend: []
    }
    
    // 处理不同的数据结构
    if (platformData.value) {
      // 处理日活用户趋势
      if (platformData.value.dailyActiveTrend) {
        processedData.dailyActiveTrend = Array.isArray(platformData.value.dailyActiveTrend) ? platformData.value.dailyActiveTrend : 
                                        typeof platformData.value.dailyActiveTrend === 'number' ? [platformData.value.dailyActiveTrend] : []
      } else if (platformData.value.dailyActive) {
        processedData.dailyActiveTrend = Array.isArray(platformData.value.dailyActive) ? platformData.value.dailyActive : 
                                        typeof platformData.value.dailyActive === 'number' ? [platformData.value.dailyActive] : []
      } else if (platformData.value?.data?.dailyActiveTrend) {
        processedData.dailyActiveTrend = Array.isArray(platformData.value.data.dailyActiveTrend) ? platformData.value.data.dailyActiveTrend : []
      } else if (platformData.value?.data?.dailyActive) {
        processedData.dailyActiveTrend = Array.isArray(platformData.value.data.dailyActive) ? platformData.value.data.dailyActive : []
      }
      
      // 处理月活用户趋势
      if (platformData.value.monthlyActiveTrend) {
        processedData.monthlyActiveTrend = Array.isArray(platformData.value.monthlyActiveTrend) ? platformData.value.monthlyActiveTrend : 
                                          typeof platformData.value.monthlyActiveTrend === 'number' ? [platformData.value.monthlyActiveTrend] : []
      } else if (platformData.value.monthlyActive) {
        processedData.monthlyActiveTrend = Array.isArray(platformData.value.monthlyActive) ? platformData.value.monthlyActive : 
                                          typeof platformData.value.monthlyActive === 'number' ? [platformData.value.monthlyActive] : []
      } else if (platformData.value?.data?.monthlyActiveTrend) {
        processedData.monthlyActiveTrend = Array.isArray(platformData.value.data.monthlyActiveTrend) ? platformData.value.data.monthlyActiveTrend : []
      } else if (platformData.value?.data?.monthlyActive) {
        processedData.monthlyActiveTrend = Array.isArray(platformData.value.data.monthlyActive) ? platformData.value.data.monthlyActive : []
      }
      
      // 处理新增用户趋势
      if (platformData.value.newUsersTrend) {
        processedData.newUsersTrend = Array.isArray(platformData.value.newUsersTrend) ? platformData.value.newUsersTrend : 
                                      typeof platformData.value.newUsersTrend === 'number' ? [platformData.value.newUsersTrend] : []
      } else if (platformData.value.newUsers) {
        processedData.newUsersTrend = Array.isArray(platformData.value.newUsers) ? platformData.value.newUsers : 
                                      typeof platformData.value.newUsers === 'number' ? [platformData.value.newUsers] : []
      } else if (platformData.value?.data?.newUsersTrend) {
        processedData.newUsersTrend = Array.isArray(platformData.value.data.newUsersTrend) ? platformData.value.data.newUsersTrend : []
      } else if (platformData.value?.data?.newUsers) {
        processedData.newUsersTrend = Array.isArray(platformData.value.data.newUsers) ? platformData.value.data.newUsers : []
      }
    }
    
    
    // 确保数据长度一致，使用默认数据填充
    const months = ['1月', '2月', '3月', '4月', '5月', '6月']
    const defaultDailyActive = [1500, 2000, 2500, 3000, 3500, 4000]
    const defaultMonthlyActive = [5000, 6000, 7000, 8000, 9000, 10000]
    const defaultNewUsers = [200, 300, 400, 500, 600, 700]
    
    // 确保数据长度与月份一致
    const finalDailyActive = processedData.dailyActiveTrend.length >= months.length ? 
      processedData.dailyActiveTrend.slice(0, months.length) : 
      [...processedData.dailyActiveTrend, ...defaultDailyActive].slice(0, months.length)
    
    const finalMonthlyActive = processedData.monthlyActiveTrend.length >= months.length ? 
      processedData.monthlyActiveTrend.slice(0, months.length) : 
      [...processedData.monthlyActiveTrend, ...defaultMonthlyActive].slice(0, months.length)
    
    const finalNewUsers = processedData.newUsersTrend.length >= months.length ? 
      processedData.newUsersTrend.slice(0, months.length) : 
      [...processedData.newUsersTrend, ...defaultNewUsers].slice(0, months.length)
    
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { show: true, textStyle: { color: '#4a5568' }, bottom: 0 },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: months,
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { color: '#a0aec0' }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: '#a0aec0' },
        splitLine: { lineStyle: { color: '#e2e8f0' } }
      },
      series: [
        {
          name: '日活用户',
          type: 'line',
          smooth: true,
          data: finalDailyActive,
          lineStyle: { color: '#4299e1', width: 3 }
        },
        {
          name: '月活用户',
          type: 'line',
          smooth: true,
          data: finalMonthlyActive,
          lineStyle: { color: '#48bb78', width: 3 }
        },
        {
          name: '新增用户',
          type: 'line',
          smooth: true,
          data: finalNewUsers,
          lineStyle: { color: '#ed8936', width: 3 }
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 4. 客服工作概览图表
  if (customerServiceChart.value) {
    const chart = echarts.init(customerServiceChart.value)
    const data = customerServiceData.value
    
    // 增强数据处理和有效性检查
    let processedData = {
      avgResponseTime: 10,
      solveRate: 90,
      satisfaction: 85,
      totalCases: 500,
      praiseRate: 95
    }
    
    // 处理不同的数据结构
    if (data) {
      // 直接从data中获取数据
      processedData.avgResponseTime = typeof data.avgResponseTime === 'number' ? data.avgResponseTime : 
                                     typeof data.responseTime === 'number' ? data.responseTime : 
                                     typeof data.data?.avgResponseTime === 'number' ? data.data.avgResponseTime : 
                                     typeof data.data?.responseTime === 'number' ? data.data.responseTime : 10
      
      processedData.solveRate = typeof data.solveRate === 'number' ? data.solveRate : 
                               typeof data.solvedRate === 'number' ? data.solvedRate : 
                               typeof data.data?.solveRate === 'number' ? data.data.solveRate : 
                               typeof data.data?.solvedRate === 'number' ? data.data.solvedRate : 90
      
      processedData.satisfaction = typeof data.satisfaction === 'number' ? data.satisfaction : 
                                  typeof data.satisfactionRate === 'number' ? data.satisfactionRate : 
                                  typeof data.data?.satisfaction === 'number' ? data.data.satisfaction : 
                                  typeof data.data?.satisfactionRate === 'number' ? data.data.satisfactionRate : 85
      
      processedData.totalCases = typeof data.totalCases === 'number' ? data.totalCases : 
                                typeof data.caseCount === 'number' ? data.caseCount : 
                                typeof data.data?.totalCases === 'number' ? data.data.totalCases : 
                                typeof data.data?.caseCount === 'number' ? data.data.caseCount : 500
      
      processedData.praiseRate = typeof data.praiseRate === 'number' ? data.praiseRate : 
                                typeof data.goodRate === 'number' ? data.goodRate : 
                                typeof data.data?.praiseRate === 'number' ? data.data.praiseRate : 
                                typeof data.data?.goodRate === 'number' ? data.data.goodRate : 95
    }
    
    
    // 数据有效性检查和范围限制
    const validateValue = (value, min, max) => {
      return Math.max(min, Math.min(max, value))
    }
    
    const radarValue = [
      validateValue(processedData.avgResponseTime, 0, 60),
      validateValue(processedData.solveRate, 0, 100),
      validateValue(processedData.satisfaction, 0, 100),
      validateValue(processedData.totalCases, 0, 1000),
      validateValue(processedData.praiseRate, 0, 100)
    ]
    
    
    const option = {
      tooltip: { trigger: 'item' },
      radar: {
        indicator: [
          { name: '响应时间(分钟)', max: 60 },
          { name: '解决率(%)', max: 100 },
          { name: '满意度(%)', max: 100 },
          { name: '处理量', max: 1000 },
          { name: '好评率(%)', max: 100 }
        ],
        splitLine: { lineStyle: { color: '#e2e8f0' } },
        axisLine: { lineStyle: { color: '#a0aec0' } },
        name: { color: '#4a5568' }
      },
      series: [{
        type: 'radar',
        data: [{
          value: radarValue,
          name: '客服工作概览',
          areaStyle: { color: 'rgba(66, 153, 225, 0.3)' },
          lineStyle: { color: '#4299e1', width: 2 }
        }]
      }]
    }
    chart.setOption(option)
  }
  
  // 5. 紧急响应统计图表
  if (emergencyChart.value) {
    const chart = echarts.init(emergencyChart.value)
    const data = emergencyData.value
    
    // 增强数据处理逻辑
    let processedData = {
      eventCountTrend: [],
      avgResponseTimeTrend: []
    }
    
    // 处理不同的数据结构
    if (data) {
      // 处理事件数量趋势
      if (data.eventCountTrend) {
        processedData.eventCountTrend = Array.isArray(data.eventCountTrend) ? data.eventCountTrend : 
                                        typeof data.eventCountTrend === 'number' ? [data.eventCountTrend] : []
      } else if (data.eventCount) {
        processedData.eventCountTrend = Array.isArray(data.eventCount) ? data.eventCount : 
                                        typeof data.eventCount === 'number' ? [data.eventCount] : []
      } else if (data.incidentCountTrend) {
        processedData.eventCountTrend = Array.isArray(data.incidentCountTrend) ? data.incidentCountTrend : 
                                        typeof data.incidentCountTrend === 'number' ? [data.incidentCountTrend] : []
      } else if (data.incidentCount) {
        processedData.eventCountTrend = Array.isArray(data.incidentCount) ? data.incidentCount : 
                                        typeof data.incidentCount === 'number' ? [data.incidentCount] : []
      } else if (data.data?.eventCountTrend) {
        processedData.eventCountTrend = Array.isArray(data.data.eventCountTrend) ? data.data.eventCountTrend : []
      } else if (data.data?.eventCount) {
        processedData.eventCountTrend = Array.isArray(data.data.eventCount) ? data.data.eventCount : []
      }
      
      // 处理平均响应时间趋势
      if (data.avgResponseTimeTrend) {
        processedData.avgResponseTimeTrend = Array.isArray(data.avgResponseTimeTrend) ? data.avgResponseTimeTrend : 
                                            typeof data.avgResponseTimeTrend === 'number' ? [data.avgResponseTimeTrend] : []
      } else if (data.avgResponseTime) {
        processedData.avgResponseTimeTrend = Array.isArray(data.avgResponseTime) ? data.avgResponseTime : 
                                            typeof data.avgResponseTime === 'number' ? [data.avgResponseTime] : []
      } else if (data.responseTimeTrend) {
        processedData.avgResponseTimeTrend = Array.isArray(data.responseTimeTrend) ? data.responseTimeTrend : 
                                            typeof data.responseTimeTrend === 'number' ? [data.responseTimeTrend] : []
      } else if (data.responseTime) {
        processedData.avgResponseTimeTrend = Array.isArray(data.responseTime) ? data.responseTime : 
                                            typeof data.responseTime === 'number' ? [data.responseTime] : []
      } else if (data.data?.avgResponseTimeTrend) {
        processedData.avgResponseTimeTrend = Array.isArray(data.data.avgResponseTimeTrend) ? data.data.avgResponseTimeTrend : []
      } else if (data.data?.avgResponseTime) {
        processedData.avgResponseTimeTrend = Array.isArray(data.data.avgResponseTime) ? data.data.avgResponseTime : []
      }
    }
    
    
    // 确保数据长度一致，使用默认数据填充
    const months = ['1月', '2月', '3月', '4月', '5月', '6月']
    const defaultEventCount = [20, 35, 25, 40, 50, 30]
    const defaultResponseTime = [5, 8, 6, 10, 12, 7]
    
    // 确保数据长度与月份一致
    const finalEventCount = processedData.eventCountTrend.length >= months.length ? 
      processedData.eventCountTrend.slice(0, months.length) : 
      [...processedData.eventCountTrend, ...defaultEventCount].slice(0, months.length)
    
    const finalResponseTime = processedData.avgResponseTimeTrend.length >= months.length ? 
      processedData.avgResponseTimeTrend.slice(0, months.length) : 
      [...processedData.avgResponseTimeTrend, ...defaultResponseTime].slice(0, months.length)
    
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { show: true, textStyle: { color: '#4a5568' }, bottom: 0 },
      xAxis: {
        type: 'category',
        data: months,
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { color: '#a0aec0' }
      },
      yAxis: [
        {
          type: 'value',
          name: '事件数量',
          position: 'left',
          axisLine: { show: false },
          axisLabel: { color: '#a0aec0' },
          splitLine: { lineStyle: { color: '#e2e8f0' } }
        },
        {
          type: 'value',
          name: '响应时间(分钟)',
          position: 'right',
          axisLine: { show: false },
          axisLabel: { color: '#a0aec0' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: '紧急事件数',
          type: 'bar',
          data: finalEventCount,
          itemStyle: { color: '#f56565', borderRadius: [4, 4, 0, 0] }
        },
        {
          name: '平均响应时间',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          data: finalResponseTime,
          lineStyle: { color: '#ed8936', width: 3 }
        }
      ]
    }
    chart.setOption(option)
  }
  
  // 6. 论坛统计图表
  if (forumChart.value) {
    const chart = echarts.init(forumChart.value)
    const data = forumData.value
    
    // 增强数据处理逻辑
    let processedData = {
      questionCount: 0,
      shareCount: 0,
      complaintCount: 0,
      otherCount: 0
    }
    
    // 处理不同的数据结构
    if (data) {
      // 处理嵌套在data字段中的数据
      const actualData = data.data ? data.data : data
      
      // 直接从actualData中获取数据
      processedData.questionCount = typeof actualData.questionCount === 'number' ? actualData.questionCount : 
                                  typeof actualData.question === 'number' ? actualData.question : 0
      
      processedData.shareCount = typeof actualData.shareCount === 'number' ? actualData.shareCount : 
                               typeof actualData.share === 'number' ? actualData.share : 0
      
      processedData.complaintCount = typeof actualData.complaintCount === 'number' ? actualData.complaintCount : 
                                  typeof actualData.complaint === 'number' ? actualData.complaint : 0
      
      processedData.otherCount = typeof actualData.otherCount === 'number' ? actualData.otherCount : 
                               typeof actualData.other === 'number' ? actualData.other : 0
      
      // 处理数组形式的数据
      if (Array.isArray(actualData)) {
        actualData.forEach(item => {
          if (item.type === 'question' || item.name === '问题咨询') {
            processedData.questionCount = item.value || item.count || 0
          } else if (item.type === 'share' || item.name === '经验分享') {
            processedData.shareCount = item.value || item.count || 0
          } else if (item.type === 'complaint' || item.name === '投诉建议') {
            processedData.complaintCount = item.value || item.count || 0
          } else if (item.type === 'other' || item.name === '其他') {
            processedData.otherCount = item.value || item.count || 0
          }
        })
      }
      
      // 处理对象形式的数据，如 { "问题咨询": 10, "经验分享": 20 }
      if (typeof actualData === 'object' && actualData !== null && !Array.isArray(actualData)) {
        Object.entries(actualData).forEach(([key, value]) => {
          if (typeof value === 'number') {
            switch (key.toLowerCase()) {
              case 'question':
              case 'questioncount':
              case '问题咨询':
                processedData.questionCount = value
                break
              case 'share':
              case 'sharecount':
              case '经验分享':
                processedData.shareCount = value
                break
              case 'complaint':
              case 'complaintcount':
              case '投诉建议':
                processedData.complaintCount = value
                break
              case 'other':
              case 'othercount':
              case '其他':
                processedData.otherCount = value
                break
            }
          }
        })
      }
    }
    
    
    // 准备饼图数据
    const pieData = [
      { value: processedData.questionCount, name: '问题咨询' },
      { value: processedData.shareCount, name: '经验分享' },
      { value: processedData.complaintCount, name: '投诉建议' },
      { value: processedData.otherCount, name: '其他' }
    ].filter(item => item.value > 0) // 过滤掉值为0的数据
    
    // 如果没有有效数据，使用默认数据
    const finalData = pieData.length > 0 ? pieData : [
      { value: 45, name: '问题咨询' },
      { value: 30, name: '经验分享' },
      { value: 15, name: '投诉建议' },
      { value: 10, name: '其他' }
    ]
    
    
    const option = {
      tooltip: { trigger: 'item' },
      legend: { orient: 'vertical', left: 'left', textStyle: { color: '#4a5568' } },
      series: [{
        name: '论坛内容分类',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: {
            show: true,
            fontSize: '16',
            fontWeight: 'bold'
          }
        },
        labelLine: { show: false },
        data: finalData
      }]
    }
    chart.setOption(option)
  }
  
  // 7. 审核统计图表
  if (auditChart.value) {
    const chart = echarts.init(auditChart.value)
    const data = auditData.value
    
    // 增强数据处理逻辑
    let processedData = {
      pending: 0,
      approved: 0,
      rejected: 0,
      processing: 0
    }
    
    // 处理不同的数据结构
    if (data) {
      // 处理嵌套在data字段中的数据
      const actualData = data.data ? data.data : data
      
      // 直接从actualData中获取数据
      processedData.pending = typeof actualData.pendingCount === 'number' ? actualData.pendingCount : 
                            typeof actualData.pending === 'number' ? actualData.pending : 0
      
      processedData.approved = typeof actualData.approvedCount === 'number' ? actualData.approvedCount : 
                             typeof actualData.approved === 'number' ? actualData.approved : 0
      
      processedData.rejected = typeof actualData.rejectedCount === 'number' ? actualData.rejectedCount : 
                             typeof actualData.rejected === 'number' ? actualData.rejected : 0
      
      processedData.processing = typeof actualData.processingCount === 'number' ? actualData.processingCount : 
                               typeof actualData.processing === 'number' ? actualData.processing : 0
      
      // 处理数组形式的数据
      if (Array.isArray(actualData)) {
        actualData.forEach(item => {
          if (item.status === 'pending' || item.name === '待审核') {
            processedData.pending = item.value || item.count || 0
          } else if (item.status === 'approved' || item.name === '审核通过') {
            processedData.approved = item.value || item.count || 0
          } else if (item.status === 'rejected' || item.name === '审核拒绝') {
            processedData.rejected = item.value || item.count || 0
          } else if (item.status === 'processing' || item.name === '处理中') {
            processedData.processing = item.value || item.count || 0
          }
        })
      }
      
      // 处理对象形式的数据，如 { "待审核": 10, "审核通过": 20 }
      if (typeof actualData === 'object' && actualData !== null && !Array.isArray(actualData)) {
        Object.entries(actualData).forEach(([key, value]) => {
          if (typeof value === 'number') {
            switch (key.toLowerCase()) {
              case 'pendingcount':
              case 'pending':
              case '待审核':
                processedData.pending = value
                break
              case 'approvedcount':
              case 'approved':
              case '审核通过':
                processedData.approved = value
                break
              case 'rejectedcount':
              case 'rejected':
              case '审核拒绝':
                processedData.rejected = value
                break
              case 'processingcount':
              case 'processing':
              case '处理中':
                processedData.processing = value
                break
            }
          }
        })
      }
    }
    
    
    // 准备柱状图数据
    const barData = [
      processedData.pending,
      processedData.approved,
      processedData.rejected,
      processedData.processing
    ]
    
    // 如果所有数据都是0，使用默认数据
    const hasValidData = barData.some(value => value > 0)
    const finalData = hasValidData ? barData : [30, 150, 20, 10]
    
    
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { show: true, textStyle: { color: '#4a5568' }, bottom: 0 },
      xAxis: {
        type: 'category',
        data: ['待审核', '审核通过', '审核拒绝', '处理中'],
        axisLine: { lineStyle: { color: '#4a5568' } },
        axisLabel: { color: '#a0aec0' }
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisLabel: { color: '#a0aec0' },
        splitLine: { lineStyle: { color: '#e2e8f0' } }
      },
      series: [{
        name: '审核数量',
        type: 'bar',
        data: finalData,
        itemStyle: {
          color: function(params) {
            const colors = ['#ed8936', '#48bb78', '#f56565', '#4299e1']
            return colors[params.dataIndex]
          },
          borderRadius: [4, 4, 0, 0]
        }
      }]
    }
    chart.setOption(option)
  }
}

// 窗口大小改变时调整图表
const handleResize = () => {
  const charts = [
    pileDistributionChart, transactionChart, userGrowthChart, 
    customerServiceChart, emergencyChart, forumChart, auditChart
  ]
  charts.forEach(chartRef => {
    if (chartRef.value) {
      echarts.getInstanceByDom(chartRef.value)?.resize()
    }
  })
}

// 组件挂载时获取数据并初始化图表
onMounted(async () => {
  await fetchChartData()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时清理事件监听和图表实例
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  
  // 销毁所有图表实例
  const charts = [
    pileDistributionChart, transactionChart, userGrowthChart, 
    customerServiceChart, emergencyChart, forumChart, auditChart
  ]
  charts.forEach(chartRef => {
    if (chartRef.value) {
      echarts.getInstanceByDom(chartRef.value)?.dispose()
    }
  })
})
</script>

<style scoped>
.statistics-charts {
  margin-top: 20px;
}

.chart-container {
  width: 100%;
  height: 300px;
  margin-top: 10px;
}

.card-header {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-text-primary);
}
</style>