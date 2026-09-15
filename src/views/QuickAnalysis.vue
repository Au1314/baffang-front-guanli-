<template>
  <div class="quick-analysis-container">
    <el-card shadow="never" class="analysis-card">
      <template #header>
        <div class="card-header">
          <el-button 
            type="default" 
            @click="$router.push('/statistics')"
            size="small"
            class="back-button"
          >
            <el-icon><ArrowLeft /></el-icon>
            返回统计
          </el-button>
          <span>快速分析</span>
          <el-tooltip content="输入问题获取AI分析报告" placement="top">
            <el-icon class="header-icon"><QuestionFilled /></el-icon>
          </el-tooltip>
        </div>
      </template>
      
      <div class="analysis-content">
        <!-- 问题输入区域 -->
        <div class="input-section">
          <el-row :gutter="15" align="middle">
            <el-col :span="20">
              <el-input
                v-model="question"
                placeholder="请输入您要分析的问题，例如：用户总数"
                clearable
                @keyup.enter="handleAnalysis"
                :disabled="loading"
                class="analysis-input"
              >
                <template #append>
                  <el-button 
                    type="primary" 
                    @click="handleAnalysis"
                    :loading="loading"
                    :disabled="!question.trim()"
                    size="large"
                    v-if="!loading"
                  >
                    <el-icon><Search /></el-icon>
                    开始分析
                  </el-button>
                  <el-button 
                    type="danger" 
                    @click="cancelAnalysis"
                    size="large"
                    v-else
                  >
                    <el-icon><Close /></el-icon>
                    取消分析
                  </el-button>
                </template>
              </el-input>
            </el-col>
          </el-row>
          <div class="tip-text">
            <el-icon size="14"><InfoFilled /></el-icon>
            <span>支持多种分析维度，例如：用户增长趋势、充电桩使用情况、订单数据分析等</span>
          </div>
        </div>
        
        <!-- 分析结果区域 -->
        <div v-if="analysisResult" class="result-section">
          <div class="result-header">
            <span class="result-title">分析报告</span>
            <el-tag type="success" size="small">生成时间: {{ formatTime(analysisResult.analysisTime) }}</el-tag>
            <el-tag type="info" size="small">耗时: {{ analysisResult.costMs }}ms</el-tag>
          </div>
          <el-divider />
          <div class="result-content" v-html="renderMarkdown(analysisResult.analysis)"></div>
        </div>
        
        <!-- 错误状态，显示重试按钮 -->
        <div v-if="errorState && !loading" class="error-section">
          <el-alert
            title="分析失败"
            :description="errorMessage"
            type="error"
            show-icon
            :closable="false"
          >
            <template #default>
              <div class="error-actions">
                <el-button 
                  type="primary" 
                  size="small"
                  @click="retryAnalysis"
                  :icon="RefreshRight"
                >
                  重试分析
                </el-button>
                <el-button 
                  size="small"
                  @click="errorState = false"
                >
                  关闭
                </el-button>
              </div>
            </template>
          </el-alert>
        </div>
        
        <!-- 空状态 -->
        <div v-else-if="!loading && !analysisResult" class="empty-state">
          <div class="empty-content">
            <el-icon class="empty-icon"><Document /></el-icon>
            <div class="empty-text">
              <h3>开始智能分析</h3>
              <p>输入您的问题，获取AI生成的详细分析报告</p>
            </div>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <div class="loading-content">
            <el-skeleton :rows="15" animated />
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Search, QuestionFilled, InfoFilled, Document, Close, RefreshRight } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'

// 问题输入
const question = ref('')
// 加载状态
const loading = ref(false)
// 分析结果
const analysisResult = ref(null)
// AbortController，用于取消请求
const abortController = ref(null)
// 错误状态，用于显示重试按钮
const errorState = ref(false)
// 错误信息
const errorMessage = ref('')

