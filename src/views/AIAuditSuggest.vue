<template>
  <div class="ai-audit-suggest-container">
    <h3 class="page-subtitle">AI审核建议</h3>
    
    <!-- 请求表单 -->
    <el-card class="form-card">
      <el-form :model="requestForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="审核ID" prop="auditId">
          <el-input v-model="requestForm.auditId" type="number" placeholder="请输入审核ID" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitRequest" :loading="submitting">获取审核建议</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 结果展示 -->
    <el-card v-if="responseData" class="result-card" :loading="submitting">
      <template #header>
        <div class="result-header">
          <span>AI审核建议结果</span>
          <div class="header-buttons">
            <el-button type="success" size="small" @click="executeDecision">手动执行决策</el-button>
            <el-button type="primary" size="small" @click="copyResult">复制结果</el-button>
          </div>
        </div>
      </template>
      
      <!-- 基本信息 -->
      <div class="result-section">
        <h4 class="section-title">基本信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="决策ID">{{ responseData.decisionId }}</el-descriptions-item>
          <el-descriptions-item label="决策编号">{{ responseData.decisionNo }}</el-descriptions-item>
          <el-descriptions-item label="置信度">{{ responseData.confidence }}%</el-descriptions-item>
          <el-descriptions-item label="自动执行">
            <el-tag :type="responseData.willAutoExecute ? 'success' : 'info'">
              {{ responseData.willAutoExecute ? '是' : '否' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理时间">{{ responseData.costMs }}ms</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- AI分析结果 -->
      <div class="result-section">
        <h4 class="section-title">AI分析结果</h4>
        <div v-if="parsedAnalysis" class="analysis-content">
          <div class="analysis-item">
            <span class="item-label">建议类型:</span>
            <el-tag :type="getSuggestionType(parsedAnalysis.suggestion)">
              {{ getSuggestionName(parsedAnalysis.suggestion) }}
            </el-tag>
          </div>
          
          <div class="analysis-item">
            <span class="item-label">置信度:</span>
            <span>{{ parsedAnalysis.confidence }}%</span>
          </div>
          
          <div class="analysis-item">
            <span class="item-label">优先级:</span>
            <el-tag :type="getPriorityType(parsedAnalysis.priority)">
              {{ getPriorityName(parsedAnalysis.priority) }}
            </el-tag>
          </div>
          
          <div class="analysis-item">
            <span class="item-label">原因:</span>
            <div class="analysis-reason">{{ parsedAnalysis.reason }}</div>
          </div>
          
          <!-- 建议操作 -->
          <div v-if="parsedAnalysis.actions && parsedAnalysis.actions.length > 0" class="actions-list">
            <h5 class="sub-section-title">建议操作</h5>
            <el-table :data="parsedAnalysis.actions" border style="width: 100%">
              <el-table-column prop="actionName" label="操作名称" width="200" />
              <el-table-column prop="actionType" label="操作类型" width="150" />
              <el-table-column prop="description" label="描述" />
              <el-table-column prop="autoExecutable" label="可自动执行" width="120">
                <template #default="scope">
                  <el-tag :type="scope.row.autoExecutable ? 'success' : 'info'">
                    {{ scope.row.autoExecutable ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="params" label="参数" width="150">
                <template #default="scope">
                  <el-button type="text" @click="showParams(scope.row.params)">查看参数</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div v-else class="analysis-content">
          <pre class="raw-analysis">{{ responseData.analysis }}</pre>
        </div>
      </div>
      
      <!-- 详细分析 -->
      <div class="result-section">
        <h4 class="section-title">详细分析</h4>
        <div class="detailed-analysis">
          <div v-html="formattedAnalysis"></div>
        </div>
      </div>
      
      <!-- 建议操作列表 -->
      <div class="result-section" v-if="responseData.suggestedActions && responseData.suggestedActions.length > 0">
        <h4 class="section-title">建议操作列表</h4>
        <el-table :data="responseData.suggestedActions" border style="width: 100%">
          <el-table-column prop="actionName" label="操作名称" width="200" />
          <el-table-column prop="actionType" label="操作类型" width="150" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="priority" label="优先级" width="100">
            <template #default="scope">
              <el-tag :type="getPriorityType(scope.row.priority)">
                {{ getPriorityName(scope.row.priority) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="autoExecutable" label="可自动执行" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.autoExecutable ? 'success' : 'info'">
                {{ scope.row.autoExecutable ? '是' : '否' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="params" label="参数" width="150">
            <template #default="scope">
              <el-button type="text" @click="showParams(scope.row.params)">查看参数</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>
    
    <!-- 参数详情弹窗 -->
    <el-dialog v-model="paramsDialogVisible" title="参数详情" width="50%">
      <pre class="params-content">{{ formatJson(paramsDialogData) }}</pre>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { authApi } from '@/api/auth'
import { ElMessage, ElMessageBox } from 'element-plus'

// 请求表单
const requestForm = reactive({
  auditId: undefined
})

// 表单引用
const formRef = ref(null)

// 加载状态
const submitting = ref(false)

// 响应数据
const responseData = ref(null)

// 表单验证规则
  const formRules = {
    auditId: [
      { required: true, message: '请输入审核ID', trigger: 'blur' },
      {
        type: 'number',
        message: '审核ID必须为数字',
        trigger: 'blur',
        transform: (value) => {
          // 如果是字符串类型，尝试转换为数字
          if (typeof value === 'string') {
            return Number(value)
          }
          return value
        }
      }
    ]
  }

// 解析后的AI分析结果
const parsedAnalysis = computed(() => {
  if (!responseData.value?.analysis) return null
  
  try {
    // 提取```json和```之间的内容
    const analysis = responseData.value.analysis
    const jsonMatch = analysis.match(/```json\n([\s\S]*?)\n```/)
    if (jsonMatch && jsonMatch[1]) {
      return JSON.parse(jsonMatch[1])
    }
    return null
  } catch (error) {
    console.error('解析AI分析结果失败:', error)
    return null
  }
})

// 格式化后的详细分析
const formattedAnalysis = computed(() => {
  if (!responseData.value?.analysis) return ''
  
  // 移除json部分，只保留详细分析
  let analysis = responseData.value.analysis
  analysis = analysis.replace(/```json\n[\s\S]*?\n```/, '')
  
  // 替换标题格式
  analysis = analysis.replace(/### (.*?)/g, '<h5 class="analysis-subtitle">$1</h5>')
  analysis = analysis.replace(/## (.*?)/g, '<h4 class="analysis-title">$1</h4>')
  analysis = analysis.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  analysis = analysis.replace(/\n/g, '<br>')
  
  return analysis
})

// 参数详情弹窗
const paramsDialogVisible = ref(false)
const paramsDialogData = ref({})

// 格式化JSON
const formatJson = (data) => {
  if (!data) return '无'
  try {
    return JSON.stringify(data, null, 2)
  } catch (error) {
    return data
  }
}

// 显示参数详情
const showParams = (params) => {
  paramsDialogData.value = params
  paramsDialogVisible.value = true
}

// 获取优先级类型
const getPriorityType = (priority) => {
  const typeMap = {
    0: 'info',
    1: 'primary',
    2: 'warning',
    3: 'danger'
  }
  return typeMap[priority] || 'info'
}

// 获取优先级名称
const getPriorityName = (priority) => {
  const nameMap = {
    0: '低',
    1: '普通',
    2: '高',
    3: '紧急'
  }
  return nameMap[priority] || `优先级${priority}`
}

// 获取建议类型
const getSuggestionType = (suggestion) => {
  const typeMap = {
    'APPROVE': 'success',
    'REJECT': 'danger',
    'NEED_MORE_INFO': 'warning',
    'MANUAL_REVIEW': 'info'
  }
  return typeMap[suggestion] || 'info'
}

// 获取建议名称
const getSuggestionName = (suggestion) => {
  const nameMap = {
    'APPROVE': '通过',
    'REJECT': '拒绝',
    'NEED_MORE_INFO': '需要更多信息',
    'MANUAL_REVIEW': '手动审核'
  }
  return nameMap[suggestion] || suggestion
}

// 提交请求
  const submitRequest = async () => {
    if (!formRef.value) return
    
    await formRef.value.validate((valid) => {
      if (!valid) return false
      
      submitting.value = true
      
      // 调用API
      authApi.getAIAuditSuggest(requestForm.auditId)
        .then(response => {
          // 响应拦截器已经处理了code判断，直接返回了data
          responseData.value = response
          ElMessage.success('获取审核建议成功')
        })
        .catch(error => {
          console.error('获取审核建议失败:', error)
          ElMessage.error('获取审核建议失败: ' + (error.message || '网络错误'))
        })
        .finally(() => {
          submitting.value = false
        })
    })
  }

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  responseData.value = null
}

// 复制结果
const copyResult = () => {
  if (!responseData.value) return
  
  const resultText = JSON.stringify(responseData.value, null, 2)
  navigator.clipboard.writeText(resultText)
    .then(() => {
      ElMessage.success('结果已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败')
    })
}

// 手动执行决策
const executeDecision = async () => {
  if (!responseData.value) return
  
  try {
    // 显示确认弹窗
    await ElMessageBox.confirm(
      `<div>确定要执行该决策吗？</div><div style="margin-top: 10px;">决策ID：${responseData.value.decisionId}</div><div>决策编号：${responseData.value.decisionNo}</div>`,
      '确认执行决策',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true
      }
    )
    
    submitting.value = true
    
    // 调用API
    const response = await authApi.executeDecision(responseData.value.decisionId)
    
    ElMessage.success(response || '执行已触发')
  } catch (error) {
    console.error('执行决策失败:', error)
    if (error !== 'cancel') {
      ElMessage.error('执行决策失败，请重试')
    }
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.ai-audit-suggest-container {
  padding: 20px 0;
}

.page-subtitle {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
}

.form-card {
  margin-bottom: 20px;
}

.result-card {
  margin-bottom: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.result-section {
  margin-bottom: 20px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #303133;
}

.analysis-content {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
}

.analysis-item {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-label {
  font-weight: bold;
  color: #606266;
  width: 80px;
  flex-shrink: 0;
}

.analysis-reason {
  flex: 1;
  line-height: 1.5;
  color: #303133;
}

.actions-list {
  margin-top: 15px;
}

.sub-section-title {
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #303133;
}

.raw-analysis {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
  margin: 0;
}

.detailed-analysis {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  line-height: 1.8;
  color: #303133;
}

.analysis-title {
  font-size: 16px;
  font-weight: bold;
  margin: 15px 0 10px 0;
  color: #303133;
}

.analysis-subtitle {
  font-size: 14px;
  font-weight: bold;
  margin: 10px 0 8px 0;
  color: #606266;
}

.params-content {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
  margin: 0;
  overflow-x: auto;
}
</style>