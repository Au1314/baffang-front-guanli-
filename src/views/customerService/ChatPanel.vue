<template>
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
        <div v-loading="chatListLoading" class="chat-list">
          <div
            v-for="chat in pendingChatList"
            :key="chat.id"
            class="chat-list-item"
            :class="{ 'active': selectedChatId === chat.id, 'pending': chat.status === 0, 'processing': chat.status === 1 }"
            @click="selectChat(chat)"
          >
            <div class="chat-item-avatar">
              <el-avatar :size="40" :src="chat.userAvatar" :icon="User" />
            </div>
            <div class="chat-item-body">
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
              <div class="chat-item-desc">
                <div class="last-message">{{ chat.lastMessage }}</div>
                <div class="chat-meta">
                  <span class="waiting-time">等待时间: {{ chat.waitingTimeText }}</span>
                  <span class="message-count">消息数: {{ chat.messageCount }}</span>
                  <span class="chat-time">{{ chat.createTime }}</span>
                </div>
              </div>
            </div>
            <div class="chat-item-actions">
              <el-button
                type="primary"
                size="small"
                @click.stop="acceptConversation(chat.id)"
                :loading="chatActionLoading"
              >
                接入
              </el-button>
            </div>
          </div>
        </div>
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
        <div v-loading="myConversationsLoading" class="chat-list">
          <div
            v-for="chat in processingChatList"
            :key="chat.id"
            class="chat-list-item"
            :class="{ 'active': selectedChatId === chat.id, 'processing': true, 'pinned': chat.isTop }"
            @click="selectChat(chat)"
          >
            <div class="chat-item-avatar">
              <el-avatar :size="40" :src="chat.userAvatar" :icon="User" />
            </div>
            <div class="chat-item-body">
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
              <div class="chat-item-desc">
                <div class="last-message">{{ chat.lastMessage }}</div>
                <div class="chat-meta">
                  <span class="message-count">消息数: {{ chat.messageCount }}</span>
                  <span class="chat-time">{{ chat.lastMessageTime || chat.createTime }}</span>
                </div>
              </div>
            </div>
            <div class="chat-item-actions">
              <el-button
                size="small"
                @click.stop="toggleConversationTop(chat.id, chat.isTop)"
                :loading="chatActionLoading"
              >
                <el-icon v-if="chat.isTop"><Top /></el-icon>
                <el-icon v-else><ArrowUp /></el-icon>
                {{ chat.isTop ? '取消置顶' : '置顶' }}
              </el-button>
            </div>
          </div>
        </div>
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
</template>

