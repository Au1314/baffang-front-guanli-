<template>
  <div class="comprehensive-analysis-container">
    <el-card shadow="never" class="analysis-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button type="default" @click="$router.push('/statistics')">
              <el-icon><Back /></el-icon>
              返回统计模块
            </el-button>
            <span class="page-title">综合数据分析</span>
          </div>
          <el-button type="primary" @click="fetchAnalysisData" :loading="loading">
            <el-icon><RefreshRight /></el-icon>
            刷新数据
          </el-button>
        </div>
      </template>

      <!-- 数据加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- 数据分析结果 -->
      <div v-else-if="analysisData" class="analysis-content">
        <!-- AI分析结果 -->
        <el-card class="analysis-result-card">
          <template #header>
            <div class="card-subheader">
              <span>AI分析结论</span>
            </div>
          </template>
          <div class="analysis-text" v-html="analysisData.analysis"></div>
        </el-card>

        <!-- 核心指标概览 -->
        <el-card class="metrics-overview-card">
          <template #header>
            <div class="card-subheader">
              <span>核心指标概览</span>
            </div>
          </template>
          <div class="metrics-grid">
            <el-statistic title="总用户数" :value="analysisData.rawData.platform.totalUsers" />
            <el-statistic title="今日新用户" :value="analysisData.rawData.platform.todayNewUsers" />
            <el-statistic title="总订单数" :value="analysisData.rawData.platform.totalOrders" />
            <el-statistic title="总收入（元）" :value="analysisData.rawData.platform.totalRevenue" />
            <el-statistic title="总充电量（kWh）" :value="analysisData.rawData.platform.totalChargeAmount" />
            <el-statistic title="总私桩数" :value="analysisData.rawData.platform.totalPrivateStations" />
          </div>
        </el-card>

        <!-- 平台整体概况 -->
        <el-card class="section-card">
          <template #header>
            <div class="card-subheader">
              <span>1. 平台整体概况</span>
            </div>
          </template>
          <el-table :data="platformMetrics" border style="width: 100%">
            <el-table-column prop="name" label="指标名称" width="180" />
            <el-table-column prop="value" label="累计值" />
            <el-table-column prop="today" label="今日值" />
          </el-table>
        </el-card>

        <!-- 私人充电站运营 -->
        <el-card class="section-card">
          <template #header>
            <div class="card-subheader">
              <span>2. 私人充电站运营</span>
            </div>
          </template>
          <div class="station-grid">
            <div class="station-item">
              <h4>认证状态分布</h4>
              <el-table :data="analysisData.rawData.privateStation.byAuthStatus" border style="width: 100%">
                <el-table-column prop="authStatusName" label="认证状态" />
                <el-table-column prop="count" label="数量" />
              </el-table>
            </div>
            <div class="station-item">
              <h4>运行状态分布</h4>
              <el-table :data="analysisData.rawData.privateStation.byStatus" border style="width: 100%">
                <el-table-column prop="statusName" label="运行状态" />
                <el-table-column prop="count" label="数量" />
              </el-table>
            </div>
            <div class="station-item">
              <h4>类型分布</h4>
              <el-table :data="analysisData.rawData.privateStation.byType" border style="width: 100%">
                <el-table-column prop="typeName" label="桩类型" />
                <el-table-column prop="count" label="数量" />
              </el-table>
            </div>
          </div>
        </el-card>

        <!-- 车辆认证 -->
        <el-card class="section-card">
          <template #header>
            <div class="card-subheader">
              <span>3. 车辆认证</span>
            </div>
          </template>
          <div class="vehicle-audit-grid">
            <div class="vehicle-item">
              <h4>认证状态分布</h4>
              <el-table :data="analysisData.rawData.vehicleAudit.byStatus" border style="width: 100%">
                <el-table-column prop="statusName" label="认证状态" />
                <el-table-column prop="count" label="数量" />
              </el-table>
            </div>
            <div class="vehicle-item">
              <h4>审核效率</h4>
              <div class="efficiency-metrics">
                <div class="metric-item">
                  <div class="metric-label">平均处理时长</div>
                  <div class="metric-value">{{ analysisData.rawData.vehicleAudit.avgProcessTimeHours }}小时</div>
                </div>
                <div class="metric-item">
                  <div class="metric-label">今日处理</div>
                  <div class="metric-value">{{ analysisData.rawData.vehicleAudit.todayProcessed }}件</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 审核与风控 -->
        <el-card class="section-card">
          <template #header>
            <div class="card-subheader">
              <span>4. 审核与风控</span>
            </div>
          </template>
          <div class="audit-grid">
            <div class="audit-item">
              <h4>待处理项总数</h4>
              <div class="pending-total">{{ analysisData.rawData.auditRecord.pendingTotal }}件</div>
            </div>
            <div class="audit-item">
              <h4>投诉处理时效</h4>
              <div class="metric-item">
                <div class="metric-label">平均处理时长</div>
                <div class="metric-value">{{ analysisData.rawData.auditAndComplaint.avgProcessTimeHours }}小时</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 论坛运营 -->
        <el-card class="section-card">
          <template #header>
            <div class="card-subheader">
              <span>5. 社区运营</span>
            </div>
          </template>
          <div class="forum-grid">
            <div class="forum-item">
              <h4>论坛活跃度</h4>
              <el-table :data="forumMetrics" border style="width: 100%">
                <el-table-column prop="name" label="指标" />
                <el-table-column prop="value" label="累计值" />
                <el-table-column prop="today" label="今日值" />
              </el-table>
            </div>
            <div class="forum-item">
              <h4>内容分布</h4>
              <el-table :data="analysisData.rawData.forum.byCategory" border style="width: 100%">
                <el-table-column prop="category" label="分类" />
                <el-table-column prop="count" label="数量" />
              </el-table>
            </div>
          </div>
        </el-card>

        <!-- 紧急呼叫 -->
        <el-card class="section-card">
          <template #header>
            <div class="card-subheader">
              <span>6. 紧急呼叫</span>
            </div>
          </template>
          <div class="emergency-grid">
            <div class="emergency-item">
              <h4>呼叫状态分布</h4>
              <el-table :data="analysisData.rawData.emergency.byStatus" border style="width: 100%">
                <el-table-column prop="statusName" label="状态" />
                <el-table-column prop="count" label="数量" />
              </el-table>
            </div>
            <div class="emergency-item">
              <h4>响应效率</h4>
              <div class="efficiency-metrics">
                <div class="metric-item">
                  <div class="metric-label">平均响应时间</div>
                  <div class="metric-value">{{ analysisData.rawData.emergency.avgResponseTimeMinutes }}分钟</div>
                </div>
                <div class="metric-item">
                  <div class="metric-label">今日呼叫</div>
                  <div class="metric-value">{{ analysisData.rawData.emergency.todayCalls }}次</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 订单与交易 -->
        <el-card class="section-card">
          <template #header>
            <div class="card-subheader">
              <span>7. 订单与交易</span>
            </div>
          </template>
          <div class="order-grid">
            <div class="order-item">
              <h4>订单类型分布</h4>
              <el-table :data="analysisData.rawData.order.byType" border style="width: 100%">
                <el-table-column prop="typeName" label="订单类型" />
                <el-table-column prop="count" label="订单数" />
                <el-table-column prop="totalAmount" label="总金额（元）" />
              </el-table>
            </div>
            <div class="order-item">
              <h4>订单状态分布</h4>
              <el-table :data="analysisData.rawData.order.byStatus" border style="width: 100%">
                <el-table-column prop="statusName" label="订单状态" />
                <el-table-column prop="count" label="数量" />
              </el-table>
            </div>
            <div class="order-item">
              <h4>充电桩评分</h4>
              <el-table :data="analysisData.rawData.order.chargeRateStats" border style="width: 100%">
                <el-table-column prop="typeName" label="评价类型" />
                <el-table-column prop="avgScore" label="平均分" />
                <el-table-column prop="count" label="评价数量" />
              </el-table>
            </div>
          </div>
        </el-card>

        <!-- 客服与管理员 -->
        <el-card class="section-card">
          <template #header>
            <div class="card-subheader">
              <span>8. 客服与管理员</span>
            </div>
          </template>
          <div class="service-admin-grid">
            <div class="service-item">
              <h4>客服会话</h4>
              <div class="service-metrics">
                <div class="metric-item">
                  <div class="metric-label">待处理会话</div>
                  <div class="metric-value">{{ analysisData.rawData.conversation.pendingSessions }}个</div>
                </div>
                <div class="metric-item">
                  <div class="metric-label">今日新会话</div>
                  <div class="metric-value">{{ analysisData.rawData.conversation.todaySessions }}个</div>
                </div>
              </div>
            </div>
            <div class="admin-item">
              <h4>管理员分布</h4>
              <el-table :data="analysisData.rawData.admin.byType" border style="width: 100%">
                <el-table-column prop="typeName" label="管理员类型" />
                <el-table-column prop="count" label="数量" />
              </el-table>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 数据加载失败 -->
      <div v-else class="error-container">
        <el-empty description="数据加载失败" />
        <el-button type="primary" @click="fetchAnalysisData">重新加载</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { RefreshRight, Back } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'

