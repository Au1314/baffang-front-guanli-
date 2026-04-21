<template>
  <div class="ai-anomaly-detection-container">
    <h3 class="page-subtitle">AI异常检测</h3>
    
    <!-- 请求表单 -->
    <el-card class="form-card">
      <el-form :model="requestForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="业务类型" prop="businessType">
          <el-input v-model="requestForm.businessType" placeholder="请输入业务类型" />
          <div class="form-tip">可选参数，用于指定检测的业务领域</div>
        </el-form-item>
        
        <el-form-item label="业务ID" prop="businessId">
          <el-input v-model="requestForm.businessId" type="number" placeholder="请输入业务ID" />
          <div class="form-tip">可选参数，用于指定具体业务对象</div>
        </el-form-item>
        
        <el-form-item label="说明" prop="additionalQuestion">
          <el-input
            v-model="requestForm.additionalQuestion"
            type="textarea"
            :rows="3"
            placeholder="请输入说明或特殊要求"
          />
        </el-form-item>
        
        <el-form-item label="自动执行" prop="autoExecute">
          <el-switch v-model="requestForm.autoExecute" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitRequest" :loading="submitting">发送检测请求</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 结果展示 -->
    <el-card v-if="responseData" class="result-card" :loading="submitting">
      <template #header>
        <div class="result-header">
          <span>AI异常检测结果</span>
          <el-button type="primary" size="small" @click="copyResult">复制结果</el-button>
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
            <span class="item-label">异常检测:</span>
            <el-tag :type="parsedAnalysis.hasAnomaly ? 'danger' : 'success'">
              {{ parsedAnalysis.hasAnomaly ? '存在异常' : '无异常' }}
            </el-tag>
          </div>
          
          <div class="analysis-item" v-if="parsedAnalysis.confidence">
            <span class="item-label">置信度:</span>
            <span>{{ parsedAnalysis.confidence }}%</span>
          </div>
          
          <div class="analysis-item" v-if="parsedAnalysis.priority">
            <span class="item-label">优先级:</span>
            <el-tag :type="getPriorityType(parsedAnalysis.priority)">
              {{ getPriorityName(parsedAnalysis.priority) }}
            </el-tag>
          </div>
          
          <!-- 异常列表 -->
          <div v-if="parsedAnalysis.anomalies && parsedAnalysis.anomalies.length > 0" class="anomalies-list">
            <h5 class="sub-section-title">异常列表</h5>
            <el-collapse>
              <el-collapse-item
                v-for="(anomaly, index) in parsedAnalysis.anomalies"
                :key="index"
                :title="`${anomaly.type} - ${getSeverityName(anomaly.severity)}`"
              >
                <div class="anomaly-content">
                  <div class="anomaly-description">{{ anomaly.description }}</div>
                  <div class="anomaly-severity">
                    <span class="item-label">严重程度:</span>
                    <el-tag :type="getSeverityType(anomaly.severity)">
                      {{ getSeverityName(anomaly.severity) }}
                    </el-tag>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
          
          <!-- 建议操作 -->
          <div v-if="parsedAnalysis.actions && parsedAnalysis.actions.length > 0" class="actions-list">
            <h5 class="sub-section-title">建议操作</h5>
            <el-table :data="parsedAnalysis.actions" border style="width: 100%">
              <el-table-column prop="actionName" label="操作名称" width="200" />
              <el-table-column prop="description" label="描述" />
              <el-table-column prop="actionType" label="操作类型" width="150" />
              <el-table-column prop="autoExecutable" label="可自动执行" width="120">
                <template #default="scope">
                  <el-tag :type="scope.row.autoExecutable ? 'success' : 'info'">
                    {{ scope.row.autoExecutable ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="params" label="参数" width="200">
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
      
      <!-- 建议操作列表 -->
      <div class="result-section" v-if="responseData.suggestedActions && responseData.suggestedActions.length > 0">
        <h4 class="section-title">详细建议操作</h4>
        <el-table :data="responseData.suggestedActions" border style="width: 100%">
          <el-table-column prop="actionName" label="操作名称" width="200" />
          <el-table-column prop="description" label="描述" />
          <el-table-column prop="actionType" label="操作类型" width="150" />
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
          <el-table-column prop="params" label="参数" width="200">
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
  businessType: '',
  businessId: undefined,
  additionalQuestion: '',
  autoExecute: false
})

// 表单引用
const formRef = ref(null)

// 加载状态
const submitting = ref(false)

// 响应数据
const responseData = ref(null)

// 表单验证规则
const formRules = {
  businessType: [
    {
      max: 50,
      message: '业务类型不能超过50个字符',
      trigger: 'blur'
    }
  ],
  businessId: [
    {
      type: 'number',
      message: '业务ID必须是数字',
      trigger: ['blur', 'change']
    }
  ],
  additionalQuestion: [
    {
      max: 500,
      message: '说明不能超过500个字符',
      trigger: 'blur'
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

// 获取严重程度类型
const getSeverityType = (severity) => {
  const typeMap = {
    'LOW': 'info',
    'MEDIUM': 'warning',
    'HIGH': 'danger'
  }
  return typeMap[severity] || 'info'
}

// 获取严重程度名称
const getSeverityName = (severity) => {
  const nameMap = {
    'LOW': '低',
    'MEDIUM': '中',
    'HIGH': '高'
  }
  return nameMap[severity] || severity
}

// 提交请求
const submitRequest = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (!valid) return false
    
    submitting.value = true
    
    // 处理请求参数
    const requestData = {
      ...requestForm,
      // 只有当businessId有值时才传递
      businessId: requestForm.businessId || undefined
    }
    
    // 调用API
    authApi.detectAnomaly(requestData)
      .then(response => {
        // 响应拦截器已经处理了code判断，直接返回了data
        responseData.value = response
        ElMessage.success('检测请求成功')
      })
      .catch(error => {
        console.error('检测请求失败:', error)
        ElMessage.error('检测请求失败: ' + (error.message || '网络错误'))
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
</script>

<style scoped>
.ai-anomaly-detection-container {
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

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.result-card {
  margin-bottom: 20px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
}

.anomalies-list {
  margin-top: 15px;
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

.anomaly-content {
  padding: 10px;
}

.anomaly-description {
  margin-bottom: 10px;
  line-height: 1.5;
}

.anomaly-severity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.raw-analysis {
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
  margin: 0;
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