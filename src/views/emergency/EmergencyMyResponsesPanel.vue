<template>
  <div class="my-responses-container">
    <!-- 筛选条件 -->
    <div class="filter-bar">
      <el-date-picker
        v-model="myResponsesFilter.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
        style="width: 300px; margin-right: 10px"
      />
      <el-select
        v-model="myResponsesFilter.status"
        placeholder="呼叫状态"
        style="width: 120px; margin-right: 10px"
        clearable
      >
        <el-option label="全部" :value="null" />
        <el-option label="待响应" :value="0" />
        <el-option label="处理中" :value="1" />
        <el-option label="已完成" :value="2" />
        <el-option label="已取消" :value="3" />
      </el-select>
      <el-select
        v-model="myResponsesFilter.type"
        placeholder="呼叫类型"
        style="width: 120px; margin-right: 10px"
        clearable
      >
        <el-option label="全部" :value="null" />
        <el-option label="呼叫拖车" :value="0" />
        <el-option label="呼叫充电桩" :value="1" />
        <el-option label="其他呼叫" :value="2" />
      </el-select>
      <el-button @click="fetchMyEmergencyResponses">查询</el-button>
      <el-button @click="resetMyResponsesFilter">重置</el-button>
    </div>

    <!-- 响应记录列表 -->
    <el-table
      v-loading="myResponsesLoading"
      :data="myResponsesList"
      stripe
      style="width: 100%"
      @row-click="viewMyResponseDetail"
    >
      <el-table-column prop="id" label="呼叫ID" width="120" />
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
      <el-table-column prop="targetPosition" label="目标位置" width="200" show-overflow-tooltip />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click.stop="viewMyResponseDetail(scope.row)"
          >
            查看详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
        v-model:current-page="myResponsesPage"
        v-model:page-size="myResponsesPageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="myResponsesTotal"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleMyResponsesSizeChange"
        @current-change="handleMyResponsesPageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'

const emit = defineEmits(['view-detail'])

const isMounted = ref(true)
onUnmounted(() => {
  isMounted.value = false
})

// 我的响应记录
const myResponsesList = ref([])
const myResponsesTotal = ref(0)
const myResponsesPage = ref(1)
const myResponsesPageSize = ref(20)
const myResponsesLoading = ref(false)
const myResponsesFilter = reactive({
  dateRange: [],
  status: null,
  type: null
})

// 获取我的响应记录
const fetchMyEmergencyResponses = async () => {
  try {
    if (!isMounted.value) return

    myResponsesLoading.value = true

    const params = {
      pageNum: myResponsesPage.value,
      pageSize: myResponsesPageSize.value
    }

    if (myResponsesFilter.status !== null && myResponsesFilter.status !== undefined) {
      params.status = myResponsesFilter.status
    }

    if (myResponsesFilter.type !== null && myResponsesFilter.type !== undefined) {
      params.type = myResponsesFilter.type
    }

    if (myResponsesFilter.dateRange && myResponsesFilter.dateRange.length === 2) {
      params.startTime = myResponsesFilter.dateRange[0] + ' 00:00:00'
      params.endTime = myResponsesFilter.dateRange[1] + ' 23:59:59'
    }

    const response = await authApi.getMyEmergencyResponses(params)

    if (!isMounted.value) return

    let listData = []
    let totalCount = 0

    if (response) {
      if (response.status === 200 && response.data) {
        if (response.data.code === 200 && response.data.data) {
          listData = response.data.data.list || []
          totalCount = response.data.data.total || 0
        } else if (response.data.list) {
          listData = response.data.list || []
          totalCount = response.data.total || 0
        }
      } else if (response.code === 200 && response.data) {
        listData = response.data.list || []
        totalCount = response.data.total || 0
      } else if (response.list) {
        listData = response.list || []
        totalCount = response.total || 0
      }
    } else {
      console.error('获取我的响应记录响应为空')
    }

    myResponsesList.value = listData
    myResponsesTotal.value = totalCount
  } catch (error) {
    if (!isMounted.value) return

    console.error('获取我的响应记录失败:', error)
    ElMessage.error('获取我的响应记录失败')
    myResponsesList.value = []
    myResponsesTotal.value = 0
  } finally {
    if (isMounted.value) {
      myResponsesLoading.value = false
    }
  }
}

// 我的响应记录分页大小变化
const handleMyResponsesSizeChange = (size) => {
  myResponsesPageSize.value = size
  myResponsesPage.value = 1
  fetchMyEmergencyResponses()
}

// 我的响应记录页码变化
const handleMyResponsesPageChange = (page) => {
  myResponsesPage.value = page
  fetchMyEmergencyResponses()
}

// 重置我的响应记录筛选
const resetMyResponsesFilter = () => {
  Object.assign(myResponsesFilter, {
    dateRange: [],
    status: null,
    type: null
  })
  fetchMyEmergencyResponses()
}

// 查看我的响应记录详情
const viewMyResponseDetail = (response) => {
  emit('view-detail', response, [])
}

onMounted(() => {
  fetchMyEmergencyResponses()
})
</script>

<style scoped>
.my-responses-container {
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
