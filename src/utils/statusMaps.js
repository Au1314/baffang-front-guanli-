// 统一审核状态 / 优先级 / 认证状态映射
//
// 消除散落在 9 个 view 中的重复实现（CarOwnerAudit、PrivateStationAudit、
// ChargingComplaintAudit、ChargingFaultAudit、PostReportAudit、以及 4 个 AI* view）。
//
// 命名约定：
//   xxxTextMap / xxxTypeMap — 供模板直接读取的 map（若需要遍历/构造下拉框）
//   getXxxText(v) / getXxxType(v) — 带默认值兜底的 helper（推荐调用方式）

// ─────────────────────────────────────────────────────────
// 审核状态（0-5）—— 全部 audit view 共用
// ─────────────────────────────────────────────────────────

export const auditStatusTextMap = {
  0: '待审核',
  1: '审核中',
  2: '已通过',
  3: '已拒绝',
  4: '需补充材料',
  5: '已撤回'
}

// Element Plus el-tag type
export const auditStatusTypeMap = {
  0: 'info',
  1: 'warning',
  2: 'success',
  3: 'danger',
  4: 'warning',
  5: 'info'
}

export function getAuditStatusText(status) {
  return auditStatusTextMap[status] ?? '未知状态'
}

export function getAuditStatusType(status) {
  return auditStatusTypeMap[status] ?? 'info'
}

// ─────────────────────────────────────────────────────────
// 优先级（0-3）—— 全部 audit / AI 决策 view 共用
// 备注：CarOwnerAudit 用的是 1='success'，AI 系列用的是 1='primary'。
//       统一采用 AI 系列的语义：低=灰、普通=蓝、高=橙、紧急=红，语义更直观。
// ─────────────────────────────────────────────────────────

export const priorityTextMap = {
  0: '低',
  1: '普通',
  2: '高',
  3: '紧急'
}

export const priorityTypeMap = {
  0: 'info',
  1: 'primary',
  2: 'warning',
  3: 'danger'
}

export function getPriorityText(priority) {
  return priorityTextMap[priority] ?? '普通'
}

export function getPriorityType(priority) {
  return priorityTypeMap[priority] ?? 'info'
}

// ─────────────────────────────────────────────────────────
// 私人电桩认证状态（0-3）—— PrivateStationAudit 用
// ─────────────────────────────────────────────────────────

export const authStatusTextMap = {
  0: '未认证',
  1: '审核中',
  2: '已认证',
  3: '认证失败'
}

export const authStatusTypeMap = {
  0: 'info',
  1: 'warning',
  2: 'success',
  3: 'danger'
}

export function getAuthStatusText(authStatus) {
  return authStatusTextMap[authStatus] ?? '未知'
}

export function getAuthStatusType(authStatus) {
  return authStatusTypeMap[authStatus] ?? 'info'
}
