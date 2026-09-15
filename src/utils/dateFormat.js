// 统一日期格式化工具 —— 消除 5 处 view 内的重复实现。
//
// 命名约定：
//   formatDateTime — 到秒，YYYY/MM/DD HH:mm:ss（默认）
//   formatDateMinute — 到分，YYYY/MM/DD HH:mm
//   formatDay — 到日，YYYY/MM/DD
//
// 所有函数在 value 为空或非法时返回空串，方便直接 `{{ formatDateTime(x) || '-' }}`

const LOCALE = 'zh-CN'

function toDate(value) {
  if (value === undefined || value === null || value === '') return null
  const d = value instanceof Date ? value : new Date(value)
  return isNaN(d.getTime()) ? null : d
}

export function formatDateTime(value) {
  const d = toDate(value)
  if (!d) return ''
  return d.toLocaleString(LOCALE, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function formatDateMinute(value) {
  const d = toDate(value)
  if (!d) return ''
  return d.toLocaleString(LOCALE, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function formatDay(value) {
  const d = toDate(value)
  if (!d) return ''
  return d.toLocaleDateString(LOCALE, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}