// 加载状态
const loading = ref(false)
// 分析数据
const analysisData = ref(null)

// 平台指标计算
const platformMetrics = computed(() => {
  if (!analysisData.value) return []
  const { platform } = analysisData.value.rawData
  return [
    { name: '总用户数', value: platform.totalUsers, today: platform.todayNewUsers },
    { name: '总私桩数', value: platform.totalPrivateStations, today: 0 },
    { name: '总公桩数', value: platform.totalPublicStations, today: 0 },
    { name: '总订单数', value: platform.totalOrders, today: platform.todayOrders },
    { name: '总收入', value: platform.totalRevenue + '元', today: platform.todayRevenue + '元' },
    { name: '总充电量', value: platform.totalChargeAmount + 'kWh', today: platform.todayChargeAmount + 'kWh' }
  ]
})

// 论坛指标计算
const forumMetrics = computed(() => {
  if (!analysisData.value) return []
  const { forum } = analysisData.value.rawData
  return [
    { name: '总帖数', value: forum.totalPosts, today: forum.todayPosts },
    { name: '总评论数', value: forum.totalComments, today: forum.todayComments }
  ]
})

// 获取分析数据
const fetchAnalysisData = async () => {
  try {
    loading.value = true
    const data = await authApi.getComprehensiveAnalysis()
    analysisData.value = data
    ElMessage.success('数据刷新成功')
  } catch (error) {
    console.error('获取综合数据分析失败:', error)
    ElMessage.error('获取数据失败，请稍后重试')
    analysisData.value = null
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchAnalysisData()
})
</script>

