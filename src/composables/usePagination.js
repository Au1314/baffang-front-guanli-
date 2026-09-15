import { ref } from 'vue'

/**
 * 统一的分页 hook —— 替换 view 里散落的 44 处重复分页状态。
 *
 * 使用示例：
 *   const { pageNum, pageSize, total, handleSizeChange, handleCurrentChange, reset } =
 *     usePagination({ pageSize: 20, onChange: fetchList })
 *
 *   <el-pagination
 *     v-model:current-page="pageNum"
 *     v-model:page-size="pageSize"
 *     :total="total"
 *     @size-change="handleSizeChange"
 *     @current-change="handleCurrentChange"
 *   />
 *
 * @param {Object}   options
 * @param {number}  [options.pageNum=1]   初始页码
 * @param {number}  [options.pageSize=10] 初始每页条数
 * @param {Function}[options.onChange]    页码或每页条数变化时的回调（如 fetchList）
 *                                        参数：{ pageNum, pageSize, reason }
 *                                        reason: 'size' | 'current' | 'reset'
 */
export function usePagination(options = {}) {
  const {
    pageNum: initialPage = 1,
    pageSize: initialSize = 10,
    onChange
  } = options

  const pageNum = ref(initialPage)
  const pageSize = ref(initialSize)
  const total = ref(0)

  const handleSizeChange = (size) => {
    pageSize.value = size
    pageNum.value = 1
    onChange?.({ pageNum: pageNum.value, pageSize: pageSize.value, reason: 'size' })
  }

  const handleCurrentChange = (page) => {
    pageNum.value = page
    onChange?.({ pageNum: pageNum.value, pageSize: pageSize.value, reason: 'current' })
  }

  // 重置到第一页并触发 onChange（常用于筛选变化时）
  const reset = () => {
    pageNum.value = 1
    onChange?.({ pageNum: pageNum.value, pageSize: pageSize.value, reason: 'reset' })
  }

  return {
    pageNum,
    pageSize,
    total,
    handleSizeChange,
    handleCurrentChange,
    reset
  }
}
