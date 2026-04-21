<template>
  <div class="login-container">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>

    <div class="login-box">
      <!-- Logo 区域 -->
      <div class="login-header">
        <div class="logo-icon">
          <el-icon :size="32" color="#fff">
            <Monitor />
          </el-icon>
        </div>
        <h2>八方互充</h2>
        <p>后台管理系统</p>
      </div>

      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        class="login-form"
      >
        <el-form-item>
          <div class="avatar-uploader">
            <el-upload
              v-model:file-list="avatarFileList"
              :auto-upload="false"
              :on-change="handleAvatarChange"
              :before-upload="beforeAvatarUpload"
              :limit="1"
              :show-file-list="false"
              accept="image/jpeg,image/png,image/gif"
            >
              <el-image
                v-if="imageUrl"
                :src="imageUrl"
                fit="cover"
                class="avatar-preview"
              >
                <template #error>
                  <div class="avatar-placeholder">
                    <el-icon :size="40" color="#909399">
                      <PictureFilled />
                    </el-icon>
                    <span>点击上传头像</span>
                  </div>
                </template>
              </el-image>
              <div v-else class="avatar-placeholder">
                <el-icon :size="40" color="#909399">
                  <PictureFilled />
                </el-icon>
                <span>点击上传头像</span>
              </div>
            </el-upload>
            <el-button
              v-if="imageUrl"
              type="text"
              size="small"
              @click="removeAvatar"
              class="avatar-delete-btn"
            >
              <el-icon color="#f56c6c"><Delete /></el-icon>
            </el-button>
          </div>
          <div class="avatar-hint">
            <small>支持 JPG、PNG、GIF 格式，大小不超过 2MB</small>
          </div>
        </el-form-item>

        <el-form-item prop="nickname">
          <el-input
            v-model="registerForm.nickname"
            placeholder="请输入昵称"
            size="large"
            :prefix-icon="User"
            class="custom-input"
          />
        </el-form-item>

        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            class="custom-input"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            class="custom-input"
          />
          <!-- 密码强度提示 -->
          <div v-if="registerForm.password" class="password-strength">
            <div class="strength-header">
              <span class="strength-label">密码强度：</span>
              <span :class="['strength-text', strengthColor]">{{ strengthText }}</span>
            </div>
            <!-- 分段式强度指示条 -->
            <div class="strength-meter">
              <div 
                class="strength-segment weak" 
                :class="{ active: strengthLevel < 40 }"
              ></div>
              <div 
                class="strength-segment medium" 
                :class="{ active: strengthLevel >= 40 && strengthLevel < 80 }"
              ></div>
              <div 
                class="strength-segment strong" 
                :class="{ active: strengthLevel >= 80 }"
              ></div>
            </div>
            <div class="strength-labels">
              <span class="strength-label-text">弱</span>
              <span class="strength-label-text">中</span>
              <span class="strength-label-text">强</span>
            </div>
            <div class="strength-rules">
              <small>(以字母开头，长度在6~18之间，包含字母、数字和特殊符号中的至少两种)</small>
            </div>
          </div>
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="请确认密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            class="custom-input"
            @keyup.enter="handleRegister"
          />
        </el-form-item>

        <el-form-item prop="inviteCode">
          <el-input
            v-model="registerForm.inviteCode"
            placeholder="请输入邀请码"
            size="large"
            :prefix-icon="Key"
            class="custom-input"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleRegister"
          >
            <span v-if="!loading">注 册</span>
            <span v-else>注册中...</span>
          </el-button>
        </el-form-item>

        <!-- 登录链接 -->
        <div class="login-footer">
          <span>已有账号？</span>
          <el-link type="primary" :underline="false" @click="goToLogin">立即登录</el-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Monitor, Key, CircleCheck, CircleClose, PictureFilled, Delete, Upload } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'
import bcrypt from 'bcryptjs'

const router = useRouter()
const registerFormRef = ref()
const loading = ref(false)

const registerForm = reactive({
  nickname: '',
  username: '',
  password: '',
  confirmPassword: '',
  inviteCode: '',
  avatar: ''
})

const avatarFileList = ref([])
const imageUrl = ref('')

// 密码强度状态
const passwordStrength = ref('')
const strengthLevel = ref(0)
const strengthText = ref('')
const strengthColor = ref('')

