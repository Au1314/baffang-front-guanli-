<template>
  <!-- 开场星空动画：点击任意处 / 按 ESC 进入 -->
  <transition name="splash-fade" @after-leave="revealCard">
    <div v-if="showSplash" class="splash" @click="skipSplash">
      <!-- 星空背景图（缓慢缩放，营造深邃感） -->
      <div class="star-bg" :style="{ backgroundImage: `url(${STAR_BG_URL})` }"></div>
      <!-- 深色渐变遮罩，保证标题文字可读 -->
      <div class="splash-overlay"></div>

      <h1 class="splash-title">八方互充</h1>
      <p class="splash-subtitle">后台管理系统</p>
      <p class="splash-hint">点击任意处 / 按 ESC 进入</p>
    </div>
  </transition>

  <div class="login-container">
    <!-- 星空背景图 + 遮罩（降低透明度，不干扰登录卡片阅读） -->
    <div class="star-bg login-star-bg" :style="{ backgroundImage: `url(${STAR_BG_URL})` }"></div>
    <div class="mask"></div>

    <div class="login-box" :class="{ 'is-visible': cardVisible }">
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

      <!-- 版权信息 -->
      <p class="login-copyright">© 2026 八方互充 版权所有</p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock, Monitor } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

// 星空背景图（Unsplash，可按需替换为本地路径如 '@/assets/starry-bg.jpg' 或其它 URL）
const STAR_BG_URL = 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1920&auto=format&fit=crop'

const router = useRouter()
const authStore = useAuthStore()
const loginFormRef = ref()
const loading = ref(false)

// 开场动画 + 卡片入场
const showSplash = ref(false)
const cardVisible = ref(false)
const SPLASH_KEY = 'login_splash_shown'

const skipSplash = () => {
  showSplash.value = false
}

// 开场动画离场完成后，让登录卡片上浮淡入
const revealCard = () => {
  cardVisible.value = true
}

const onKeydown = (e) => {
  if (e.key === 'Escape') skipSplash()
}

onMounted(() => {
  // 系统开启「减少动态」时跳过开场动画，保证可访问性
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  if (reducedMotion || sessionStorage.getItem(SPLASH_KEY)) {
    // 不播开场动画：稍等一帧再显示卡片，确保入场动画生效
    setTimeout(revealCard, 50)
    return
  }

  showSplash.value = true
  sessionStorage.setItem(SPLASH_KEY, '1')
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})

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

    // 检查响应是否有效
    if (!response) {
      throw new Error('服务器返回无效响应')
    }

    // 存储登录信息
    authStore.login(response)

    // 登录成功消息，显示在底部
    ElMessage({
      message: '登录成功',
      type: 'success',
      position: 'bottom',
      duration: 3000
    })

    // 跳转到首页
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
/* ── 星空背景（开场动画与登录页共用，同一张图缓存复用） ── */
.star-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  will-change: transform;
  animation: star-zoom 25s ease-in-out infinite alternate;
}

/* ── 开场星空 Splash ── */
.splash {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  background-color: #05070f; /* 图片加载前的兜底底色 */
  animation: splash-bg-in 0.5s ease-out;
}

.splash-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(3, 5, 16, 0.55) 0%,
    rgba(3, 5, 16, 0.25) 50%,
    rgba(3, 5, 16, 0.6) 100%
  );
}

/* 主标题：浅蓝白 + 柔和蓝色外发光，弹性放大淡入 */
.splash-title {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: clamp(40px, 8vw, 64px);
  font-weight: 600;
  color: #dce8ff;
  letter-spacing: 8px;
  text-shadow:
    0 0 18px rgba(120, 170, 255, 0.55),
    0 0 42px rgba(80, 140, 255, 0.35);
  animation: splash-title-in 1.5s cubic-bezier(0.18, 0.89, 0.32, 1.28) 0.5s both;
}

/* 副标题：柔和，不抢星空焦点 */
.splash-subtitle {
  position: relative;
  z-index: 1;
  margin: 14px 0 0;
  font-size: var(--font-size-md);
  letter-spacing: 6px;
  color: rgba(190, 210, 240, 0.78);
  animation: splash-subtitle-in 1s ease 2s both;
}

