<template>
  <div class="post-report-audit">
    <!-- 筛选条件 -->
    <el-card shadow="never" style="margin-bottom: 16px;">
      <el-form :inline="true" :model="filterForm" class="demo-form-inline">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="请选择" clearable style="width: 120px;">
            <el-option label="审核中" value="1"></el-option>
            <el-option label="已通过" value="2"></el-option>
            <el-option label="已拒绝" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="filterForm.priority" placeholder="请选择" clearable style="width: 120px;">
            <el-option label="普通" value="1"></el-option>
            <el-option label="高" value="2"></el-option>
            <el-option label="紧急" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="搜索标题、审核单号、内容" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchReportList">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table :data="reportList" border stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="auditNo" label="审核单号" width="180"></el-table-column>
        <el-table-column prop="title" label="举报标题"></el-table-column>
        <el-table-column prop="applicantName" label="举报人" width="120"></el-table-column>
        <el-table-column prop="reportedUserName" label="被举报人" width="120"></el-table-column>
        <el-table-column prop="priorityName" label="优先级" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.priority === 3 ? 'danger' : scope.row.priority === 2 ? 'warning' : 'info'">
              {{ scope.row.priorityName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="currentStatus" label="状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.currentStatus)">
              {{ scope.row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="submitTime" label="提交时间" width="180"></el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleViewDetail(scope.row)">查看详情</el-button>
            <el-button type="success" size="small" @click="handleAudit(scope.row)" v-if="scope.row.currentStatus === 1">审核</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        ></el-pagination>
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetailDialog"
      title="举报详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border v-loading="detailLoading">
        <el-descriptions-item label="审核单号">{{ currentReport.auditNo || '-' }}</el-descriptions-item>
        <el-descriptions-item label="举报标题">{{ currentReport.title || '-' }}</el-descriptions-item>
        <el-descriptions-item label="审核类型">{{ currentReport.auditTypeName || '-' }}</el-descriptions-item>
        <el-descriptions-item label="业务ID">{{ currentReport.businessId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="举报人">
          {{ currentReport.applicantName || '-' }}
          <div v-if="currentReport.applicantUsername" style="font-size: 12px; color: var(--color-text-regular); margin-top: 4px;">
            用户名：{{ currentReport.applicantUsername }}
          </div>
          <div v-if="currentReport.applicantPhone" style="font-size: 12px; color: var(--color-text-regular);">
            电话：{{ currentReport.applicantPhone }}
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="被举报人">
          <div>
            {{ currentReport.reportedUserName || '-' }}
            <span v-if="currentReport.reportedUserId" style="font-size: 12px; color: var(--color-text-regular); margin-left: 10px;">
              ID：{{ currentReport.reportedUserId }}
            </span>
          </div>
          <div v-if="currentReport.reportedUserAvatar" style="margin-top: 4px;">
            <el-avatar :src="currentReport.reportedUserAvatar" size="small"></el-avatar>
          </div>
        </el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="currentReport.priority === 3 ? 'danger' : currentReport.priority === 2 ? 'warning' : 'info'">
            {{ currentReport.priorityName || '-' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentReport.currentStatus)">
            {{ currentReport.statusName || '-' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentReport.submitTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="完成时间">{{ currentReport.finishTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="举报内容" :span="2">{{ currentReport.content || '-' }}</el-descriptions-item>
        <el-descriptions-item label="被举报内容" :span="2">{{ currentReport.reportedContent || '-' }}</el-descriptions-item>
        <el-descriptions-item label="最终意见" :span="2">{{ currentReport.finalOpinion || '-' }}</el-descriptions-item>
        <el-descriptions-item label="拒绝原因" :span="2">{{ currentReport.rejectReason || '-' }}</el-descriptions-item>
        <!-- 附件列表 -->
        <el-descriptions-item label="附件列表" :span="2">
          <div class="attachment-list" v-if="formattedAttachments.length > 0">
            <el-link
              v-for="(attachment, index) in formattedAttachments"
              :key="index"
              :href="attachment"
              target="_blank"
              style="margin-right: 10px; margin-bottom: 10px; display: inline-block"
            >
              {{ attachment.split('/').pop() }}
            </el-link>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
        <!-- 审核日志 -->
        <el-descriptions-item label="审核日志" :span="2">
          <div class="audit-logs" v-if="currentReport.auditLogs && currentReport.auditLogs.length > 0">
            <el-timeline>
              <el-timeline-item
                v-for="(log, index) in currentReport.auditLogs"
                :key="index"
                :timestamp="log.createTime || '-'"
                :type="log.action === 1 ? 'success' : 'warning'"
              >
                <div class="log-content">
                  <div><strong>{{ log.actionName || '-' }}</strong></div>
                  <div>操作人：{{ log.adminName || '-' }}</div>
                  <div>状态变更：{{ log.fromStatusName || '-' }} → {{ log.toStatusName || '-' }}</div>
                  <div v-if="log.opinion">审核意见：{{ log.opinion }}</div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
          <span v-else>-</span>
        </el-descriptions-item>
      </el-descriptions>
      
      <!-- 详情页审核按钮 -->
      <div style="margin-top: 20px; text-align: right;">
        <el-button type="success" @click="handleAudit(currentReport)" v-if="currentReport.currentStatus === 1">审核</el-button>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="showAuditDialog"
      title="举报审核"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="auditForm" :rules="auditRules" ref="auditFormRef" label-position="top">
        <el-form-item label="审核结果" prop="action">
          <el-radio-group v-model="auditForm.action">
            <el-radio label="2">通过</el-radio>
            <el-radio label="3">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="auditForm.priority" placeholder="请选择优先级" clearable>
            <el-option label="普通" value="1"></el-option>
            <el-option label="高" value="2"></el-option>
            <el-option label="紧急" value="3"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核意见" prop="opinion">
          <el-input
            v-model="auditForm.opinion"
            type="textarea"
            :rows="4"
            placeholder="请输入审核意见"
          ></el-input>
        </el-form-item>
        <el-form-item label="是否删除内容" prop="deleteContent" v-if="auditForm.action === '2'">
          <el-switch v-model="auditForm.deleteContent" active-text="是" inactive-text="否"></el-switch>
        </el-form-item>
        <el-form-item label="拒绝原因" prop="rejectReason" v-if="auditForm.action === '3'">
          <el-input
            v-model="auditForm.rejectReason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancelAudit">取消</el-button>
          <el-button type="primary" @click="submitAudit">提交审核</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'
import { getAuditStatusType as getStatusType } from '@/utils/statusMaps'

// 加载状态
const loading = ref(false)

// 筛选条件
const filterForm = reactive({
  status: '',
  keyword: '',
  startTime: '',
  endTime: '',
  priority: '',
  pageNum: 1,
  pageSize: 10
})

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  pages: 0
})

// 举报列表数据
const reportList = ref([])

// 详情对话框显示状态
const showDetailDialog = ref(false)
// 当前查看的举报详情
const currentReport = ref({})
// 详情加载状态
const detailLoading = ref(false)

// 格式化附件列表
const formattedAttachments = computed(() => {
  // 添加调试日志
  
  if (!currentReport.value) return []
  
  let attachments = []
  
  // 优先使用attachmentList数组
  if (Array.isArray(currentReport.value.attachmentList) && currentReport.value.attachmentList.length > 0) {
    attachments = currentReport.value.attachmentList
  } 
  // 如果attachmentList不存在或为空，尝试从attachments字符串解析
  else if (typeof currentReport.value.attachments === 'string' && currentReport.value.attachments.trim()) {
    attachments = currentReport.value.attachments.split(',')
  }
  
  // 清理和过滤附件
  const result = attachments.map(attach => {
    if (typeof attach === 'string') {
      // 清理可能存在的空格和引号
      const cleaned = attach.trim().replace(/^[`'"\s]+|[`'"\s]+$/g, '')
      return cleaned
    }
    return ''
  }).filter(attach => attach)
  
  return result
})

// 审核相关数据
// 审核对话框显示状态
const showAuditDialog = ref(false)
// 审核表单引用
const auditFormRef = ref()
// 当前审核的记录ID
const currentAuditId = ref(0)
// 审核表单数据
const auditForm = reactive({
  action: '',
  opinion: '',
  priority: '',
  rejectReason: '',
  deleteContent: false
})

// 审核表单验证规则
const auditRules = {
  action: [
    { required: true, message: '请选择审核结果', trigger: 'change' }
  ],
  opinion: [
    { required: true, message: '请输入审核意见', trigger: 'blur' },
    { min: 1, max: 500, message: '审核意见长度在 1 到 500 个字符', trigger: 'blur' }
  ],
  deleteContent: [
    {
      type: 'boolean',
      message: '请选择是否删除内容',
      trigger: ['change']
    }
  ],
  rejectReason: [
    {
      required: false,
      validator: (rule, value, callback) => {
        if (auditForm.action === '3' && !value.trim()) {
          return '拒绝时必须填写拒绝原因'
        } else {
          callback()
        }
      },
      trigger: ['blur', 'change']
    },
    {
      min: 1,
      max: 500,
      message: '拒绝原因长度在 1 到 500 个字符',
      trigger: 'blur'
    }
  ]
}

// 获取举报列表
const fetchReportList = async () => {
  loading.value = true
  try {
    const params = {
      ...filterForm,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize
    }
    
    // 移除空值参数
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await authApi.getPostReportList(params)
    reportList.value = response?.list || []
    pagination.total = response?.total || 0
    pagination.pages = response?.pages || 0
  } catch (error) {
    console.error('获取举报审核列表失败:', error)
    ElMessage.error('获取举报审核列表失败')
  } finally {
    loading.value = false
  }
}

// 重置筛选条件
const resetFilter = () => {
  Object.keys(filterForm).forEach(key => {
    filterForm[key] = ''
  })
  fetchReportList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  fetchReportList()
}

// 页码变化
const handleCurrentChange = (page) => {
  pagination.pageNum = page
  fetchReportList()
}

// 查看详情
const handleViewDetail = async (row) => {
  try {
    showDetailDialog.value = true
    detailLoading.value = true
    const response = await authApi.getReportDetail(row.id)
    // 直接设置返回数据，API拦截器已经处理了响应
    currentReport.value = response || {}
  } catch (error) {
    console.error('获取举报详情失败:', error)
    ElMessage.error('获取举报详情失败')
    currentReport.value = {}
  } finally {
    detailLoading.value = false
  }
}

// 审核操作方法
// 打开审核对话框
const handleAudit = (row) => {
  currentAuditId.value = row.id
  auditForm.action = ''
  auditForm.opinion = ''
  auditForm.priority = ''
  auditForm.rejectReason = ''
  auditForm.deleteContent = false
  showAuditDialog.value = true
}

// 取消审核
const cancelAudit = () => {
  showAuditDialog.value = false
}

// 提交审核
const submitAudit = async () => {
  if (!auditFormRef.value) return
  await auditFormRef.value.validate()
  try {
    if (auditForm.action === '2') {
      // 审核通过，调用approveReport API
      await authApi.approveReport(currentAuditId.value, {
        opinion: auditForm.opinion,
        deleteContent: auditForm.deleteContent
      })
    } else if (auditForm.action === '3') {
      // 审核拒绝，调用rejectReport API
      await authApi.rejectReport(currentAuditId.value, {
        opinion: auditForm.opinion,
        rejectReason: auditForm.rejectReason.trim()
      })
    }
    ElMessage.success('审核成功')
    showAuditDialog.value = false
    fetchReportList() // 刷新列表
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.error('审核失败')
  }
}

// 初始加载
onMounted(() => {
  fetchReportList()
})
</script>

<style scoped>
.post-report-audit {
  padding: 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 附件列表样式 */
.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 审核日志样式 */
.audit-logs {
  margin-top: 10px;
}

.log-content {
  padding: 10px;
  background-color: var(--color-bg-page);
  border-radius: 4px;
}
</style>