<script setup>
import { ref, reactive, onMounted, watch, nextTick, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import CustomerServiceWS from '@/utils/CustomerServiceWS'
import {
  Search,
  User,
  ChatDotRound,
  Check,
  CircleClose,
  RefreshRight,
  Loading,
  Top,
  ArrowUp
} from '@element-plus/icons-vue'

const authStore = useAuthStore()

// WebSocket服务实例
const wsService = ref(null)
// WebSocket连接状态
const wsConnected = ref(false)

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

// 在线客服列表
const onlineAdmins = ref([])

// 初始化WebSocket连接
const initWebSocket = () => {
  if (!authStore.token) {
    console.error('没有找到管理员token，无法初始化WebSocket连接');
    return;
  }

  try {
    // 创建WebSocket服务实例
    wsService.value = new CustomerServiceWS(authStore.token);
    wsConnected.value = true;

    // 注册WebSocket事件处理器
    registerWebSocketHandlers();
  } catch (error) {
    console.error('初始化WebSocket连接失败:', error);
    // ElMessage.error('WebSocket连接失败，请刷新页面重试'); // 未完全实现功能，隐藏报错提示
  }
};

// 注册WebSocket事件处理器
const registerWebSocketHandlers = () => {
  if (!wsService.value) return;

  // 会话列表更新
  wsService.value.on('CONVERSATIONS', (data) => {
    // 使用API刷新列表，确保数据结构一致
    fetchPendingChatList();
    fetchMyConversations();
  });

  // 新消息
  wsService.value.on('NEW_MESSAGE', (message) => {
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
    ElMessage.success('有新会话进入队列，请及时处理');
    // 使用API刷新会话列表，确保数据结构一致
    fetchPendingChatList();
  });

  // 会话被接入
  wsService.value.on('CONVERSATION_ACCEPTED', (data) => {
    ElMessage.success('会话已成功接入');
    // 使用API刷新会话列表，确保数据结构一致
    fetchPendingChatList();
    fetchMyConversations();
  });

  // 会话被关闭
  wsService.value.on('CONVERSATION_CLOSED', (data) => {
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
    // 更新在线客服列表
    wsService.value.getOnlineAdmins();
  });

  // 客服下线
  wsService.value.on('ADMIN_OFFLINE', (admin) => {
    // 更新在线客服列表
    wsService.value.getOnlineAdmins();
  });

  // 在线客服列表
  wsService.value.on('ONLINE_ADMINS', (admins) => {
    onlineAdmins.value = admins;
  });

  // 心跳响应
  wsService.value.on('PONG', () => {
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
    // ElMessage.error('获取我的对话列表失败，请稍后重试') // 未完全实现功能，隐藏报错提示
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
    // ElMessage.error('获取待处理对话失败') // 未完全实现功能，隐藏报错提示
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
    // ElMessage.error('获取对话消息失败，请稍后重试') // 未完全实现功能，隐藏报错提示
  } finally {
    messageLoading.value = false
  }
}

// 发送消息
const handleSendMessage = async () => {
  if (!sendMessageContent.trim()) {
    // ElMessage.warning('请输入消息内容') // 未完全实现功能，隐藏提示
    return
  }

  if (!selectedChatId.value) {
    // ElMessage.warning('请先选择一个对话') // 未完全实现功能，隐藏提示
    return
  }

  try {
    sendLoading.value = true

    // 创建临时消息对象，设置状态为发送中
    const tempMessage = {
      id: Date.now(), // 临时ID
      content: sendMessageContent.value,
      senderId: authStore.adminInfo?.id,
      senderType: 1, // 客服发送
      senderName: authStore.adminInfo?.username,
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
      // ElMessage.error('没有权限发送消息') // 未完全实现功能，隐藏报错提示
    } else if (error.response?.status === 404) {
      // ElMessage.error('对话不存在') // 未完全实现功能，隐藏报错提示
    } else {
      // ElMessage.error('发送消息失败，请稍后重试') // 未完全实现功能，隐藏报错提示
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
      // ElMessage.success('消息已标记为已读'); // 未完全实现功能，隐藏提示
    }
  } catch (error) {
    console.error('标记已读失败:', error)
    // ElMessage.error('标记已读失败') // 未完全实现功能，隐藏报错提示
  } finally {
    chatActionLoading.value = false
  }
}

// 结束对话
const handleEndChat = async () => {
  if (!selectedChatId.value) {
    // ElMessage.warning('请先选择一个对话') // 未完全实现功能，隐藏提示
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
    // ElMessage.success('对话已成功结束') // 未完全实现功能，隐藏提示

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
      // ElMessage.error('没有权限结束该对话') // 未完全实现功能，隐藏报错提示
    } else if (error.response?.status === 404) {
      // ElMessage.error('对话不存在') // 未完全实现功能，隐藏报错提示
    } else {
      // ElMessage.error('结束对话失败，请稍后重试') // 未完全实现功能，隐藏报错提示
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
    // ElMessage.success('接入会话成功') // 未完全实现功能，隐藏提示

    // 刷新对话列表
    fetchPendingChatList()
    fetchMyConversations()
  } catch (error) {
    console.error('接入会话失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
    // 根据错误类型提供更友好的提示
    if (error.response?.status === 403) {
      // ElMessage.error('没有权限接入该会话') // 未完全实现功能，隐藏报错提示
    } else if (error.response?.status === 404) {
      // ElMessage.error('会话不存在') // 未完全实现功能，隐藏报错提示
    } else {
      // ElMessage.error('接入会话失败，请稍后重试') // 未完全实现功能，隐藏报错提示
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
    // ElMessage.warning('请先选择一个对话') // 未完全实现功能，隐藏提示
    return
  }

  if (!transferForm.targetAdminId) {
    // ElMessage.warning('请选择目标客服') // 未完全实现功能，隐藏提示
    return
  }

  if (!transferForm.reason.trim()) {
    // ElMessage.warning('请输入转接原因') // 未完全实现功能，隐藏提示
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
    // ElMessage.success('对话转接成功') // 未完全实现功能，隐藏提示

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
      // ElMessage.error('没有权限转接该对话') // 未完全实现功能，隐藏报错提示
    } else if (error.response?.status === 404) {
      // ElMessage.error('对话不存在') // 未完全实现功能，隐藏报错提示
    } else {
      // ElMessage.error('转接会话失败，请稍后重试') // 未完全实现功能，隐藏报错提示
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

    // ElMessage.success(isTop ? '取消置顶成功' : '置顶成功') // 未完全实现功能，隐藏提示
  } catch (error) {
    console.error('切换置顶状态失败:', error)
    // ElMessage.error('操作失败，请稍后重试') // 未完全实现功能，隐藏报错提示
  } finally {
    chatActionLoading.value = false
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
  border: 1px solid var(--color-border-light);
}

.chat-list-panel:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--color-text-placeholder);
}

.panel-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border-light);
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
  color: var(--color-text-primary);
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
  border-bottom: 1px solid var(--color-border-light);
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
  background-color: var(--color-primary);
}

.chat-list-item.active {
  background-color: var(--color-primary-light);
  border-right: 4px solid var(--color-primary);
  box-shadow: -2px 0 12px rgba(64, 158, 255, 0.15);
  transform: translateX(2px);
}

.chat-list-item.active::before {
  background-color: var(--color-primary);
}

/* 待处理对话特殊样式 */
.chat-list-item.pending {
  border-left: 4px solid var(--color-warning);
  background-color: var(--color-warning-light);
}

.chat-list-item.pending:hover {
  background-color: var(--color-danger-light);
}

.chat-list-item.pending::before {
  background-color: var(--color-warning);
}

/* 处理中对话特殊样式 */
.chat-list-item.processing {
  border-left: 4px solid var(--color-primary);
  background-color: var(--color-primary-light);
}

.chat-list-item.processing:hover {
  background-color: #e6f7ff;
}

.chat-list-item.processing::before {
  background-color: var(--color-primary);
}

/* 已结束对话特殊样式 */
.chat-list-item.ended {
  border-left: 4px solid var(--color-text-secondary);
  background-color: var(--color-bg-page);
}

.chat-list-item.ended:hover {
  background-color: #f0f2f5;
}

.chat-list-item.ended::before {
  background-color: var(--color-text-secondary);
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
  color: var(--color-text-primary);
  font-size: 14px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.user-name {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 14px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.user-phone {
  color: var(--color-text-regular);
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
  background-color: var(--color-warning-light);
  color: var(--color-warning);
  border: 1px solid #fde2b3;
}

.status-tag.success {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
  border: 1px solid #adcfff;
}

.status-tag.info {
  background-color: var(--color-bg-page);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-base);
}

.chat-item-desc {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.last-message {
  font-size: 14px;
  color: var(--color-text-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  line-height: 1.4;
  padding: 6px 0;
  border-left: 3px solid var(--color-border-light);
  padding-left: 12px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.chat-list-item:hover .last-message {
  border-left-color: var(--color-primary);
  color: var(--color-text-primary);
}

.chat-meta {
  display: flex;
  gap: 10px;
  font-size: 11px;
  color: var(--color-text-secondary);
  flex-wrap: wrap;
  align-items: center;
}

.waiting-time {
  color: var(--color-warning);
  font-weight: 500;
  background-color: var(--color-warning-light);
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
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  border: 1px solid #adcfff;
}

.chat-time {
  color: var(--color-text-secondary);
  font-size: 11px;
  background-color: #f9fafb;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  border: 1px solid var(--color-border-light);
}

/* 未读消息提示 */
.unread-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 10px;
  height: 10px;
  background-color: var(--color-danger);
  border-radius: 50%;
  box-shadow: 0 0 0 2px white, 0 2px 4px rgba(245, 108, 108, 0.3);
  animation: pulse 2s infinite;
}

/* 置顶对话样式 */
.chat-list-item.pinned {
  background-color: #f0f9ff;
  border-left: 4px solid var(--color-primary);
  position: relative;
}

.chat-list-item.pinned::before {
  background-color: var(--color-primary);
}

.chat-list-item.pinned:hover {
  background-color: var(--color-primary-light);
}

/* 置顶标记 */
.chat-list-item.pinned::after {
  content: '置顶';
  position: absolute;
  top: 12px;
  right: 16px;
  font-size: 10px;
  color: var(--color-primary);
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
  border: 1px solid var(--color-border-light);
}

.chat-content-panel:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--color-text-placeholder);
}

.no-chat-selected {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-border-light);
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
  background-color: var(--color-bg-page);
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
  background-color: var(--color-primary);
  color: white;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
  border: 2px solid #ffffff;
  width: 36px;
  height: 36px;
  font-size: 16px;
}

.user-avatar {
  background-color: var(--color-success);
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
  color: var(--color-text-secondary);
  margin-bottom: 4px;
  padding: 0 6px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.admin-message .message-sender {
  text-align: right;
  color: var(--color-primary);
}

.user-message .message-sender {
  text-align: left;
  color: var(--color-success);
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
  border-left: 8px solid var(--color-primary);
  border-bottom: 6px solid transparent;
  border-right: 0 solid transparent;
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
  border: 1px solid var(--color-border-light);
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
  color: var(--color-text-secondary);
  animation: spin 1s linear infinite;
}

.status-icon.sent {
  color: var(--color-success);
  animation: pulse 1s ease-in-out;
}

.status-icon.read {
  color: var(--color-primary);
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
  border: 1px solid var(--color-border-light);
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  color: var(--color-text-regular);
}

.message-input-area {
  padding: 20px;
  border-top: 1px solid var(--color-border-light);
  background-color: #ffffff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
}

.auto-resize-input {
  border-radius: 18px;
  transition: all 0.3s ease;
  border: 2px solid var(--color-border-light);
  background-color: #f9fafb;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  min-height: 48px;
  max-height: 160px;
}

.auto-resize-input:hover {
  border-color: var(--color-text-placeholder);
  box-shadow: inset 0 1px 4px rgba(0, 0, 0, 0.08);
}

.auto-resize-input:focus-within {
  border-color: var(--color-primary);
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
  color: var(--color-text-primary);
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
  border-top: 1px solid var(--color-border-light);
}

.tip-text {
  font-size: 12px;
  color: var(--color-text-secondary);
  background-color: #f9fafb;
  padding: 6px 14px;
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-border-light);
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

/* 分页样式 */
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

/* 筛选栏样式 */
.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  background-color: var(--color-bg-page);
  border-radius: 12px;
  border: 1px solid var(--color-border-light);
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

/* 头像样式优化 */
.el-avatar {
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.el-avatar:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
}

@media (max-width: 480px) {
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
