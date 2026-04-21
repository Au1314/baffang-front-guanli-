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
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="请输入用户名"
            size="large"
            :prefix-icon="User"
            class="custom-input"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            size="large"
            :prefix-icon="Lock"
            show-password
            class="custom-input"
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            @click="handleLogin"
          >
            <span v-if="!loading">登 录</span>
            <span v-else>登录中...</span>
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 注册链接 -->
      <div class="login-footer">
        <span>没有账号？</span>
        <el-link type="primary" :underline="false" @click="goToRegister">立即注册</el-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Monitor } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'
import { useAdminStore } from '@/store/adminStore'

const router = useRouter()
const adminStore = useAdminStore()
const loginFormRef = ref()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
    if (!loginFormRef.value) return

    try {
      await loginFormRef.value.validate()
      loading.value = true

      const response = await authApi.login(loginForm)
      
      console.log('登录API响应:', response)
      
      // 检查响应是否有效
      if (!response) {
        throw new Error('服务器返回无效响应')
      }
      
      // 存储登录信息
      adminStore.login(response)

      // 登录成功消息，显示在底部
      ElMessage({
        message: '登录成功',
        type: 'success',
        position: 'bottom',
        duration: 3000
      })

      // 跳转到首页
      console.log('执行路由跳转')
      router.push('/')
  } catch (error) {
    console.error('登录错误:', error)
    
    // 处理网络错误
    if (error.message?.includes('Failed to fetch') || error.message?.includes('network error')) {
      ElMessage.error('网络错误：无法连接到服务器，请检查网络连接')
    } 
    // 处理401未授权错误
    else if (error.response?.status === 401) {
      ElMessage.error('登录失败：用户名或密码错误')
    }
    // 处理其他业务错误
    else {
      ElMessage.error(error.message || '登录失败')
    }
  } finally {
    loading.value = false
  }
}

const goToRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  /* 优化渐变配色，更柔和的蓝灰色调 */
  background: linear-gradient(135deg, #f5f7fa 0%, #e4eaf5 100%);
  position: relative;
  overflow: hidden;
}

/* 背景装饰圆圈 - 优化透明度和大小，更低调 */
.bg-decoration {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.circle {
  position: absolute;
  border-radius: 50%;
  /* 更淡的装饰色 */
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
  /* 更纯净的白色背景，轻微的毛玻璃效果 */
  background: #ffffff;
  /* 更圆润的圆角 */
  border-radius: 16px;
  /* 更柔和的阴影，提升层次感 */
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
  /* 优化logo渐变，更清新 */
  background: linear-gradient(135deg, #5666e5 0%, #6674de 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* 更柔和的阴影 */
  box-shadow: 0 8px 24px rgba(86, 102, 229, 0.2);
}

.login-header h2 {
  margin: 0 0 6px 0;
  /* 更沉稳的主色调 */
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

/* 自定义输入框样式 - 优化 */
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

/* 登录按钮 - 优化 */
.login-btn {
  width: 100%;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 2px;
  border: none;
  border-radius: 10px;
  /* 优化按钮渐变 */
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

/* 禁用状态优化 */
.login-btn:disabled {
  transform: none;
  box-shadow: 0 4px 16px rgba(86, 102, 229, 0.25);
  opacity: 0.9;
}

/* 底部信息 */
.login-footer {
  margin-top: 28px;
  text-align: center;
}

.login-footer span {
  color: #a0aec0;
  font-size: 12px;
}

/* 响应式适配 - 优化 */
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