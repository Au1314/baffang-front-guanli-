<template>
  <div class="notice-send">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>发送通知给指定用户</span>
        </div>
      </template>
      
      <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
        <el-form-item label="用户ID" prop="userId">
          <el-input
            v-model="form.userId"
            placeholder="请输入用户ID"
            type="number"
            min="1"
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
  userId: null,
  title: '',
  content: '',
  type: null,
  relatedId: null,
  relatedType: null
})

// 表单验证规则
const rules = ref({
  userId: [
    { required: true, message: '请输入用户ID', trigger: 'blur' },
    {
      type: 'number',
      min: 1,
      message: '用户ID必须为正整数',
      trigger: 'blur',
      transform: (value) => Number(value) // 将输入值转换为数值类型
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
    
    // 移除null和undefined值
    const submitData = { ...form.value }
    Object.keys(submitData).forEach(key => {
      if (submitData[key] === null || submitData[key] === undefined) {
        delete submitData[key]
      }
    })
    
    await authApi.sendNotice(submitData)
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
.notice-send {
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