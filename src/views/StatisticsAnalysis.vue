<template>
  <div class="statistics-analysis">
    <el-card shadow="never" class="analysis-card">
      <template #header>
        <div class="card-header">
          <span>智能分析</span>
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
              >
                <template #append>
                  <el-button 
                    type="primary" 
                    @click="handleAnalysis"
                    :loading="loading"
                    :disabled="!question.trim()"
                  >
                    <el-icon><Search /></el-icon>
                    快速分析
                  </el-button>
                </template>
              </el-input>
            </el-col>
          </el-row>
        </div>
        
        <!-- 分析结果区域 -->
        <div v-if="analysisResult" class="result-section">
          <div class="result-header">
            <span class="result-title">分析报告</span>
            <el-tag type="success" size="small">生成时间: {{ formatTime(analysisResult.analysisTime) }}</el-tag>
          </div>
          <el-divider />
          <div class="result-content" v-html="renderMarkdown(analysisResult.analysis)"></div>
        </div>
        
        <!-- 空状态 -->
        <div v-else-if="!loading" class="empty-state">
          <el-empty description="请输入问题进行智能分析" />
        </div>
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-state">
          <el-skeleton :rows="10" animated />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Search, QuestionFilled } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'

// 问题输入
const question = ref('')
// 加载状态
const loading = ref(false)
// 分析结果
const analysisResult = ref(null)

// 处理分析请求
const handleAnalysis = async () => {
  if (!question.value.trim()) {
    ElMessage.warning('请输入要分析的问题')
    return
  }
  
  loading.value = true
  try {
    const result = await authApi.quickAnalysis(question.value.trim())
    analysisResult.value = result.data
    ElMessage.success('分析完成')
  } catch (error) {
    console.error('分析失败:', error)
    ElMessage.error('分析失败，请稍后重试')
  } finally {
    loading.value = false
  }
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
.statistics-analysis {
  margin-bottom: 20px;
}

.analysis-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.header-icon {
  font-size: 18px;
  color: #909399;
  cursor: help;
}

.analysis-content {
  padding: 10px 0;
}

.input-section {
  margin-bottom: 20px;
}

.result-section {
  background-color: #fafafa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.result-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.result-content {
  line-height: 1.8;
  color: #303133;
}

/* Markdown样式 */
.result-content :deep(.md-h2) {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
  margin: 20px 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.result-content :deep(.md-h3) {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin: 15px 0 10px 0;
}

.result-content :deep(.md-bold) {
  font-weight: bold;
  color: #303133;
}

.result-content :deep(.md-list) {
  padding-left: 20px;
  margin: 10px 0;
}

.result-content :deep(.md-list-item) {
  margin: 5px 0;
}

.empty-state {
  padding: 40px 0;
  text-align: center;
}

.loading-state {
  padding: 20px;
}
</style>