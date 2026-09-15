<template>
  <div class="decision-list-container">
    <!-- 查询表单 -->
    <el-card class="query-card">
      <el-form :inline="true" :model="queryForm" class="demo-form-inline">
        <el-form-item label="决策类型">
          <el-select v-model="queryForm.decisionType" placeholder="请选择决策类型" style="width: 180px;">
            <el-option label="审核建议" :value="0" />
            <el-option label="异常预警" :value="1" />
            <el-option label="资源调度" :value="2" />
            <el-option label="风险控制" :value="3" />
            <el-option label="运营优化" :value="4" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" placeholder="请选择状态" style="width: 180px;">
            <el-option label="待处理" :value="0" />
            <el-option label="已采纳" :value="1" />
            <el-option label="已忽略" :value="2" />
            <el-option label="部分采纳" :value="3" />
            <el-option label="自动执行中" :value="4" />
            <el-option label="执行完成" :value="5" />
            <el-option label="执行失败" :value="6" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="优先级">
          <el-select v-model="queryForm.priority" placeholder="请选择优先级" style="width: 180px;">
            <el-option label="低" :value="0" />
            <el-option label="普通" :value="1" />
            <el-option label="高" :value="2" />
            <el-option label="紧急" :value="3" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="业务类型">
          <el-input v-model="queryForm.businessType" placeholder="请输入业务类型" />
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="queryForm.timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleQuery">查询</el-button>
          <el-button @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计数据展示 -->
    <el-card class="statistics-card" :loading="statisticsLoading">
      <template #header>
        <div class="card-header">
          <span>决策统计数据</span>
        </div>
      </template>
      
      <!-- 总体统计指标 -->
      <el-row :gutter="20" class="statistics-row">
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-content">
              <div class="statistic-label">总决策数量</div>
              <div class="statistic-value">{{ statistics.totalCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-content">
              <div class="statistic-label">待处理数量</div>
              <div class="statistic-value pending">{{ statistics.pendingCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-content">
              <div class="statistic-label">已采纳数量</div>
              <div class="statistic-value adopted">{{ statistics.adoptedCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-content">
              <div class="statistic-label">今日新增</div>
              <div class="statistic-value today">{{ statistics.todayCount }}</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <el-row :gutter="20" class="statistics-row">
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-content">
              <div class="statistic-label">已执行数量</div>
              <div class="statistic-value executed">{{ statistics.executedCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-content">
              <div class="statistic-label">执行失败</div>
              <div class="statistic-value failed">{{ statistics.failedCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-content">
              <div class="statistic-label">已忽略数量</div>
              <div class="statistic-value ignored">{{ statistics.ignoredCount }}</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover" class="statistic-card">
            <div class="statistic-content">
              <div class="statistic-label">平均置信度</div>
              <div class="statistic-value confidence">{{ formattedAvgConfidence }}%</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      
      <!-- 统计详情 -->
      <el-row :gutter="20" class="statistics-detail-row">
        <!-- 按类型统计 -->
        <el-col :span="12">
          <el-card shadow="never" class="detail-card">
            <template #header>
              <div class="detail-header">
                <span>按类型统计</span>
              </div>
            </template>
            <el-table :data="formattedByType" border style="width: 100%">
              <el-table-column prop="type" label="类型代码" width="100" />
              <el-table-column prop="typeName" label="类型名称" width="150" />
              <el-table-column prop="count" label="数量" width="100" />
              <el-table-column prop="count" label="占比" width="120">
                <template #default="scope">
                  {{ ((scope.row.count / statistics.totalCount) * 100).toFixed(1) }}%
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
        
        <!-- 按优先级统计 -->
        <el-col :span="12">
          <el-card shadow="never" class="detail-card">
            <template #header>
              <div class="detail-header">
                <span>按优先级统计</span>
              </div>
            </template>
            <el-table :data="formattedByPriority" border style="width: 100%">
              <el-table-column prop="priority" label="优先级代码" width="100" />
              <el-table-column prop="priorityName" label="优先级名称" width="150" />
              <el-table-column prop="count" label="数量" width="100" />
              <el-table-column prop="count" label="占比" width="120">
                <template #default="scope">
                  {{ ((scope.row.count / statistics.totalCount) * 100).toFixed(1) }}%
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table :data="decisionList" stripe style="width: 100%" :loading="loading" @row-click="showDecisionDetail">
        <el-table-column prop="id" label="决策ID" width="120" />
        <el-table-column prop="decisionNo" label="决策编号" width="180" />
        <el-table-column prop="decisionTypeName" label="决策类型" width="120" />
        <el-table-column prop="businessType" label="业务类型" width="120" />
        <el-table-column prop="businessId" label="业务ID" width="100" />
        <el-table-column prop="confidence" label="置信度" width="100">
          <template #default="scope">
            {{ scope.row.confidence }}%
          </template>
        </el-table-column>
        <el-table-column prop="priorityName" label="优先级" width="100" />
        <el-table-column prop="statusName" label="状态" width="120" />
        <el-table-column prop="autoExecute" label="自动执行" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.autoExecute ? 'success' : 'info'">
              {{ scope.row.autoExecute ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="handlerName" label="处理人" width="120" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="handleTime" label="处理时间" width="180" />
        <el-table-column label="操作" width="240">
          <template #default="scope">
            <el-button type="primary" size="small" @click.stop="showDecisionDetail(scope.row.id)">详情</el-button>
            <el-button v-if="scope.row.status === 0" type="success" size="small" @click.stop="openHandleDialog(scope.row)">处理</el-button>
            <el-button v-if="!scope.row.autoExecute && [0, 1, 3, 6].includes(scope.row.status)" type="warning" size="small" @click.stop="executeDecision(scope.row)">手动执行</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.pageNum"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        />
      </div>
    </el-card>
    
    <!-- 决策详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="决策详情" width="80%" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="决策ID">{{ decisionDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="决策编号">{{ decisionDetail.decisionNo }}</el-descriptions-item>
        <el-descriptions-item label="决策类型">{{ decisionDetail.decisionTypeName }}</el-descriptions-item>
        <el-descriptions-item label="触发类型">{{ decisionDetail.triggerTypeName }}</el-descriptions-item>
        <el-descriptions-item label="业务类型">{{ decisionDetail.businessType }}</el-descriptions-item>
        <el-descriptions-item label="业务ID">{{ decisionDetail.businessId }}</el-descriptions-item>
        <el-descriptions-item label="置信度" span="2">{{ decisionDetail.confidence }}%</el-descriptions-item>
        <el-descriptions-item label="优先级">{{ decisionDetail.priorityName }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ decisionDetail.statusName }}</el-descriptions-item>
        <el-descriptions-item label="自动执行">
          <el-tag :type="decisionDetail.autoExecute ? 'success' : 'info'">
            {{ decisionDetail.autoExecute ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理人">{{ decisionDetail.handlerName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" span="2">{{ decisionDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ decisionDetail.handleTime || '未处理' }}</el-descriptions-item>
        <el-descriptions-item label="AI分析" span="2">
          <el-divider orientation="left">AI分析内容</el-divider>
          <div class="ai-analysis-content">{{ decisionDetail.aiAnalysis || '无' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="输入数据" span="2">
          <el-divider orientation="left">输入数据</el-divider>
          <pre class="json-content">{{ formatJson(decisionDetail.inputData) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="决策结果" span="2">
          <el-divider orientation="left">决策结果</el-divider>
          <pre class="json-content">{{ formatJson(decisionDetail.decisionResult) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="建议操作" span="2">
          <el-divider orientation="left">建议操作</el-divider>
          <div v-if="decisionDetail.suggestedActions && decisionDetail.suggestedActions.length > 0">
            <el-collapse>
              <el-collapse-item v-for="(action, index) in decisionDetail.suggestedActions" :key="index" :title="`操作 ${index + 1}`">
                <pre class="json-content">{{ formatJson(action) }}</pre>
              </el-collapse-item>
            </el-collapse>
          </div>
          <div v-else>无建议操作</div>
        </el-descriptions-item>
        <el-descriptions-item label="操作日志" span="2">
          <el-divider orientation="left">操作日志</el-divider>
          <div v-if="decisionDetail.actionLogs && decisionDetail.actionLogs.length > 0">
            <el-timeline>
              <el-timeline-item v-for="(log, index) in decisionDetail.actionLogs" :key="index" :timestamp="log.createTime">
                {{ log.action }} - {{ log.description }}
              </el-timeline-item>
            </el-timeline>
          </div>
          <div v-else>无操作日志</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
    
    <!-- 处理决策弹窗 -->
    <el-dialog v-model="handleDialogVisible" title="处理决策" width="50%" append-to-body>
      <el-form :model="handleForm" label-width="100px" :rules="handleRules" ref="handleFormRef">
        <el-form-item label="决策ID" prop="decisionId">
          <el-input v-model="handleForm.decisionId" readonly disabled></el-input>
        </el-form-item>
        <el-form-item label="决策编号" prop="decisionNo">
          <el-input v-model="handleForm.decisionNo" readonly disabled></el-input>
        </el-form-item>
        <el-form-item label="操作类型" prop="action">
          <el-select v-model="handleForm.action" placeholder="请选择操作类型" style="width: 100%">
            <el-option v-for="option in actionOptions" :key="option.value" :label="option.label" :value="option.value"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="处理备注" prop="remark">
          <el-input v-model="handleForm.remark" type="textarea" rows="4" placeholder="请输入处理备注"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitHandle" :loading="handleLoading">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { authApi } from '@/api/auth'
import { ElMessage, ElMessageBox } from 'element-plus'

// 查询表单
const queryForm = reactive({
  decisionType: undefined,
  status: undefined,
  priority: undefined,
  businessType: '',
  timeRange: []
})

// 分页数据
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
})

// 决策列表数据
const decisionList = ref([])

// 加载状态
const loading = ref(false)

// 统计数据
const statistics = ref({
  totalCount: 0,
  pendingCount: 0,
  adoptedCount: 0,
  ignoredCount: 0,
  executedCount: 0,
  failedCount: 0,
  todayCount: 0,
  avgConfidence: 0,
  byType: [],
  byPriority: []
})

// 统计数据加载状态
const statisticsLoading = ref(false)

// 决策类型映射
const decisionTypeMap = {
  0: '审核建议',
  1: '异常预警',
  2: '资源调度',
  3: '风险控制',
  4: '运营优化'
}

// 优先级映射
const priorityMap = {
  0: '低',
  1: '普通',
  2: '高',
  3: '紧急'
}

// 详情弹窗可见性
const detailDialogVisible = ref(false)

// 决策详情数据
const decisionDetail = ref({})

// 处理决策弹窗相关变量
const handleDialogVisible = ref(false)
const handleLoading = ref(false)
const handleForm = ref({
  decisionId: null,
  decisionNo: '',
  action: '',
  remark: ''
})

// 操作类型选项
const actionOptions = [
  { label: '采纳', value: 'adopt' },
  { label: '忽略', value: 'ignore' },
  { label: '部分采纳', value: 'partial' }
]

// 格式化JSON数据的辅助函数
const formatJson = (data) => {
  if (!data) return '无'
  try {
    return JSON.stringify(data, null, 2)
  } catch (error) {
    return data
  }
}

// 获取决策详情
const fetchDecisionDetail = async (id) => {
  try {
    const response = await authApi.getDecisionDetail(id)
    decisionDetail.value = response
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取决策详情失败:', error)
    ElMessage.error('获取决策详情失败')
  }
}

// 显示决策详情
const showDecisionDetail = (rowOrId) => {
  const id = typeof rowOrId === 'number' ? rowOrId : rowOrId.id
  fetchDecisionDetail(id)
}

// 格式化后的按类型统计数据
const formattedByType = computed(() => {
  return Array.isArray(statistics.value.byType) ? statistics.value.byType.map(item => ({
    ...item,
    typeName: decisionTypeMap[item.type] || `类型${item.type}`
  })) : []
})

// 格式化后的按优先级统计数据
const formattedByPriority = computed(() => {
  return Array.isArray(statistics.value.byPriority) ? statistics.value.byPriority.map(item => ({
    ...item,
    priorityName: priorityMap[item.priority] || `优先级${item.priority}`
  })) : []
})

// 格式化后的平均置信度
const formattedAvgConfidence = computed(() => {
  return statistics.value.avgConfidence.toFixed(2)
})

// 获取决策统计数据
const fetchDecisionStatistics = async () => {
  try {
    statisticsLoading.value = true
    const response = await authApi.getDecisionStatistics()
    statistics.value = response
  } catch (error) {
    console.error('获取决策统计数据失败:', error)
    ElMessage.error('获取决策统计数据失败')
  } finally {
    statisticsLoading.value = false
  }
}

// 查询决策列表
const fetchDecisionList = async () => {
  try {
    loading.value = true
    
    // 处理查询参数
    const params = {
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      decisionType: queryForm.decisionType,
      status: queryForm.status,
      priority: queryForm.priority,
      businessType: queryForm.businessType,
      startTime: queryForm.timeRange[0] || undefined,
      endTime: queryForm.timeRange[1] || undefined
    }
    
    const response = await authApi.getDecisionList(params)
    
    // 更新数据
    decisionList.value = response.list || []
    pagination.total = response.total || 0
    pagination.pages = response.pages || 0
    
  } catch (error) {
    console.error('获取决策列表失败:', error)
    ElMessage.error('获取决策列表失败')
  } finally {
    loading.value = false
  }
}

// 查询按钮点击事件
const handleQuery = () => {
  pagination.pageNum = 1
  fetchDecisionList()
}

// 重置查询表单
const resetQuery = () => {
  Object.assign(queryForm, {
    decisionType: undefined,
    status: undefined,
    priority: undefined,
    businessType: '',
    timeRange: []
  })
  pagination.pageNum = 1
  fetchDecisionList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  fetchDecisionList()
}

// 当前页码变化
const handleCurrentChange = (current) => {
  pagination.pageNum = current
  fetchDecisionList()
}

// 处理决策表单验证规则
const handleRules = {
  action: [
    { required: true, message: '请选择操作类型', trigger: 'change' }
  ],
  remark: [
    { required: true, message: '请输入处理备注', trigger: 'blur' }
  ]
}

// 处理表单引用
const handleFormRef = ref(null)

// 打开处理决策弹窗
const openHandleDialog = (row) => {
  handleForm.value = {
    decisionId: row.id,
    decisionNo: row.decisionNo,
    action: '',
    remark: ''
  }
  handleDialogVisible.value = true
}

// 提交处理决策
const submitHandle = async () => {
  if (!handleFormRef.value) return
  
  try {
    // 表单验证
    await handleFormRef.value.validate()
    
    handleLoading.value = true
    
    // 调用API
    await authApi.handleDecision({
      decisionId: handleForm.value.decisionId,
      action: handleForm.value.action,
      remark: handleForm.value.remark
    })
    
    ElMessage.success('决策处理成功')
    handleDialogVisible.value = false
    
    // 刷新列表和统计数据
    fetchDecisionList()
    fetchDecisionStatistics()
  } catch (error) {
    console.error('决策处理失败:', error)
    if (error !== false) {
      ElMessage.error('决策处理失败，请重试')
    }
  } finally {
    handleLoading.value = false
  }
}

// 手动执行决策
const executeDecision = async (row) => {
  try {
    // 显示确认弹窗
    await ElMessageBox.confirm(
      `<div>确定要执行该决策吗？</div><div style="margin-top: 10px;">决策ID：${row.id}</div><div>决策编号：${row.decisionNo}</div>`,
      '确认执行决策',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )
    
    // 调用API
    const response = await authApi.executeDecision(row.id)
    
    ElMessage.success(response || '执行已触发')
    
    // 刷新列表和统计数据
    fetchDecisionList()
    fetchDecisionStatistics()
  } catch (error) {
    console.error('执行决策失败:', error)
    if (error !== 'cancel') {
      ElMessage.error('执行决策失败，请重试')
    }
  }
}

// 组件挂载时初始化数据
onMounted(() => {
  fetchDecisionList()
  fetchDecisionStatistics()
})
</script>

<style scoped>
.decision-list-container {
  padding: 20px 0;
}

.query-card {
  margin-bottom: 20px;
}

.demo-form-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 统计数据样式 */
.statistics-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.statistics-row {
  margin-bottom: 20px;
}

.statistic-card {
  height: 100%;
  transition: all 0.3s ease;
}

.statistic-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.statistic-label {
  font-size: 14px;
  color: var(--color-text-regular);
  margin-bottom: 10px;
}

.statistic-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.statistic-value.pending {
  color: var(--color-warning);
}

.statistic-value.adopted {
  color: var(--color-success);
}

.statistic-value.today {
  color: var(--color-primary);
}

.statistic-value.executed {
  color: var(--color-text-secondary);
}

.statistic-value.failed {
  color: var(--color-danger);
}

.statistic-value.ignored {
  color: var(--color-text-secondary);
}

.statistic-value.confidence {
  color: var(--color-success);
}

.statistics-detail-row {
  margin-top: 20px;
}

.detail-card {
  height: 100%;
}

.detail-header {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-text-primary);
}

/* 详情弹窗样式 */
.json-content {
  background-color: var(--color-bg-page);
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-primary);
}

.ai-analysis-content {
  padding: 10px;
  line-height: 1.5;
}
</style>