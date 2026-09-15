<template>
  <div class="private-station-audit-container">
    <!-- 筛选条件 -->
    <AuditFilter 
      :filter-form="auditFilter" 
      :filter-items="filterItems" 
      :more-filter-items="moreFilterItems"
      @search="fetchAuditList"
      @reset="resetAuditFilter"
    />
    
    <!-- 审核列表 -->
    <el-table 
      :data="auditList" 
      style="width: 100%" 
      :loading="auditLoading" 
      @row-click="handleRowClick"
      class="audit-table"
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="auditNo" label="审核单号" min-width="180">
        <template #default="scope">
          <div class="cell-text" :title="scope.row.auditNo">
            {{ scope.row.auditNo }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="stationName" label="电桩名称" min-width="180">
        <template #default="scope">
          <div class="cell-text" :title="scope.row.stationName">
            {{ scope.row.stationName }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="ownerId" label="所有者ID" width="120" />
      <el-table-column prop="ownerUsername" label="所有者用户名" min-width="150">
        <template #default="scope">
          <div class="cell-text" :title="scope.row.ownerUsername">
            {{ scope.row.ownerUsername }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="地址" min-width="240">
        <template #default="scope">
          <div class="cell-text" :title="scope.row.address">
            {{ scope.row.address }}
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="defaultPrice" label="默认价格" width="120" align="center">
        <template #default="scope">
          {{ scope.row.defaultPrice }}元/度
        </template>
      </el-table-column>
      <el-table-column prop="priceTypeName" label="定价类型" width="120" align="center" />
      <el-table-column prop="chargerCount" label="充电枪数量" width="120" align="center">
        <template #default="scope">
          {{ scope.row.chargerCount || '未知' }}
        </template>
      </el-table-column>
      <el-table-column prop="isPublic" label="是否公开" width="100" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.isPublic ? 'success' : 'info'" effect="light">
            {{ scope.row.isPublic ? '是' : '否' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="statusName" label="电桩状态" width="120" align="center">
        <template #default="scope">
          <el-tag :type="scope.row.status === 0 ? 'info' : 'success'" effect="light">
            {{ scope.row.statusName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="auditStatusName" label="审核状态" width="120" align="center">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.auditStatus)" effect="light">
            {{ scope.row.auditStatusName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="authStatusName" label="认证状态" width="120" align="center">
        <template #default="scope">
          <el-tag :type="getAuthStatusType(scope.row.authStatus)" effect="light">
            {{ scope.row.authStatusName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" min-width="180" align="center" />
      <el-table-column label="操作" min-width="240" fixed="right">
        <template #default="scope">
          <div class="operation-buttons">
            <!-- 查看详情 -->
            <el-button 
              size="small" 
              type="primary" 
              @click.stop="handleViewDetail(scope.row)"
              class="detail-button"
            >
              <el-icon><View /></el-icon>
              详情
            </el-button>
            
            <!-- 审核按钮（只有待审核和审核中状态可以审核） -->
            <el-button 
              v-if="scope.row.auditStatus === 0 || scope.row.auditStatus === 1"
              size="small" 
              type="success" 
              @click.stop="handleApprove(scope.row)"
              class="approve-button"
            >
              <el-icon><Check /></el-icon>
              通过
            </el-button>
            <el-button 
              v-if="scope.row.auditStatus === 0 || scope.row.auditStatus === 1"
              size="small" 
              type="danger" 
              @click.stop="handleReject(scope.row)"
              class="reject-button"
            >
              <el-icon><Close /></el-icon>
              驳回
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页控件 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="auditPage"
        v-model:page-size="auditPageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="auditTotal"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        class="custom-pagination"
      />
    </div>
    
    <!-- 审核详情弹窗 -->
    <el-dialog
      v-model="showAuditDetail"
      title="审核详情"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-card shadow="never" v-loading="detailLoading">
        <!-- 基本信息组 -->
        <el-card shadow="hover" style="margin-bottom: 16px;">
          <template #header>
            <div class="card-header">
              <span>基本信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="电桩ID">{{ currentAudit.id || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="电桩名称">{{ currentAudit.stationName || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="地址" :span="2">{{ currentAudit.address || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ currentAudit.createTime || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ currentAudit.updateTime || '未知' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- 所有者信息组 -->
        <el-card shadow="hover" style="margin-bottom: 16px;">
          <template #header>
            <div class="card-header">
              <span>所有者信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="所有者ID">{{ currentAudit.ownerId || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="所有者用户名">{{ currentAudit.ownerUsername || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="所有者姓名">{{ currentAudit.ownerName || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="所有者电话">{{ currentAudit.ownerPhone || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="所有者邮箱">{{ currentAudit.ownerEmail || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="所有者头像">{{ currentAudit.ownerAvatar ? '已上传' : '未上传' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- 技术参数组 -->
        <el-card shadow="hover" style="margin-bottom: 16px;">
          <template #header>
            <div class="card-header">
              <span>技术参数</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="经度">{{ currentAudit.longitude !== null ? currentAudit.longitude : '未知' }}</el-descriptions-item>
            <el-descriptions-item label="纬度">{{ currentAudit.latitude !== null ? currentAudit.latitude : '未知' }}</el-descriptions-item>
            <el-descriptions-item label="默认价格">{{ currentAudit.defaultPrice !== null ? currentAudit.defaultPrice : 0 }}元/度</el-descriptions-item>
            <el-descriptions-item label="定价类型">{{ currentAudit.priceTypeName || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="充电枪数量">{{ currentAudit.chargerCount !== null ? currentAudit.chargerCount : '未知' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- 状态信息组 -->
        <el-card shadow="hover" style="margin-bottom: 16px;">
          <template #header>
            <div class="card-header">
              <span>状态信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="是否公开">{{ currentAudit.isPublic !== null ? (currentAudit.isPublic ? '是' : '否') : '未知' }}</el-descriptions-item>
            <el-descriptions-item label="电桩状态">
              <el-tag :type="currentAudit.status === 0 ? 'info' : 'success'">
                {{ currentAudit.statusName || '未知' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="认证车辆">{{ currentAudit.ownerAuthVehicleName || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="认证站点">{{ currentAudit.ownerAuthChargingStationName || '未知' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- 审核信息组 -->
        <el-card shadow="hover" style="margin-bottom: 16px;">
          <template #header>
            <div class="card-header">
              <span>审核信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="审核单号">{{ currentAudit.auditInfo?.auditNo || currentAudit.auditNo }}</el-descriptions-item>
            <el-descriptions-item label="当前状态">
              <el-tag :type="getStatusType(currentAudit.auditInfo?.currentStatus || currentAudit.auditStatus)">
                {{ currentAudit.auditInfo?.currentStatusName || currentAudit.auditStatusName }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="优先级">
              <el-tag :type="getPriorityType(currentAudit.auditInfo?.priority || 1)">
                {{ currentAudit.auditInfo?.priorityName || '普通' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">{{ currentAudit.auditInfo?.submitTime || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="完成时间">{{ currentAudit.auditInfo?.finishTime || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="最终意见">{{ currentAudit.auditInfo?.finalOpinion || '未知' }}</el-descriptions-item>
            <el-descriptions-item label="拒绝原因" :span="2">{{ currentAudit.auditInfo?.rejectReason || '无' }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- 审核日志组 -->
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>审核日志</span>
            </div>
          </template>
          <el-table :data="currentAudit.auditInfo?.logs || []" stripe size="small" style="width: 100%">
            <el-table-column prop="createTime" label="操作时间" width="180" align="center" />
            <el-table-column prop="adminName" label="操作人" width="150" align="center" />
            <el-table-column prop="actionName" label="操作类型" width="120" align="center">
              <template #default="scope">
                <el-tag type="primary">{{ scope.row.actionName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="fromStatusName" label="原状态" width="120" align="center">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.fromStatus)">{{ scope.row.fromStatusName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="toStatusName" label="新状态" width="120" align="center">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.toStatus)">{{ scope.row.toStatusName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="opinion" label="审核意见" min-width="200" />
          </el-table>
        </el-card>
      </el-card>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showAuditDetail = false">关闭</el-button>
          <el-button 
            v-if="(currentAudit.auditInfo?.currentStatus === 0 || currentAudit.auditInfo?.currentStatus === 1) || (currentAudit.auditStatus === 0 || currentAudit.auditStatus === 1)"
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
            <el-radio label="2">通过</el-radio>
            <el-radio label="3">拒绝</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item 
          v-if="auditForm.result === '3'"
          label="拒绝原因" 
          required
        >
          <el-input 
            v-model="auditForm.reject_reason" 
            type="textarea" 
            placeholder="请输入拒绝原因" 
            rows="3"
          />
        </el-form-item>
        <el-form-item label="审核意见" required>
          <el-input 
            v-model="auditForm.final_opinion" 
            type="textarea" 
            placeholder="请输入审核意见" 
            rows="3"
          />
        </el-form-item>
        <el-form-item label="操作备注">
          <el-input 
            v-model="auditForm.remark" 
            type="textarea" 
            placeholder="请输入操作备注（可选）" 
            rows="2"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import AuditFilter from '@/components/audit/AuditFilter.vue'
import { View, Check, Close } from '@element-plus/icons-vue'
import {
  getAuditStatusText,
  getAuditStatusType,
  getAuthStatusType,
  getPriorityText,
  getPriorityType
} from '@/utils/statusMaps'

const filterItems = [
  {
    type: 'select',
    label: '认证状态',
    prop: 'authStatus',
    placeholder: '请选择认证状态',
    width: '150px',
    options: [
      { label: '待审核', value: 0 },
      { label: '审核中', value: 1 },
      { label: '已通过', value: 2 },
      { label: '已拒绝', value: 3 }
    ]
  },
  {
    type: 'select',
    label: '审核状态',
    prop: 'auditStatus',
    placeholder: '请选择审核状态',
    width: '150px',
    options: [
      { label: '待审核', value: 0 },
      { label: '审核中', value: 1 },
      { label: '已通过', value: 2 },
      { label: '已拒绝', value: 3 }
    ]
  },
  {
    type: 'input',
    label: '电桩名称',
    prop: 'stationName',
    placeholder: '请输入电桩名称',
    width: '200px'
  }
]

const moreFilterItems = [
  {
    type: 'date',
    label: '创建时间',
    prop: 'createTime',
    width: '240px'
  }
]

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const auditList = ref([])
const auditTotal = ref(0)
const auditPage = ref(1)
const auditPageSize = ref(20)
const auditLoading = ref(false)

// 筛选条件
const auditFilter = reactive({
  authStatus: null,
  auditStatus: null,
  stationName: ''
})

// 审核详情
const showAuditDetail = ref(false)
const currentAudit = ref({})
const detailLoading = ref(false)

// 审核操作
const showAuditOperation = ref(false)
const submitting = ref(false)
const auditForm = reactive({
  result: '',
  reject_reason: '',
  final_opinion: '',
  remark: ''
})

// 审核类型名称
const getAuditTypeName = (type) => {
  const typeMap = {
    0: '私桩认证',
    1: '车主认证',
    2: '充电桩投诉',
    3: '充电桩故障',
    4: '评论举报',
    5: '交易申诉'
  }
  return typeMap[type] || '未知类型'
}

// 模板沿用简短命名
const getStatusText = getAuditStatusText
const getStatusType = getAuditStatusType

// 获取审核列表
const fetchAuditList = async () => {
  try {
    auditLoading.value = true
    
    const params = {
      page: auditPage.value,
      size: auditPageSize.value,
      authStatus: auditFilter.authStatus,
      auditStatus: auditFilter.auditStatus
    }
    
    // 处理电桩名称搜索
    if (auditFilter.stationName) {
      params.stationName = auditFilter.stationName
    }
    
    // 使用新API获取私人电桩待审核列表
    const response = await authApi.getPrivateStationAuditList(params)
    
    auditList.value = response.list || []
    auditTotal.value = response.total || 0
  } catch (error) {
    console.error('获取审核列表失败:', error)
    ElMessage.error('获取审核列表失败')
  } finally {
    auditLoading.value = false
  }
}

// 重置筛选条件
const resetAuditFilter = () => {
  auditFilter.authStatus = null
  auditFilter.auditStatus = null
  auditFilter.stationName = ''
  fetchAuditList()
}

// 分页大小变化
const handleSizeChange = (size) => {
  auditPageSize.value = size
  auditPage.value = 1 // 重置到第一页
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
    // 调用API获取最新详情数据
    const response = await authApi.getPrivateStationAuthDetail(row.id)
    
    // 检查响应数据是否存在
    if (response) {
      currentAudit.value = response
      showAuditDetail.value = true
    } else {
      console.error('API返回数据为空:', response)
      ElMessage.error('获取审核详情失败：数据为空')
    }
  } catch (error) {
    console.error('获取审核详情失败:', error)
    ElMessage.error('获取审核详情失败')
  } finally {
    detailLoading.value = false
  }
}

// 审核操作
const handleAudit = (audit) => {
  currentAudit.value = audit
  auditForm.result = ''
  auditForm.reject_reason = ''
  auditForm.final_opinion = ''
  auditForm.remark = '' // 重置操作备注
  showAuditOperation.value = true
}

// 快捷通过操作
const handleApprove = async (row) => {
  try {
    const { value: opinion } = await ElMessageBox.prompt(
      '请输入审核意见',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入审核意见',
        inputValidator: (value) => {
          if (!value || value.trim() === '') {
            return '审核意见不能为空'
          }
          return true
        }
      }
    )
    
    submitting.value = true
    
    const auditData = {
      stationId: row.id,
      authStatus: 2, // 通过
      opinion: opinion
    }
    
    const response = await authApi.auditPrivateStation(auditData)
    
    ElMessage.success('审核通过成功')
    fetchAuditList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败：' + error.message)
    }
  } finally {
    submitting.value = false
  }
}

// 快捷驳回操作
const handleReject = async (row) => {
  try {
    const { value: reason } = await ElMessageBox.prompt(
      '请输入驳回原因',
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: '请输入驳回原因',
        inputValidator: (value) => {
          if (!value || value.trim() === '') {
            return '驳回原因不能为空'
          }
          return true
        }
      }
    )
    
    submitting.value = true
    
    const auditData = {
      stationId: row.id,
      authStatus: 3, // 驳回
      opinion: reason
    }
    
    const response = await authApi.auditPrivateStation(auditData)
    
    ElMessage.success('审核驳回成功')
    fetchAuditList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败：' + error.message)
    }
  } finally {
    submitting.value = false
  }
}

// 提交审核
const submitAudit = async () => {
  if (!auditForm.result) {
    ElMessage.warning('请选择审核结果')
    return
  }
  
  // 根据新API要求调整验证逻辑
  // 拒绝时必须填写拒绝原因
  if (auditForm.result === '3' && !auditForm.reject_reason) {
    ElMessage.warning('请输入拒绝原因')
    return
  }
  
  // 确保审核意见不为空
  if (!auditForm.final_opinion) {
    ElMessage.warning('请输入审核意见')
    return
  }
  
  try {
    submitting.value = true
    
    // 根据审核结果映射认证状态
    let authStatus = 2 // 默认通过
    if (auditForm.result === '3') {
      authStatus = 3 // 拒绝
    }
    
    const auditData = {
      stationId: currentAudit.value.id,
      authStatus: authStatus,
      opinion: auditForm.final_opinion
    }
    
    // 使用新的私人电桩认证审核API
    const response = await authApi.auditPrivateStation(auditData)
    
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
onMounted(() => {
  fetchAuditList()
})
</script>

<style scoped>
.private-station-audit-container {
  padding: 24px;
  min-height: 80vh;
  background-color: var(--color-bg-page);
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.attachments-list {
  margin-top: 8px;
}

.operation-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

/* 卡片头部样式优化 */
.card-header {
  font-weight: 600;
  font-size: 18px;
  color: var(--color-text-primary);
  padding: 16px 0;
  border-bottom: 1px solid var(--color-border-light);
  margin-bottom: 16px;
}

/* 描述列表样式优化 */
:deep(.el-descriptions__item-label) {
  font-weight: 500;
  color: var(--color-text-regular);
  font-size: 14px;
}

:deep(.el-descriptions__item-content) {
  color: var(--color-text-primary);
  font-size: 14px;
}

/* 卡片间距优化 */
.el-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-border-light);
  margin-bottom: 16px;
}

.el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}

/* 表格样式 */
.audit-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-border-light);
  margin-bottom: 24px;
}

:deep(.el-table__header-wrapper th) {
  background-color: #f9fafb;
  font-weight: 600;
  font-size: 14px;
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-light);
  padding: 16px 0;
}

:deep(.el-table__body-wrapper tr) {
  transition: all 0.3s ease;
}

:deep(.el-table__body-wrapper tr:hover) {
  background-color: #f0f9ff !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-table__body-wrapper tr.current-row) {
  background-color: var(--color-primary-light) !important;
}

:deep(.el-table__body-wrapper td) {
  padding: 16px 0;
  font-size: 14px;
  color: var(--color-text-regular);
  border-bottom: 1px solid var(--color-border-light);
}

/* 单元格文本样式 */
.cell-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: inline-block;
}

/* 操作按钮样式 */
.detail-button {
  border-radius: var(--radius-md);
  padding: 6px 12px;
  font-size: var(--font-size-xs);
  background: var(--color-primary);
  border: none;
  transition: background var(--transition-fast);
}

.detail-button:hover {
  background: var(--color-primary-hover);
}

.approve-button {
  border-radius: var(--radius-md);
  padding: 6px 12px;
  font-size: var(--font-size-xs);
  background: var(--color-success);
  border: none;
  transition: filter var(--transition-fast);
}

.approve-button:hover {
  filter: brightness(1.05);
}

.reject-button {
  border-radius: var(--radius-md);
  padding: 6px 12px;
  font-size: var(--font-size-xs);
  background: var(--color-danger);
  border: none;
  transition: filter var(--transition-fast);
}

.reject-button:hover {
  filter: brightness(1.05);
}

/* 分页样式 */
.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: var(--space-5);
  padding: var(--space-4);
  background: var(--color-bg-card);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-extra-light);
}

:deep(.custom-pagination) {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  display: flex;
  align-items: center;
  gap: 12px;
}

:deep(.el-pagination__total) {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-regular);
  margin-right: 0;
}

:deep(.el-pagination__sizes) {
  margin-right: 0;
}

:deep(.el-pagination__sizes .el-input .el-input__inner) {
  border-radius: 10px;
  font-size: 14px;
  padding: 8px 16px;
  border: 1px solid var(--color-border-base);
  transition: all 0.3s ease;
}

:deep(.el-pagination__sizes .el-input .el-input__inner:hover) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.el-pagination__sizes .el-input .el-input__inner:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

:deep(.el-pagination__jump) {
  margin-left: 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

:deep(.el-pagination__jump .el-input .el-input__inner) {
  border-radius: 10px;
  font-size: 14px;
  padding: 8px 12px;
  width: 60px;
  border: 1px solid var(--color-border-base);
  transition: all 0.3s ease;
  height: 36px;
  box-sizing: border-box;
}

:deep(.el-pagination__jump .el-input .el-input__inner:hover) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.el-pagination__jump .el-input .el-input__inner:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

:deep(.el-pagination__jump .el-pagination__jump-btn) {
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 14px;
  color: var(--color-text-regular);
  border: 1px solid var(--color-border-base);
  background: white;
  transition: all 0.3s ease;
  margin-left: 8px;
}

:deep(.el-pagination__jump .el-pagination__jump-btn:hover) {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

:deep(.el-pagination__button) {
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 14px;
  color: var(--color-text-regular);
  border: 1px solid var(--color-border-base);
  background: white;
  transition: all 0.3s ease;
  margin: 0 4px;
}

:deep(.el-pagination__button:hover) {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

:deep(.el-pagination__button--active) {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  font-weight: 500;
}

:deep(.el-pagination__button--active:hover) {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

:deep(.el-pagination__prev),
:deep(.el-pagination__next) {
  border-radius: 10px;
  padding: 8px 16px;
  font-size: 14px;
  color: var(--color-text-regular);
  border: 1px solid var(--color-border-base);
  background: white;
  transition: all 0.3s ease;
  margin: 0 4px;
}

:deep(.el-pagination__prev:hover),
:deep(.el-pagination__next:hover) {
  color: var(--color-primary);
  border-color: var(--color-primary);
  background-color: var(--color-primary-light);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

:deep(.el-pagination__prev.is-disabled),
:deep(.el-pagination__next.is-disabled) {
  color: var(--color-text-placeholder);
  border-color: var(--color-border-lighter);
  background-color: var(--color-bg-page);
  cursor: not-allowed;
}

:deep(.el-pagination__prev.is-disabled:hover),
:deep(.el-pagination__next.is-disabled:hover) {
  transform: none;
  box-shadow: none;
  border-color: var(--color-border-lighter);
  background-color: var(--color-bg-page);
  color: var(--color-text-placeholder);
}

/* 标签样式 */
:deep(.el-tag) {
  border-radius: 12px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 500;
}

/* 弹窗内容样式优化 */
:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__header) {
  padding: var(--space-4) var(--space-5);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  border-bottom: 1px solid var(--color-border-lighter);
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

:deep(.el-dialog__title) {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .private-station-audit-container {
    padding: 16px;
  }
  
  .audit-table {
    margin-bottom: 16px;
  }
  
  :deep(.el-table__header-wrapper th),
  :deep(.el-table__body-wrapper td) {
    padding: 12px 0;
  }
  
  .operation-buttons {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .pagination {
    padding: 16px;
  }
  
  :deep(.el-dialog) {
    width: 95% !important;
  }
}
</style>