<template>
  <div class="charging-fault-audit">
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
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input v-model="filterForm.keyword" placeholder="搜索标题、审核单号" style="width: 200px;"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="fetchComplaintList">查询</el-button>
          <el-button @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table :data="complaintList" border stripe style="width: 100%" v-loading="loading">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="auditNo" label="审核单号" width="180"></el-table-column>
        <el-table-column prop="title" label="标题"></el-table-column>
        <el-table-column prop="applicantName" label="申请人" width="120"></el-table-column>
        <el-table-column prop="applicantPhone" label="联系电话" width="150"></el-table-column>
        <el-table-column prop="priorityName" label="优先级" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.priority === 2 ? 'danger' : 'info'">
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
            <el-button type="success" size="small" @click="handleAudit(scope.row)" v-if="scope.row.currentStatus === 0 || scope.row.currentStatus === 1">审核</el-button>
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
      title="故障详情"
      width="800px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" border v-loading="detailLoading">
        <el-descriptions-item label="审核单号">{{ currentComplaint.auditNo }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ currentComplaint.title }}</el-descriptions-item>
        <el-descriptions-item label="审核类型">{{ currentComplaint.auditTypeName }}</el-descriptions-item>
        <el-descriptions-item label="申请人">{{ currentComplaint.applicantName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentComplaint.applicantPhone }}</el-descriptions-item>
        <el-descriptions-item label="优先级">
          <el-tag :type="currentComplaint.priority === 2 ? 'danger' : 'info'">
            {{ currentComplaint.priorityName }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="getStatusType(currentComplaint.currentStatus)">
            {{ currentComplaint.statusName }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="提交时间">{{ currentComplaint.submitTime }}</el-descriptions-item>
        <el-descriptions-item label="完成时间" v-if="currentComplaint.finishTime">{{ currentComplaint.finishTime }}</el-descriptions-item>
        <el-descriptions-item label="内容" :span="2">{{ currentComplaint.content }}</el-descriptions-item>
        <el-descriptions-item label="最终意见" v-if="currentComplaint.finalOpinion" :span="2">{{ currentComplaint.finalOpinion }}</el-descriptions-item>
        <el-descriptions-item label="拒绝原因" v-if="currentComplaint.rejectReason" :span="2">{{ currentComplaint.rejectReason }}</el-descriptions-item>
      </el-descriptions>
      
      <!-- 图片附件 -->
      <div v-if="currentComplaint.imageList && currentComplaint.imageList.length > 0" style="margin-top: 20px;">
        <h4>附件图片：</h4>
        <div class="image-list">
          <el-image
            v-for="(image, index) in currentComplaint.imageList"
            :key="index"
            :src="image.trim()"
            :preview-src-list="currentComplaint.imageList.map(img => img.trim())"
            fit="cover"
            style="width: 150px; height: 150px; margin-right: 10px; margin-bottom: 10px;"
          ></el-image>
        </div>
      </div>
      
      <!-- 详情页审核按钮 -->
      <div style="margin-top: 20px; text-align: right;">
        <el-button type="success" @click="handleAudit(currentComplaint)" v-if="currentComplaint.currentStatus === 0 || currentComplaint.currentStatus === 1">审核</el-button>
      </div>
    </el-dialog>

    <!-- 审核对话框 -->
    <el-dialog
      v-model="showAuditDialog"
      title="故障审核"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form :model="auditForm" :rules="auditRules" ref="auditFormRef" label-position="top">
        <el-form-item label="审核结果" prop="action">
          <el-radio-group v-model="auditForm.action">
            <el-radio label="1">通过</el-radio>
            <el-radio label="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="auditForm.priority" placeholder="请选择优先级" clearable>
            <el-option label="低" value="0"></el-option>
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
        <el-form-item label="拒绝原因" prop="rejectReason" v-if="auditForm.action === '2'">
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'

// 加载状态
const loading = ref(false)

// 筛选条件
const filterForm = reactive({
  status: '',
  stationId: '',
  keyword: '',
  startTime: '',
  endTime: '',
  priority: '',
  auditType: 3 // 固定为充电桩故障类型
})

// 分页信息
const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  pages: 0
})

// 投诉列表数据
const complaintList = ref([])

// 详情对话框显示状态
const showDetailDialog = ref(false)
// 当前查看的投诉详情
const currentComplaint = ref({})
// 详情加载状态
const detailLoading = ref(false)

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
  rejectReason: ''
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
  rejectReason: [
    {
      required: false,
      validator: (rule, value, callback) => {
        if (auditForm.action === '2' && !value.trim()) {
          callback(new Error('拒绝时必须填写拒绝原因'))
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

// 获取状态类型
const getStatusType = (status) => {
  switch (status) {
    case 0: // 待审核
      return 'info'
    case 1: // 审核中
      return 'warning'
    case 2: // 已通过
      return 'success'
    case 3: // 已拒绝
      return 'danger'
    case 4: // 需补充材料
      return 'warning'
    case 5: // 已撤回
      return 'info'
    default:
      return 'info'
  }
}

// 获取投诉列表
const fetchComplaintList = async () => {
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
    
    const response = await authApi.getComplaintList(params)
    complaintList.value = response.list || []
    pagination.total = response.total || 0
    pagination.pages = response.pages || 0
  } catch (error) {
    console.error('获取故障审核列表失败:', error)
    ElMessage.error('获取故障审核列表失败')
  } finally {
    loading.value = false
  }
}

// 重置筛选条件
const resetFilter = () => {
  Object.keys(filterForm).forEach(key => {
    if (key === 'auditType') {
      filterForm[key] = 3
    } else {
      filterForm[key] = ''
    }
  })
  fetchComplaintList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  pagination.pageSize = size
  pagination.pageNum = 1
  fetchComplaintList()
}

// 页码变化
const handleCurrentChange = (page) => {
  pagination.pageNum = page
  fetchComplaintList()
}

// 查看详情
const handleViewDetail = async (row) => {
  detailLoading.value = true
  try {
    const response = await authApi.getComplaintDetail(row.id)
    currentComplaint.value = response || {}
    showDetailDialog.value = true
  } catch (error) {
    console.error('获取故障详情失败:', error)
    ElMessage.error('获取故障详情失败')
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
    // 调用审核API
    await authApi.auditFault({
      id: currentAuditId.value,
      action: parseInt(auditForm.action),
      opinion: auditForm.opinion,
      priority: auditForm.priority ? parseInt(auditForm.priority) : null,
      rejectReason: auditForm.rejectReason.trim() || null
    })
    ElMessage.success('审核成功')
    showAuditDialog.value = false
    fetchComplaintList() // 刷新列表
  } catch (error) {
    console.error('审核失败:', error)
    ElMessage.error('审核失败')
  }
}

// 初始加载
onMounted(() => {
  fetchComplaintList()
})
</script>

<style scoped>
.charging-fault-audit {
  padding: 0;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
}
</style>