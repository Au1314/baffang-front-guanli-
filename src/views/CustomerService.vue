<template>
  <div class="customer-service-container">
    <el-card shadow="never" class="customer-service-card">
      <template #header>
        <div class="card-header">
          <span>客服管理</span>
        </div>
      </template>
      
      <!-- 标签页导航 -->
      <el-tabs v-model="activeTab" class="service-tabs">
        <!-- AI客服配置 -->
        <el-tab-pane label="AI客服配置" name="ai-config">
          <el-card shadow="hover" class="config-card">
            <template #header>
              <div class="config-card-header">
                <el-icon class="card-icon"><Cpu /></el-icon>
                <span>AI客服参数配置</span>
              </div>
            </template>
            
            <el-form :model="aiConfigForm" label-width="150px" class="ai-config-form">
              <!-- 基本配置 -->
              <el-divider>基本配置</el-divider>
              
              <el-form-item label="AI客服开关" required>
                <el-switch v-model="aiConfigForm.aiEnabled" />
              </el-form-item>
              
              <el-form-item label="欢迎语" required>
                <el-input
                  v-model="aiConfigForm.aiWelcomeMessage"
                  type="textarea"
                  rows="3"
                  placeholder="请输入AI客服欢迎语"
                />
              </el-form-item>
              
              <el-form-item label="离线消息" required>
                <el-input
                  v-model="aiConfigForm.offlineMessage"
                  type="textarea"
                  rows="3"
                  placeholder="请输入非工作时间的回复"
                />
              </el-form-item>
              
              <!-- API配置 -->
              <el-divider>API配置</el-divider>
              
              <el-form-item label="API Key" required>
                <el-input
                  v-model="aiConfigForm.aiApiKey"
                  type="password"
                  placeholder="请输入AI API Key"
                  show-password
                />
              </el-form-item>
              
              <el-form-item label="API URL" required>
                <el-input
                  v-model="aiConfigForm.aiApiUrl"
                  placeholder="请输入AI API URL"
                />
              </el-form-item>
              
              <el-form-item label="模型名称" required>
                <el-input
                  v-model="aiConfigForm.aiModel"
                  placeholder="请输入AI模型名称"
                />
              </el-form-item>
              
              <!-- 模型参数配置 -->
              <el-divider>模型参数配置</el-divider>
              
              <el-form-item label="最大Token数" required>
                <el-input-number
                  v-model="aiConfigForm.aiMaxTokens"
                  :min="100"
                  :max="2000"
                  :step="100"
                />
              </el-form-item>
              
              <el-form-item label="温度参数" required>
                <el-slider
                  v-model="aiConfigForm.aiTemperature"
                  :min="0"
                  :max="2"
                  :step="0.1"
                  show-input
                />
              </el-form-item>
              
              <el-form-item label="系统提示词" required>
                <el-input
                  v-model="aiConfigForm.aiSystemPrompt"
                  type="textarea"
                  rows="5"
                  placeholder="请输入AI系统提示词"
                />
              </el-form-item>
              
              <!-- 转人工配置 -->
              <el-divider>转人工配置</el-divider>
              
              <el-form-item label="转人工触发词" required>
                <el-select
                  v-model="aiConfigForm.transferKeywords"
                  multiple
                  placeholder="请选择或输入转人工触发词"
                  style="width: 100%"
                >
                  <el-option
                    v-for="keyword in ['人工', '转人工', '人工客服', '真人']"
                    :key="keyword"
                    :label="keyword"
                    :value="keyword"
                  />
                </el-select>
              </el-form-item>
              
              <el-form-item label="自动转人工阈值" required>
                <el-input-number
                  v-model="aiConfigForm.autoTransferThreshold"
                  :min="1"
                  :max="10"
                  :step="1"
                />
              </el-form-item>
              
              <!-- 工作时间配置 -->
              <el-divider>工作时间配置</el-divider>
              
              <el-form-item label="工作时间开始" required>
                <el-time-picker
                  v-model="aiConfigForm.workingHoursStart"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="请选择工作时间开始"
                />
              </el-form-item>
              
              <el-form-item label="工作时间结束" required>
                <el-time-picker
                  v-model="aiConfigForm.workingHoursEnd"
                  format="HH:mm"
                  value-format="HH:mm"
                  placeholder="请选择工作时间结束"
                />
              </el-form-item>
              
              <!-- 按钮区域 -->
              <el-form-item>
                <div class="form-actions">
                  <el-button type="primary" @click="saveAIConfig" :loading="configLoading">
                    保存配置
                  </el-button>
                  <el-button @click="resetAIConfig">
                    重置
                  </el-button>
                </div>
              </el-form-item>
            </el-form>
          </el-card>
        </el-tab-pane>
        
        <!-- 人工客服对话 -->
        <el-tab-pane label="人工客服对话" name="chat" v-if="false">
          <div class="chat-container">
            <!-- 待处理对话列表 -->
<div class="chat-list-panel">
  <div class="panel-header">
    <h3>待处理对话</h3>
    <el-badge :value="pendingChatList.length" type="danger" class="pending-badge" />
  </div>
  
  <el-input
    v-model="chatFilter.keyword"
    placeholder="请输入用户ID或对话内容"
    clearable
    @keyup.enter="fetchPendingChatList"
    class="chat-search"
  >
    <template #append>
      <el-button @click="fetchPendingChatList"><el-icon><Search /></el-icon></el-button>
    </template>
  </el-input>
  
  <el-empty v-if="!pendingChatList.length && !chatListLoading" description="暂无待处理对话" />
  
  <el-scrollbar class="chat-list-scroll">
    <el-list v-loading="chatListLoading" class="chat-list">
      <el-list-item
        v-for="chat in pendingChatList"
        :key="chat.id"
        class="chat-list-item"
        :class="{ 'active': selectedChatId === chat.id, 'pending': chat.status === 0, 'processing': chat.status === 1 }"
        @click="selectChat(chat)"
      >
        <template #avatar>
          <el-avatar :size="40" :src="chat.userAvatar" :icon="User" />
        </template>
        <template #title>
          <div class="chat-item-title">
            <span class="user-id">用户: {{ chat.userName }} (ID: {{ chat.userId }})</span>
            <div class="user-info">
              <span class="user-phone">{{ chat.userPhone }}</span>
              <el-tag
                :type="chat.status === 0 ? 'warning' : 'success'"
                size="small"
                class="status-tag"
              >
                {{ chat.status === 0 ? '待处理' : '处理中' }}
              </el-tag>
            </div>
          </div>
        </template>
        <template #description>
          <div class="chat-item-desc">
            <div class="last-message">{{ chat.lastMessage }}</div>
            <div class="chat-meta">
              <span class="waiting-time">等待时间: {{ chat.waitingTimeText }}</span>
              <span class="message-count">消息数: {{ chat.messageCount }}</span>
              <span class="chat-time">{{ chat.createTime }}</span>
            </div>
          </div>
        </template>
        <template #actions>
          <el-button
            type="primary"
            size="small"
            @click.stop="acceptConversation(chat.id)"
            :loading="chatActionLoading"
          >
            接入
          </el-button>
        </template>
      </el-list-item>
    </el-list>
  </el-scrollbar>
  
  <!-- 待接入对话列表分页 -->
  <div class="pagination" v-if="pendingTotal > 0">
    <el-pagination
      v-model:current-page="pendingPageNum"
      v-model:page-size="pendingPageSize"
      :page-sizes="[5, 10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="pendingTotal"
      @size-change="fetchPendingChatList"
      @current-change="fetchPendingChatList"
    />
  </div>
</div>

