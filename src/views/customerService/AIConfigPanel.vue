<template>
  <el-card shadow="hover" class="config-card">
    <template #header>
      <div class="config-card-header">
        <el-icon class="card-icon"><Cpu /></el-icon>
        <span>AI客服参数配置</span>
      </div>
    </template>

    <el-form :model="aiConfigForm" label-width="150px" class="ai-config-form">
      <!-- 基本配置 -->
      <el-divider>基本配置</el-divider>

      <el-form-item label="AI客服开关" required>
        <el-switch v-model="aiConfigForm.aiEnabled" />
      </el-form-item>

      <el-form-item label="欢迎语" required>
        <el-input
          v-model="aiConfigForm.aiWelcomeMessage"
          type="textarea"
          rows="3"
          placeholder="请输入AI客服欢迎语"
        />
      </el-form-item>

      <el-form-item label="离线消息" required>
        <el-input
          v-model="aiConfigForm.offlineMessage"
          type="textarea"
          rows="3"
          placeholder="请输入非工作时间的回复"
        />
      </el-form-item>

      <!-- API配置 -->
      <el-divider>API配置</el-divider>

      <el-form-item label="API Key" required>
        <el-input
          v-model="aiConfigForm.aiApiKey"
          type="password"
          placeholder="请输入AI API Key"
          show-password
        />
      </el-form-item>

      <el-form-item label="API URL" required>
        <el-input
          v-model="aiConfigForm.aiApiUrl"
          placeholder="请输入AI API URL"
        />
      </el-form-item>

      <el-form-item label="模型名称" required>
        <el-input
          v-model="aiConfigForm.aiModel"
          placeholder="请输入AI模型名称"
        />
      </el-form-item>

      <!-- 模型参数配置 -->
      <el-divider>模型参数配置</el-divider>

      <el-form-item label="最大Token数" required>
        <el-input-number
          v-model="aiConfigForm.aiMaxTokens"
          :min="100"
          :max="2000"
          :step="100"
        />
      </el-form-item>

      <el-form-item label="温度参数" required>
        <el-slider
          v-model="aiConfigForm.aiTemperature"
          :min="0"
          :max="2"
          :step="0.1"
          show-input
        />
      </el-form-item>

      <el-form-item label="系统提示词" required>
        <el-input
          v-model="aiConfigForm.aiSystemPrompt"
          type="textarea"
          rows="5"
          placeholder="请输入AI系统提示词"
        />
      </el-form-item>

      <!-- 转人工配置 -->
      <el-divider>转人工配置</el-divider>

      <el-form-item label="转人工触发词" required>
        <el-select
          v-model="aiConfigForm.transferKeywords"
          multiple
          placeholder="请选择或输入转人工触发词"
          style="width: 100%"
        >
          <el-option
            v-for="keyword in ['人工', '转人工', '人工客服', '真人']"
            :key="keyword"
            :label="keyword"
            :value="keyword"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="自动转人工阈值" required>
        <el-input-number
          v-model="aiConfigForm.autoTransferThreshold"
          :min="1"
          :max="10"
          :step="1"
        />
      </el-form-item>

      <!-- 工作时间配置 -->
      <el-divider>工作时间配置</el-divider>

      <el-form-item label="工作时间开始" required>
        <el-time-picker
          v-model="aiConfigForm.workingHoursStart"
          format="HH:mm"
          value-format="HH:mm"
          placeholder="请选择工作时间开始"
        />
      </el-form-item>

      <el-form-item label="工作时间结束" required>
        <el-time-picker
          v-model="aiConfigForm.workingHoursEnd"
          format="HH:mm"
          value-format="HH:mm"
          placeholder="请选择工作时间结束"
        />
      </el-form-item>

      <!-- 按钮区域 -->
      <el-form-item>
        <div class="form-actions">
          <el-button type="primary" @click="saveAIConfig" :loading="configLoading">
            保存配置
          </el-button>
          <el-button @click="resetAIConfig">
            重置
          </el-button>
        </div>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Cpu } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'

// AI客服配置
const configLoading = ref(false)
const aiConfigForm = reactive({
  aiEnabled: true,
  aiWelcomeMessage: '您好，欢迎使用我们的AI客服服务，有什么可以帮助您的吗？',
  aiApiKey: '',
  aiApiUrl: 'https://api.openai.com/v1/chat/completions',
  aiModel: 'gpt-3.5-turbo',
  aiMaxTokens: 500,
  aiTemperature: 0.7,
  aiSystemPrompt: '你是八方出行的智能客服助手，负责解答用户关于拖车、救援、代驾等服务的问题。请用简洁、专业、友好的语气回复用户。',
  autoTransferThreshold: 3,
  offlineMessage: '当前非工作时间，请留言或稍后再试，工作时间：09:00-18:00',
  transferKeywords: ['人工', '转人工', '人工客服', '真人'],
  workingHoursStart: '09:00',
  workingHoursEnd: '18:00'
})

// 获取AI配置
const fetchAIConfig = async () => {
  try {
    configLoading.value = true
    const response = await authApi.getAICustomerConfig()
    const aiConfigData = response?.data || {}
    const configData = {
      ...aiConfigData,
      workingHoursStart: aiConfigData.workingHoursStart || '09:00',
      workingHoursEnd: aiConfigData.workingHoursEnd || '18:00'
    }
    Object.assign(aiConfigForm, configData)
    ElMessage.success('AI客服配置获取成功')
  } catch (error) {
    console.error('获取AI配置失败:', error)
    console.error('错误详情:', error.response?.data || error.message)
  } finally {
    configLoading.value = false
  }
}

// 保存AI配置
const saveAIConfig = async () => {
  try {
    configLoading.value = true
    await authApi.updateAICustomerConfig(aiConfigForm)
    ElMessage.success('AI客服配置保存成功')
  } catch (error) {
    console.error('保存AI配置失败:', error)
  } finally {
    configLoading.value = false
  }
}

// 重置AI配置
const resetAIConfig = () => {
  Object.assign(aiConfigForm, {
    aiEnabled: true,
    aiWelcomeMessage: '您好，欢迎使用我们的AI客服服务，有什么可以帮助您的吗？',
    aiApiKey: '',
    aiApiUrl: 'https://api.openai.com/v1/chat/completions',
    aiModel: 'gpt-3.5-turbo',
    aiMaxTokens: 500,
    aiTemperature: 0.7,
    aiSystemPrompt: '你是八方出行的智能客服助手，负责解答用户关于拖车、救援、代驾等服务的问题。请用简洁、专业、友好的语气回复用户。',
    autoTransferThreshold: 3,
    offlineMessage: '当前非工作时间，请留言或稍后再试，工作时间：09:00-18:00',
    transferKeywords: ['人工', '转人工', '人工客服', '真人'],
    workingHoursStart: '09:00',
    workingHoursEnd: '18:00'
  })
}

onMounted(() => {
  fetchAIConfig()
})
</script>

<style scoped>
/* AI配置样式 */
.config-card {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.06);
}

.config-card-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  padding: 16px 20px;
  background-color: #f9fafb;
  border-bottom: 1px solid #f0f0f0;
}

.card-icon {
  margin-right: 10px;
  color: var(--color-primary);
  font-size: 18px;
}

.ai-config-form {
  margin-top: 24px;
  padding: 0 20px 20px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-start;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
}

/* 按钮样式优化 */
:deep(.el-button) {
  border-radius: 8px;
  transition: all 0.3s ease;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  position: relative;
  overflow: hidden;
}

:deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

:deep(.el-button:active) {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(64, 158, 255, 0.3);
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
  transition: all 0.3s;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
