// 角色色统一映射 —— 替代原先散落在 DashboardHeader / StatisticsPanel /
// QuickActions / ActivityTimeline / RoleBasedCard / MainLayout 中的重复字典。
//
// 设计原则：
//  - 超级管理员 = 主蓝（与 Element Plus primary 一致）
//  - 普通管理员 = 信息灰（权限低于超级，视觉次之）
//  - 审核员 = 绿（success）
//  - 客服 = 橙（warning，活跃感）
//  - 紧急响应 = 红（danger）
//  - 论坛管理员 = 紫
//  - 未分配 = 浅灰

const ROLE_PALETTE = {
  0:  { main: '#409EFF', light: '#ecf5ff' }, // 超级管理员
  1:  { main: '#909399', light: '#f4f4f5' }, // 普通管理员
  2:  { main: '#67C23A', light: '#f0f9eb' }, // 审核员
  3:  { main: '#E6A23C', light: '#fdf6ec' }, // 客服
  4:  { main: '#F56C6C', light: '#fef0f0' }, // 紧急响应人员
  5:  { main: '#722ED1', light: '#f3ecfb' }, // 论坛管理员
  10: { main: '#C0C4CC', light: '#f4f4f5' }  // 未分配身份
}

const FALLBACK = ROLE_PALETTE[0]

const DESC_TO_TYPE = {
  '超级管理员': 0,
  '普通管理员': 1,
  '审核员': 2,
  '客服': 3,
  '紧急响应人员': 4,
  '论坛管理员': 5,
  '未分配身份': 10
}

export function roleColorByType(type) {
  return ROLE_PALETTE[type] || FALLBACK
}

export function roleColorByDesc(desc) {
  const type = DESC_TO_TYPE[desc]
  return type === undefined ? FALLBACK : ROLE_PALETTE[type]
}

// 给 el-tag 用：返回 type 字符串，让 Element Plus 自己上色
const DESC_TO_TAG_TYPE = {
  '超级管理员': 'primary',
  '普通管理员': 'info',
  '审核员': 'success',
  '客服': 'warning',
  '紧急响应人员': 'danger',
  '论坛管理员': '',         // 紫色 Element Plus 无对应，组件层用 main 色覆盖
  '未分配身份': 'info'
}

export function roleTagType(desc) {
  return DESC_TO_TAG_TYPE[desc] ?? ''
}