<!-- 处理中对话列表 -->
<div class="chat-list-panel">
  <div class="panel-header">
    <h3>处理中对话</h3>
    <el-badge :value="processingChatList.length" type="primary" class="pending-badge" />
  </div>
  
  <div class="filter-bar">
    <el-input
      v-model="myConversationsFilter.keyword"
      placeholder="请输入用户ID或对话内容"
      clearable
      @keyup.enter="fetchMyConversations"
      class="chat-search"
      style="width: 200px; margin-right: 10px"
    >
      <template #append>
        <el-button @click="fetchMyConversations"><el-icon><Search /></el-icon></el-button>
      </template>
    </el-input>
    <el-select
      v-model="myConversationsStatus"
      placeholder="对话状态"
      style="width: 120px; margin-right: 10px"
      clearable
      @change="fetchMyConversations"
    >
      <el-option label="全部" :value="null" />
      <el-option label="处理中" :value="1" />
      <el-option label="已结束" :value="2" />
    </el-select>
    <el-button @click="resetMyConversationsFilter">重置</el-button>
  </div>
  
  <el-empty v-if="!processingChatList.length" description="暂无处理中对话" />
  
  <el-scrollbar class="chat-list-scroll">
    <el-list :data="processingChatList" v-loading="myConversationsLoading" class="chat-list">
      <el-list-item
        v-for="chat in processingChatList"
        :key="chat.id"
        class="chat-list-item"
        :class="{ 'active': selectedChatId === chat.id, 'processing': true, 'pinned': chat.isTop }"
        @click="selectChat(chat)"
      >
        <template #avatar>
          <el-avatar :size="40" :src="chat.userAvatar" :icon="User" />
        </template>
        <template #title>
          <div class="chat-item-title">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
              <span class="user-name">{{ chat.userName }}</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <el-tag
                  :type="'success'"
                  size="small"
                  class="status-tag"
                >
                  {{ chat.statusName || '处理中' }}
                </el-tag>
                <el-badge v-if="chat.unreadCount > 0" :value="chat.unreadCount" type="danger" class="unread-badge" />
              </div>
            </div>
            <div class="user-info">
              <span class="user-id">用户ID: {{ chat.userId }}</span>
              <span class="user-phone">{{ chat.userPhone }}</span>
            </div>
          </div>
        </template>
        <template #description>
          <div class="chat-item-desc">
            <div class="last-message">{{ chat.lastMessage }}</div>
            <div class="chat-meta">
              <span class="message-count">消息数: {{ chat.messageCount }}</span>
              <span class="chat-time">{{ chat.lastMessageTime || chat.createTime }}</span>
            </div>
          </div>
        </template>
        <template #actions>
          <el-button
            size="small"
            @click.stop="toggleConversationTop(chat.id, chat.isTop)"
            :loading="chatActionLoading"
          >
            <el-icon v-if="chat.isTop"><Top /></el-icon>
            <el-icon v-else><ArrowUp /></el-icon>
            {{ chat.isTop ? '取消置顶' : '置顶' }}
          </el-button>
        </template>
      </el-list-item>
    </el-list>
  </el-scrollbar>
  
  <!-- 我的对话列表分页 -->
  <div class="pagination" v-if="myConversationsTotal > 0">
    <el-pagination
      v-model:current-page="myConversationsPageNum"
      v-model:page-size="myConversationsPageSize"
      :page-sizes="[5, 10, 20, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="myConversationsTotal"
      @size-change="fetchMyConversations"
      @current-change="fetchMyConversations"
    />
  </div>
</div>
            
            <!-- 消息对话区域 -->
            <div class="chat-content-panel" v-if="selectedChatId">
              <div class="panel-header">
                <h3>对话详情</h3>
                <div class="chat-actions">
                  <el-button size="small" @click="markAsRead" :loading="chatActionLoading">
                    <el-icon><Check /></el-icon> 标记已读
                  </el-button>
                  <el-button size="small" type="danger" @click="handleEndChat" :loading="chatActionLoading">
                    <el-icon><CircleClose /></el-icon> 结束对话
                  </el-button>
                </div>
              </div>
              
              <!-- 消息列表 -->
              <el-scrollbar class="message-scroll" ref="messageScrollRef" @scroll="handleMessageScroll">
                <div class="message-list">
                  <el-empty v-if="!chatMessages.length && !messageLoading" description="暂无消息" />
                  
                  <!-- 加载更多按钮 -->
                  <div v-if="canLoadMore" class="load-more-btn-container">
                    <el-button size="small" type="text" @click="loadMoreMessages" :loading="messageLoading">
                      <el-icon><RefreshRight /></el-icon> 加载更多历史消息
                    </el-button>
                  </div>
                  
                  <div
                    v-for="message in chatMessages"
                    :key="message.id"
                    class="message-item"
                    :class="{ 'admin-message': message.senderType === 1, 'user-message': message.senderType === 0 }"
                  >
                    <div class="message-avatar" v-if="message.senderType === 0">
                      <el-avatar
                        :size="32"
                        :icon="User"
                        class="user-avatar"
                      />
                    </div>
                    <div class="message-content-wrapper" :class="{ 'admin-message-wrapper': message.senderType === 1, 'user-message-wrapper': message.senderType === 0 }">
                      <div class="message-content">
                        <div class="message-text">{{ message.content }}</div>
                        <div class="message-footer">
                          <span class="message-time">{{ message.sendTime || message.createTime }}</span>
                          <span v-if="message.senderType === 1" class="message-status">
                            <el-icon v-if="message.status === 'sending'" class="status-icon sending"><Loading /></el-icon>
                            <el-icon v-else-if="message.status === 'sent'" class="status-icon sent"><Check /></el-icon>
                            <el-icon v-else-if="message.status === 'read'" class="status-icon read"><Check /></el-icon>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div class="message-avatar" v-if="message.senderType === 1">
                      <el-avatar
                        :size="32"
                        :icon="ChatDotRound"
                        class="admin-avatar"
                      />
                    </div>
                  </div>
                  
                  <div v-if="messageLoading" class="loading-more">
                    <el-skeleton :rows="1" animated />
                  </div>
                </div>
              </el-scrollbar>
              
              <!-- 消息输入区域 -->
              <div class="message-input-area">
                <el-input
                  v-model="sendMessageContent"
                  type="textarea"
                  :rows="1"
                  placeholder="请输入消息内容..."
                  resize="none"
                  @keyup.enter.ctrl="handleSendMessage"
                  @keyup.enter.exact="handleSendMessage"
                  class="auto-resize-input"
                  ref="messageInputRef"
                />
                <div class="send-actions">
                  <span class="tip-text">按 Enter 发送，Ctrl+Enter 换行</span>
                  <el-button
                    type="primary"
                    @click="handleSendMessage"
                    :loading="sendLoading"
                    :disabled="!sendMessageContent.trim()"
                  >
                    发送
                  </el-button>
                </div>
              </div>
            </div>
            
            <!-- 未选择对话提示 -->
            <div class="no-chat-selected" v-else>
              <el-empty description="请选择一个对话开始处理" />
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 对话记录 -->
        <el-tab-pane label="对话记录" name="records">
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
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 查看对话记录弹窗 -->
    <el-dialog
      v-model="showRecordDetail"
      title="对话记录详情"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="record-detail-header">
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
    
    <!-- 转接对话弹窗 -->
    <el-dialog
      v-model="transferDialogVisible"
      title="转接对话"
      width="500px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form :model="transferForm" label-width="100px" class="transfer-form">
        <el-form-item label="目标客服" required>
          <el-select
            v-model="transferForm.targetAdminId"
            placeholder="请选择目标客服"
            style="width: 100%"
          >
            <el-option
              v-for="admin in onlineAdmins"
              :key="admin.adminId"
              :label="admin.adminName"
              :value="admin.adminId"
            >
              <div class="option-content">
                <el-avatar :size="24" :icon="ChatDotRound" class="admin-avatar" />
                <span class="admin-name">{{ admin.adminName }}</span>
                <el-tag type="success" size="small" class="online-tag">在线</el-tag>
              </div>
            </el-option>
          </el-select>
          <div v-if="onlineAdmins.length === 0" class="no-admin-tip">暂无在线客服</div>
        </el-form-item>
        
        <el-form-item label="转接原因" required>
          <el-input
            v-model="transferForm.reason"
            type="textarea"
            rows="3"
            placeholder="请输入转接原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="cancelTransferConversation">取消</el-button>
          <el-button type="primary" @click="confirmTransferConversation" :loading="transferLoading">
            确认转接
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authApi } from '@/api/auth'
import { useAdminStore } from '@/store/adminStore'
import CustomerServiceWS from '@/utils/CustomerServiceWS'
import {
  Search,
  User,
  ChatDotRound,
  Check,
  CircleClose,
  Cpu,
  RefreshRight,
  Loading,
  Top,
  ArrowUp
} from '@element-plus/icons-vue'

