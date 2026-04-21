<template>
  <div class="notice-broadcast">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>发送系统公告</span>
        </div>
      </template>
      
      <el-form :model="form" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入公告标题" maxlength="50" show-word-limit />
        </el-form-item>
        
        <el-form-item label="公告内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="10"
            placeholder="请输入公告内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            <el-icon><Document /></el-icon>
            发送公告
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Refresh } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'

// 表单数据
const form = ref({
  title: '',
  content: ''
})

// 表单验证规则
const rules = ref({
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
    { min: 1, max: 50, message: '公告标题长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' },
    { min: 1, max: 500, message: '公告内容长度在 1 到 500 个字符', trigger: 'blur' }
  ]
})

// 表单引用
const formRef = ref(null)

// 加载状态
const loading = ref(false)

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    await authApi.broadcastNotice(form.value)
    ElMessage.success('系统公告发送成功')
    
    // 重置表单
    handleReset()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('系统公告发送失败')
      console.error('发送系统公告失败:', error)
    }
  } finally {
    loading.value = false
  }
}

// 重置表单
const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}
</script>

<style scoped>
.notice-broadcast {
  padding: 0 20px 20px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

/* 表单样式优化 */
:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

:deep(.el-form-item__label.is-required:not(.is-no-asterisk)::before) {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
  font-weight: bold;
}

:deep(.el-input__wrapper),
:deep(.el-select__wrapper),
:deep(.el-textarea__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover),
:deep(.el-select__wrapper:hover),
:deep(.el-textarea__wrapper:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-input__wrapper.is-focus),
:deep(.el-select__wrapper.is-focus),
:deep(.el-textarea__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.el-textarea) {
  resize: vertical;
}

:deep(.el-textarea__inner) {
  min-height: 120px;
}

/* 字符数统计样式 */
:deep(.el-input__count) {
  color: #909399;
  font-size: 12px;
  padding-top: 4px;
}

:deep(.el-textarea__count) {
  color: #909399;
  font-size: 12px;
  padding-top: 4px;
  text-align: right;
}

/* 按钮样式优化 */
:deep(.el-button) {
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
}

:deep(.el-button--primary:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

:deep(.el-button--default) {
  color: #606266;
  border-color: #dcdfe6;
  background-color: #fff;
}

:deep(.el-button--default:hover) {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

/* 表单布局优化 */
@media screen and (max-width: 768px) {
  :deep(.el-form-item) {
    margin-bottom: 16px;
  }
  
  :deep(.el-form-item__label) {
    font-size: 13px;
  }
  
  :deep(.el-textarea__inner) {
    min-height: 100px;
  }
}
</style>