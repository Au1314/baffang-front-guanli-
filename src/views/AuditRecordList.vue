<template>
  <div class="audit-record-list">
    <!-- 筛选条件 -->
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <!-- 审核类型 -->
        <el-form-item label="审核类型">
          <el-select v-model="filterForm.auditType" placeholder="请选择" clearable style="width: 180px">
            <el-option label="全部" :value="''" />
            <el-option label="私桩认证" :value="0" />
            <el-option label="车主认证" :value="1" />
            <el-option label="充电桩投诉" :value="2" />
            <el-option label="充电桩故障" :value="3" />
            <el-option label="评论举报" :value="4" />
            <el-option label="交易申诉" :value="5" />
          </el-select>
        </el-form-item>

        <!-- 审核状态 -->
        <el-form-item label="审核状态">
          <el-select v-model="filterForm.status" placeholder="请选择" clearable style="width: 180px">
            <el-option label="全部" :value="''" />
            <el-option label="待审核" :value="0" />
            <el-option label="审核中" :value="1" />
            <el-option label="通过" :value="2" />
            <el-option label="拒绝" :value="3" />
            <el-option label="需补充" :value="4" />
            <el-option label="撤回" :value="5" />
          </el-select>
        </el-form-item>

        <!-- 优先级 -->
        <el-form-item label="优先级">
          <el-select v-model="filterForm.priority" placeholder="请选择" clearable style="width: 180px">
            <el-option label="全部" :value="''" />
            <el-option label="低" :value="0" />
            <el-option label="普通" :value="1" />
            <el-option label="高" :value="2" />
            <el-option label="紧急" :value="3" />
          </el-select>
        </el-form-item>

        <!-- 关键词 -->
        <el-form-item label="关键词">
          <el-input 
            v-model="filterForm.keyword" 
            placeholder="审核单号、标题" 
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <!-- 时间范围 -->
        <el-form-item label="提交时间">
          <el-date-picker
            v-model="filterForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            clearable
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格展示 -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>审核记录列表</span>
          <span class="total-count">共 {{ total }} 条记录</span>
        </div>
      </template>
      
      <el-table 
        v-loading="loading" 
        :data="auditList" 
        style="width: 100%"
        stripe
        @row-click="handleRowClick"
      >
        <!-- 审核编号 -->
        <el-table-column prop="auditNo" label="审核编号" min-width="180" />
        
        <!-- 标题 -->
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        
        <!-- 审核类型 -->
        <el-table-column prop="auditTypeName" label="审核类型" width="120" />
        
        <!-- 审核状态 -->
        <el-table-column prop="statusName" label="审核状态" width="100">
          <template #default="scope">
            <el-tag 
              :type="getStatusTagType(scope.row.currentStatus)"
              size="small"
            >
              {{ scope.row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        
        <!-- 优先级 -->
        <el-table-column prop="priorityName" label="优先级" width="100">
          <template #default="scope">
            <el-tag 
              :type="getPriorityTagType(scope.row.priority)"
              size="small"
            >
              {{ scope.row.priorityName }}
            </el-tag>
          </template>
        </el-table-column>
        
        <!-- 申请人 -->
        <el-table-column prop="applicantName" label="申请人" width="120">
          <template #default="scope">
            {{ scope.row.applicantName || '未知' }}
          </template>
        </el-table-column>
        
        <!-- 提交时间 -->
        <el-table-column prop="submitTime" label="提交时间" width="180">
          <template #default="scope">
            {{ formatDateTime(scope.row.submitTime) }}
          </template>
        </el-table-column>
        
        <!-- 审核人 -->
        <el-table-column prop="currentAdminName" label="当前审核人" width="120">
          <template #default="scope">
            {{ scope.row.currentAdminName || '暂无' }}
          </template>
        </el-table-column>
        
        <!-- 完成时间 -->
        <el-table-column prop="finishTime" label="完成时间" width="180">
          <template #default="scope">
            {{ scope.row.finishTime ? formatDateTime(scope.row.finishTime) : '未完成' }}
          </template>
        </el-table-column>
        
        <!-- 操作 -->
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleViewDetail(scope.row, $event)"
              plain
            >
              查看详情
            </el-button>
            <el-button 
              type="success" 
              size="small" 
              @click="handleViewLogs(scope.row, $event)"
              plain
              style="margin-left: 8px;"
            >
              查看日志
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>

  <!-- 详情弹窗 -->
  <el-dialog
    v-model="detailDialogVisible"
    title="审核记录详情"
    width="800px"
    :close-on-click-modal="true"
  >
    <div v-if="detailLoading" class="dialog-loading">
      <el-skeleton :rows="10" animated />
    </div>
    
    <div v-else-if="auditDetail" class="audit-detail-content">
      <!-- 基本信息 -->
      <el-card shadow="never" class="detail-section">
        <template #header>
          <span class="section-title">基本信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="审核单号">{{ auditDetail.auditNo }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ auditDetail.title }}</el-descriptions-item>
          <el-descriptions-item label="审核类型">
            <el-tag :type="getStatusTagType(auditDetail.currentStatus)" size="small">
              {{ auditDetail.auditTypeName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="当前状态">
            <el-tag :type="getStatusTagType(auditDetail.currentStatus)" size="small">
              {{ auditDetail.statusName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityTagType(auditDetail.priority)" size="small">
              {{ auditDetail.priorityName }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">{{ formatDateTime(auditDetail.submitTime) }}</el-descriptions-item>
          <el-descriptions-item label="当前审核人">{{ auditDetail.currentAdminName || '暂无' }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ auditDetail.finishTime ? formatDateTime(auditDetail.finishTime) : '未完成' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 申请人信息 -->
      <el-card shadow="never" class="detail-section">
        <template #header>
          <span class="section-title">申请人信息</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="申请人ID">{{ auditDetail.applicantId }}</el-descriptions-item>
          <el-descriptions-item label="申请人姓名">{{ auditDetail.applicantName || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="申请人手机号">{{ auditDetail.applicantPhone || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="申请人用户名">{{ auditDetail.applicantUsername || '未知' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 提交内容 -->
      <el-card shadow="never" class="detail-section">
        <template #header>
          <span class="section-title">提交内容</span>
        </template>
        <div class="content-text">{{ auditDetail.content }}</div>
      </el-card>

      <!-- 附件列表 -->
      <el-card shadow="never" class="detail-section" v-if="formattedAttachments.length > 0">
        <template #header>
          <span class="section-title">附件列表</span>
        </template>
        <div class="attachment-list">
          <div 
            v-for="(attachment, index) in formattedAttachments" 
            :key="index" 
            class="attachment-item"
          >
            <el-link :href="attachment" target="_blank" :underline="true">
              <el-icon><Document /></el-icon>
              附件{{ index + 1 }} {{ getFileExtension(attachment) }}
            </el-link>
          </div>
        </div>
      </el-card>

      <!-- 审核日志 -->
      <el-card shadow="never" class="detail-section">
        <template #header>
          <span class="section-title">审核日志</span>
        </template>
        <el-skeleton v-if="logsLoading" :rows="5" animated />
        <div v-else-if="auditLogs && auditLogs.length > 0">
          <el-timeline>
            <el-timeline-item 
              v-for="log in auditLogs" 
              :key="log.id || log.createTime"
              :timestamp="formatDateTime(log.createTime)"
            >
              <div class="detail-log-item">
                <div class="log-header">
                  <strong>{{ log.adminName || '系统' }}</strong> - <span class="log-action">{{ log.actionName }}</span>
                </div>
                <div class="log-status">
                  <span class="status-label">状态变更：</span>
                  <el-tag size="small" type="info">{{ log.fromStatusName }}</el-tag>
                  <span class="status-arrow">→</span>
                  <el-tag size="small" :type="log.toStatus === 2 ? 'success' : log.toStatus === 3 ? 'danger' : 'warning'">
                    {{ log.toStatusName }}
                  </el-tag>
                </div>
                <div class="log-opinion" v-if="log.opinion">
                  <span class="opinion-label">操作意见：</span>
                  <span class="opinion-content">{{ log.opinion }}</span>
                </div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
        <div v-else class="empty-log">暂无审核日志</div>
      </el-card>
    </div>
    
    <div v-else class="dialog-empty">
      <el-empty description="暂无数据" />
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>

  <!-- 日志弹窗 -->
  <el-dialog
    v-model="logsDialogVisible"
    title="审核操作日志"
    width="600px"
    :close-on-click-modal="true"
  >
    <div v-if="logsLoading" class="dialog-loading">
      <el-skeleton :rows="8" animated />
    </div>
    
    <div v-else-if="auditLogs && auditLogs.length > 0" class="audit-logs-content">
      <el-timeline>
        <el-timeline-item 
          v-for="log in auditLogs" 
          :key="log.id || log.createTime"
          :timestamp="formatDateTime(log.createTime)"
          placement="top"
        >
          <div class="log-item">
            <div class="log-header">
              <div class="log-operator">{{ log.adminName || '系统' }}</div>
              <div class="log-action">{{ log.actionName }}</div>
            </div>
            <div class="log-status">
              <span class="status-label">原状态：</span>
              <el-tag size="small" type="info">{{ log.fromStatusName }}</el-tag>
              <span class="status-arrow">→</span>
              <span class="status-label">目标状态：</span>
              <el-tag size="small" :type="log.toStatus === 2 ? 'success' : log.toStatus === 3 ? 'danger' : 'warning'">
                {{ log.toStatusName }}
              </el-tag>
            </div>
            <div class="log-opinion" v-if="log.opinion">
              <span class="opinion-label">操作意见：</span>
              <div class="opinion-content">{{ log.opinion }}</div>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
    </div>
    
    <div v-else class="dialog-empty">
      <el-empty description="暂无审核日志" />
    </div>
    
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="logsDialogVisible = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { getAuditRecordList, getAuditRecordDetail, getAuditRecordLogs } from '@/api/audit'
import { ElMessage } from 'element-plus'
import { Document } from '@element-plus/icons-vue'

// 筛选条件表单
const filterForm = ref({
  auditType: '',
  status: '',
  priority: '',
  keyword: '',
  dateRange: []
})

// 分页参数
const pagination = ref({
  pageNum: 1,
  pageSize: 10
})

// 表格数据
const auditList = ref([])
const total = ref(0)
const loading = ref(false)

// 详情弹窗相关数据
const detailDialogVisible = ref(false)
const auditDetail = ref(null)
const detailLoading = ref(false)
// 审核操作日志数据
const auditLogs = ref([])
const logsLoading = ref(false)
// 日志弹窗相关数据
const logsDialogVisible = ref(false)
const selectedAuditId = ref(null)

// 格式化附件列表
const formattedAttachments = computed(() => {
  if (!auditDetail.value) return []
  
  // 优先使用attachmentList数组
  if (auditDetail.value.attachmentList && auditDetail.value.attachmentList.length > 0) {
    return auditDetail.value.attachmentList.map(attach => {
      // 清理可能存在的空格和引号
      return attach.trim().replace(/^[`'"]+|[`'"]+$/g, '')
    })
  }
  
  // 如果attachmentList不存在，尝试从attachments字符串解析
  if (auditDetail.value.attachments) {
    return auditDetail.value.attachments
      .split(',')
      .map(attach => attach.trim().replace(/^[`'"]+|[`'"]+$/g, ''))
      .filter(attach => attach)
  }
  
  return []
})

// 获取文件扩展名
const getFileExtension = (url) => {
  if (!url) return ''
  const fileName = url.split('/').pop()
  const ext = fileName.split('.').pop().toLowerCase()
  return `.${ext}`
}

// 根据状态获取标签类型
const getStatusTagType = (status) => {
  const statusMap = {
    0: 'info', // 待审核
    1: 'warning', // 审核中
    2: 'success', // 通过
    3: 'danger', // 拒绝
    4: 'warning', // 需补充
    5: 'info' // 撤回
  }
  return statusMap[status] || 'info'
}

// 根据优先级获取标签类型
const getPriorityTagType = (priority) => {
  const priorityMap = {
    0: 'info', // 低
    1: 'success', // 普通
    2: 'warning', // 高
    3: 'danger' // 紧急
  }
  return priorityMap[priority] || 'info'
}

// 格式化日期时间
const formatDateTime = (datetime) => {
  if (!datetime) return ''
  const date = new Date(datetime)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 构建请求参数
const buildRequestParams = () => {
  const params = {
    ...pagination.value,
    // 只有当值为null或undefined时才设为undefined，避免0值被过滤掉
    auditType: filterForm.value.auditType === null || filterForm.value.auditType === undefined ? undefined : filterForm.value.auditType,
    status: filterForm.value.status === null || filterForm.value.status === undefined ? undefined : filterForm.value.status,
    priority: filterForm.value.priority === null || filterForm.value.priority === undefined ? undefined : filterForm.value.priority,
    keyword: filterForm.value.keyword || undefined,
    startTime: filterForm.value.dateRange?.[0] || undefined,
    endTime: filterForm.value.dateRange?.[1] || undefined
  }
  return params
}

// 获取审核记录列表
const fetchAuditRecordList = async () => {
  loading.value = true
  try {
    const params = buildRequestParams()
    const response = await getAuditRecordList(params)
    auditList.value = response.list || []
    total.value = response.total || 0
  } catch (error) {
    console.error('获取审核记录列表失败:', error)
    ElMessage.error('获取审核记录列表失败')
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
  pagination.value.pageNum = 1 // 重置页码
  fetchAuditRecordList()
}

// 重置
const handleReset = () => {
  filterForm.value = {
    auditType: '',
    status: '',
    priority: '',
    keyword: '',
    dateRange: []
  }
  pagination.value = {
    pageNum: 1,
    pageSize: 10
  }
  fetchAuditRecordList()
}

// 分页大小改变
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  fetchAuditRecordList()
}

// 当前页改变
const handleCurrentChange = (current) => {
  pagination.value.pageNum = current
  fetchAuditRecordList()
}

// 获取审核日志
const fetchAuditLogs = async (id) => {
  logsLoading.value = true
  try {
    const response = await getAuditRecordLogs(id)
    // 响应拦截器已经处理了API响应，直接使用response
    auditLogs.value = response || []
    return response || []
  } catch (error) {
    console.error('获取审核操作日志失败:', error)
    ElMessage.error('获取审核操作日志失败')
    auditLogs.value = []
    return []
  } finally {
    logsLoading.value = false
  }
}

// 查看详情
const fetchAuditDetail = async (id) => {
  detailLoading.value = true
  logsLoading.value = true
  try {
    // 并行获取审核详情和审核日志
    const [detailResponse, logsResponse] = await Promise.all([
      getAuditRecordDetail(id),
      fetchAuditLogs(id)
    ])
    auditDetail.value = detailResponse
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取审核记录详情失败:', error)
    ElMessage.error('获取审核记录详情失败')
    // 清空日志数据，防止显示旧数据
    auditLogs.value = []
  } finally {
    detailLoading.value = false
    logsLoading.value = false
  }
}

// 点击查看详情按钮
const handleViewDetail = (row, event) => {
  // 阻止事件冒泡，避免触发行点击事件
  if (event) {
    event.stopPropagation()
  }
  fetchAuditDetail(row.id)
}

// 点击查看日志按钮
const handleViewLogs = async (row, event) => {
  // 阻止事件冒泡，避免触发行点击事件
  if (event) {
    event.stopPropagation()
  }
  selectedAuditId.value = row.id
  await fetchAuditLogs(row.id)
  logsDialogVisible.value = true
}

// 点击列表项
const handleRowClick = (row) => {
  fetchAuditDetail(row.id)
}

// 组件挂载时获取数据
onMounted(() => {
  fetchAuditRecordList()
})
</script>

<style scoped>
.audit-record-list {
  width: 100%;
}

.filter-card {
  margin-bottom: 16px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.table-card {
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.total-count {
  font-size: 14px;
  color: #606266;
  font-weight: normal;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

/* 详情弹窗样式 */
.dialog-loading {
  padding: 20px 0;
}

.audit-detail-content {
  max-height: 600px;
  overflow-y: auto;
}

.detail-section {
  margin-bottom: 16px;
}

.section-title {
  font-weight: bold;
  font-size: 16px;
}

.content-text {
  white-space: pre-wrap;
  line-height: 1.6;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px 0;
}

.attachment-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.attachment-item .el-icon {
  font-size: 16px;
  color: #409eff;
}

.empty-log {
  text-align: center;
  padding: 20px;
  color: #909399;
}

.dialog-empty {
  padding: 40px 0;
}

/* 日志弹窗样式 */
.audit-logs-content {
  max-height: 500px;
  overflow-y: auto;
}

.log-item {
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 8px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.log-operator {
  font-weight: bold;
  color: #303133;
}

.log-action {
  color: #409eff;
  font-weight: 500;
}

.log-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.status-label {
  color: #606266;
  font-size: 14px;
}

.status-arrow {
  color: #909399;
  font-weight: bold;
}

.log-opinion {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e4e7ed;
}

.opinion-label {
  display: block;
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
}

.opinion-content {
  color: #303133;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  background-color: #fff;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #ebeef5;
}

/* 详情弹窗中的日志样式 */
.detail-log-item {
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.detail-log-item .log-header {
  margin-bottom: 8px;
}

.detail-log-item .log-status {
  margin-bottom: 8px;
}

.detail-log-item .log-opinion {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px dashed #e4e7ed;
}

.detail-log-item .opinion-label {
  display: inline;
  margin-right: 8px;
}

.detail-log-item .opinion-content {
  display: inline;
  background: none;
  padding: 0;
  border: none;
}

.el-timeline-item__timestamp {
  font-size: 12px;
  color: #909399;
}

/* 确保标签之间有适当的间距 */
.el-timeline-item .el-tag {
  margin-right: 8px;
}
</style>