// 密码强度计算函数
const calculatePasswordStrength = (password) => {
  if (!password) {
    passwordStrength.value = ''
    strengthLevel.value = 0
    strengthText.value = ''
    strengthColor.value = ''
    return
  }
  
  // 检查字符类型
  const startsWithLetter = /^[a-zA-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecial = /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  
  const hasLetter = hasLower || hasUpper
  const length = password.length
  
  // 采用更灵活的强度计算方式，根据符合的条件逐步增加强度
  let score = 0
  
  // 长度加分
  if (length >= 6) score += 20
  if (length >= 8) score += 20
  if (length >= 12) score += 20
  
  // 字符类型加分
  if (hasLower) score += 15
  if (hasUpper) score += 15
  if (hasNumber) score += 15
  if (hasSpecial) score += 15
  
  // 以字母开头加分
  if (startsWithLetter) score += 10
  
  // 确保分数在合理范围内
  score = Math.min(100, Math.max(0, score))
  strengthLevel.value = score
  
  // 根据分数划分强度等级
  if (score < 40) {
    passwordStrength.value = 'weak'
    strengthText.value = '弱密码'
    strengthColor.value = 'danger'
  } else if (score < 80) {
    passwordStrength.value = 'medium'
    strengthText.value = '中强度密码'
    strengthColor.value = 'warning'
  } else {
    passwordStrength.value = 'strong'
    strengthText.value = '强密码'
    strengthColor.value = 'success'
  }
}

// 头像上传相关函数
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件')
    return false
  }
  
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB')
    return false
  }
  
  return true
}

const handleAvatarChange = (file) => {
  if (beforeAvatarUpload(file.raw)) {
    // 读取文件为DataURL用于预览
    const reader = new FileReader()
    reader.onload = (e) => {
      imageUrl.value = e.target.result
      registerForm.avatar = e.target.result
    }
    reader.readAsDataURL(file.raw)
    
    // 更新文件列表
    avatarFileList.value = [file]
  }
}

const removeAvatar = () => {
  imageUrl.value = ''
  registerForm.avatar = ''
  avatarFileList.value = []
}

// 监听密码变化，实时计算强度
watch(() => registerForm.password, (newPassword) => {
  calculatePasswordStrength(newPassword)
})

const registerRules = {
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z]/, message: '密码必须以字母开头', trigger: 'blur' },
    { validator: (rule, value, callback) => {
          const hasLetter = /[a-zA-Z]/.test(value)
          const hasNumber = /[0-9]/.test(value)
          const hasSpecial = /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
          const typesCount = [hasLetter, hasNumber, hasSpecial].filter(Boolean).length
          
          if (typesCount >= 2) {
            callback()
          } else {
            callback(new Error('密码必须包含字母、数字和特殊字符中的至少两种'))
          }
        }, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: (rule, value, callback) => {
        if (value !== registerForm.password) {
          callback(new Error('两次输入密码不一致'))
        } else {
          callback()
        }
      }, trigger: 'blur' }],
  inviteCode: [
    { required: true, message: '请输入邀请码', trigger: 'blur' }
  ]
}



const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    await registerFormRef.value.validate()
    loading.value = true

    // 不使用BCrypt加密密码，直接传递明文密码，由后端处理加密
    // 因为API文档中显示直接传递明文密码
    const registerData = {
      username: registerForm.username,
      password: registerForm.password, // 直接传递明文密码
      name: registerForm.nickname, // 后端使用name作为昵称字段
      confirmPassword: registerForm.password, // 后端需要confirmPassword参数
      inviteCode: registerForm.inviteCode || '',
      avatar: registerForm.avatar || ''
    }

    // 使用authApi.register方法，自动处理baseURL和认证
    const response = await authApi.register(registerData)

    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (error) {
    console.error('注册失败:', error)
    // 显示更具体的错误信息
    let errorMsg = '注册失败'
    if (error.response && error.response.data && error.response.data.msg) {
      errorMsg = error.response.data.msg
    } else if (error.message) {
      errorMsg = error.message
    }
    ElMessage.error(errorMsg)
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4eaf5 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰圆圈 */
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(86, 102, 229, 0.05), rgba(102, 116, 222, 0.05));
  animation: float 8s ease-in-out infinite;
}

.circle-1 {
  width: 260px;
  height: 260px;
  top: -120px;
  right: -80px;
  animation-delay: 0s;
}

.circle-2 {
  width: 180px;
  height: 180px;
  bottom: -80px;
  left: -80px;
  animation-delay: 2s;
}

.circle-3 {
  width: 140px;
  height: 140px;
  top: 50%;
  left: 10%;
  animation-delay: 4s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-15px) rotate(5deg);
  }
}