const adminStore = useAdminStore()

// WebSocket服务实例
const wsService = ref(null)
// WebSocket连接状态
const wsConnected = ref(false)

// 当前激活的标签页
const activeTab = ref('ai-config')

// AI客服配置
const configLoading = ref(false)
const aiConfigForm = reactive({
  aiEnabled: true,
  aiWelcomeMessage: '您好，欢迎使用我们的AI客服服务，有什么可以帮助您的吗？',
  aiApiKey: '',
  aiApiUrl: 'https://api.openai.com/v1/chat/completions',
  aiModel: 'gpt-3.5-turbo',
  aiMaxTokens: 500,
  aiTemperature: 0.7,
  aiSystemPrompt: '你是八方出行的智能客服助手，负责解答用户关于拖车、救援、代驾等服务的问题。请用简洁、专业、友好的语气回复用户。',
  autoTransferThreshold: 3,
  offlineMessage: '当前非工作时间，请留言或稍后再试，工作时间：09:00-18:00',
  transferKeywords: ['人工', '转人工', '人工客服', '真人'],
  workingHoursStart: '09:00',
  workingHoursEnd: '18:00'
})

// 待处理对话列表
const pendingChatList = ref([])
const processingChatList = ref([])
const chatListLoading = ref(false)
const selectedChatId = ref(null)
const chatFilter = reactive({
  keyword: ''
})

// 我的对话列表分页和筛选
const myConversationsPageNum = ref(1)
const myConversationsPageSize = ref(10)
const myConversationsTotal = ref(0)
const myConversationsPages = ref(1)
const myConversationsStatus = ref(null)
const myConversationsLoading = ref(false)
const myConversationsFilter = reactive({
  keyword: ''
})

// 待接入对话列表分页
const pendingPageNum = ref(1)
const pendingPageSize = ref(10)
const pendingTotal = ref(0)
const pendingPages = ref(1)

// 消息对话
const chatMessages = ref([])
const messageLoading = ref(false)
const sendMessageContent = ref('')
const sendLoading = ref(false)
const chatActionLoading = ref(false)
const messageScrollRef = ref(null)
const messageInputRef = ref(null)
// 消息加载更多相关
const canLoadMore = ref(true)
const isLoadingMore = ref(false)

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

// 在线客服列表
const onlineAdmins = ref([])

// 初始化WebSocket连接
const initWebSocket = () => {
  if (!adminStore.token) {
    console.error('没有找到管理员token，无法初始化WebSocket连接');
    return;
  }

  try {
    // 创建WebSocket服务实例
    wsService.value = new CustomerServiceWS(adminStore.token);
    wsConnected.value = true;

    // 注册WebSocket事件处理器
    registerWebSocketHandlers();
  } catch (error) {
    console.error('初始化WebSocket连接失败:', error);
    ElMessage.error('WebSocket连接失败，请刷新页面重试');
  }
};

// 注册WebSocket事件处理器
const registerWebSocketHandlers = () => {
  if (!wsService.value) return;

  // 会话列表更新
  wsService.value.on('CONVERSATIONS', (data) => {
    console.log('会话列表更新:', data);
    // 使用API刷新列表，确保数据结构一致
    fetchPendingChatList();
    fetchMyConversations();
  });

  // 新消息
  wsService.value.on('NEW_MESSAGE', (message) => {
    console.log('收到新消息:', message);
    // 统一的消息结构
    const newMessage = {
      id: message.id,
      conversationId: message.conversationId,
      content: message.content,
      senderId: message.senderId,
      senderType: message.senderType || 0,
      senderName: message.senderName || (message.senderType === 1 ? '客服' : '用户'),
      senderAvatar: message.senderAvatar || '',
      messageType: message.messageType || 0,
      sendTime: message.sendTime || message.createTime,
      isRead: message.isRead || 0,
      status: message.senderType === 1 ? 'sent' : undefined
    };
    
    // 如果是当前选中会话的消息，直接添加到消息列表
    if (selectedChatId.value === message.conversationId) {
      chatMessages.value.push(newMessage);
      // 滚动到底部
      nextTick(() => {
        if (messageScrollRef.value) {
          const scrollEl = messageScrollRef.value.wrapRef;
          scrollEl.scrollTop = scrollEl.scrollHeight;
        }
      });
    } else {
      // 否则更新本地对话列表的未读消息数量
      const index = processingChatList.value.findIndex(chat => chat.id === message.conversationId);
      if (index !== -1) {
        processingChatList.value[index].unreadCount = (processingChatList.value[index].unreadCount || 0) + 1;
      }
      // 刷新我的对话列表，确保数据结构一致
      fetchMyConversations();
      ElMessage.warning('收到新消息，请查看');
    }
  });

  // 新会话
  wsService.value.on('NEW_CONVERSATION', (conversation) => {
    console.log('新会话进入队列:', conversation);
    ElMessage.success('有新会话进入队列，请及时处理');
    // 使用API刷新会话列表，确保数据结构一致
    fetchPendingChatList();
  });

  // 会话被接入
  wsService.value.on('CONVERSATION_ACCEPTED', (data) => {
    console.log('会话被接入:', data);
    ElMessage.success('会话已成功接入');
    // 使用API刷新会话列表，确保数据结构一致
    fetchPendingChatList();
    fetchMyConversations();
  });

  // 会话被关闭
  wsService.value.on('CONVERSATION_CLOSED', (data) => {
    console.log('会话被关闭:', data);
    if (selectedChatId.value === data.conversationId) {
      ElMessage.success('会话已关闭');
      selectedChatId.value = null;
      chatMessages.value = [];
    }
    // 使用API刷新会话列表，确保数据结构一致
    fetchPendingChatList();
    fetchMyConversations();
  });

  // 会话结束
  wsService.value.on('CONVERSATION_ENDED', (data) => {
    console.log('会话结束:', data);
    if (selectedChatId.value === data.conversationId) {
      ElMessage.success('会话已结束');
      selectedChatId.value = null;
      chatMessages.value = [];
    }
    // 使用API刷新会话列表，确保数据结构一致
    fetchPendingChatList();
    fetchMyConversations();
  });

  // 会话被转接
  wsService.value.on('CONVERSATION_TRANSFERRED', (data) => {
    console.log('会话被转接:', data);
    if (selectedChatId.value === data.conversationId) {
      ElMessage.info('当前会话已被转接');
      selectedChatId.value = null;
      chatMessages.value = [];
    }
    // 使用API刷新会话列表，确保数据结构一致
    fetchPendingChatList();
    fetchMyConversations();
  });

  // 客服上线
  wsService.value.on('ADMIN_ONLINE', (admin) => {
    console.log('客服上线:', admin);
    // 更新在线客服列表
    wsService.value.getOnlineAdmins();
  });

  // 客服下线
  wsService.value.on('ADMIN_OFFLINE', (admin) => {
    console.log('客服下线:', admin);
    // 更新在线客服列表
    wsService.value.getOnlineAdmins();
  });

  // 在线客服列表
  wsService.value.on('ONLINE_ADMINS', (admins) => {
    console.log('在线客服列表:', admins);
    onlineAdmins.value = admins;
  });

  // 心跳响应
  wsService.value.on('PONG', () => {
    console.log('收到心跳响应');
  });
};

