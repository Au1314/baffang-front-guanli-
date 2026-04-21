<template>
  <div class="notice-list">
    <el-card>
      <!-- 搜索过滤区域 -->
      <el-form :model="searchForm" :inline="true" label-width="80px" class="search-form">
        <el-form-item label="通知类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable style="width: 150px;">
            <el-option label="系统公告" :value="0" />
            <el-option label="充电通知" :value="1" />
            <el-option label="预约通知" :value="2" />
            <el-option label="V2V通知" :value="3" />
            <el-option label="紧急呼叫通知" :value="4" />
            <el-option label="订单通知" :value="5" />
            <el-option label="审核通知" :value="6" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="接收用户">
          <el-input
            v-model="searchForm.userId"
            placeholder="用户ID"
            clearable
            type="number"
            style="width: 150px;"
          />
        </el-form-item>
        
        <el-form-item label="是否已读">
          <el-select v-model="searchForm.isRead" placeholder="全部" clearable style="width: 120px;">
            <el-option label="未读" :value="0" />
            <el-option label="已读" :value="1" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="标题/内容"
            clearable
            @keyup.enter="handleSearch"
            style="width: 200px;"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 操作栏 -->
      <div class="operation-bar" style="margin-bottom: 16px;">
        <el-button 
          type="danger" 
          class="batch-delete-btn" 
          @click="handleBatchDelete" 
          :disabled="selectedIds.length === 0"
        >
          <el-icon><Delete /></el-icon>
          批量删除
          <span v-if="selectedIds.length > 0" style="margin-left: 4px;">({{ selectedIds.length }})</span>
        </el-button>
      </div>
      
      <!-- 通知列表 -->
      <el-table
        :data="noticeList"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
        @selection-change="handleSelectionChange"
        @row-click.stop="handleRowClick"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="通知ID" width="80" align="center" />
        <el-table-column prop="title" label="标题" min-width="200" />
        <el-table-column prop="content" label="内容" min-width="300">
          <template #default="scope">
            <span :title="scope.row.content">{{ scope.row.content }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="typeName" label="通知类型" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getTypeTagType(scope.row.type)">
              {{ scope.row.typeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="接收用户" width="120" align="center" />
        <el-table-column prop="isRead" label="是否已读" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.isRead === 1 ? 'success' : 'warning'">
              {{ scope.row.isRead === 1 ? '已读' : '未读' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" align="center" />
        <el-table-column prop="readTime" label="阅读时间" width="180" align="center" />
        <el-table-column label="操作" min-width="200px" align="center">
          <template #default="scope">
            <el-button
              type="primary"
              size="small"
              @click.stop="handleViewDetail(scope.row)"
            >
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click.stop="handleDeleteNotice(scope.row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 通知详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="通知详情"
      width="600px"
      @close="handleDetailClose"
    >
      <div v-if="detailLoading" class="detail-loading">
        <el-skeleton :rows="6" animated />
      </div>
      <div v-else class="notice-detail">
        <div class="detail-item">
          <label>通知标题：</label>
          <span>{{ noticeDetail.title }}</span>
        </div>
        <div class="detail-item">
          <label>通知类型：</label>
          <el-tag :type="getTypeTagType(noticeDetail.type)">{{ noticeDetail.typeName }}</el-tag>
        </div>
        <div class="detail-item">
          <label>接收用户：</label>
          <span>{{ noticeDetail.userName }}</span>
        </div>
        <div class="detail-item">
          <label>是否已读：</label>
          <el-tag :type="noticeDetail.isRead === 1 ? 'success' : 'warning'">
            {{ noticeDetail.isRead === 1 ? '已读' : '未读' }}
          </el-tag>
        </div>
        <div class="detail-item">
          <label>创建时间：</label>
          <span>{{ noticeDetail.createTime }}</span>
        </div>
        <div class="detail-item">
          <label>阅读时间：</label>
          <span>{{ noticeDetail.readTime || '未读' }}</span>
        </div>
        <div class="detail-item content">
          <label>通知内容：</label>
          <div class="content-text">{{ noticeDetail.content }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, Check, View } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'

// 加载状态
const loading = ref(false)

// 搜索表单
const searchForm = ref({
  type: null,
  userId: null,
  isRead: null,
  keyword: ''
})

// 通知列表数据
const noticeList = ref([])

// 选中的通知ID列表
const selectedIds = ref([])

// 分页信息
const pagination = ref({
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0
})

// 详情弹窗可见性
const detailVisible = ref(false)
// 详情加载状态
const detailLoading = ref(false)
// 通知详情数据
const noticeDetail = ref({})

// 获取通知列表
const getNoticeList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm.value,
      page: pagination.value.page,
      pageSize: pagination.value.pageSize
    }
    
    // 移除null和undefined值
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === undefined || params[key] === '') {
        delete params[key]
      }
    })
    
    const response = await authApi.getNoticeList(params)
    noticeList.value = response.list || []
    pagination.value.total = response.total || 0
    pagination.value.totalPages = response.totalPages || 0
  } catch (error) {
    ElMessage.error('获取通知列表失败')
    console.error('获取通知列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.page = 1
  getNoticeList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    type: null,
    userId: null,
    isRead: null,
    keyword: ''
  }
  pagination.value.page = 1
  getNoticeList()
}

