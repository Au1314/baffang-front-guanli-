import service from './index'

/**
 * 获取审核记录列表
 * @param {Object} params - 查询参数
 * @param {number} params.pageNum - 页码
 * @param {number} params.pageSize - 每页条数
 * @param {number} [params.auditType] - 审核类型：0-私桩 1-车主 2-投诉 3-故障 4-评论 5-交易申诉
 * @param {number} [params.status] - 审核状态：0-待审核 1-审核中 2-通过 3-拒绝 4-需补充 5-撤回
 * @param {number} [params.priority] - 优先级：0-低，1-普通，2-高，3-紧急
 * @param {string} [params.keyword] - 关键字（审核单号、标题）
 * @param {string} [params.startTime] - 提交开始时间
 * @param {string} [params.endTime] - 提交结束时间
 * @returns {Promise} - 返回审核记录列表数据
 */
export const getAuditRecordList = (params) => {
  return service({
    url: '/audit/record/list',
    method: 'get',
    params
  })
}

/**
 * 获取审核记录详情
 * @param {number|string} id - 审核记录ID
 * @returns {Promise} - 返回审核记录详情数据
 */
export const getAuditRecordDetail = (id) => {
  return service({
    url: `/audit/record/${id}`,
    method: 'get'
  })
}

/**
 * 获取审核操作日志
 * @param {number|string} id - 审核记录ID
 * @returns {Promise} - 返回审核操作日志数据
 */
export const getAuditRecordLogs = (id) => {
  return service({
    url: `/audit/record/${id}/logs`,
    method: 'get'
  })
}
