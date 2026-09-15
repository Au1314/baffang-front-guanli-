<template>
  <div class="all-customer-service-stats-container">
    <el-card shadow="never" class="all-customer-service-stats-card">
      <template #header>
        <div class="card-header">
          <span>所有客服统计</span>
        </div>
      </template>
      
      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="search-box">
          <el-input
            v-model="searchKeyword"
            placeholder="请输入管理员名称搜索"
            clearable
            @input="handleSearch"
            class="search-input"
          >
            <template #prefix>
              <el-icon class="el-input__icon"><Search /></el-icon>
            </template>
          </el-input>
        </div>
        <div class="overview-info">
          <el-tag type="info">总客服数：{{ filteredStatsData.length }}</el-tag>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <el-skeleton :loading="loading" animated>
        <template #template>
          <div class="table-skeleton">
            <div v-for="i in 5" :key="i" class="table-row-skeleton">
              <el-skeleton-item variant="text" style="width: 15%;" />
              <el-skeleton-item variant="text" style="width: 20%;" />
              <el-skeleton-item variant="text" style="width: 12%;" />
              <el-skeleton-item variant="text" style="width: 12%;" />
              <el-skeleton-item variant="text" style="width: 12%;" />
              <el-skeleton-item variant="text" style="width: 12%;" />
              <el-skeleton-item variant="text" style="width: 17%;" />
            </div>
          </div>
        </template>
        
        <!-- 统计数据表格 -->
        <div v-if="filteredStatsData.length > 0" class="table-container">
          <el-table
            :data="filteredStatsData"
            style="width: 100%"
            border
            :default-sort="{ prop: 'todayCount', order: 'descending' }"
            class="stats-table"
          >
            <el-table-column
              prop="adminId"
              label="管理员ID"
              width="120"
              sortable
              align="center"
            >
              <template #default="scope">
                {{ scope.row.adminId }}
              </template>
            </el-table-column>
            
            <el-table-column
              prop="adminName"
              label="管理员名称"
              width="180"
              sortable
              align="center"
            >
              <template #default="scope">
                {{ scope.row.adminName }}
              </template>
            </el-table-column>
            
            <el-table-column
              prop="todayCount"
              label="今日接待量"
              width="140"
              sortable
              align="center"
            >
              <template #default="scope">
                <span :class="{ 'highlight': scope.row.todayCount > 0 }">
                  {{ scope.row.todayCount }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column
              prop="todayCompletedCount"
              label="今日完成量"
              width="140"
              sortable
              align="center"
            >
              <template #default="scope">
                <span :class="{ 'highlight': scope.row.todayCompletedCount > 0 }">
                  {{ scope.row.todayCompletedCount }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column
              prop="ongoingCount"
              label="进行中量"
              width="140"
              sortable
              align="center"
            >
              <template #default="scope">
                <span :class="{ 'highlight': scope.row.ongoingCount > 0 }">
                  {{ scope.row.ongoingCount }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column
              prop="messageCount"
              label="消息量"
              width="140"
              sortable
              align="center"
            >
              <template #default="scope">
                <span :class="{ 'highlight': scope.row.messageCount > 0 }">
                  {{ scope.row.messageCount }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column
              prop="avgResponseTime"
              label="平均响应时间"
              width="160"
              sortable
              align="center"
              :sort-method="sortByAvgResponseTime"
            >
              <template #default="scope">
                <span :class="{ 'highlight': scope.row.avgResponseTime > 0 }">
                  {{ formatAvgResponseTime(scope.row.avgResponseTime) }}
                </span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <!-- 空数据提示 -->
        <div v-else-if="!loading" class="empty-container">
          <el-empty
            description="暂无数据"
            image="empty"
          >
            <el-button type="primary" @click="loadStatsData">重新加载</el-button>
          </el-empty>
        </div>
      </el-skeleton>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-container">
        <el-alert
          title="数据加载失败"
          :description="error"
          type="error"
          show-icon
          :closable="false"
        />
        <el-button type="primary" @click="loadStatsData" style="margin-top: 16px;">
          重新加载
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'
import { Search } from '@element-plus/icons-vue'

// 状态管理
const loading = ref(true)
const error = ref('')
const statsData = ref([])
const searchKeyword = ref('')
const updateTime = ref(new Date())

// 搜索过滤后的统计数据
const filteredStatsData = computed(() => {
  if (!searchKeyword.value) {
    return statsData.value
  }
  return statsData.value.filter(item => 
    item.adminName.toLowerCase().includes(searchKeyword.value.toLowerCase())
  )
})

// 格式化平均响应时间（秒 -> 分:秒）
const formatAvgResponseTime = (seconds) => {
  if (!seconds) return '00:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 平均响应时间排序方法
const sortByAvgResponseTime = (a, b) => {
  return a.avgResponseTime - b.avgResponseTime
}

// 搜索处理
const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

// 加载统计数据
const loadStatsData = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await authApi.getAllCustomerServiceStats()
    statsData.value = data
    updateTime.value = new Date()
    ElMessage.success('数据加载成功')
  } catch (err) {
    console.error('加载所有客服统计数据失败:', err)
    error.value = '网络错误，请稍后重试'
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 页面挂载时加载数据
onMounted(() => {
  loadStatsData()
})
</script>

<style scoped>
.all-customer-service-stats-container {
  padding: 0 20px 20px;
}

.all-customer-service-stats-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.search-box {
  flex: 1;
  max-width: 300px;
}

.search-input {
  width: 100%;
}

.overview-info {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.table-container {
  margin-top: 20px;
}

.stats-table {
  font-size: 14px;
}

.highlight {
  font-weight: bold;
  color: var(--color-primary);
}

.empty-container {
  text-align: center;
  padding: 40px 0;
}

.error-container {
  text-align: center;
  padding: 40px 0;
}

.table-skeleton {
  margin: 20px 0;
}

.table-row-skeleton {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
</style>