// 页码变化
const handleCurrentChange = (current) => {
  pagination.value.page = current
  getNoticeList()
}

// 每页条数变化
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.page = 1
  getNoticeList()
}



// 删除通知
const handleDeleteNotice = async (row) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该通知吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await authApi.deleteNotice(row.id)
    ElMessage.success('通知删除成功')
    
    // 刷新列表
    getNoticeList()
  } catch (error) {
    if (error.type !== 'cancel') {
      ElMessage.error('删除失败')
      console.error('删除通知失败:', error)
    }
  }
}

// 批量删除通知
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的通知')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个通知吗？`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // 使用批量删除API
    const response = await authApi.batchDeleteNotice(selectedIds.value)
    ElMessage.success(`成功删除 ${response.data} 个通知`)
    
    // 刷新列表
    getNoticeList()
    
    // 清空选择
    selectedIds.value = []
  } catch (error) {
    if (error.type !== 'cancel') {
      ElMessage.error('批量删除失败')
      console.error('批量删除通知失败:', error)
    }
  }
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 获取通知类型标签样式
const getTypeTagType = (type) => {
  const typeMap = {
    0: 'primary',   // 系统公告
    1: 'success',   // 充电通知
    2: 'warning',   // 预约通知
    3: 'info',      // V2V通知
    4: 'danger',    // 紧急呼叫通知
    5: 'info',      // 订单通知
    6: 'warning'    // 审核通知
  }
  return typeMap[type] || 'info'
}

// 获取通知详情
const getNoticeDetail = async (noticeId) => {
  detailLoading.value = true
  try {
    const response = await authApi.getNoticeDetail(noticeId)
    noticeDetail.value = response
    detailVisible.value = true
  } catch (error) {
    ElMessage.error('获取通知详情失败')
    console.error('获取通知详情失败:', error)
  } finally {
    detailLoading.value = false
  }
}

// 处理列表行点击
const handleRowClick = (row) => {
  getNoticeDetail(row.id)
}

// 处理详情弹窗关闭
const handleDetailClose = () => {
  noticeDetail.value = {}
}

// 处理查看详情按钮点击
const handleViewDetail = (row) => {
  getNoticeDetail(row.id)
}

// 初始加载数据
onMounted(() => {
  getNoticeList()
})
</script>

<style scoped>
.notice-list {
  padding: 0 20px 20px;
}

/* 筛选区样式优化 */
.search-form {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.el-form-item) {
  margin-bottom: 12px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper) {
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover),
:deep(.el-select__wrapper:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-select__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 操作栏样式 */
.operation-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.batch-delete-btn {
  transition: all 0.3s ease;
}

.batch-delete-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
}

.batch-delete-btn:not(:disabled) {
  background-color: #f56c6c;
  border-color: #f56c6c;
}

.batch-delete-btn:not(:disabled):hover {
  background-color: #f78989;
  border-color: #f78989;
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

:deep(.el-table__header-wrapper) {
  background-color: #fafafa;
}

:deep(.el-table th) {
  font-weight: 600;
  color: #303133;
  background-color: #fafafa;
}

:deep(.el-table tr:hover > td) {
  background-color: #ecf5ff !important;
}

:deep(.el-table .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-table .cell:hover) {
  white-space: normal;
  overflow: visible;
  text-overflow: clip;
}

/* 表格标签样式 */
:deep(.el-tag) {
  border-radius: 4px;
  font-size: 12px;
  padding: 2px 8px;
  margin: 0 2px;
}

/* 操作按钮间距优化 */
:deep(.el-table .el-button) {
  margin-right: 6px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

:deep(.el-table .el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.el-table .el-button:last-child) {
  margin-right: 0;
}

/* 分页样式优化 */
.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-pagination) {
  display: flex;
  align-items: center;
}

:deep(.el-pagination__jump) {
  margin-left: 10px;
}

:deep(.el-pagination__jump .el-input__wrapper) {
  width: 80px;
}

:deep(.el-pagination__sizes .el-input__wrapper) {
  width: 100px;
}

/* 详情弹窗样式 */
.notice-detail {
  padding: 20px 0;
}

.detail-item {
  margin-bottom: 15px;
  display: flex;
  align-items: flex-start;
}

.detail-item label {
  width: 100px;
  font-weight: bold;
  margin-right: 20px;
  text-align: right;
}

.detail-item span {
  flex: 1;
  word-break: break-all;
}

.detail-item.content {
  margin-top: 30px;
}

.content-text {
  flex: 1;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  min-height: 100px;
  white-space: pre-wrap;
  word-break: break-all;
}

.detail-loading {
  padding: 20px 0;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .notice-list {
    padding: 0 10px 10px;
  }
  
  .search-form {
    padding: 12px;
  }
  
  :deep(.el-form-item) {
    margin-bottom: 8px;
  }
  
  :deep(.el-form-item__label) {
    font-size: 13px;
  }
  
  :deep(.el-table) {
    font-size: 13px;
  }
  
  :deep(.el-table .el-button) {
    font-size: 12px;
    padding: 4px 8px;
  }
  
  .pagination {
    justify-content: center;
  }
}
</style>