<style scoped>
.comprehensive-analysis-container {
  padding: 0 20px 20px;
}

.analysis-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.card-subheader {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-text-regular);
}

.loading-container {
  padding: 20px 0;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-result-card {
  background-color: #f0f9ff;
  border-left: 4px solid #3b82f6;
}

.analysis-text {
  white-space: pre-wrap;
  line-height: 1.6;
  color: var(--color-text-primary);
}

.metrics-overview-card {
  margin-bottom: 20px;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.section-card {
  margin-bottom: 20px;
}

.station-grid,
.vehicle-audit-grid,
.forum-grid,
.emergency-grid,
.order-grid,
.service-admin-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.station-item,
.vehicle-item,
.forum-item,
.emergency-item,
.order-item,
.service-item,
.admin-item,
.audit-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

h4 {
  margin: 0;
  font-size: 14px;
  font-weight: bold;
  color: var(--color-text-regular);
}

.efficiency-metrics,
.service-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.metric-item {
  text-align: center;
  padding: 15px;
  background-color: #fafafa;
  border-radius: 4px;
}

.metric-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 5px;
}

.metric-value {
  font-size: 20px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.pending-total {
  font-size: 32px;
  font-weight: bold;
  color: var(--color-danger);
  text-align: center;
  padding: 20px;
  background-color: var(--color-danger-light);
  border-radius: 4px;
}

.error-container {
  text-align: center;
  padding: 40px 0;
}

.loading-container {
  padding: 20px 0;
}
</style>