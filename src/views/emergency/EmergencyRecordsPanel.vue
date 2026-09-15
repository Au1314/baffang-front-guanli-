<template>
  <div class="records-container">
    <!-- 记录筛选 -->
    <div class="filter-bar">
      <el-date-picker
        v-model="recordFilter.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="width: 300px; margin-right: 10px"
      />
      <el-select
        v-model="recordFilter.level"
        placeholder="紧急等级"
        style="width: 120px; margin-right: 10px"
        clearable
      >
        <el-option label="全部" :value="null" />
        <el-option label="低危" :value="1" />
        <el-option label="中危" :value="2" />
        <el-option label="高危" :value="3" />
      </el-select>
      <el-input
        v-model="recordFilter.keyword"
        placeholder="请输入用户ID或呼叫内容"
        style="width: 250px; margin-right: 10px"
        clearable
      >
        <template #append>
          <el-button @click="fetchEmergencyRecords"><el-icon><Search /></el-icon></el-button>
        </template>
      </el-input>
      <el-button @click="resetRecordFilter">重置</el-button>
    </div>

    <!-- 呼叫记录列表 -->
    <el-table
      v-loading="recordLoading"
      :data="emergencyRecords"
      stripe
      style="width: 100%"
      @row-click="viewRecordDetail"
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
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click.stop="viewRecordDetail(scope.row)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="recordPage"
        v-model:page-size="recordPageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="recordTotal"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleRecordSizeChange"
        @current-change="handleRecordPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'

const emit = defineEmits(['view-detail'])

const isMounted = ref(true)
onUnmounted(() => {
  isMounted.value = false
})

// 呼叫记录
const emergencyRecords = ref([])
const recordTotal = ref(0)
const recordPage = ref(1)
const recordPageSize = ref(20)
const recordLoading = ref(false)
const recordFilter = reactive({
  dateRange: [],
  keyword: '',
  level: null
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

// 获取紧急呼叫记录
const fetchEmergencyRecords = async () => {
  try {
    if (!isMounted.value) return

    recordLoading.value = true

    const params = {
      pageNum: recordPage.value,
      pageSize: recordPageSize.value
    }

    if (recordFilter.keyword) {
      params.keyword = recordFilter.keyword
    }

    if (recordFilter.dateRange && recordFilter.dateRange.length === 2) {
      params.startTime = recordFilter.dateRange[0] + ' 00:00:00'
      params.endTime = recordFilter.dateRange[1] + ' 23:59:59'
    }

    const response = await authApi.getEmergencyCallRecords(params)

    if (!isMounted.value) return

    if (response) {
      emergencyRecords.value = response.list || []
      recordTotal.value = response.total || 0
    } else {
      console.error('获取紧急呼叫记录响应为空')
      emergencyRecords.value = []
      recordTotal.value = 0
    }
  } catch (error) {
    if (!isMounted.value) return

    console.error('获取紧急呼叫记录失败:', error)
    ElMessage.error('获取紧急呼叫记录失败')
    emergencyRecords.value = []
    recordTotal.value = 0
  } finally {
    if (isMounted.value) {
      recordLoading.value = false
    }
  }
}

// 记录分页大小变化
const handleRecordSizeChange = (size) => {
  recordPageSize.value = size
  recordPage.value = 1
  fetchEmergencyRecords()
}

// 记录页码变化
const handleRecordPageChange = (page) => {
  recordPage.value = page
  fetchEmergencyRecords()
}

// 重置记录筛选
const resetRecordFilter = () => {
  Object.assign(recordFilter, {
    dateRange: [],
    keyword: '',
    level: null
  })
  fetchEmergencyRecords()
}

// 查看记录详情
const viewRecordDetail = (record) => {
  emit('view-detail', record, mockHandlingLogs[record.id] || [])
}

onMounted(() => {
  fetchEmergencyRecords()
})
</script>

<style scoped>
.records-container {
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
