<template>
  <div class="risk-assessment-container">
    <h2 class="page-title">AI风险评估</h2>
    
    <!-- 风险评估表单 -->
    <el-card class="query-card">
      <el-form :model="queryParams" label-width="100px" class="demo-form" :rules="formRules" ref="formRef">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="业务类型" prop="businessType">
              <el-select v-model="queryParams.businessType" placeholder="请选择业务类型" style="width: 100%">
                <el-option label="用户" value="USER"></el-option>
                <el-option label="订单" value="ORDER"></el-option>
                <el-option label="充电" value="CHARGING"></el-option>
                <el-option label="支付" value="PAYMENT"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="业务ID" prop="businessId">
              <el-input v-model="queryParams.businessId" placeholder="请输入业务ID" style="width: 100%"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="8" class="button-col">
            <el-form-item>
              <el-button type="primary" @click="handleSubmit" :loading="loading" class="submit-btn">
                <el-icon><CircleCheck /></el-icon> 提交评估
              </el-button>
              <el-button @click="resetForm" class="reset-btn">
                <el-icon><RefreshLeft /></el-icon> 重置
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>
    
    <!-- 风险评估结果 -->
    <el-card v-if="assessmentResult" class="result-card">
      <template #header>
        <div class="card-header">
          <span>风险评估结果</span>
        </div>
      </template>
      
      <!-- 基本信息 -->
      <div class="basic-info">
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="info-item">
              <div class="info-label">风险等级</div>
              <div class="info-value" :class="riskLevelClass">
                {{ assessmentResult.analysis.riskLevel || '未知' }}
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="info-item">
              <div class="info-label">置信度</div>
              <div class="info-value confidence">
                {{ assessmentResult.analysis.confidence || 0 }}%
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="info-item">
              <div class="info-label">优先级</div>
              <div class="info-value priority">
                {{ assessmentResult.analysis.priority || 0 }}
              </div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="info-item">
              <div class="info-label">自动执行</div>
              <div class="info-value">
                <el-tag :type="assessmentResult.willAutoExecute ? 'success' : 'info'">
                  {{ assessmentResult.willAutoExecute ? '是' : '否' }}
                </el-tag>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
      
      <!-- 风险因素 -->
      <el-divider orientation="left" class="section-divider">风险因素</el-divider>
      <el-table :data="assessmentResult.analysis.riskFactors" border style="width: 100%" v-if="assessmentResult.analysis.riskFactors && assessmentResult.analysis.riskFactors.length > 0">
        <el-table-column prop="factor" label="风险因子" min-width="200"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="400"></el-table-column>
      </el-table>
      <el-empty v-else description="暂无风险因素"></el-empty>
      
      <!-- 建议操作 -->
      <el-divider orientation="left" class="section-divider">建议操作</el-divider>
      <el-table :data="assessmentResult.suggestedActions" border style="width: 100%" v-if="assessmentResult.suggestedActions && assessmentResult.suggestedActions.length > 0">
        <el-table-column prop="actionName" label="操作名称" min-width="150"></el-table-column>
        <el-table-column prop="actionType" label="操作类型" min-width="150"></el-table-column>
        <el-table-column prop="description" label="描述" min-width="300"></el-table-column>
        <el-table-column prop="autoExecutable" label="是否自动执行" min-width="120">
          <template #default="scope">
            <el-tag :type="scope.row.autoExecutable ? 'success' : 'info'">
              {{ scope.row.autoExecutable ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作参数" min-width="200">
          <template #default="scope">
            <el-button type="primary" link @click="showParams(scope.row.params)">
              查看参数
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="暂无建议操作"></el-empty>
    </el-card>
    
    <!-- 加载状态 -->
    <el-card v-if="loading" class="loading-card">
      <div class="loading-content">
        <el-skeleton :rows="8" animated />
      </div>
    </el-card>
    
    <!-- 操作参数详情弹窗 -->
    <el-dialog v-model="paramsDialogVisible" title="操作参数" width="50%" append-to-body>
      <pre class="json-content">{{ formatJson(dialogParams) }}</pre>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import { ElMessage } from 'element-plus'
import { CircleCheck, RefreshLeft } from '@element-plus/icons-vue'

// 查询参数
const queryParams = ref({
  businessType: '',
  businessId: ''
})

// 表单引用
const formRef = ref(null)

// 表单验证规则
const formRules = {
  businessType: [
    { required: true, message: '请选择业务类型', trigger: 'change' }
  ],
  businessId: [
    { required: true, message: '请输入业务ID', trigger: 'blur' }
  ]
}

// 评估结果
const assessmentResult = ref(null)

// 加载状态
const loading = ref(false)

// 弹窗相关
const paramsDialogVisible = ref(false)
const dialogParams = ref({})

// 风险等级样式
const riskLevelClass = computed(() => {
  const level = assessmentResult.value?.analysis?.riskLevel
  switch (level) {
    case 'HIGH':
      return 'high'
    case 'MEDIUM':
      return 'medium'
    case 'LOW':
      return 'low'
    default:
      return ''
  }
})

// 格式化JSON数据的辅助函数
const formatJson = (data) => {
  if (!data) return '无'
  try {
    return JSON.stringify(data, null, 2)
  } catch (error) {
    return data
  }
}

// 显示操作参数
const showParams = (params) => {
  dialogParams.value = params
  paramsDialogVisible.value = true
}

// 提交评估
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    
    loading.value = true
    assessmentResult.value = null
    
    // 调用API获取风险评估结果
    const response = await authApi.riskAssessment({
      businessType: queryParams.value.businessType,
      businessId: queryParams.value.businessId
    })
    
    // 解析analysis字段中的JSON字符串
    const result = { ...response }
    if (result.analysis) {
      try {
        // 提取```json和```之间的内容
        const jsonMatch = result.analysis.match(/```json\n([\s\S]*?)\n```/)
        if (jsonMatch && jsonMatch[1]) {
          result.analysis = JSON.parse(jsonMatch[1])
        }
      } catch (error) {
        console.error('解析analysis字段失败:', error)
        result.analysis = {}
      }
    }
    
    assessmentResult.value = result
    ElMessage.success('风险评估完成')
  } catch (error) {
    console.error('风险评估失败:', error)
    if (error !== false) {
      ElMessage.error('风险评估失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
  assessmentResult.value = null
}
</script>

<style scoped>
.risk-assessment-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
  color: var(--color-text-primary);
  text-align: center;
}

.query-card {
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.demo-form {
  padding: 20px 0;
}

.button-col {
  display: flex;
  align-items: flex-end;
}

.submit-btn {
  margin-right: 10px;
}

.result-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin-bottom: 20px;
}

.loading-card {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin-bottom: 20px;
}

.basic-info {
  margin-bottom: 20px;
  padding: 10px 0;
}

.info-item {
  text-align: center;
  padding: 20px;
  background-color: var(--color-bg-page);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
}

.info-label {
  font-size: 14px;
  color: var(--color-text-regular);
  margin-bottom: 12px;
}

.info-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.info-value.high {
  color: var(--color-danger);
}

.info-value.medium {
  color: var(--color-warning);
}

.info-value.low {
  color: var(--color-success);
}

.info-value.confidence {
  color: var(--color-primary);
}

.info-value.priority {
  color: var(--color-text-secondary);
}

.section-divider {
  margin: 25px 0;
}

.loading-content {
  padding: 20px 0;
}

.json-content {
  background-color: var(--color-bg-page);
  padding: 15px;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-text-primary);
  max-height: 400px;
  overflow-y: auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .risk-assessment-container {
    padding: 10px;
  }
  
  .el-col {
    margin-bottom: 10px;
  }
  
  .button-col {
    justify-content: flex-start;
    margin-top: 10px;
  }
}
</style>