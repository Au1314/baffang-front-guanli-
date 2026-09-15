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
      <el-input
        v-model="recordFilter.keyword"
        placeholder="请输入用户ID或对话内容"
        style="width: 250px; margin-right: 10px"
        clearable
      >
        <template #append>
          <el-button @click="fetchAllChatRecords"><el-icon><Search /></el-icon></el-button>
        </template>
      </el-input>
      <el-select
        v-model="recordFilter.status"
        placeholder="对话状态"
        style="width: 120px; margin-right: 10px"
        clearable
      >
        <el-option label="全部" :value="null" />
        <el-option label="待处理" :value="0" />
        <el-option label="处理中" :value="1" />
        <el-option label="已结束" :value="2" />
      </el-select>
      <el-button @click="resetRecordFilter">重置</el-button>
    </div>

    <!-- 对话记录列表 -->
    <el-table
      v-loading="recordLoading"
      :data="allChatRecords"
      stripe
      style="width: 100%"
      @row-click="viewChatRecord"
    >
      <el-table-column prop="id" label="对话ID" width="120" />
      <el-table-column prop="userId" label="用户ID" width="150" />
      <el-table-column prop="lastMessage" label="最后消息" width="300" show-overflow-tooltip />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="scope">
          <el-tag
            :type="scope.row.status === 0 ? 'warning' : scope.row.status === 1 ? 'success' : 'info'"
          >
            {{ scope.row.status === 0 ? '待处理' : scope.row.status === 1 ? '处理中' : '已结束' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="180" />
      <el-table-column prop="endTime" label="结束时间" width="180">
        <template #default="scope">
          {{ scope.row.endTime || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="messageCount" label="消息数" width="100" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="scope">
          <el-button
            size="small"
            type="primary"
            @click.stop="viewChatRecord(scope.row)"
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

  <!-- 查看对话记录弹窗 -->
  <el-dialog
    v-model="showRecordDetail"
    title="对话记录详情"
    width="800px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <div class="record-detail-header" v-if="currentRecord">
      <div class="record-info">
        <span class="record-id">对话ID: {{ currentRecord.id }}</span>
        <el-tag :type="'primary'" size="small" class="type-tag">
          {{ currentRecord.typeName || '客服对话' }}
        </el-tag>
        <el-tag
          :type="currentRecord.status === 0 ? 'warning' : currentRecord.status === 1 ? 'success' : 'info'"
        >
          {{ currentRecord.statusName || (currentRecord.status === 0 ? '待处理' : currentRecord.status === 1 ? '处理中' : '已结束') }}
        </el-tag>
      </div>
      <div class="record-users">
        <div class="user-info">
          <span class="user-label">用户:</span>
          <el-avatar :size="30" :src="currentRecord.userAvatar" :icon="User" class="user-avatar" />
          <span class="user-name">{{ currentRecord.userName }}</span>
          <span class="user-phone">{{ currentRecord.userPhone }}</span>
        </div>
        <div class="admin-info">
          <span class="admin-label">客服:</span>
          <el-avatar :size="30" :icon="ChatDotRound" class="admin-avatar" />
          <span class="admin-name">{{ currentRecord.adminName || '未分配' }}</span>
        </div>
      </div>
      <div class="record-meta">
        <div class="record-time">
          <span>创建时间: {{ currentRecord.createTime }}</span>
          <span v-if="currentRecord.endTime">结束时间: {{ currentRecord.endTime }}</span>
          <span v-if="currentRecord.durationText">持续时间: {{ currentRecord.durationText }}</span>
        </div>
        <div class="record-stats">
          <span>消息数量: {{ currentRecord.messageCount }}</span>
          <span v-if="currentRecord.remark" class="record-remark">备注: {{ currentRecord.remark }}</span>
        </div>
      </div>

      <!-- 参与者列表 -->
      <div class="record-participants" v-if="currentRecord.participants && currentRecord.participants.length > 0">
        <div class="participants-title">参与者:</div>
        <div class="participants-list">
          <el-tag
            v-for="participant in currentRecord.participants"
            :key="participant.participantId"
            :type="participant.participantType === 0 ? 'success' : 'primary'"
            size="small"
            class="participant-tag"
          >
            {{ participant.name }} ({{ participant.participantTypeName }} - {{ participant.roleName }})
          </el-tag>
        </div>
      </div>
    </div>

    <el-scrollbar class="record-detail-scroll" max-height="500px">
      <div class="record-message-list">
        <div
          v-for="message in recordDetailMessages"
          :key="message.id"
          class="message-item"
          :class="{ 'admin-message': message.senderType === 1, 'user-message': message.senderType === 0 }"
        >
          <div class="message-avatar">
            <el-avatar
              :size="32"
              :src="message.senderType === 0 ? currentRecord.userAvatar : ''"
              :icon="message.senderType === 1 ? ChatDotRound : User"
              :class="message.senderType === 1 ? 'admin-avatar' : 'user-avatar'"
            />
          </div>
          <div class="message-content">
            <div class="message-sender">{{ message.senderName }}</div>
            <div class="message-text">{{ message.content }}</div>
            <div class="message-time">{{ message.createTime }}</div>
          </div>
        </div>
      </div>
    </el-scrollbar>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="showRecordDetail = false">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, User, ChatDotRound } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'

// 对话记录
const allChatRecords = ref([])
const recordTotal = ref(0)
const recordPage = ref(1)
const recordPageSize = ref(20)
const recordLoading = ref(false)
const recordFilter = reactive({
  dateRange: [],
  keyword: '',
  status: null
})

// 对话记录详情
const showRecordDetail = ref(false)
const currentRecord = ref(null)
const recordDetailMessages = ref([])

// 获取全量对话记录 - 暂时使用mock数据，因为没有对应的API
const fetchAllChatRecords = async () => {
  try {
    recordLoading.value = true
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))

    // 使用模拟数据
    const mockData = Array.from({ length: 10 }, (_, index) => ({
      id: 100 + index,
      userId: 1000 + index,
      userName: `用户${index + 1}`,
      userPhone: `138****800${index + 1}`,
      status: 2,
      statusName: '已关闭',
      lastMessage: `这是第${index + 1}条对话的最后一条消息`,
      messageCount: Math.floor(Math.random() * 20) + 1,
      createTime: new Date(Date.now() - index * 3600000).toLocaleString(),
      endTime: new Date(Date.now() - index * 1800000).toLocaleString(),
      durationText: `${Math.floor(Math.random() * 30) + 5}分钟`
    }))

    // 筛选数据
    let filteredData = [...mockData]

    // 关键词筛选
    if (recordFilter.keyword) {
      const keyword = recordFilter.keyword.toLowerCase()
      filteredData = filteredData.filter(record =>
        record.userName.toLowerCase().includes(keyword) ||
        record.lastMessage.toLowerCase().includes(keyword)
      )
    }

    // 状态筛选
    if (recordFilter.status !== null && recordFilter.status !== undefined) {
      filteredData = filteredData.filter(record => record.status === recordFilter.status)
    }

    // 分页处理
    const startIndex = (recordPage.value - 1) * recordPageSize.value
    const endIndex = startIndex + recordPageSize.value
    const paginatedData = filteredData.slice(startIndex, endIndex)

    allChatRecords.value = paginatedData
    recordTotal.value = filteredData.length
  } catch (error) {
    console.error('获取对话记录失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
  } finally {
    recordLoading.value = false
  }
}

// 分页大小变化
const handleRecordSizeChange = (size) => {
  recordPageSize.value = size
  recordPage.value = 1
  fetchAllChatRecords()
}

// 页码变化
const handleRecordPageChange = (page) => {
  recordPage.value = page
  fetchAllChatRecords()
}

// 重置记录筛选
const resetRecordFilter = () => {
  Object.assign(recordFilter, {
    dateRange: [],
    keyword: '',
    status: null
  })
  recordPage.value = 1
  fetchAllChatRecords()
}

// 查看对话记录详情
const viewChatRecord = async (record) => {
  currentRecord.value = record
  recordDetailMessages.value = []
  showRecordDetail.value = true

  try {
    // 真实API调用
    const response = await authApi.getChatCompleteRecord(record.id)

    const chatData = response || {}

    currentRecord.value = chatData

    // 获取对话消息（模拟数据，因为API只返回对话详情，没有消息列表）
    const mockMessages = Array.from({ length: record.messageCount }, (_, index) => ({
      id: 200 + index,
      content: `这是第${index + 1}条消息内容`,
      senderType: index % 2 === 0 ? 0 : 1,
      senderName: index % 2 === 0 ? chatData.userName : chatData.adminName,
      createTime: new Date(Date.now() - (record.messageCount - index) * 60000).toLocaleString()
    }))

    recordDetailMessages.value = mockMessages
  } catch (error) {
    console.error('获取对话记录详情失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
  }
}

onMounted(() => {
  fetchAllChatRecords()
})
</script>

<style scoped>
/* 对话记录样式 */
.records-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  padding: 24px;
  transition: all 0.3s ease;
}

.records-container:hover {
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
}

.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
  background-color: var(--color-bg-page);
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.filter-bar:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: var(--color-text-placeholder);
}

.filter-bar .el-input,
.filter-bar .el-select,
.filter-bar .el-date-picker {
  border-radius: 8px;
  transition: all 0.3s ease;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.filter-bar .el-input :deep(.el-input__wrapper),
.filter-bar .el-select :deep(.el-input__wrapper) {
  border-radius: 8px;
  border: 1px solid var(--color-border-light);
  transition: all 0.3s ease;
}

.filter-bar .el-input :deep(.el-input__wrapper):hover,
.filter-bar .el-select :deep(.el-input__wrapper):hover {
  border-color: var(--color-text-placeholder);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.filter-bar .el-input :deep(.el-input__wrapper).is-focus,
.filter-bar .el-select :deep(.el-input__wrapper).is-focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.filter-bar .el-button {
  border-radius: 8px;
  transition: all 0.3s ease;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  padding: 8px 20px;
}

.filter-bar .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  background-color: var(--color-bg-page);
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
}

.pagination .el-pagination {
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.pagination .el-pagination__item {
  border-radius: 6px;
  transition: all 0.3s ease;
}

.pagination .el-pagination__item:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.pagination .el-pagination__item.is-active {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: white;
}

/* 表格样式优化 */
.records-container .el-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--color-border-light);
}

.records-container .el-table :deep(.el-table__header-wrapper) {
  background-color: var(--color-bg-page);
  border-bottom: 1px solid var(--color-border-light);
}

.records-container .el-table :deep(.el-table__header-wrapper th) {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  font-weight: 600;
  color: var(--color-text-primary);
  background-color: var(--color-bg-page);
  border-right: 1px solid var(--color-border-light);
}

.records-container .el-table :deep(.el-table__body-wrapper tr) {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  transition: all 0.3s ease;
}

.records-container .el-table :deep(.el-table__body-wrapper tr:hover) {
  background-color: #f9fafb;
}

.records-container .el-table :deep(.el-table__body-wrapper tr.el-table__row--striped) {
  background-color: #fafafa;
}

.records-container .el-table :deep(.el-table__body-wrapper tr.el-table__row--striped:hover) {
  background-color: #f9fafb;
}

.records-container .el-button {
  border-radius: 8px;
  transition: all 0.3s ease;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  padding: 6px 16px;
}

.records-container .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.records-container .el-tag {
  border-radius: 12px;
  padding: 2px 10px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  font-size: 12px;
}

/* 记录详情样式 */
.record-detail-header {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.record-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.record-id {
  font-weight: 600;
  font-size: 16px;
  color: var(--color-text-primary);
  background-color: #f9fafb;
  padding: 6px 12px;
  border-radius: 8px;
}

.type-tag {
  margin-left: 8px;
}

.record-users {
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  flex-wrap: wrap;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.user-info,
.admin-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-label,
.admin-label {
  font-weight: 600;
  color: var(--color-text-regular);
  min-width: 40px;
}

.user-avatar,
.admin-avatar {
  margin-right: 8px;
}

.user-name,
.admin-name {
  font-weight: 500;
  color: var(--color-text-primary);
}

.user-phone {
  color: var(--color-text-secondary);
  font-size: 14px;
}

.record-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
}

.record-time {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: var(--color-text-regular);
  flex-wrap: wrap;
}

.record-stats {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: var(--color-text-regular);
  flex-wrap: wrap;
}

.record-remark {
  color: var(--color-danger);
  background-color: var(--color-danger-light);
  padding: 2px 8px;
  border-radius: 10px;
}

.record-participants {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px dashed #f0f0f0;
}

.participants-title {
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--color-text-primary);
}

.participants-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.participant-tag {
  margin-bottom: 8px;
  border-radius: 16px;
  padding: 4px 12px;
}

.record-message-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-sender {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: 6px;
  padding: 0 8px;
  font-weight: 500;
}

.admin-message .message-sender {
  text-align: right;
}

.user-message .message-sender {
  text-align: left;
}

.record-detail-scroll {
  margin-top: 24px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
}

/* 记录详情消息样式（与聊天消息共用气泡样式） */
.message-item {
  display: flex;
  align-items: flex-start;
  position: relative;
  animation: messageSlideIn 0.3s ease-out;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-item.admin-message {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 12px;
  flex-shrink: 0;
  margin-top: 4px;
  transition: all 0.3s;
  position: relative;
}

.message-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.admin-avatar {
  background-color: var(--color-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  border: 2px solid #ffffff;
}

.user-avatar {
  background-color: var(--color-success);
  color: white;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
  border: 2px solid #ffffff;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 70%;
  position: relative;
}

.message-text {
  padding: 16px 20px;
  border-radius: 18px;
  line-height: 1.5;
  word-break: break-word;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.message-text:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.user-message .message-text {
  background-color: #ffffff;
  border-bottom-left-radius: 4px;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-light);
}

.admin-message .message-text {
  background-color: var(--color-primary);
  color: white;
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.message-time {
  font-size: 11px;
  color: var(--color-text-secondary);
  margin-left: 12px;
  align-self: flex-start;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 3px 8px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  border: 1px solid var(--color-border-light);
}

.admin-message .message-time {
  margin-right: 12px;
  margin-left: 0;
  align-self: flex-end;
  background-color: rgba(64, 158, 255, 0.1);
  color: var(--color-primary);
  border: 1px solid #adcfff;
}

/* 对话框样式优化 */
:deep(.el-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

/* 标签样式优化 */
:deep(.el-tag) {
  border-radius: 12px;
  padding: 2px 12px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  font-size: 12px;
  transition: all 0.3s ease;
}

:deep(.el-tag:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 头像样式优化 */
:deep(.el-avatar) {
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-avatar:hover) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 滚动条样式优化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: all 0.3s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