/* 底部进入提示 */
.splash-hint {
  position: absolute;
  z-index: 1;
  bottom: 48px;
  left: 0;
  right: 0;
  margin: 0;
  text-align: center;
  font-size: var(--font-size-xs);
  letter-spacing: 2px;
  color: rgba(190, 210, 240, 0.55);
  animation: splash-hint-in 0.8s ease 3.5s both;
}

@keyframes splash-bg-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes star-zoom {
  from { transform: scale(1); }
  to { transform: scale(1.08); }
}

@keyframes splash-title-in {
  0% { opacity: 0; transform: scale(0.85); }
  60% { opacity: 1; }
  100% { opacity: 1; transform: scale(1); }
}

@keyframes splash-subtitle-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes splash-hint-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 结束：整体向上淡出 */
.splash-fade-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.splash-fade-leave-to {
  opacity: 0;
  transform: translateY(-8%);
}

/* ── 登录页 ── */
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background-color: #05070f;
}

/* 登录页的星空图降低透明度，配合遮罩，突出卡片 */
.login-star-bg {
  opacity: 0.65;
}

.mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.42);
}

/* 毛玻璃登录卡片：从下方上浮淡入 */
.login-box {
  width: 400px;
  padding: 40px 36px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.28);
  border: 1px solid rgba(255, 255, 255, 0.6);
  position: relative;
  z-index: 10;
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.8s ease, transform 0.4s ease, box-shadow 0.3s ease;
}

.login-box.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* 卡片轻微悬浮抬升，仅入场完成后生效（避免与入场动画冲突） */
.login-box.is-visible:hover {
  transform: translateY(-6px);
  box-shadow: 0 22px 48px rgba(0, 0, 0, 0.32);
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-6);
}

.logo-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--space-4);
  background: var(--color-primary);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(64, 158, 255, 0.3);
}

.login-header h2 {
  margin: 0 0 6px 0;
  color: var(--color-text-primary);
  font-size: var(--font-size-xxl);
  font-weight: 600;
  letter-spacing: 1px;
}

.login-header p {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--font-size-base);
}

.login-form {
  margin-top: var(--space-4);
}

.login-form :deep(.el-form-item) {
  margin-bottom: var(--space-5);
}

.login-form :deep(.el-input__inner) {
  height: 44px;
}

/* 输入框 hover 态：边框泛蓝，过渡柔和 */
.login-form :deep(.el-input__wrapper) {
  transition: box-shadow 0.25s ease, background-color 0.25s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px rgba(147, 197, 253, 0.6) inset;
}

/* 输入框聚焦态：主色描边 + 柔光晕 */
.login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px var(--color-primary) inset, 0 0 12px rgba(64, 150, 255, 0.25);
}

.login-form :deep(.el-input__icon) {
  color: var(--color-text-secondary);
}

.login-btn {
  width: 100%;
  height: 44px;
  font-size: var(--font-size-md);
  font-weight: 500;
  letter-spacing: 4px;
  border-radius: var(--radius-md);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.login-btn:hover {
  transform: scale(1.02);
  box-shadow: 0 0 16px rgba(64, 150, 255, 0.45);
  filter: brightness(1.05);
}

.login-btn:active {
  transform: scale(0.98);
}

.login-footer {
  margin-top: var(--space-6);
  text-align: center;
}

.login-footer span {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
  margin-right: var(--space-1);
}

/* 版权小字：弱化、居中 */
.login-copyright {
  margin: var(--space-5) 0 0;
  text-align: center;
  font-size: var(--font-size-xs);
  color: rgba(120, 130, 145, 0.65);
  letter-spacing: 1px;
}

@media (max-width: 480px) {
  .login-box {
    width: calc(100% - 32px);
    margin: 16px;
    padding: var(--space-6) var(--space-4);
  }

  .login-header h2 {
    font-size: var(--font-size-xl);
  }

  .logo-icon {
    width: 56px;
    height: 56px;
  }
}

/* 减少动态：关闭卡片入场过渡，直接显示 */
@media (prefers-reduced-motion: reduce) {
  .login-box {
    transition: none;
  }
}
</style>
