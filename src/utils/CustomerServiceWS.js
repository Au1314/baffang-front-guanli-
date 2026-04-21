class CustomerServiceWS {
    constructor(token) {
        this.ws = new WebSocket(`ws://localhost:8080/ws/customer-service?token=${token}`);
        this.handlers = {};
        this.heartbeatTimer = null;
        this.isConnected = false;
        this.init();
    }

    init() {
        this.ws.onopen = () => {
            console.log('WebSocket连接成功');
            this.isConnected = true;
            this.startHeartbeat();
            // 自动获取会话列表
            this.getConversations();
        };

        this.ws.onmessage = (event) => {
            try {
                const { type, payload, timestamp } = JSON.parse(event.data);
                // 触发对应处理器
                if (this.handlers[type]) {
                    this.handlers[type](payload, timestamp);
                }
            } catch (error) {
                console.error('解析WebSocket消息失败:', error);
            }
        };

        this.ws.onclose = (event) => {
            console.log('WebSocket连接关闭:', event.code, event.reason);
            this.isConnected = false;
            this.stopHeartbeat();
            // 可以在这里实现重连逻辑
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket错误:', error);
        };
    }

    // 注册消息处理器
    on(type, handler) {
        this.handlers[type] = handler;
    }

    // 发送消息
    send(type, data = {}) {
        if (!this.isConnected) {
            console.error('WebSocket未连接，无法发送消息');
            return false;
        }

        try {
            const message = JSON.stringify({ type, ...data });
            this.ws.send(message);
            return true;
        } catch (error) {
            console.error('发送WebSocket消息失败:', error);
            return false;
        }
    }

    // 心跳机制
    startHeartbeat() {
        this.heartbeatTimer = setInterval(() => {
            this.send('PING');
        }, 30000); // 30秒发送一次心跳
    }

    stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    // 关闭连接
    close() {
        this.stopHeartbeat();
        if (this.isConnected) {
            this.ws.close();
        }
    }

    // ========== 业务方法 ==========
    
    // 获取会话列表
    getConversations() {
        this.send('GET_CONVERSATIONS');
    }

    // 获取会话消息历史
    getMessages(conversationId, page = 1, size = 50) {
        this.send('GET_CONVERSATION_MESSAGES', { conversationId, page, size });
    }

    // 接入会话
    acceptConversation(conversationId) {
        this.send('ACCEPT_CONVERSATION', { conversationId });
    }

    // 发送消息
    sendMessage(conversationId, content, messageType = 0) {
        this.send('SEND_MESSAGE', { conversationId, content, messageType });
    }

    // 标记已读
    markRead(conversationId) {
        this.send('READ_RECEIPT', { conversationId });
    }

    // 关闭会话
    closeConversation(conversationId, reason = '') {
        this.send('CLOSE_CONVERSATION', { conversationId, reason });
    }

    // 转接会话
    transferConversation(conversationId, targetAdminId) {
        this.send('TRANSFER_CONVERSATION', { conversationId, targetAdminId });
    }

    // 获取在线客服
    getOnlineAdmins() {
        this.send('GET_ONLINE_ADMINS');
    }
}

export default CustomerServiceWS;