// 更新会话最后一条消息
const updateConversationLastMessage = (message) => {
  // 检查待处理列表
  const pendingIndex = pendingChatList.value.findIndex(chat => chat.id === message.conversationId);
  if (pendingIndex !== -1) {
    pendingChatList.value[pendingIndex].lastMessage = message.content;
    pendingChatList.value[pendingIndex].createTime = message.createTime;
    pendingChatList.value[pendingIndex].messageCount++;
  }
  // 检查处理中列表
  const processingIndex = processingChatList.value.findIndex(chat => chat.id === message.conversationId);
  if (processingIndex !== -1) {
    processingChatList.value[processingIndex].lastMessage = message.content;
    processingChatList.value[processingIndex].createTime = message.createTime;
    processingChatList.value[processingIndex].messageCount++;
  }
};

// 获取AI配置
const fetchAIConfig = async () => {
  try {
    configLoading.value = true
    const response = await authApi.getAICustomerConfig()
    // 确保response.data存在
    const aiConfigData = response?.data || {}
    // 确保时间字段有默认值，防止Element Plus时间选择器报错
    const configData = {
      ...aiConfigData,
      workingHoursStart: aiConfigData.workingHoursStart || '09:00',
      workingHoursEnd: aiConfigData.workingHoursEnd || '18:00'
    }
    Object.assign(aiConfigForm, configData)
    ElMessage.success('AI客服配置获取成功')
  } catch (error) {
    console.error('获取AI配置失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    ElMessage.error('获取AI客服配置失败')
  } finally {
    configLoading.value = false
  }
}

// 保存AI配置
const saveAIConfig = async () => {
  try {
    configLoading.value = true
    await authApi.updateAICustomerConfig(aiConfigForm)
    ElMessage.success('AI客服配置保存成功')
  } catch (error) {
    console.error('保存AI配置失败:', error)
    ElMessage.error('保存AI客服配置失败')
  } finally {
    configLoading.value = false
  }
}

// 重置AI配置
const resetAIConfig = () => {
  Object.assign(aiConfigForm, {
    aiEnabled: true,
    aiWelcomeMessage: '您好，欢迎使用我们的AI客服服务，有什么可以帮助您的吗？',
    aiApiKey: '',
    aiApiUrl: 'https://api.openai.com/v1/chat/completions',
    aiModel: 'gpt-3.5-turbo',
    aiMaxTokens: 500,
    aiTemperature: 0.7,
    aiSystemPrompt: '你是八方出行的智能客服助手，负责解答用户关于拖车、救援、代驾等服务的问题。请用简洁、专业、友好的语气回复用户。',
    autoTransferThreshold: 3,
    offlineMessage: '当前非工作时间，请留言或稍后再试，工作时间：09:00-18:00',
    transferKeywords: ['人工', '转人工', '人工客服', '真人'],
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00'
  })
}

// 获取我的对话列表
const fetchMyConversations = async () => {
  try {
    myConversationsLoading.value = true
    const response = await authApi.getMyConversations({
      pageNum: myConversationsPageNum.value,
      pageSize: myConversationsPageSize.value,
      status: myConversationsStatus.value,
      keyword: myConversationsFilter.keyword
    })
    // 确保response存在
    const data = response || {}
    // 更新处理中对话列表
    processingChatList.value = data?.list || []
    
    // 为每个对话添加isTop属性（默认false）
    processingChatList.value.forEach(chat => {
      if (chat.isTop === undefined) {
        chat.isTop = false
      }
    })
    
    // 排序对话列表，置顶的对话排在前面
    processingChatList.value.sort((a, b) => {
      if (a.isTop && !b.isTop) return -1
      if (!a.isTop && b.isTop) return 1
      return 0
    })
    
    // 更新分页状态
    myConversationsTotal.value = data?.total || 0
    myConversationsPages.value = data?.pages || 1
  } catch (error) {
    console.error('获取我的对话列表失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    ElMessage.error('获取我的对话列表失败，请稍后重试')
  } finally {
    myConversationsLoading.value = false
  }
}

// 重置我的对话列表筛选条件
const resetMyConversationsFilter = () => {
  myConversationsFilter.keyword = ''
  myConversationsStatus.value = null
  myConversationsPageNum.value = 1
  fetchMyConversations()
}

// 获取待处理对话列表
const fetchPendingChatList = async () => {
  try {
    chatListLoading.value = true
    const response = await authApi.getPendingChatList({
      pageNum: pendingPageNum.value,
      pageSize: pendingPageSize.value
    })
    // 确保response.data存在
    const data = response?.data || {}
    pendingChatList.value = data?.list || []
    pendingTotal.value = data?.total || 0
    pendingPages.value = data?.pages || 1
  } catch (error) {
    console.error('获取待处理对话失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    ElMessage.error('获取待处理对话失败')
  } finally {
    chatListLoading.value = false
  }
}

// 选择对话
const selectChat = async (chat) => {
  selectedChatId.value = chat.id
  await fetchChatMessages(chat.id)
  
  // 清零未读消息数量
  const index = processingChatList.value.findIndex(c => c.id === chat.id)
  if (index !== -1) {
    processingChatList.value[index].unreadCount = 0
  }
}

// 获取对话消息列表
const fetchChatMessages = async (conversationId) => {
  try {
    messageLoading.value = true
    // 使用HTTP API获取历史消息
    const response = await authApi.getChatMessageList(conversationId, {
      pageNum: 1,
      pageSize: 50,
      lastMessageId: 0
    })
    
    // 确保response.data存在
    const data = response?.data || {}
    
    // 更新消息列表
    chatMessages.value = data?.list || []
    
    // 标记为已读
    if (wsService.value) {
      wsService.value.markRead(conversationId);
    } else {
      // 如果WebSocket未连接，使用HTTP API标记为已读
      try {
        await authApi.markMessageRead(conversationId)
      } catch (error) {
        console.error('标记消息已读失败:', error)
      }
    }
    
    // 滚动到底部
    nextTick(() => {
      if (messageScrollRef.value) {
        const scrollEl = messageScrollRef.value.wrapRef
        scrollEl.scrollTop = scrollEl.scrollHeight
      }
    })
  } catch (error) {
    console.error('获取对话消息失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    ElMessage.error('获取对话消息失败，请稍后重试')
  } finally {
    messageLoading.value = false
  }
}

// 发送消息
const handleSendMessage = async () => {
  if (!sendMessageContent.trim()) {
    ElMessage.warning('请输入消息内容')
    return
  }
  
  if (!selectedChatId.value) {
    ElMessage.warning('请先选择一个对话')
    return
  }
  
  try {
    sendLoading.value = true
    
    // 创建临时消息对象，设置状态为发送中
    const tempMessage = {
      id: Date.now(), // 临时ID
      content: sendMessageContent.value,
      senderId: adminStore.adminInfo?.id,
      senderType: 1, // 客服发送
      senderName: adminStore.adminInfo?.username,
      messageType: 0, // 文本消息
      sendTime: new Date().toLocaleString(),
      status: 'sending'
    }
    
    // 添加临时消息到本地列表
    chatMessages.value.push(tempMessage)
    
    // 滚动到底部
    nextTick(() => {
      if (messageScrollRef.value) {
        const scrollEl = messageScrollRef.value.wrapRef
        scrollEl.scrollTop = scrollEl.scrollHeight
      }
    })
    
    // 使用HTTP API发送消息
    const messageParams = {
      content: sendMessageContent.value,
      messageType: 0, // 文本消息
      extraInfo: null
    }
    
    const response = await authApi.sendChatMessage(selectedChatId.value, messageParams)
    
    // 确保response存在
    const messageData = response || {}
    
    // 发送成功，清空输入框
    sendMessageContent.value = ''
    
    // 重置输入框高度
    resetInputHeight()
    
    // 更新消息状态为已发送
    const index = chatMessages.value.findIndex(msg => msg.id === tempMessage.id)
    if (index !== -1) {
      chatMessages.value[index] = {
        ...chatMessages.value[index],
        id: messageData.id || tempMessage.id,
        status: 'sent'
      }
    }
    
    // 滚动到底部
    nextTick(() => {
      if (messageScrollRef.value) {
        const scrollEl = messageScrollRef.value.wrapRef
        scrollEl.scrollTop = scrollEl.scrollHeight
      }
    })
    
  } catch (error) {
    console.error('发送消息失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    // 根据错误类型提供更友好的提示
    if (error.response?.status === 403) {
      ElMessage.error('没有权限发送消息')
    } else if (error.response?.status === 404) {
      ElMessage.error('对话不存在')
    } else {
      ElMessage.error('发送消息失败，请稍后重试')
    }
  } finally {
    sendLoading.value = false
  }
}

// 标记已读
const markAsRead = async () => {
  try {
    chatActionLoading.value = true
    if (wsService.value && selectedChatId.value) {
      wsService.value.markRead(selectedChatId.value);
      ElMessage.success('消息已标记为已读');
    }
  } catch (error) {
    console.error('标记已读失败:', error)
    ElMessage.error('标记已读失败')
  } finally {
    chatActionLoading.value = false
  }
}

// 结束对话
const handleEndChat = async () => {
  if (!selectedChatId.value) {
    ElMessage.warning('请先选择一个对话')
    return
  }
  
  try {
    // 提示用户是否结束对话
    await ElMessageBox.confirm('确定要结束当前对话吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    chatActionLoading.value = true
    
    // 使用HTTP API结束对话，支持添加备注
    const endChatParams = {
      remark: '客服主动结束对话'
    }
    
    const response = await authApi.endChat(selectedChatId.value, endChatParams)
    
    // 结束成功
    ElMessage.success('对话已成功结束')
    
    // 重置当前选中的对话
    selectedChatId.value = null
    chatMessages.value = []
    
    // 刷新对话列表
    fetchPendingChatList()
    fetchMyConversations()
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('结束对话失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    // 根据错误类型提供更友好的提示
    if (error.response?.status === 403) {
      ElMessage.error('没有权限结束该对话')
    } else if (error.response?.status === 404) {
      ElMessage.error('对话不存在')
    } else {
      ElMessage.error('结束对话失败，请稍后重试')
    }
  } finally {
    chatActionLoading.value = false
  }
}

// 接入会话
const acceptConversation = async (conversationId) => {
  try {
    chatActionLoading.value = true
    // 使用HTTP API接入对话
    const response = await authApi.joinConversation(conversationId)
    
    // 确保response.data存在
    const data = response?.data || {}
    
    // 接入成功
    ElMessage.success('接入会话成功')
    
    // 刷新对话列表
    fetchPendingChatList()
    fetchMyConversations()
  } catch (error) {
    console.error('接入会话失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    // 根据错误类型提供更友好的提示
    if (error.response?.status === 403) {
      ElMessage.error('没有权限接入该会话')
    } else if (error.response?.status === 404) {
      ElMessage.error('会话不存在')
    } else {
      ElMessage.error('接入会话失败，请稍后重试')
    }
  } finally {
    chatActionLoading.value = false
  }
}

// 转接会话相关状态
const transferDialogVisible = ref(false)
const currentTransferConversationId = ref(null)
const transferForm = reactive({
  targetAdminId: null,
  reason: ''
})
const transferLoading = ref(false)

// 打开转接会话弹窗
const openTransferDialog = (conversationId) => {
  currentTransferConversationId.value = conversationId
  transferForm.targetAdminId = null
  transferForm.reason = ''
  transferDialogVisible.value = true
}

// 转接会话
const transferConversation = async (conversationId) => {
  openTransferDialog(conversationId)
}

// 确认转接会话
const confirmTransferConversation = async () => {
  if (!currentTransferConversationId.value) {
    ElMessage.warning('请先选择一个对话')
    return
  }
  
  if (!transferForm.targetAdminId) {
    ElMessage.warning('请选择目标客服')
    return
  }
  
  if (!transferForm.reason.trim()) {
    ElMessage.warning('请输入转接原因')
    return
  }
  
  try {
    transferLoading.value = true
    
    // 使用HTTP API转接对话
    const response = await authApi.transferConversation(currentTransferConversationId.value, {
      targetAdminId: transferForm.targetAdminId,
      reason: transferForm.reason
    })
    
    // 转接成功
    ElMessage.success('对话转接成功')
    
    // 关闭弹窗
    transferDialogVisible.value = false
    
    // 如果是当前选中的对话，重置状态
    if (selectedChatId.value === currentTransferConversationId.value) {
      selectedChatId.value = null
      chatMessages.value = []
    }
    
    // 刷新对话列表
    fetchPendingChatList()
    fetchMyConversations()
  } catch (error) {
    console.error('转接会话失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    // 根据错误类型提供更友好的提示
    if (error.response?.status === 403) {
      ElMessage.error('没有权限转接该对话')
    } else if (error.response?.status === 404) {
      ElMessage.error('对话不存在')
    } else {
      ElMessage.error('转接会话失败，请稍后重试')
    }
  } finally {
    transferLoading.value = false
  }
}

// 取消转接会话
const cancelTransferConversation = () => {
  transferDialogVisible.value = false
  currentTransferConversationId.value = null
  transferForm.targetAdminId = null
  transferForm.reason = ''
}

// 切换对话置顶状态
const toggleConversationTop = async (conversationId, isTop) => {
  try {
    chatActionLoading.value = true
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 更新本地对话列表
    const index = processingChatList.value.findIndex(chat => chat.id === conversationId)
    if (index !== -1) {
      processingChatList.value[index].isTop = !isTop
      
      // 重新排序对话列表，置顶的对话排在前面
      processingChatList.value.sort((a, b) => {
        if (a.isTop && !b.isTop) return -1
        if (!a.isTop && b.isTop) return 1
        return 0
      })
    }
    
    ElMessage.success(isTop ? '取消置顶成功' : '置顶成功')
  } catch (error) {
    console.error('切换置顶状态失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    chatActionLoading.value = false
  }
}

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
    ElMessage.error('获取对话记录失败，请稍后重试')
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

// 查看对话记录详情
const viewChatRecord = async (record) => {
  currentRecord.value = record
  recordDetailMessages.value = []
  showRecordDetail.value = true
  
  try {
    // 真实API调用
    const response = await authApi.getChatCompleteRecord(record.id)
    
    // 确保response存在
    const chatData = response || {}
    
    // 保存完整的对话详情
    currentRecord.value = chatData
    
    // 获取对话消息（模拟数据，因为API只返回对话详情，没有消息列表）
    // 实际项目中，应该调用获取消息列表的API
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
    // 根据错误类型提供更友好的提示
    if (error.response?.status === 403) {
      ElMessage.error('没有权限访问对话详情，请联系管理员')
    } else if (error.response?.status === 404) {
      ElMessage.error('对话记录不存在')
    } else {
      ElMessage.error('获取对话记录详情失败，请稍后重试')
    }
  }
}

// 监听选中对话ID变化
watch(selectedChatId, (newId) => {
  if (newId) {
    fetchChatMessages(newId)
  }
})

// 监听输入内容变化，自动调整输入框高度
watch(sendMessageContent, () => {
  nextTick(() => {
    if (messageInputRef.value) {
      const textarea = messageInputRef.value.$el.querySelector('textarea')
      if (textarea) {
        textarea.style.height = 'auto'
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'
      }
    }
  })
})

// 发送消息后重置输入框高度
const resetInputHeight = () => {
  nextTick(() => {
    if (messageInputRef.value) {
      const textarea = messageInputRef.value.$el.querySelector('textarea')
      if (textarea) {
        textarea.style.height = 'auto'
      }
    }
  })
}

// 处理消息滚动事件
const handleMessageScroll = (event) => {
  const scrollEl = event.target
  // 当滚动到顶部时，自动加载更多历史消息
  if (scrollEl.scrollTop <= 50) {
    loadMoreMessages()
  }
}

// 加载更多历史消息
const loadMoreMessages = async () => {
  if (!selectedChatId.value || chatMessages.value.length === 0 || messageLoading.value) {
    return
  }
  
  try {
    // 获取当前消息列表中最早的消息ID
    const firstMessage = chatMessages.value[0]
    if (!firstMessage) return
    
    messageLoading.value = true
    isLoadingMore.value = true
    
    // 使用HTTP API获取更多历史消息
    const response = await authApi.getChatMessageList(selectedChatId.value, {
      pageNum: 1,
      pageSize: 50,
      lastMessageId: firstMessage.id
    })
    
    // 确保response.data存在
    const data = response?.data || {}
    const moreMessages = data?.list || []
    
    // 如果没有更多消息，显示提示
    if (moreMessages.length === 0) {
      ElMessage.info('没有更多历史消息了')
      canLoadMore.value = false
      return
    }
    
    // 记录当前滚动位置
    const scrollEl = messageScrollRef.value?.wrapRef
    const scrollHeight = scrollEl?.scrollHeight || 0
    const clientHeight = scrollEl?.clientHeight || 0
    const scrollTop = scrollEl?.scrollTop || 0
    
    // 将新获取的消息添加到消息列表前面
    chatMessages.value = [...moreMessages, ...chatMessages.value]
    
    // 恢复滚动位置
    nextTick(() => {
      if (scrollEl) {
        const newScrollHeight = scrollEl.scrollHeight
        scrollEl.scrollTop = newScrollHeight - (scrollHeight - scrollTop)
      }
    })
  } catch (error) {
    console.error('加载更多消息失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    ElMessage.error('加载更多消息失败，请稍后重试')
  } finally {
    messageLoading.value = false
    isLoadingMore.value = false
  }
}

// 组件挂载时初始化数据
onMounted(() => {
  fetchAIConfig()
  fetchAllChatRecords()
  fetchPendingChatList()
  fetchMyConversations()
  // 初始化WebSocket连接
  initWebSocket()
})

// 组件卸载前关闭WebSocket连接
onBeforeUnmount(() => {
  if (wsService.value) {
    wsService.value.close();
  }
});
</script>

<style scoped>
.customer-service-container {
  padding: 24px;
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.customer-service-card {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  background-color: #ffffff;
}

.card-header {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  padding: 20px 24px;
  border-bottom: 1px solid #e4e7ed;
  background-color: #ffffff;
  border-radius: 12px 12px 0 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.service-tabs {
  margin-top: 0;
  background-color: #ffffff;
  overflow: hidden;
}

.service-tabs :deep(.el-tabs__header) {
  padding: 0 24px;
  margin: 0;
  border-bottom: 1px solid #e4e7ed;
}

.service-tabs :deep(.el-tabs__content) {
  padding: 24px;
}

.service-tabs :deep(.el-tab-pane) {
  animation: tabContentFadeIn 0.3s ease-out;
}

@keyframes tabContentFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.service-tabs :deep(.el-tabs__content) {
  padding: 24px;
  animation: tabContentFadeIn 0.3s ease-out;
}

.service-tabs :deep(.el-tab-pane) {
  animation: tabContentFadeIn 0.3s ease-out;
}

@keyframes tabContentFadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 按钮动画效果 */
.el-button {
  transition: all 0.3s ease;
}

.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.el-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 对话框动画 */
.el-dialog {
  animation: dialogSlideIn 0.3s ease-out;
}

@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 列表项加载动画 */
.chat-list-item {
  animation: listItemFadeIn 0.3s ease-out;
}

@keyframes listItemFadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 消息发送动画 */
@keyframes messageSend {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.message-item.sending {
  animation: messageSend 0.5s ease-in-out;
}

/* 滚动条美化 */
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
  transition: all 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 加载动画 */
.loading-more {
  animation: loadingPulse 1.5s ease-in-out infinite;
}

@keyframes loadingPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* 徽章动画 */
.pending-badge,
.unread-badge {
  animation: badgePulse 2s infinite;
}

@keyframes badgePulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* AI配置样式 */
.config-card {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.06);
}

.config-card-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding: 16px 20px;
  background-color: #f9fafb;
  border-bottom: 1px solid #f0f0f0;
}

.card-icon {
  margin-right: 10px;
  color: #409eff;
  font-size: 18px;
}

.ai-config-form {
  margin-top: 24px;
  padding: 0 20px 20px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

/* 聊天界面样式 */
.chat-container {
  display: flex;
  gap: 20px;
  height: 700px;
  width: 100%;
}

.chat-list-panel {
  width: 340px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
}

.chat-list-panel:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: #c0c4cc;
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f9fafb;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #303133;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.pending-badge {
  transform: translate(0, -10px);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
}

.unread-badge {
  transform: translate(0, -2px);
  box-shadow: 0 0 0 2px white, 0 2px 8px rgba(245, 108, 108, 0.3);
  font-weight: bold;
  font-size: 11px;
  min-width: 18px;
  height: 18px;
  line-height: 18px;
}

.chat-search {
  margin: 12px 20px;
  border-radius: 8px;
  transition: all 0.3s;
}

.chat-search :deep(.el-input__wrapper) {
  border-radius: 8px;
  box-shadow: none;
  transition: all 0.3s;
}

.chat-search :deep(.el-input__wrapper:focus-within) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.chat-list-scroll {
  flex: 1;
  overflow: hidden;
}

.chat-list {
  padding: 0;
}

.chat-list-item {
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 1px solid #e4e7ed;
  padding: 16px 20px;
  margin: 0;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-list-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background-color: transparent;
  transition: all 0.3s ease;
}

.chat-list-item:hover {
  background-color: #f9fafb;
  transform: translateX(2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chat-list-item:hover::before {
  background-color: #409eff;
}

.chat-list-item.active {
  background-color: #ecf5ff;
  border-right: 4px solid #409eff;
  box-shadow: -2px 0 12px rgba(64, 158, 255, 0.15);
  transform: translateX(2px);
}

.chat-list-item.active::before {
  background-color: #409eff;
}

/* 待处理对话特殊样式 */
.chat-list-item.pending {
  border-left: 4px solid #e6a23c;
  background-color: #fdf6ec;
}

.chat-list-item.pending:hover {
  background-color: #fef0f0;
}

.chat-list-item.pending::before {
  background-color: #e6a23c;
}

/* 处理中对话特殊样式 */
.chat-list-item.processing {
  border-left: 4px solid #409eff;
  background-color: #ecf5ff;
}

.chat-list-item.processing:hover {
  background-color: #e6f7ff;
}

.chat-list-item.processing::before {
  background-color: #409eff;
}

/* 已结束对话特殊样式 */
.chat-list-item.ended {
  border-left: 4px solid #909399;
  background-color: #f5f7fa;
}

.chat-list-item.ended:hover {
  background-color: #f0f2f5;
}

.chat-list-item.ended::before {
  background-color: #909399;
}

.chat-item-title {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
}

.chat-item-title .user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  flex-wrap: wrap;
  width: 100%;
  justify-content: space-between;
}

.user-id {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.user-name {
  font-weight: 600;
  color: #303133;
  font-size: 14px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.user-phone {
  color: #606266;
  font-size: 12px;
  background-color: #f9fafb;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.status-tag {
  font-weight: 500;
  border-radius: 12px;
  padding: 3px 10px;
  font-size: 11px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

/* 状态标签颜色 */
.status-tag.warning {
  background-color: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #fde2b3;
}

.status-tag.success {
  background-color: #ecf5ff;
  color: #409eff;
  border: 1px solid #adcfff;
}

.status-tag.info {
  background-color: #f5f7fa;
  color: #909399;
  border: 1px solid #dcdfe6;
}

.chat-item-desc {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.last-message {
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  line-height: 1.4;
  padding: 6px 0;
  border-left: 3px solid #e4e7ed;
  padding-left: 12px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.chat-list-item:hover .last-message {
  border-left-color: #409eff;
  color: #303133;
}

.chat-meta {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: #909399;
  flex-wrap: wrap;
  align-items: center;
}

.waiting-time {
  color: #e6a23c;
  font-weight: 500;
  background-color: #fdf6ec;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  animation: pulse 2s infinite;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  border: 1px solid #fde2b3;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.message-count {
  color: #409eff;
  background-color: #ecf5ff;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  border: 1px solid #adcfff;
}

.chat-time {
  color: #909399;
  font-size: 11px;
  background-color: #f9fafb;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  border: 1px solid #e4e7ed;
}

/* 未读消息提示 */
.unread-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 10px;
  height: 10px;
  background-color: #f56c6c;
  border-radius: 50%;
  box-shadow: 0 0 0 2px white, 0 2px 4px rgba(245, 108, 108, 0.3);
  animation: pulse 2s infinite;
}

/* 置顶对话样式 */
.chat-list-item.pinned {
  background-color: #f0f9ff;
  border-left: 4px solid #409eff;
  position: relative;
}

.chat-list-item.pinned::before {
  background-color: #409eff;
}

.chat-list-item.pinned:hover {
  background-color: #ecf5ff;
}

/* 置顶标记 */
.chat-list-item.pinned::after {
  content: '置顶';
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 10px;
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
  border: 1px solid #adcfff;
}

/* 对话列表项动画 */
.chat-list-item {
  animation: listItemFadeIn 0.3s ease-out;
}

@keyframes listItemFadeIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.chat-content-panel {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #e4e7ed;
}

.chat-content-panel:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: #c0c4cc;
}

.no-chat-selected {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
}

.chat-actions {
  display: flex;
  gap: 10px;
}

.chat-actions .el-button {
  border-radius: 6px;
  transition: all 0.3s;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.message-scroll {
  flex: 1;
  padding: 24px;
  overflow: hidden;
  background-color: #f5f7fa;
  background-image: 
    linear-gradient(rgba(64, 158, 255, 0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(64, 158, 255, 0.05) 1px, transparent 1px);
  background-size: 20px 20px;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding-bottom: 20px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  position: relative;
  animation: messageSlideIn 0.3s ease-out;
  margin-bottom: 0;
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
  background-color: #409eff;
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  border: 2px solid #ffffff;
  width: 36px;
  height: 36px;
  font-size: 16px;
}

.user-avatar {
  background-color: #67c23a;
  color: white;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
  border: 2px solid #ffffff;
  width: 36px;
  height: 36px;
  font-size: 16px;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-width: 70%;
  position: relative;
}

.message-sender {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
  padding: 0 6px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.admin-message .message-sender {
  text-align: right;
  color: #409eff;
}

.user-message .message-sender {
  text-align: left;
  color: #67c23a;
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
  color: #303133;
  border: 1px solid #e4e7ed;
}

.admin-message .message-text {
  background-color: #409eff;
  color: white;
  border-bottom-right-radius: 4px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

/* 消息气泡尾部装饰 */
.user-message .message-text::after {
  content: '';
  position: absolute;
  bottom: 10px;
  left: -8px;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-right: 8px solid #ffffff;
  border-bottom: 6px solid transparent;
  border-left: 0 solid transparent;
}

.admin-message .message-text::after {
  content: '';
  position: absolute;
  bottom: 10px;
  right: -8px;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-left: 8px solid #409eff;
  border-bottom: 6px solid transparent;
  border-right: 0 solid transparent;
}

.message-time {
  font-size: 11px;
  color: #909399;
  margin-left: 12px;
  align-self: flex-start;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 3px 8px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  border: 1px solid #e4e7ed;
}

.admin-message .message-time {
  margin-right: 12px;
  margin-left: 0;
  align-self: flex-end;
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
  border: 1px solid #adcfff;
}

.message-footer {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
}

.admin-message .message-footer {
  justify-content: flex-end;
}

.user-message .message-footer {
  justify-content: flex-start;
}

.message-status {
  display: flex;
  align-items: center;
  margin-left: 4px;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 3px 8px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  border: 1px solid #e4e7ed;
}

.admin-message .message-status {
  background-color: rgba(64, 158, 255, 0.1);
  border: 1px solid #adcfff;
}

.status-icon {
  font-size: 12px;
  margin-left: 4px;
  transition: all 0.3s;
}

.status-icon.sending {
  color: #909399;
  animation: spin 1s linear infinite;
}

.status-icon.sent {
  color: #67c23a;
  animation: pulse 1s ease-in-out;
}

.status-icon.read {
  color: #409eff;
  animation: pulse 1s ease-in-out;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.loading-more {
  margin-top: 16px;
  text-align: center;
  padding: 12px 0;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 8px;
  margin: 16px auto;
  width: 80%;
  border: 1px solid #e4e7ed;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  color: #606266;
}

.message-input-area {
  padding: 20px;
  border-top: 1px solid #e4e7ed;
  background-color: #ffffff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.auto-resize-input {
  border-radius: 18px;
  transition: all 0.3s ease;
  border: 2px solid #e4e7ed;
  background-color: #f9fafb;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  min-height: 48px;
  max-height: 160px;
}

.auto-resize-input:hover {
  border-color: #c0c4cc;
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.08);
}

.auto-resize-input:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2), inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.auto-resize-input :deep(textarea) {
  resize: none;
  border: none;
  outline: none;
  padding: 14px 18px;
  font-size: 14px;
  line-height: 1.5;
  min-height: 48px;
  max-height: 160px;
  overflow-y: auto;
  background-color: transparent;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  color: #303133;
}

.auto-resize-input :deep(textarea:focus) {
  box-shadow: none;
}

.auto-resize-input :deep(textarea::-webkit-scrollbar) {
  width: 6px;
}

.auto-resize-input :deep(textarea::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 3px;
}

.auto-resize-input :deep(textarea::-webkit-scrollbar-thumb) {
  background: #c1c1c1;
  border-radius: 3px;
}

.auto-resize-input :deep(textarea::-webkit-scrollbar-thumb:hover) {
  background: #a8a8a8;
}

.send-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;
}

.tip-text {
  font-size: 12px;
  color: #909399;
  background-color: #f9fafb;
  padding: 6px 14px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.send-actions .el-button {
  border-radius: 24px;
  transition: all 0.3s ease;
  padding: 10px 28px;
  font-weight: 500;
  font-size: 14px;
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.send-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.send-actions .el-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.send-actions .el-button:disabled {
  opacity: 0.6;
  transform: none;
  box-shadow: none;
}

/* 输入区域动画效果 */
@keyframes inputSlideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-input-area {
  animation: inputSlideUp 0.3s ease-out;
}

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
  background-color: #f5f7fa;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.filter-bar:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #c0c4cc;
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
  border: 1px solid #e4e7ed;
  transition: all 0.3s ease;
}

.filter-bar .el-input :deep(.el-input__wrapper):hover,
.filter-bar .el-select :deep(.el-input__wrapper):hover {
  border-color: #c0c4cc;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.filter-bar .el-input :deep(.el-input__wrapper).is-focus,
.filter-bar .el-select :deep(.el-input__wrapper).is-focus {
  border-color: #409eff;
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
  background-color: #f5f7fa;
  border-radius: 12px;
  border: 1px solid #e4e7ed;
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
  border-color: #409eff;
  color: #409eff;
}

.pagination .el-pagination__item.is-active {
  background-color: #409eff;
  border-color: #409eff;
  color: white;
}

/* 加载动画样式 */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #f5f7fa;
  border-radius: 12px;
  margin: 20px 0;
  border: 1px solid #e4e7ed;
}

.loading-spinner {
  font-size: 24px;
  color: #409eff;
  animation: spin 1s linear infinite;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 80px 30px;
  background-color: #f5f7fa;
  border-radius: 16px;
  border: 2px dashed #e4e7ed;
  text-align: center;
  margin: 24px 0;
  transition: all 0.3s ease;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.empty-state:hover {
  border-color: #409eff;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
  transform: translateY(-2px);
}

.empty-state-icon {
  font-size: 64px;
  color: #c0c4cc;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  opacity: 0.8;
}

.empty-state:hover .empty-state-icon {
  color: #409eff;
  transform: scale(1.1);
  opacity: 1;
}

.empty-state-text {
  font-size: 18px;
  color: #606266;
  margin-bottom: 12px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  font-weight: 500;
  transition: all 0.3s ease;
}

.empty-state:hover .empty-state-text {
  color: #303133;
}

.empty-state-desc {
  font-size: 14px;
  color: #909399;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  line-height: 1.5;
  max-width: 400px;
  transition: all 0.3s ease;
}

.empty-state:hover .empty-state-desc {
  color: #606266;
}

/* 加载动画样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  background-color: #f5f7fa;
  border-radius: 16px;
  margin: 24px 0;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.loading-container:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: #c0c4cc;
}

.loading-spinner {
  font-size: 32px;
  color: #409eff;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 14px;
  color: #606266;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  margin-top: 12px;
}

/* 按钮样式优化 */
.el-button {
  border-radius: 8px;
  transition: all 0.3s ease;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  position: relative;
  overflow: hidden;
}

.el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.el-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

.el-button::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

.el-button:hover::before {
  width: 100px;
  height: 100px;
}

/* 提示文字样式 */
.el-message {
  border-radius: 8px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 12px 20px;
}

.el-message__content {
  font-size: 14px;
  line-height: 1.5;
}

/* 对话框样式优化 */
.el-dialog {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.el-dialog__header {
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 20px 24px;
}

.el-dialog__title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.el-dialog__body {
  padding: 24px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.el-dialog__footer {
  padding: 16px 24px;
  border-top: 1px solid #e4e7ed;
  background-color: #f9fafb;
}

/* 标签样式优化 */
.el-tag {
  border-radius: 12px;
  padding: 2px 12px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  font-size: 12px;
  transition: all 0.3s ease;
}

.el-tag:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 头像样式优化 */
.el-avatar {
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-avatar:hover {
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

/* 选择框样式优化 */
.el-select :deep(.el-select__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.el-select :deep(.el-select__wrapper):hover {
  border-color: #c0c4cc;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.el-select :deep(.el-select__wrapper).is-focus {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

/* 输入框样式优化 */
.el-input :deep(.el-input__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.el-input :deep(.el-input__wrapper):hover {
  border-color: #c0c4cc;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.el-input :deep(.el-input__wrapper).is-focus {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

/* 表格样式优化 */
.records-container .el-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e4e7ed;
}

.records-container .el-table :deep(.el-table__header-wrapper) {
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.records-container .el-table :deep(.el-table__header-wrapper th) {
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  font-weight: 600;
  color: #303133;
  background-color: #f5f7fa;
  border-right: 1px solid #e4e7ed;
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

/* 按钮样式优化 */
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

/* 标签样式优化 */
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
  color: #303133;
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
  color: #606266;
  min-width: 40px;
}

.user-avatar,
.admin-avatar {
  margin-right: 8px;
}

.user-name,
.admin-name {
  font-weight: 500;
  color: #303133;
}

.user-phone {
  color: #909399;
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
  color: #606266;
  flex-wrap: wrap;
}

.record-stats {
  display: flex;
  gap: 24px;
  font-size: 14px;
  color: #606266;
  flex-wrap: wrap;
}

.record-remark {
  color: #f56c6c;
  background-color: #fef0f0;
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
  color: #303133;
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
  color: #909399;
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

/* 响应式设计 */
@media (max-width: 1200px) {
  .chat-container {
    flex-direction: column;
    height: auto;
    min-height: 700px;
    gap: 16px;
  }
  
  .chat-list-panel {
    width: 100%;
    height: 300px;
  }
  
  .chat-content-panel {
    height: 500px;
  }
  
  .message-content {
    max-width: 80%;
  }
  
  .message-avatar {
    margin: 0 12px;
  }
}

@media (max-width: 768px) {
  .customer-service-container {
    padding: 12px;
    min-height: calc(100vh - 100px);
  }
  
  .card-header {
    font-size: 18px;
    padding: 16px 20px;
  }
  
  .service-tabs :deep(.el-tabs__header) {
    padding: 0 12px;
  }
  
  .service-tabs :deep(.el-tabs__content) {
    padding: 16px 12px;
  }
  
  .chat-container {
    gap: 12px;
    min-height: 600px;
  }
  
  .chat-list-panel {
    width: 100%;
    height: 220px;
    border-radius: 8px;
  }
  
  .panel-header {
    padding: 12px 16px;
  }
  
  .panel-header h3 {
    font-size: 14px;
  }
  
  .chat-search {
    margin: 8px 16px;
  }
  
  .chat-list-item {
    padding: 12px 16px;
  }
  
  .chat-content-panel {
    height: 400px;
    border-radius: 8px;
  }
  
  .message-scroll {
    padding: 12px;
  }
  
  .message-item {
    margin-bottom: 12px;
  }
  
  .message-avatar {
    margin: 0 8px;
  }
  
  .message-avatar .el-avatar {
    width: 28px;
    height: 28px;
  }
  
  .message-content {
    max-width: 85%;
  }
  
  .message-text {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .message-input-area {
    padding: 12px;
  }
  
  .auto-resize-input :deep(textarea) {
    padding: 12px 14px;
    min-height: 48px;
    font-size: 13px;
  }
  
  .send-actions {
    margin-top: 12px;
    padding-top: 12px;
  }
  
  .send-actions .el-button {
    padding: 8px 16px;
    font-size: 13px;
  }
  
  .tip-text {
    font-size: 11px;
    padding: 3px 8px;
  }
  
  .records-container {
    padding: 16px 12px;
    border-radius: 8px;
  }
  
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
    padding: 12px;
    gap: 8px;
  }
  
  .filter-bar .el-input,
  .filter-bar .el-select,
  .filter-bar .el-date-picker {
    width: 100%;
  }
  
  .record-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .record-users {
    flex-direction: column;
    gap: 12px;
    padding: 12px;
  }
  
  .record-meta {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px;
    gap: 8px;
  }
  
  .record-time,
  .record-stats {
    flex-direction: column;
    gap: 8px;
  }
  
  .pagination {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .customer-service-container {
    padding: 8px;
  }
  
  .service-tabs :deep(.el-tabs__content) {
    padding: 12px 8px;
  }
  
  .chat-list-panel {
    height: 200px;
  }
  
  .chat-content-panel {
    height: 350px;
  }
  
  .message-content {
    max-width: 90%;
  }
  
  .message-text {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .auto-resize-input :deep(textarea) {
    padding: 10px 12px;
    min-height: 40px;
    font-size: 12px;
  }
  
  .send-actions .el-button {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .tip-text {
    font-size: 10px;
  }
  
  .chat-meta {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
  
  .waiting-time,
  .message-count,
  .chat-time {
    font-size: 10px;
    padding: 2px 6px;
  }
}
</style>