.login-box {
  width: 400px;
  padding: 40px 36px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(106, 115, 147, 0.08);
  border: 1px solid rgba(240, 243, 250, 0.8);
  position: relative;
  z-index: 10;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 16px;
  background: linear-gradient(135deg, #5666e5 0%, #6674de 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(86, 102, 229, 0.2);
}

.login-header h2 {
  margin: 0 0 6px 0;
  color: #2d3748;
  font-size: 24px;
  font-weight: 600;
  letter-spacing: 1px;
}

.login-header p {
  margin: 0;
  color: #718096;
  font-size: 14px;
  font-weight: 400;
}

.login-form {
  margin-top: 16px;
}

/* 自定义输入框样式 */
.login-form :deep(.el-input__wrapper) {
  border-radius: 10px;
  padding: 2px 14px;
  box-shadow: none;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
  background-color: #fafbfc;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: #5666e5;
  background-color: #ffffff;
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: #5666e5;
  box-shadow: 0 0 0 2px rgba(86, 102, 229, 0.1);
  background-color: #ffffff;
}

.login-form :deep(.el-input__inner) {
  height: 46px;
  font-size: 14px;
  color: #2d3748;
}

.login-form :deep(.el-input__prefix) {
  color: #a0aec0;
  margin-right: 8px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-form-item__error) {
  padding-top: 4px;
  font-size: 12px;
  margin-left: 2px;
}

.invite-code-status {
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
}

.invite-code-status.success {
  background-color: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.invite-code-status.success .el-icon {
  margin-right: 6px;
  font-size: 16px;
}

.invite-code-status.error {
  background-color: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

.invite-code-status.error .el-icon {
  margin-right: 6px;
  font-size: 16px;
}

/* 头像上传样式 */
.avatar-uploader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
  width: 100%;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px dashed #d9d9d9;
  margin: 0 auto;
  display: block;
}

.avatar-preview:hover {
  transform: scale(1.05);
  border-color: #5666e5;
}

.avatar-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px dashed #d9d9d9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: #fafafa;
  margin: 0 auto;
  text-align: center;
}

.avatar-placeholder:hover {
  border-color: #5666e5;
  background-color: #f0f2f5;
}

.avatar-placeholder span {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
  display: block;
  text-align: center;
  width: 100%;
}

.avatar-delete-btn {
  position: absolute;
  top: 0;
  right: calc(50% - 40px);
  transform: translateY(-50%);
  background-color: white;
  border: 1px solid #d9d9d9;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.avatar-hint {
  text-align: center;
  margin-top: 10px;
  margin-bottom: 20px;
  width: 100%;
}

.avatar-hint small {
  color: #909399;
  font-size: 12px;
  display: block;
  text-align: center;
}

/* 确保头像上传区域与输入框等宽 */
.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
  width: 100%;
  text-align: center;
}

/* 确保上传组件容器居中 */
.login-form :deep(.el-form-item__content) {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 密码强度提示样式 */
.password-strength {
  margin-top: 10px;
  padding: 10px;
  background-color: #fafbfc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.strength-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.strength-label {
  font-weight: 500;
  color: #4a5568;
}

.strength-text {
  font-weight: 600;
  margin-left: 8px;
}

.strength-text.danger {
  color: #ff4d4f;
}

.strength-text.warning {
  color: #faad14;
}

.strength-text.success {
  color: #52c41a;
}

/* 分段式强度指示条 */
.strength-meter {
  display: flex;
  height: 8px;
  background-color: #f0f2f5;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.strength-segment {
  flex: 1;
  transition: all 0.3s ease;
}

.strength-segment.weak {
  background-color: #f0f2f5;
}

.strength-segment.weak.active {
  background-color: #ff4d4f;
}

.strength-segment.medium {
  background-color: #f0f2f5;
}

.strength-segment.medium.active {
  background-color: #faad14;
}

.strength-segment.strong {
  background-color: #f0f2f5;
}

.strength-segment.strong.active {
  background-color: #52c41a;
}

.strength-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.strength-label-text {
  font-size: 12px;
  color: #8c8c8c;
}

.strength-rules {
  text-align: center;
}

.strength-rules small {
  color: #8c8c8c;
  font-size: 12px;
}

/* 登录按钮样式 */
.login-btn {
  width: 100%;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(135deg, #5666e5 0%, #6674de 100%);
  box-shadow: 0 4px 16px rgba(86, 102, 229, 0.25);
  transition: all 0.2s ease;
}

.login-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(86, 102, 229, 0.3);
}

.login-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(86, 102, 229, 0.2);
}

/* 禁用状态 */
.login-btn:disabled {
  transform: none;
  box-shadow: 0 4px 16px rgba(86, 102, 229, 0.25);
  opacity: 0.9;
}

/* 底部信息 */
.login-footer {
  margin-top: 28px;
  text-align: center;
  color: #718096;
  font-size: 14px;
}

.login-footer span {
  margin-right: 8px;
}

/* 响应式适配 */
@media (max-width: 480px) {
  .login-box {
    width: calc(100% - 32px);
    margin: 16px;
    padding: 32px 20px;
  }

  .login-header h2 {
    font-size: 20px;
  }

  .logo-icon {
    width: 56px;
    height: 56px;
    border-radius: 14px;
  }

  .login-form :deep(.el-input__inner) {
    height: 44px;
  }

  .login-btn {
    height: 46px;
  }
}
</style>