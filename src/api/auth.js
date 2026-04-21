import request from './index'

export const authApi = {
  // 登录
  login(data) {
    return request.post('/auth/login', data)
  },
  
  // 登出
  logout() {
    return request.post('/auth/logout')
  },
  
  // 获取管理员信息
  getAdminInfo() {
    return request.get('/auth/info')
  },
  
  // 获取管理员个人信息（新API）
  getProfile() {
    return request.get('/profile')
  },
  
  // 上传头像
  uploadAvatar(file) {
    const formData = new FormData()
    formData.append('file', file)
    return request.post('/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },
  
  // 更新管理员个人信息（新API）
  updateProfile(data) {
    return request.put('/profile', data)
  },
  
  // 更新管理员信息（旧API，保留兼容）
  updateAdminInfo(data) {
    return request.put('/auth/info', data)
  },
  
  // 修改密码（新API）
  changePassword(data) {
    return request.put('/profile/password', data)
  },
  
  // 注册
  register(data) {
    return request.post('/auth/register', data)
  },
  
  // 成员管理
  getMemberList(params) {
    return request.get('/member/list', { params })
  },
  getMemberDetail(adminId) {
    return request.get(`/member/${adminId}`)
  },
  addMember(data) {
    return request.post('/member/add', data)
  },
  updateMemberRole(adminId, roleType) {
    return request.put('/member/type', { targetAdminId: adminId, newType: roleType })
  },
  setAdmin(id, data) {
    return request.put(`/member/${id}/set-admin`, data)
  },
  setMemberRole(id, data) {
    return request.put(`/member/${id}/role`, data)
  },
  removeMember(id) {
    return request.delete(`/member/${id}`)
  },
  
  // 邀请码管理
  generateInviteCode(data) {
    console.log('调用generateInviteCode，数据:', data)
    return request.post('/auth/invite-code/generate', data)
  },
  getInviteCodeList(params) {
    return request.get('/auth/invite-code/list', { params })
  },
  updateInviteCodeStatus(codeId, status) {
    console.log('调用updateInviteCodeStatus，codeId:', codeId, 'status:', status)
    // 根据API文档，修改邀请码状态的API是PUT /invite-code/{codeId}/status?status=0/1
    const url = `/invite-code/${codeId}/status`
    const params = { status }
    console.log('请求URL:', url)
    console.log('请求参数:', params)
    return request.put(url, {}, { params })
  },
  deleteInviteCode(codeId) {
    console.log('调用deleteInviteCode，codeId:', codeId)
    // 删除邀请码的API是DELETE /invite-code/{codeId}
    const url = `/invite-code/${codeId}`
    console.log('请求URL:', url)
    return request.delete(url)
  },
  batchDeleteInviteCode(ids) {
    console.log('调用batchDeleteInviteCode，ids:', ids)
    // 批量删除邀请码的API是DELETE /invite-code/batch
    // 根据API文档，请求体应该是一个整数数组，而不是一个包含ids字段的对象
    const url = `/invite-code/batch`
    console.log('请求URL:', url)
    console.log('请求数据:', ids)
    return request.delete(url, { data: ids })
  },
  
  // 参数配置
  getConfig() {
    return request.get('/platform/config')
  },
  updateConfig(data) {
    return request.put('/platform/config', data)
  },
  
  // 日志查看
  getLogList(params) {
    return request.get('/system/log/list', { params })
  },
  // 获取单条日志详情
  getLogDetail(id) {
    return request.get(`/system/log/detail/${id}`)
  },

  // 审核相关API
  // 获取审核列表
  getAuditList(params) {
    return request.get('/audit/list', { params })
  },
  // 获取审核详情
  getAuditDetail(id) {
    return request.get(`/audit/${id}`)
  },
  // 私桩认证审核
  auditPrivatePile(data) {
    return request.post('/audit/private-pile', data)
  },
  // 私人电桩认证审核（新API）
  auditPrivateStation(data) {
    return request.post('/auth/station/review', data)
  },
  // 车主认证审核
  auditCarOwner(data) {
    return request.put('/audit/car-owner', data)
  },
  // 车主认证审核（新API）
  auditVehicle(data) {
    return request.post('/audit/vehicle/review', data)
  },
  // 获取车主认证审核列表
  getCarOwnerAuditList(params) {
    return request.get('/audit/vehicle/list', { params })
  },
  // 获取车主认证审核详情
  getCarOwnerAuditDetail(id) {
    return request.get(`/audit/vehicle/detail/${id}`)
  },
  // 充电桩投诉审核
  auditComplaint(data) {
    return request.put(`/complaint/${data.id}/audit`, {
      action: data.action,
      opinion: data.opinion,
      rejectReason: data.rejectReason || null,
      priority: data.priority || null
    })
  },
  // 充电桩故障审核
  auditFault(data) {
    return request.put(`/complaint/${data.id}/audit`, {
      action: data.action,
      opinion: data.opinion,
      rejectReason: data.rejectReason || null,
      priority: data.priority || null
    })
  },
  // 评论举报审核
  auditComment(data) {
    return request.put('/audit/comment', data)
  },
  // 交易申诉审核
  auditAppeal(data) {
    return request.put('/audit/appeal', data)
  },
  // 批量审核
  batchAudit(data) {
    return request.put('/audit/batch', data)
  },
  // 获取私桩待审核列表
  getPrivatePileAuditList(params) {
    return request.get('/audit/private-pile/list', { params })
  },
  // 获取私人电桩待审核列表（新API）
  getPrivateStationAuditList(params) {
    return request.get('/auth/station/list', { params })
  },
  // 获取私人电桩认证详情
  getPrivateStationAuthDetail(stationId) {
    return request.get(`/auth/station/detail/${stationId}`)
  },
  // 获取私桩认证详情
  getPrivatePileAuditDetail(id) {
    return request.get(`/audit/private-pile/${id}`)
  },

  // 数据导出相关API
  // 审核记录导出
  exportAuditRecords(params) {
    return request.post('/data/export/audit-records', params, { responseType: 'blob' })
  },
  // 订单&用户数据导出
  exportOrderUserData(params) {
    return request.post('/data/export/order-user', params, { responseType: 'blob' })
  },
  // 订单明细/交易流水/退款记录导出
  exportOrderDetails(params) {
    return request.post('/data/export/order-details', params, { responseType: 'blob' })
  },
  // 用户列表/黑白名单/成就激励记录导出
  exportUserLists(params) {
    return request.post('/data/export/user-lists', params, { responseType: 'blob' })
  },
  // 备份平台数据
  backupPlatformData(params) {
    return request.post('/data/backup', params)
  },
  // 查询备份任务状态
  getBackupTaskStatus(taskId) {
    return request.get(`/data/backup/status/${taskId}`)
  },
  // 回滚平台数据
  rollbackPlatformData(params) {
    return request.post('/data/rollback', params)
  },

  // 论坛管理相关API
  // 帖子列表查询
  getPostList(params) {
    return request.get('/forum/post/list', { params })
  },
  // 帖子详情查询
  getPostDetail(postId) {
    return request.get(`/forum/post/${postId}`)
  },
  // 帖子编辑
  editPost(postId, data) {
    return request.put(`/forum/post/${postId}`, data)
  },
  // 帖子删除
  deletePost(postId) {
    return request.delete(`/forum/post/${postId}`)
  },
  // 批量删除帖子
  batchDeletePost(ids) {
    return request.delete('/forum/post/batch', { data: { ids } })
  },
  // 评论列表查询
  getCommentList(params) {
    return request.get('/forum/reply/list', { params })
  },
  // 评论删除
  deleteComment(commentId) {
    return request.delete(`/forum/reply/${commentId}`)
  },
  // 评论详情查询
  getCommentDetail(commentId) {
    return request.get(`/forum/reply/${commentId}`)
  },
  // 批量删除评论
  batchDeleteComment(ids) {
    return request.delete('/forum/reply/batch', { data: { ids } })
  },
  // 帖子置顶设置
  setPostTop(postId, data) {
    return request.put(`/forum/post/${postId}/top`, data)
  },
  // 帖子精华/取消精华
  setPostEssence(postId, data) {
    return request.put(`/forum/post/${postId}/essence`, data)
  },
  // 举报列表查询
  getReportList(params) {
    return request.get('/forum/report/list', { params })
  },
  // 帖子举报列表查询
  getPostReportList(params) {
    return request.get('/forum/report/post/list', { params })
  },
  // 评论举报列表查询
  getCommentReportList(params) {
    return request.get('/forum/report/reply/list', { params })
  },
  // 举报详情查询
  getReportDetail(reportId) {
    return request.get(`/forum/report/${reportId}`)
  },
  // 举报审核操作
  auditReport(reportId, data) {
    return request.post(`/forum/report/${reportId}/audit`, data)
  },
  // 举报通过操作
  approveReport(reportId, data) {
    return request.post(`/forum/report/${reportId}/approve`, data)
  },
  // 举报拒绝操作
  rejectReport(reportId, data) {
    return request.post(`/forum/report/${reportId}/reject`, data)
  },

  // 客服管理相关API
  // 待处理对话列表
  getPendingChatList(params) {
    return request.get('/customer-service/pending', { params })
  },
  // 获取单条对话的消息列表
  getChatMessageList(conversationId, params) {
    return request.get(`/customer-service/conversations/${conversationId}/messages`, { params })
  },
  // 发送对话消息
  sendChatMessage(conversationId, data) {
    return request.post(`/customer-service/conversations/${conversationId}/messages`, data)
  },
  // 标记消息已读
  markMessageRead(chatId) {
    return request.put(`/customer-service/chat/${chatId}/read`)
  },
  // 结束对话
  endChat(conversationId, data = {}) {
    return request.post(`/customer-service/conversations/${conversationId}/close`, data)
  },
  // 接入对话
  joinConversation(conversationId) {
    return request.post(`/customer-service/conversations/${conversationId}/join`)
  },
  // 转接对话
  transferConversation(conversationId, data) {
    return request.post(`/customer-service/conversations/${conversationId}/transfer`, data)
  },
  // 获取我的对话列表
  getMyConversations(params) {
    return request.get('/customer-service/my-conversations', { params })
  },
  // 全量对话记录（暂时注释，因为没有对应的API）
  // getAllChatRecords(params) {
  //   return request.get('/customer-service/chat', { params })
  // },
  // 获取对话详情
  getChatCompleteRecord(chatId) {
    return request.get(`/customer-service/conversations/${chatId}`)
  },
  // 获取AI客服配置
  getAICustomerConfig() {
    return request.get('/customer-service/ai-config')
  },
  // 更新AI客服配置
  updateAICustomerConfig(data) {
    return request.put('/customer-service/ai-config', data)
  },

  // 紧急响应相关API
  // 紧急响应 - 接单处理
  acceptEmergencyCall(callId) {
    return request.put(`/emergency/call/${callId}/accept`)
  },
  // 紧急响应 - 完成处理
  completeEmergencyCall(callId, data) {
    return request.post(`/emergency/call/${callId}/complete`, data)
  },
  // 紧急响应 - 取消呼叫
  cancelEmergencyCall(callId, data) {
    return request.post(`/emergency/call/${callId}/cancel`, data)
  },
  // 紧急响应 - 分配呼叫
  assignEmergencyCall(callId, data) {
    return request.put(`/emergency/call/${callId}/assign`, data)
  },
  // 紧急响应 - 修改呼叫信息
  updateEmergencyCallInfo(callId, data) {
    return request.put(`/emergency/call/${callId}`, data)
  },
  // 紧急响应 - 批量处理呼叫
  batchProcessEmergencyCalls(data) {
    return request.put('/emergency/call/batch', data)
  },
  // 紧急响应 - 查询呼叫记录
  getEmergencyCallRecords(params) {
    return request.get('/emergency/call/list', { params })
  },
  // 紧急响应 - 获取呼叫详情
  getEmergencyCallDetail(callId) {
    return request.get(`/emergency/call/${callId}`)
  },
  // 紧急响应 - 获取待响应呼叫列表（按距离排序）
  getPendingEmergencyCalls(params) {
    return request.get('/emergency/call/pending', { params })
  },
  // 紧急响应 - 获取我的响应记录
  getMyEmergencyResponses(params) {
    return request.get('/emergency/call/my-responses', { params })
  },
  // 紧急响应 - 响应紧急呼叫
  respondEmergencyCall(callId, data) {
    return request.post(`/emergency/call/${callId}/respond`, data)
  },

  // 私人电桩管理相关API
  // 获取私桩列表
  getPrivateStationList(params) {
    return request.get('/private-station/page', { params })
  },
  // 获取私桩详情
  getPrivateStationDetail(id) {
    return request.get(`/private-station/${id}`)
  },
  // 修改私桩信息
  updatePrivateStation(id, data) {
    return request.put(`/private-station/${id}`, data)
  },
  // 删除私桩
  deletePrivateStation(id) {
    return request.delete(`/private-station/${id}`)
  },
  
  // 用户管理相关API
  // 获取用户列表
  getUserList(params) {
    return request.get('/user/list', { params })
  },
  // 获取用户详情
  getUserDetail(id) {
    return request.get(`/user/detail/${id}`)
  },
  // 更新用户信息
  updateUser(id, data) {
    return request.put(`/user/${id}`, data)
  },
  // 设置用户状态（启用/禁用）
  setUserStatus(id, status, reason) {
    // 构建请求体，只包含有值的字段
    const requestBody = { status }
    // 只有当reason有值时才添加到请求体中
    if (reason && reason.trim() !== '') {
      requestBody.reason = reason
    }
    return request.put(`/user/${id}/status`, requestBody)
  },
  // 重置用户密码
  resetUserPassword(id) {
    return request.put(`/user/${id}/password`)
  },
  // 删除用户
  deleteUser(id) {
    return request.delete(`/user/${id}`)
  },
  // 批量删除用户
  deleteUsersBatch(ids) {
    return request.delete('/user/batch', { data: { ids } })
  },
  
  // 投诉/故障审核相关API
  // 获取投诉/故障审核列表
  getComplaintList(params) {
    return request.get('/complaint/list', { params })
  },
  // 获取投诉/故障审核详情
  getComplaintDetail(id) {
    return request.get(`/complaint/detail/${id}`)
  },

  // 通知管理相关API
  // 获取通知列表
  getNoticeList(params) {
    return request.get('/notice/list', { params })
  },
  // 获取通知详情
  getNoticeDetail(noticeId) {
    return request.get(`/notice/${noticeId}`)
  },
  // 标记通知为已读
  markNoticeAsRead(noticeId) {
    return request.put(`/notice/${noticeId}/read`)
  },
  // 删除通知
  deleteNotice(noticeId) {
    return request.delete(`/notice/${noticeId}`)
  },
  
  // 发送系统公告
  broadcastNotice(data) {
    return request.post('/notice/broadcast', data)
  },
  
  // 发送通知给指定用户
  sendNotice(data) {
    return request.post('/notice/send', data)
  },
  
  // 批量发送通知
  batchSendNotice(data) {
    return request.post('/notice/batch-send', data)
  },
  
  // 批量删除通知
  batchDeleteNotice(ids) {
    return request.delete('/notice/batch-delete', { data: { ids } })
  },
  
  // 个人客服统计
  getMyCustomerServiceStats() {
    return request.get('/customer-service/stats/my')
  },
  
  // 所有客服统计
  getAllCustomerServiceStats() {
    return request.get('/customer-service/stats/admins')
  },
  
  // 客服统计概览
  getCustomerServiceStatsOverview() {
    return request.get('/customer-service/stats/overview')
  },
  
  // 紧急响应统计
  getEmergencyStatistics() {
    return request.get('/emergency/statistics')
  },
  
  // 论坛统计
  getForumStatistics() {
    return request.get('/forum/statistics')
  },

  // 获取审核统计信息
  getAuditStatistics() {
    return request.get('/audit/record/statistics')
  },

  // 获取故障/投诉统计信息
  getComplaintStatistics() {
    return request.get('/complaint/statistics')
  },

  // 获取车主审核认证统计信息
  getVehicleAuditStatistics() {
    return request.get('/audit/vehicle/statistics')
  },

  // 获取私桩分布数据统计
  getPrivateStationDistribution() {
    return request.get('/stats/station/distribution')
  },

  // 获取用户日活/总数统计
  getPlatformStats() {
    return request.get('/stats/platform')
  },
  
  // AI快速分析
  quickAnalysis(question, config = {}) {
    return request.get('/ai/analysis/quick', { 
      params: { question }, 
      timeout: 90000, // 单独设置90秒超时
      ...config 
    })
  },
  
  // 综合数据分析
  getComprehensiveAnalysis(params = {}) {
    return request.get('/ai/analysis/all', { 
      params, 
      timeout: 180000 // 3分钟超时
    })
  },
  
  // 模块数据分析
  moduleAnalysis(data) {
    return request.post('/ai/analysis/module', data, {
      timeout: 180000 // 3分钟超时
    })
  },
  
  // 自定义问题分析
  customAnalysis(data) {
    return request.post('/ai/analysis/question', data, {
      timeout: 180000 // 3分钟超时
    })
  },
  
  // 分页查询决策列表
  getDecisionList(params) {
    return request.get('/ai/decision/list', { params })
  },
  
  // 获取决策详情
  getDecisionDetail(id) {
    return request.get(`/ai/decision/${id}`)
  },
  
  // 获取决策统计数据
  getDecisionStatistics() {
    return request.get('/ai/decision/statistics')
  },
  
  // 通用AI决策请求
  requestAIDecision(data) {
    return request.post('/ai/decision/request', data, {
      timeout: 180000 // 3分钟超时，适应AI分析可能的长时间处理
    })
  },
  
  // AI审核建议
  getAIAuditSuggest(auditId) {
    return request.post(`/ai/decision/audit/suggest/${auditId}`, {}, {
      timeout: 180000 // 3分钟超时，适应AI分析可能的长时间处理
    })
  },
  
  // AI异常检测
  detectAnomaly(data) {
    return request.post('/ai/decision/anomaly/detect', data, {
      timeout: 180000 // 3分钟超时
    })
  },
  
  // AI运营优化建议
  getOperationOptimizationSuggest(data) {
    return request.post('/ai/decision/optimization/suggest', data, {
      timeout: 180000 // 3分钟超时
    })
  },

  // AI风险评估
  riskAssessment(params) {
    return request.post('ai/decision/risk/assess', {}, {
      params,
      timeout: 180000 // 3分钟超时
    })
  },

  // 处理决策
  handleDecision(params) {
    return request.post('ai/decision/handle', params, {
      timeout: 180000 // 3分钟超时
    })
  },

  // 手动执行决策
  executeDecision(decisionId) {
    return request.post(`ai/decision/execute/${decisionId}`, {}, {
      timeout: 180000 // 3分钟超时
    })
  }
}