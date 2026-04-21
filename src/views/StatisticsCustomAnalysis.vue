<template>
  <div class="custom-analysis-container">
    <el-card shadow="never" class="analysis-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button type="default" @click="$router.push('/statistics')">
              <el-icon><Back /></el-icon>
              返回统计模块
            </el-button>
            <span class="page-title">自定义问题分析</span>
          </div>
        </div>
      </template>

      <!-- 分析参数表单 -->
      <el-card class="form-card">
        <el-form :model="analysisForm" label-width="120px" class="analysis-form">
          <el-row :gutter="20">
            <el-col :span="18">
              <el-form-item label="分析问题" required>
                <el-input
                  v-model="analysisForm.question"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入您想分析的问题，例如：哪些区域的充电站最少？应该优先在哪里新增充电站？"
                />
              </el-form-item>
            </el-col>
            <el-col :span="6" class="form-action-col">
              <el-form-item>
                <el-checkbox v-model="analysisForm.includeRawData">包含原始数据</el-checkbox>
              </el-form-item>
              <el-button
                type="primary"
                @click="startAnalysis"
                :loading="loading"
                class="analysis-button"
              >
                <el-icon v-if="!loading"><Search /></el-icon>
                <el-icon v-else><Loading /></el-icon>
                {{ loading ? '分析中...' : '开始分析' }}
              </el-button>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <!-- 数据加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>

      <!-- 数据分析结果 -->
      <div v-else-if="analysisResult" class="analysis-content">
        <!-- 分析信息 -->
        <el-card class="analysis-info-card">
          <div class="analysis-meta">
            <div class="meta-item">
              <span class="meta-label">分析问题：</span>
              <span class="question-text">{{ analysisResult.question }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">分析时间：</span>
              <span>{{ analysisResult.analysisTime }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">处理耗时：</span>
              <span>{{ (analysisResult.costMs / 1000).toFixed(2) }}秒</span>
            </div>
          </div>
        </el-card>

        <!-- AI分析结果 -->
        <el-card class="analysis-result-card">
          <template #header>
            <div class="card-subheader">
              <span>AI分析结论</span>
            </div>
          </template>
          <div class="analysis-text" v-html="analysisResult.analysis"></div>
        </el-card>

        <!-- 原始数据展示 -->
        <el-card v-if="analysisForm.includeRawData" class="raw-data-card">
          <template #header>
            <div class="card-subheader">
              <span>原始数据</span>
            </div>
          </template>
          <div v-if="!analysisResult.rawData" class="empty-data">
            <el-empty description="原始数据为空" />
          </div>
          <div v-else class="raw-data-content">
            <pre>{{ JSON.stringify(analysisResult.rawData, null, 2) }}</pre>
          </div>
        </el-card>
      </div>

      <!-- 数据加载失败 -->
      <div v-else class="error-container">
        <el-empty description="暂无分析结果" />
        <p class="hint-text">请填写分析问题，点击开始分析获取结果</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { Back, Search, Loading } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'

// 加载状态
const loading = ref(false)
// 分析结果
const analysisResult = ref(null)

// 分析表单
const analysisForm = reactive({
  question: '',
  includeRawData: true
})

// 开始分析
const startAnalysis = async () => {
  // 表单验证
  if (!analysisForm.question.trim()) {
    ElMessage.warning('请输入分析问题')
    return
  }

  try {
    loading.value = true
    const data = await authApi.customAnalysis(analysisForm)
    analysisResult.value = data
    ElMessage.success('分析完成')
  } catch (error) {
    console.error('获取自定义问题分析失败:', error)
    ElMessage.error('分析失败，请稍后重试')
    analysisResult.value = null
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.custom-analysis-container {
  padding: 0 20px 20px;
}

.analysis-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.form-card {
  margin-bottom: 20px;
}

.analysis-form {
  padding: 10px 0;
}

.form-action-col {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.analysis-button {
  width: 100%;
  margin-top: 10px;
}

.loading-container {
  padding: 20px 0;
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.analysis-info-card {
  margin-bottom: 20px;
}

.analysis-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  align-items: flex-start;
}

.meta-item {
  display: flex;
  align-items: flex-start;
  gap: 5px;
}

.meta-label {
  color: #606266;
  font-size: 14px;
  font-weight: bold;
  min-width: 80px;
  flex-shrink: 0;
}

.question-text {
  color: #303133;
  font-size: 14px;
  word-break: break-word;
  max-width: 80%;
}

.analysis-result-card {
  background-color: #f0f9ff;
  border-left: 4px solid #3b82f6;
}

.analysis-text {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #303133;
}

.raw-data-card {
  background-color: #fafafa;
}

.raw-data-content {
  background-color: #fff;
  padding: 15px;
  border-radius: 4px;
  overflow-x: auto;
}

.raw-data-content pre {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  color: #303133;
}

.empty-data {
  padding: 20px 0;
}

.error-container {
  text-align: center;
  padding: 40px 0;
}

.hint-text {
  color: #909399;
  margin-top: 10px;
}

.card-subheader {
  font-size: 14px;
  font-weight: bold;
  color: #606266;
}
</style>