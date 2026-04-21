# 客服模块WebSocket实现计划

## 1. 创建WebSocket服务类
- 在 `src/utils/CustomerServiceWS.js` 创建可复用的WebSocket服务类
- 实现带token认证的WebSocket连接逻辑
- 添加消息处理和事件注册功能
- 实现心跳机制保持连接活跃

## 2. 集成到CustomerService.vue组件
- 在组件中导入并初始化WebSocket服务
- 用真实的WebSocket通信替换当前的模拟数据
- 为所有WebSocket消息类型实现事件处理器

## 3. 实现会话管理功能
- **GET_CONVERSATIONS**: 获取并显示会话列表
- **ACCEPT_CONVERSATION**: 处理会话接入
- **CLOSE_CONVERSATION**: 实现会话关闭
- **TRANSFER_CONVERSATION**: 添加会话转接功能

## 4. 实现消息处理功能
- **SEND_MESSAGE**: 支持发送文本消息
- **GET_CONVERSATION_MESSAGES**: 获取消息历史记录
- **NEW_MESSAGE**: 处理实时消息接收
- **READ_RECEIPT**: 实现已读回执功能

## 5. 实现实时通知功能
- **NEW_CONVERSATION**: 处理新会话通知
- **ADMIN_ONLINE/OFFLINE**: 跟踪客服状态变化
- **CONVERSATION_ENDED/TRANSFERRED**: 处理会话状态变更

## 6. UI更新
- 确保界面根据WebSocket事件实时更新
- 添加加载状态和错误处理
- 提供实时反馈以提升用户体验

## 7. 测试
- 测试WebSocket连接建立
- 测试消息发送和接收
- 测试会话管理操作
- 测试实时通知功能

这个实现将把当前的模拟数据替换为实时WebSocket通信，使客服模块能够按预期工作。