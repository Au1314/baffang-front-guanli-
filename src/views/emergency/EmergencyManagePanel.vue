<template>
  <div class="manage-container">
    <!-- 紧急呼叫管理筛选 -->
    <div class="filter-bar">
      <el-date-picker
        v-model="manageFilter.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="width: 300px; margin-right: 10px"
      />
      <el-select
        v-model="manageFilter.status"
        placeholder="呼叫状态"
        style="width: 120px; margin-right: 10px"
        clearable
      >
        <el-option label="全部" :value="null" />
        <el-option label="待处理" :value="0" />
        <el-option label="处理中" :value="1" />
        <el-option label="已结束" :value="2" />
      </el-select>
      <el-select
        v-model="manageFilter.type"
        placeholder="呼叫类型"
        style="width: 120px; margin-right: 10px"
        clearable
      >
        <el-option label="全部" :value="null" />
        <el-option label="呼叫拖车" :value="0" />
        <el-option label="呼叫充电桩" :value="1" />
        <el-option label="其他呼叫" :value="2" />
      </el-select>
      <el-input
        v-model="manageFilter.keyword"
        placeholder="请输入用户ID或呼叫内容"
        style="width: 250px; margin-right: 10px"
        clearable
      >
        <template #append>
          <el-button @click="fetchManageEmergencyList"><el-icon><Search /></el-icon></el-button>
        </template>
      </el-input>
      <el-button @click="resetManageFilter">重置</el-button>
    </div>

    <!-- 紧急呼叫管理列表 -->
    <el-table
      v-loading="manageLoading"
      :data="manageEmergencyList"
      stripe
      style="width: 100%"
      @row-click="viewEmergencyDetail"
    >
      <el-table-column prop="id" label="呼叫ID" width="120" />
      <el-table-column prop="requestUserId" label="用户ID" width="150" />
      <el-table-column prop="requestUserName" label="用户姓名" width="150" />
      <el-table-column prop="requestUserPhone" label="用户电话" width="150" />
      <el-table-column prop="typeName" label="呼叫类型" width="120">
        <template #default="scope">
          <el-tag
            :type="scope.row.type === 0 ? 'info' : scope.row.type === 1 ? 'warning' : 'danger'"
          >
            {{ scope.row.typeName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="statusName" label="状态" width="120">
        <template #default="scope">
          <el-tag
            :type="scope.row.status === 0 ? 'warning' : scope.row.status === 1 ? 'success' : scope.row.status === 2 ? 'info' : 'danger'"
          >
            {{ scope.row.statusName }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="callTime" label="呼叫时间" width="180" />
      <el-table-column prop="callPosition" label="呼叫位置" width="200" show-overflow-tooltip />
      <el-table-column prop="responseAdminName" label="处理人" width="150">
        <template #default="scope">
          {{ scope.row.responseAdminName || scope.row.responseAdminId || '未分配' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click.stop="viewEmergencyDetail(scope.row)"
          >
            查看详情
          </el-button>
          <el-button
            v-if="scope.row.status === 1"
            size="small"
            type="success"
            @click.stop="completeEmergency(scope.row.id)"
          >
            完成呼叫
          </el-button>
          <el-button
            v-if="scope.row.status === 1"
            size="small"
            type="warning"
            @click.stop="cancelEmergency(scope.row.id)"
          >
            取消呼叫
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="managePage"
        v-model:page-size="managePageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="manageTotal"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleManageSizeChange"
        @current-change="handleManagePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'

const emit = defineEmits(['view-detail'])

const isMounted = ref(true)
onUnmounted(() => {
  isMounted.value = false
})

// 管理紧急呼叫
const manageEmergencyList = ref([])
const manageTotal = ref(0)
const managePage = ref(1)
const managePageSize = ref(20)
const manageLoading = ref(false)
const manageFilter = reactive({
  dateRange: [],
  keyword: '',
  status: null,
  type: null
})

// 模拟数据 - 处理日志（查看详情弹窗使用）
const mockHandlingLogs = {
  1: [
    { id: 1, content: '收到紧急呼叫，正在处理', createTime: '2026-01-08 11:30:00' },
    { id: 2, content: '已联系救援车辆，预计15分钟到达', createTime: '2026-01-08 11:32:00' },
    { id: 3, content: '救援车辆已出发', createTime: '2026-01-08 11:35:00' }
  ],
  2: [
    { id: 4, content: '收到紧急呼叫，正在处理', createTime: '2026-01-08 10:15:00' }
  ],
  3: [
    { id: 5, content: '收到紧急呼叫，正在处理', createTime: '2026-01-07 16:45:00' }
  ]
}

// 完成呼叫（管理模块）
const completeEmergency = async (callId) => {
  try {
    if (!isMounted.value) return

    // 弹出带输入框的对话框，让用户输入备注
    const { value: remark } = await ElMessageBox.prompt('请输入完成呼叫的备注信息', '完成呼叫', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入备注信息，例如：已将车辆拖至指定4S店，用户确认无误',
      inputValidator: (value) => {
        if (!value.trim()) {
          return '备注信息不能为空'
        }
        return true
      },
      inputErrorMessage: '备注信息不能为空',
      type: 'info'
    })

    // 调用API完成呼叫
    const response = await authApi.completeEmergencyCall(callId, {
      remark: remark.trim()
    })

    // 检查组件是否已卸载
    if (!isMounted.value) return

    // 显示成功消息
    ElMessage.success((response && response.message) || '完成呼叫成功')

    // 刷新管理紧急响应列表
    fetchManageEmergencyList()
  } catch (error) {
    if (!isMounted.value || error === 'cancel' || error.name === 'ElMessageBoxCancel') {
      return
    }

    console.error('完成呼叫失败:', error)

    let errorMsg = '完成呼叫失败'
    if (error.response) {
      errorMsg = error.response.data?.msg || `完成失败 (${error.response.status})`
    } else if (error.request) {
      errorMsg = '请求超时：服务器没有响应，请稍后重试'
    } else {
      errorMsg = error.message || '请求失败'
    }

    ElMessage.error(errorMsg)
  }
}

// 取消呼叫（管理模块）
const cancelEmergency = async (callId) => {
  try {
    if (!isMounted.value) return

    // 弹出带输入框的对话框，让用户输入取消原因
    const { value: cancelReason } = await ElMessageBox.prompt('请输入取消呼叫的原因', '取消呼叫', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入取消原因，例如：用户已自行解决问题',
      inputValidator: (value) => {
        if (!value.trim()) {
          return '取消原因不能为空'
        }
        return true
      },
      inputErrorMessage: '取消原因不能为空',
      type: 'warning'
    })

    // 调用API取消呼叫
    const response = await authApi.cancelEmergencyCall(callId, {
      cancelReason: cancelReason.trim()
    })

    // 检查组件是否已卸载
    if (!isMounted.value) return

    // 显示成功消息
    ElMessage.success((response && response.message) || '取消呼叫成功')

    // 刷新管理紧急响应列表
    fetchManageEmergencyList()
  } catch (error) {
    if (!isMounted.value || error === 'cancel' || error.name === 'ElMessageBoxCancel') {
      return
    }

    console.error('取消呼叫失败:', error)

    let errorMsg = '取消呼叫失败'
    if (error.response) {
      errorMsg = error.response.data?.msg || `取消失败 (${error.response.status})`
    } else if (error.request) {
      errorMsg = '请求超时：服务器没有响应，请稍后重试'
    } else {
      errorMsg = error.message || '请求失败'
    }

    ElMessage.error(errorMsg)
  }
}

// 获取管理紧急呼叫列表
const fetchManageEmergencyList = async () => {
  try {
    if (!isMounted.value) return

    manageLoading.value = true

    const params = {
      pageNum: managePage.value,
      pageSize: managePageSize.value
    }

    if (manageFilter.keyword) {
      params.keyword = manageFilter.keyword
    }

    if (manageFilter.status !== null && manageFilter.status !== undefined) {
      params.status = manageFilter.status
    }

    if (manageFilter.type !== null && manageFilter.type !== undefined) {
      params.type = manageFilter.type
    }

    const response = await authApi.getEmergencyCallRecords(params)

    if (!isMounted.value) return

    if (response) {
      manageEmergencyList.value = response.list || []
      manageTotal.value = response.total || 0
    } else {
      console.error('获取管理紧急呼叫列表响应为空')
      manageEmergencyList.value = []
      manageTotal.value = 0
    }
  } catch (error) {
    if (!isMounted.value) return

    console.error('获取管理紧急呼叫列表失败:', error)
    ElMessage.error('获取管理紧急呼叫列表失败')
    manageEmergencyList.value = []
    manageTotal.value = 0
  } finally {
    if (isMounted.value) {
      manageLoading.value = false
    }
  }
}

// 管理分页大小变化
const handleManageSizeChange = (size) => {
  managePageSize.value = size
  managePage.value = 1
  fetchManageEmergencyList()
}

// 管理页码变化
const handleManagePageChange = (page) => {
  managePage.value = page
  fetchManageEmergencyList()
}

// 重置管理筛选
const resetManageFilter = () => {
  Object.assign(manageFilter, {
    dateRange: [],
    keyword: '',
    status: null,
    type: null
  })
  fetchManageEmergencyList()
}

// 查看紧急呼叫详情
const viewEmergencyDetail = (emergency) => {
  emit('view-detail', emergency, mockHandlingLogs[emergency.id] || [])
}

onMounted(() => {
  fetchManageEmergencyList()
})
</script>

<style scoped>
.manage-container {
  padding: 20px;
  margin-top: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

/* 筛选栏样式 */
.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px solid var(--color-border-lighter);
}

/* 分页样式 */
.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

/* 标签样式统一 */
:deep(.el-tag) {
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* 按钮样式统一 */
:deep(.el-button) {
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.el-button:active) {
  transform: translateY(0);
}
</style>
