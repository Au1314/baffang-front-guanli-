<template>
  <div class="notice-batch-send">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>批量发送通知</span>
        </div>
      </template>
      
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="用户ID" prop="userIds">
          <el-input
            v-model="form.userIds"
            placeholder="请输入用户ID，多个ID可用逗号、空格、分号或点号分隔（例如：1,2,3 4.5;6）"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="通知标题" prop="title">
          <el-input
            v-model="form.title"
            placeholder="请输入通知标题"
            maxlength="50"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="通知内容" prop="content">
          <el-input
            v-model="form.content"
            type="textarea"
            :rows="8"
            placeholder="请输入通知内容"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="通知类型" prop="type">
          <el-select v-model="form.type" placeholder="请选择通知类型">
            <el-option label="系统公告" :value="0" />
            <el-option label="充电通知" :value="1" />
            <el-option label="预约通知" :value="2" />
            <el-option label="V2V通知" :value="3" />
            <el-option label="紧急呼叫通知" :value="4" />
            <el-option label="订单通知" :value="5" />
            <el-option label="审核通知" :value="6" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="关联ID" prop="relatedId">
          <el-input
            v-model="form.relatedId"
            placeholder="请输入关联ID（可选）"
            type="number"
            min="1"
          />
        </el-form-item>
        
        <el-form-item label="关联类型" prop="relatedType">
          <el-select v-model="form.relatedType" placeholder="请选择关联类型（可选）">
            <el-option label="订单" :value="0" />
            <el-option label="预约" :value="1" />
            <el-option label="V2V呼叫" :value="2" />
            <el-option label="紧急呼叫" :value="3" />
            <el-option label="帖子" :value="4" />
            <el-option label="评价" :value="5" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">
            <el-icon><Document /></el-icon>
            发送通知
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
  userIds: '',
  title: '',
  content: '',
  type: null,
  relatedId: null,
  relatedType: null
})

// 表单验证规则
const rules = ref({
  userIds: [
    { required: true, message: '请输入用户ID', trigger: ['blur', 'submit'] },
    { 
      validator: (rule, value, callback) => {
        if (!value) {
          callback()
          return
        }
        // 验证输入的用户ID是否为数字，支持多种分隔符（逗号、空格、分号、点号等）
        if (!/^\d+([,\s;.]+\d+)*$/.test(value)) {
          callback(new Error('用户ID必须为数字，多个ID用逗号、空格、分号或点号分隔'))
          return
        }
        callback()
      },
      trigger: ['blur', 'submit']
    }
  ],
  title: [
    { required: true, message: '请输入通知标题', trigger: 'blur' },
    { min: 1, max: 50, message: '通知标题长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入通知内容', trigger: 'blur' },
    { min: 1, max: 500, message: '通知内容长度在 1 到 500 个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择通知类型', trigger: 'change' },
    { type: 'number', min: 0, max: 6, message: '通知类型必须在0-6之间', trigger: 'change' }
  ],
  relatedId: [
    {
      validator: (rule, value, callback) => {
        if (value === null || value === undefined || value === '') {
          callback() // 可选字段，为空时直接通过
        } else {
          const numValue = Number(value)
          if (isNaN(numValue) || numValue < 1) {
            callback(new Error('关联ID必须为正整数'))
          } else {
            callback()
          }
        }
      },
      trigger: 'blur'
    }
  ],
  relatedType: [
    {
      validator: (rule, value, callback) => {
        if (value === null || value === undefined || value === '') {
          callback() // 可选字段，为空时直接通过
        } else {
          const numValue = Number(value)
          if (isNaN(numValue) || numValue < 0 || numValue > 5) {
            callback(new Error('关联类型必须在0-5之间'))
          } else {
            callback()
          }
        }
      },
      trigger: 'change'
    }
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
    
    // 处理用户ID，转换为数组，支持多种分隔符（逗号、空格、分号、点号等）
    const userIds = form.value.userIds
      .replace(/[,\s;.]+/g, ',') // 将多种分隔符替换为逗号
      .split(',')
      .map(id => id.trim())
      .filter(id => id !== '')
      .map(id => parseInt(id, 10))
    
    
    // 检查用户ID数组是否为空
    if (userIds.length === 0) {
      ElMessage.error('用户列表不能为空')
      loading.value = false
      return
    }
    
    // 准备提交数据
    const submitData = {
      userIds: userIds,
      title: form.value.title,
      content: form.value.content,
      type: form.value.type,
      relatedId: form.value.relatedId || null,
      relatedType: form.value.relatedType || null
    }
    
    
    // 调用API发送通知
    await authApi.batchSendNotice(submitData)
    ElMessage.success('通知发送成功')
    
    // 重置表单
    handleReset()
  } catch (error) {
    if (error !== false) {
      ElMessage.error('通知发送失败')
      console.error('发送通知失败:', error)
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
.notice-batch-send {
  padding: 0 20px 20px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-text-primary);
}

/* 表单样式优化 */
:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: var(--color-text-primary);
  font-size: 14px;
}

:deep(.el-form-item__label.is-required:not(.is-no-asterisk)::before) {
  content: "*";
  color: var(--color-danger);
  margin-right: 4px;
  font-weight: bold;
}

:deep(.el-textarea__wrapper) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-textarea__wrapper:hover) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

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
  color: var(--color-text-secondary);
  font-size: 12px;
  padding-top: 4px;
}

:deep(.el-textarea__count) {
  color: var(--color-text-secondary);
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
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

:deep(.el-button--primary:hover) {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

:deep(.el-button--default) {
  color: var(--color-text-regular);
  border-color: var(--color-border-base);
  background-color: #fff;
}

:deep(.el-button--default:hover) {
  color: var(--color-primary);
  border-color: #c6e2ff;
  background-color: var(--color-primary-light);
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