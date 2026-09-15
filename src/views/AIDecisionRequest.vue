<template>
  <div class="ai-decision-request-container">
    <h3 class="page-subtitle">AI决策请求</h3>
    
    <!-- 请求表单 -->
    <el-card class="form-card">
      <el-form :model="requestForm" :rules="formRules" ref="formRef" label-width="120px">
        <el-form-item label="决策类型" prop="decisionType">
          <el-select v-model="requestForm.decisionType" placeholder="请选择决策类型">
            <el-option label="审核建议" :value="0" />
            <el-option label="异常预警" :value="1" />
            <el-option label="资源调度" :value="2" />
            <el-option label="风险控制" :value="3" />
            <el-option label="运营优化" :value="4" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="业务类型" prop="businessType">
          <el-input v-model="requestForm.businessType" placeholder="请输入业务类型" />
          <div class="form-tip">审核或风险类型时必填</div>
        </el-form-item>
        
        <el-form-item label="业务ID" prop="businessId">
          <el-input v-model="requestForm.businessId" type="number" placeholder="请输入业务ID" />
          <div class="form-tip">审核建议时必填</div>
        </el-form-item>
        
        <el-form-item label="说明" prop="additionalQuestion">
          <el-input
            v-model="requestForm.additionalQuestion"
            type="textarea"
            :rows="3"
            placeholder="请输入说明"
          />
        </el-form-item>
        
        <el-form-item label="自动执行" prop="autoExecute">
          <el-switch v-model="requestForm.autoExecute" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitRequest" :loading="submitting">发送请求</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    
    <!-- 结果展示 -->
    <el-card v-if="responseData" class="result-card" :loading="submitting">
      <template #header>
        <div class="result-header">
          <span>AI决策结果</span>
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
        <h4 class="section-title">建议操作列表</h4>
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
import {
  getPriorityType,
  getPriorityText as getPriorityName
} from '@/utils/statusMaps'

// 请求表单
const requestForm = reactive({
  decisionType: 0,
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
    decisionType: [
      { required: true, message: '请选择决策类型', trigger: 'change' }
    ],
    businessType: [
      {
        required: () => requestForm.decisionType === 0 || requestForm.decisionType === 3,
        message: '审核或风险类型时业务类型必填',
        trigger: ['blur', 'change']
      }
    ],
    businessId: [
      {
        required: () => requestForm.decisionType === 0,
        message: '审核建议时业务ID必填',
        trigger: ['blur', 'change']
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
      authApi.requestAIDecision(requestData)
        .then(response => {
          // 响应拦截器已经处理了code判断，直接返回了data
          responseData.value = response
          ElMessage.success('请求成功')
        })
        .catch(error => {
          console.error('请求失败:', error)
          ElMessage.error('请求失败: ' + (error.message || '网络错误'))
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
.ai-decision-request-container {
  padding: 20px 0;
}

.page-subtitle {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 20px;
  color: var(--color-text-primary);
}

.form-card {
  margin-bottom: 20px;
}

.form-tip {
  font-size: 12px;
  color: var(--color-text-secondary);
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
  color: var(--color-text-primary);
}

.analysis-content {
  background-color: var(--color-bg-page);
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
  color: var(--color-text-regular);
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
  color: var(--color-text-primary);
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
  color: var(--color-text-primary);
  margin: 0;
}

.params-content {
  background-color: var(--color-bg-page);
  padding: 10px;
  border-radius: 4px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-primary);
  margin: 0;
  overflow-x: auto;
}
</style>