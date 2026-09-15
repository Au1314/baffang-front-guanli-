<template>
  <div class="notice-container">
    <el-card shadow="never" class="notice-card">
      <template #header>
        <div class="card-header">
          <span>通知管理</span>
        </div>
      </template>
      
      <div class="notice-content">
        <!-- 左侧导航菜单 -->
        <div class="notice-nav">
          <el-menu 
            :default-active="activeMenu"
            class="notice-menu"
            router
          >
            <el-menu-item index="/notice/list">
          <template #title>
            <span>通知列表</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/notice/broadcast">
          <template #title>
            <span>发送系统公告</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/notice/send">
          <template #title>
            <span>发送通知给指定用户</span>
          </template>
        </el-menu-item>
        <el-menu-item index="/notice/batch-send">
          <template #title>
            <span>批量发送通知</span>
          </template>
        </el-menu-item>
          </el-menu>
        </div>
        
        <!-- 右侧内容区域 -->
        <div class="notice-main">
          <!-- 面包屑导航 -->
          <el-breadcrumb separator="/" style="margin-bottom: 16px;">
            <el-breadcrumb-item :to="{ path: '/notice' }">通知管理</el-breadcrumb-item>
            <el-breadcrumb-item>{{ currentTitle }}</el-breadcrumb-item>
          </el-breadcrumb>
          
          <!-- 路由视图 -->
          <router-view />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.fullPath
})

// 当前页面标题
const currentTitle = computed(() => {
  const titleMap = {
    '/notice/list': '通知列表',
    '/notice/broadcast': '发送系统公告',
    '/notice/send': '发送通知给指定用户'
  }
  return titleMap[route.fullPath] || '通知管理'
})

// 组件挂载时，默认跳转到通知列表
onMounted(() => {
  if (route.path === '/notice' && !route.fullPath.includes('/notice/')) {
    router.push('/notice/list')
  }
})
</script>

<style scoped>
.notice-container {
  padding: 20px;
  min-height: calc(100vh - 120px);
  background-color: var(--color-bg-page);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.notice-card {
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: #fff;
}

.notice-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 通知管理布局 */
.notice-content {
  display: flex;
  gap: 20px;
}

/* 左侧导航菜单 */
.notice-nav {
  width: 200px;
  flex-shrink: 0;
}

.notice-menu {
  border-right: none;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.notice-menu:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

/* 菜单项样式 */
:deep(.el-menu-item) {
  height: 48px;
  line-height: 48px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-regular);
  transition: all 0.3s ease;
  margin: 0 4px;
  border-radius: 8px;
  position: relative;
}

:deep(.el-menu-item:hover) {
  color: var(--color-primary);
  background-color: rgba(64, 158, 255, 0.05) !important;
}

:deep(.el-menu-item.is-active) {
  color: var(--color-primary);
  background-color: rgba(64, 158, 255, 0.1) !important;
  font-weight: 600;
}

:deep(.el-menu-item.is-active::after) {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background-color: var(--color-primary);
  border-radius: 0 3px 3px 0;
}

/* 菜单容器 */
:deep(.el-menu) {
  border-right: none;
  background-color: #fff;
}

/* 右侧内容区域 */
.notice-main {
  flex: 1;
  min-width: 0;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.notice-main:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

/* 统一按钮样式 */
:deep(.el-button) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

/* 统一标签样式 */
:deep(.el-tag) {
  border-radius: 4px;
  font-size: 12px;
  padding: 2px 8px;
}

/* 统一对话框样式 */
:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background-color: #fafafa;
  border-bottom: 1px solid var(--color-border-lighter);
  padding: 16px 20px;
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border-lighter);
  background-color: #fafafa;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .notice-container {
    padding: 10px;
  }
  
  .notice-content {
    flex-direction: column;
  }
  
  .notice-nav {
    width: 100%;
  }
  
  .notice-main {
    padding: 15px;
  }
}
</style>