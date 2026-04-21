<template>
  <div class="car-owner-audit-container">
    <!-- 筛选条件 -->
    <div class="filter-bar" style="margin-bottom: 16px;">
      <el-select 
        v-model="auditFilter.status" 
        placeholder="请选择审核状态" 
        style="width: 150px; margin-right: 10px;"
        clearable
      >
        <el-option label="待审核" :value="0" />
        <el-option label="审核中" :value="1" />
        <el-option label="已通过" :value="2" />
        <el-option label="已拒绝" :value="3" />
      </el-select>
      <el-select 
        v-model="auditFilter.priority" 
        placeholder="请选择优先级" 
        style="width: 150px; margin-right: 10px;"
        clearable
      >
        <el-option label="低" :value="0" />
        <el-option label="普通" :value="1" />
        <el-option label="高" :value="2" />
        <el-option label="紧急" :value="3" />
      </el-select>
      <el-input 
        v-model="auditFilter.keyword" 
        placeholder="请输入关键字" 
        style="width: 200px; margin-right: 10px;" 
        clearable
        @keyup.enter="fetchAuditList"
      />
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="margin-right: 10px;"
      />
      <el-button type="primary" @click="fetchAuditList">查询</el-button>
      <el-button @click="resetAuditFilter">重置</el-button>
    </div>
    
    <!-- 审核列表 -->
    <el-table :data="auditList" stripe style="width: 100%" :loading="auditLoading" @row-click="handleRowClick">
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="auditNo" label="审核单号" width="180" />
      <el-table-column prop="carBrand" label="品牌" width="100" />
      <el-table-column prop="carName" label="车型" width="100" />
      <el-table-column prop="carType" label="类型" width="120" />
      <el-table-column prop="vehicleNumber" label="车牌号" width="120" />
      <el-table-column prop="applicantName" label="申请人" width="120" />
      <el-table-column prop="applicantPhone" label="联系电话" width="150" />
      <el-table-column prop="currentStatus" label="状态" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.currentStatus)">
            {{ getStatusText(scope.row.currentStatus) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="priority" label="优先级" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getPriorityType(scope.row.priority)">
            {{ getPriorityText(scope.row.priority) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="submitTime" label="提交时间" width="180" align="center" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <div class="operation-buttons">
            <el-button 
              size="small" 
              type="primary" 
              @click.stop="handleViewDetail(scope.row)"
              style="margin-right: 8px"
            >
              详情
            </el-button>
            <el-button 
              v-if="scope.row.currentStatus === 0 || scope.row.currentStatus === 1"
              size="small" 
              type="success" 
              @click.stop="handleAudit(scope.row)"
            >
              审核
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页控件 -->
    <div class="pagination" style="margin-top: 16px;">
      <el-pagination
        v-model:current-page="auditPage"
        v-model:page-size="auditPageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="auditTotal"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
    
    <!-- 审核详情弹窗 -->
    <el-dialog
      v-model="showAuditDetail"
      title="车主认证审核详情"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div v-loading="detailLoading" class="audit-detail-content">
        <!-- 申请人信息 -->
        <el-card shadow="hover" style="margin-bottom: 16px;">
          <template #header>
            <div class="card-header">
              <span>申请人信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="申请人ID">{{ currentAudit.applicantInfo?.id }}</el-descriptions-item>
            <el-descriptions-item label="姓名">{{ currentAudit.applicantInfo?.name }}</el-descriptions-item>
            <el-descriptions-item label="电话">{{ currentAudit.applicantInfo?.phone }}</el-descriptions-item>
            <el-descriptions-item label="车辆认证状态">
              <el-tag :type="currentAudit.applicantInfo?.authVehicle === 2 ? 'success' : 'warning'">
                {{ currentAudit.applicantInfo?.authVehicle === 2 ? '已认证' : '未认证' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 审核信息 -->
        <el-card shadow="hover" style="margin-bottom: 16px;">
          <template #header>
            <div class="card-header">
              <span>审核信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="审核单号">{{ currentAudit.auditInfo?.auditNo }}</el-descriptions-item>
            <el-descriptions-item label="标题">{{ currentAudit.auditInfo?.title }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ currentAudit.auditInfo?.submitTime }}</el-descriptions-item>
            <el-descriptions-item label="当前状态">
              <el-tag :type="getStatusType(currentAudit.auditInfo?.currentStatus)">
                {{ getStatusText(currentAudit.auditInfo?.currentStatus) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="优先级">
              <el-tag :type="getPriorityType(currentAudit.auditInfo?.priority)">
                {{ getPriorityText(currentAudit.auditInfo?.priority) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="当前处理人">{{ currentAudit.auditInfo?.currentAdminName || '无' }}</el-descriptions-item>
            <el-descriptions-item label="完成时间">{{ currentAudit.auditInfo?.finishTime || '未完成' }}</el-descriptions-item>
            <el-descriptions-item label="最终意见">{{ currentAudit.auditInfo?.finalOpinion || '无' }}</el-descriptions-item>
            <el-descriptions-item label="拒绝原因">{{ currentAudit.auditInfo?.rejectReason || '无' }}</el-descriptions-item>
            <el-descriptions-item label="申请内容" :span="2">{{ currentAudit.auditInfo?.content }}</el-descriptions-item>
            <el-descriptions-item label="审核附件" :span="2">
              <div v-if="currentAudit.auditInfo?.attachments" class="attachments-list">
                <el-link 
                  v-for="(attachment, index) in currentAudit.auditInfo.attachments.split(',')" 
                  :key="index" 
                  :href="attachment.trim()" 
                  target="_blank"
                  style="margin-right: 10px; display: inline-block; margin-bottom: 8px;"
                >
                  附件{{ index + 1 }}
                </el-link>
              </div>
              <span v-else>无</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 车辆信息 -->
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>车辆信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="车辆ID">{{ currentAudit.vehicleInfo?.id }}</el-descriptions-item>
            <el-descriptions-item label="车牌号">{{ currentAudit.vehicleInfo?.vehicleNumber }}</el-descriptions-item>
            <el-descriptions-item label="品牌">{{ currentAudit.vehicleInfo?.carBrand }}</el-descriptions-item>
            <el-descriptions-item label="车型">{{ currentAudit.vehicleInfo?.carName }}</el-descriptions-item>
            <el-descriptions-item label="车辆类型">{{ currentAudit.vehicleInfo?.vehicleType }}</el-descriptions-item>
            <el-descriptions-item label="具体型号">{{ currentAudit.vehicleInfo?.carType }}</el-descriptions-item>
            <el-descriptions-item label="电池容量">{{ currentAudit.vehicleInfo?.batteryCapacity }} kWh</el-descriptions-item>
            <el-descriptions-item label="续航里程">{{ currentAudit.vehicleInfo?.range }} km</el-descriptions-item>
            <el-descriptions-item label="最大充电功率">{{ currentAudit.vehicleInfo?.maxChargePower / 1000 }} kW</el-descriptions-item>
            <el-descriptions-item label="最大充电电压">{{ currentAudit.vehicleInfo?.maxChargeVoltage }} V</el-descriptions-item>
            <el-descriptions-item label="最大充电电流">{{ currentAudit.vehicleInfo?.maxChargeCurrent }} A</el-descriptions-item>
            <el-descriptions-item label="放电功率">{{ currentAudit.vehicleInfo?.dischargePower / 1000 }} kW</el-descriptions-item>
            <el-descriptions-item label="认证状态">
              <el-tag :type="currentAudit.vehicleInfo?.authStatus === 1 ? 'warning' : currentAudit.vehicleInfo?.authStatus === 2 ? 'success' : 'info'">
                {{ currentAudit.vehicleInfo?.authStatus === 1 ? '审核中' : currentAudit.vehicleInfo?.authStatus === 2 ? '已认证' : '未认证' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentAudit.vehicleInfo?.createTime }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 审核日志 -->
        <el-card shadow="hover" v-if="currentAudit && currentAudit.auditLogs && currentAudit.auditLogs.length > 0" style="margin-top: 16px;">
          <template #header>
            <div class="card-header">
              <span>审核日志</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item 
              v-for="(log, index) in currentAudit.auditLogs" 
              :key="index"
              :timestamp="log.createTime"
            >
              {{ log.content }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAuditDetail = false">关闭</el-button>
          <el-button 
            v-if="((currentAudit.auditInfo?.currentStatus === 0 || currentAudit.auditInfo?.currentStatus === 1) || (currentAudit.currentStatus === 0 || currentAudit.currentStatus === 1))"
            type="primary" 
            @click="handleAudit(currentAudit)"
          >
            审核
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 审核操作弹窗 -->
    <el-dialog
      v-model="showAuditOperation"
      title="审核操作"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="auditForm" label-width="100px">
        <el-form-item label="审核结果" required>
          <el-radio-group v-model="auditForm.result">
            <el-radio label="1">通过</el-radio>
            <el-radio label="2">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item 
          v-if="auditForm.result === '2'"
          label="拒绝原因" 
          required
        >
          <el-input 
            v-model="auditForm.rejectReason" 
            type="textarea" 
            placeholder="请输入拒绝原因" 
            rows="3"
          />
        </el-form-item>
        <el-form-item label="审核意见" required>
          <el-input 
            v-model="auditForm.opinion" 
            type="textarea" 
            placeholder="请输入审核意见" 
            rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAuditOperation = false">取消</el-button>
          <el-button type="primary" @click="submitAudit" :loading="submitting">提交审核</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'

// 响应式数据
const auditList = ref([])
const auditTotal = ref(0)
const auditPage = ref(1)
const auditPageSize = ref(20)
const auditLoading = ref(false)
const dateRange = ref([])

// 筛选条件
const auditFilter = reactive({
  status: null,
  priority: null,
  keyword: ''
})

// 审核详情
const showAuditDetail = ref(false)
const currentAudit = ref({
  applicantInfo: {},
  auditInfo: {},
  vehicleInfo: {},
  auditLogs: []
})
const detailLoading = ref(false)

// 审核操作
const showAuditOperation = ref(false)
const submitting = ref(false)
const auditForm = reactive({
  result: '',
  rejectReason: '',
  opinion: ''
})

// 审核状态文本
const getStatusText = (status) => {
  const statusMap = {
    0: '待审核',
    1: '审核中',
    2: '已通过',
    3: '已拒绝',
    4: '需补充材料',
    5: '已撤回'
  }
  return statusMap[status] || '未知状态'
}

// 审核状态类型
const getStatusType = (status) => {
  const typeMap = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger',
    4: 'warning',
    5: 'info'
  }
  return typeMap[status] || 'info'
}

// 优先级文本
const getPriorityText = (priority) => {
  const priorityMap = {
    0: '低',
    1: '普通',
    2: '高',
    3: '紧急'
  }
  return priorityMap[priority] || '普通'
}

// 优先级类型
const getPriorityType = (priority) => {
  const typeMap = {
    0: 'info',
    1: 'success',
    2: 'warning',
    3: 'danger'
  }
  return typeMap[priority] || 'info'
}

// 获取审核列表
const fetchAuditList = async () => {
  try {
    auditLoading.value = true
    
    const params = {
      page: auditPage.value,
      size: auditPageSize.value,
      status: auditFilter.status,
      priority: auditFilter.priority,
      keyword: auditFilter.keyword
    }
    
    // 处理日期范围
    if (dateRange.value && dateRange.value.length === 2) {
      params.startTime = dateRange.value[0]
      params.endTime = dateRange.value[1]
    }
    
    // 调用API获取车主认证审核列表
    const response = await authApi.getCarOwnerAuditList(params)
    
    auditList.value = response.list || []
    auditTotal.value = response.total || 0
  } catch (error) {
    console.error('获取车主认证审核列表失败:', error)
    ElMessage.error('获取车主认证审核列表失败')
  } finally {
    auditLoading.value = false
  }
}

// 重置筛选条件
const resetAuditFilter = () => {
  auditFilter.status = null
  auditFilter.priority = null
  auditFilter.keyword = ''
  dateRange.value = []
  fetchAuditList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  auditPageSize.value = size
  auditPage.value = 1
  fetchAuditList()
}

// 页码变化
const handlePageChange = (page) => {
  auditPage.value = page
  fetchAuditList()
}

// 点击列表行
const handleRowClick = (row) => {
  handleViewDetail(row)
}

// 查看详情
const handleViewDetail = async (row) => {
  try {
    detailLoading.value = true
    // 注意：response已经是API返回的data数据（由axios拦截器处理），不再包含data属性
    const response = await authApi.getCarOwnerAuditDetail(row.id)
    
    // 直接使用返回的数据，API拦截器已经确保只有成功响应才会返回数据
    if (response) {
      // 合并数据，确保所有必要的字段都存在，真实数据优先
      currentAudit.value = {
        // 默认空对象作为兜底
        applicantInfo: {},
        auditInfo: {},
        vehicleInfo: {},
        auditLogs: [],
        // 合并真实数据，覆盖默认值
        ...response,
        // 确保嵌套对象也完整
        applicantInfo: response.applicantInfo || {},
        auditInfo: response.auditInfo || {},
        vehicleInfo: response.vehicleInfo || {},
        auditLogs: response.auditLogs || []
      }
      showAuditDetail.value = true
    } else {
      console.error('API返回数据为空:', response)
      ElMessage.error('获取审核详情失败：返回数据为空')
    }
  } catch (error) {
    console.error('获取车主认证审核详情失败:', error)
    ElMessage.error('获取车主认证审核详情失败')
  } finally {
    detailLoading.value = false
  }
}

// 审核操作（暂用placeholder，后续可扩展）// 审核操作
const handleAudit = (audit) => {
  currentAudit.value = audit
  // 初始化表单
  auditForm.result = ''
  auditForm.rejectReason = ''
  auditForm.opinion = ''
  showAuditOperation.value = true
}

// 提交审核
const submitAudit = async () => {
  if (!auditForm.result) {
    ElMessage.warning('请选择审核结果')
    return
  }
  
  if (auditForm.result === '2' && !auditForm.rejectReason) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  
  if (!auditForm.opinion) {
    ElMessage.warning('请输入审核意见')
    return
  }
  
  try {
    submitting.value = true
    
    // 构建API请求参数
    const auditData = {
      auditId: currentAudit.value.id,
      action: parseInt(auditForm.result),
      opinion: auditForm.opinion,
      rejectReason: auditForm.result === '2' ? auditForm.rejectReason : null
    }
    
    // 使用新的车主认证审核API
    const response = await authApi.auditVehicle(auditData)
    
    ElMessage.success('审核操作成功')
    showAuditOperation.value = false
    showAuditDetail.value = false
    fetchAuditList() // 刷新列表
  } catch (error) {
    console.error('审核操作失败:', error)
    ElMessage.error('审核操作失败')
  } finally {
    submitting.value = false
  }
}

// 组件挂载时获取审核列表
fetchAuditList()
</script>

<style scoped>
.car-owner-audit-container {
  padding: 0 20px 20px 20px;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>