// 处理分析请求
const handleAnalysis = async () => {
  if (!question.value.trim()) {
    ElMessage.warning('请输入要分析的问题')
    return
  }
  
  // 清除之前的结果和错误
  analysisResult.value = null
  errorState.value = false
  errorMessage.value = ''
  loading.value = true
  
  try {
    abortController.value = new AbortController()

    const result = await authApi.quickAnalysis(question.value.trim(), {
      signal: abortController.value.signal
    })
    analysisResult.value = result
    ElMessage.success('分析完成')
  } catch (error) {
    // 忽略取消请求的错误（axios v1 取消时 code === 'ERR_CANCELED'）
    if (error.code === 'ERR_CANCELED' || error.name === 'CanceledError') {
      ElMessage.info('分析已取消')
      return
    }
    
    console.error('分析失败:', error)
    // 更详细的错误信息
    let errorMsg = '分析失败，请稍后重试'
    if (error.code === 'ECONNABORTED') {
      errorMsg = '分析请求超时，请稍后重试'
    } else if (error.response?.data?.message) {
      errorMsg = error.response.data.message
    } else if (error.response?.data?.msg) {
      errorMsg = error.response.data.msg
    } else if (error.message) {
      errorMsg = error.message
    }
    
    // 保存错误信息，用于显示重试按钮
    errorMessage.value = errorMsg
    errorState.value = true
    ElMessage.error(errorMsg)
  } finally {
    loading.value = false
    abortController.value = null
  }
}

// 取消分析请求
const cancelAnalysis = () => {
  if (abortController.value) {
    abortController.value.abort()
  }
}

// 重试分析请求
const retryAnalysis = () => {
  handleAnalysis()
}


// 渲染Markdown
const renderMarkdown = (content) => {
  // 简单的Markdown渲染，处理标题、列表、粗体等基本格式
  if (!content) return ''
  
  let html = content
  
  // 标题处理
  html = html.replace(/^## (.*$)/gm, '<h2 class="md-h2">$1</h2>')
  html = html.replace(/^### (.*$)/gm, '<h3 class="md-h3">$1</h3>')
  
  // 粗体处理
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="md-bold">$1</strong>')
  
  // 列表处理
  html = html.replace(/^1\. (.*$)/gm, '<li class="md-list-item">$1</li>')
  html = html.replace(/(<li.*?<\/li>)/gs, '<ol class="md-list">$1</ol>')
  
  // 换行处理
  html = html.replace(/\n/g, '<br>')
  
  return html
}

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return ''
  return timeStr
}
</script>

<style scoped>
.quick-analysis-container {
  padding: 0 20px 20px;
}

.analysis-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text-primary);
  gap: 10px;
}

.back-button {
  margin-right: 10px;
}

.header-icon {
  font-size: 20px;
  color: var(--color-text-secondary);
  cursor: help;
}

.analysis-content {
  padding: 20px 0;
}

.input-section {
  margin-bottom: 30px;
}

.analysis-input {
  font-size: 16px;
}

.tip-text {
  margin-top: 10px;
  color: var(--color-text-secondary);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}

.result-section {
  background-color: #fafafa;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid var(--color-border-lighter);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  flex-wrap: wrap;
}

.result-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.result-content {
  line-height: 1.8;
  color: var(--color-text-primary);
  font-size: 15px;
}

/* Markdown样式 */
.result-content :deep(.md-h2) {
  font-size: 22px;
  font-weight: bold;
  color: var(--color-text-primary);
  margin: 25px 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--color-primary);
}

.result-content :deep(.md-h3) {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text-primary);
  margin: 20px 0 10px 0;
}

.result-content :deep(.md-bold) {
  font-weight: bold;
  color: var(--color-text-primary);
}

.result-content :deep(.md-list) {
  padding-left: 25px;
  margin: 15px 0;
}

.result-content :deep(.md-list-item) {
  margin: 8px 0;
}

.empty-state {
  padding: 60px 0;
  text-align: center;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.empty-icon {
  font-size: 64px;
  color: var(--color-text-placeholder);
}

.empty-text h3 {
  font-size: 20px;
  font-weight: bold;
  color: var(--color-text-primary);
  margin-bottom: 8px;
}

.empty-text p {
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
}

.loading-state {
  padding: 20px;
}

.loading-content {
  background-color: #fafafa;
  padding: 25px;
  border-radius: 8px;
  border: 1px solid var(--color-border-lighter);
}
</style>