<template>
  <div class="audit-container">
    <el-card shadow="never" class="audit-card">
      <template #header>
        <div class="card-header">
          <span>审核管理</span>
        </div>
      </template>
      
      <div class="audit-content">
        <!-- 左侧导航菜单 -->
        <div class="audit-nav">
          <el-menu 
            :default-active="activeMenu"
            class="audit-menu"
            router
          >
            <el-menu-item index="/audit/private-station">
              <template #title>
                <span>私人电桩认证审核</span>
              </template>
            </el-menu-item>
            <el-menu-item index="/audit/car-owner">
              <template #title>
                <span>车主认证审核</span>
              </template>
            </el-menu-item>
            <el-menu-item index="/audit/charging-complaint">
              <template #title>
                <span>充电桩投诉审核</span>
              </template>
            </el-menu-item>
            <el-menu-item index="/audit/charging-fault">
              <template #title>
                <span>充电桩故障审核</span>
              </template>
            </el-menu-item>
            <el-menu-item index="/audit/comment-report">
              <template #title>
                <span>评论举报审核</span>
              </template>
            </el-menu-item>
            <el-menu-item index="/audit/transaction-appeal">
              <template #title>
                <span>交易申诉审核</span>
              </template>
            </el-menu-item>
            <el-menu-item index="/audit/record-list">
              <template #title>
                <span>全部审核记录</span>
              </template>
            </el-menu-item>
          </el-menu>
        </div>
        
        <!-- 右侧内容区域 -->
        <div class="audit-main">
          <!-- 面包屑导航 -->
          <el-breadcrumb separator="/" style="margin-bottom: 16px;">
            <el-breadcrumb-item :to="{ path: '/audit' }">审核管理</el-breadcrumb-item>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'


const route = useRoute()
const router = useRouter()

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.fullPath
})

// 当前页面标题
  const currentTitle = computed(() => {
    const titleMap = {
      '/audit/private-station': '私人电桩认证审核',
      '/audit/car-owner': '车主认证审核',
      '/audit/charging-complaint': '充电桩投诉审核',
      '/audit/charging-fault': '充电桩故障审核',
      '/audit/comment-report': '评论举报审核',
      '/audit/transaction-appeal': '交易申诉审核',
      '/audit/record-list': '全部审核记录'
    }
    return titleMap[route.fullPath] || '审核管理'
  })

// 组件挂载时，默认跳转到私人电桩认证审核
onMounted(() => {
  if (route.path === '/audit' && !route.fullPath.includes('/audit/')) {
    router.push('/audit/private-station')
  }
})
</script>

<style scoped>
.audit-container {
  min-height: 100%;
}

.audit-card {
  margin-bottom: var(--space-5);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-extra-light);
}

.card-header {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--color-text-primary);
}

.audit-content {
  display: flex;
  gap: var(--space-5);
}

.audit-nav {
  width: 220px;
  flex-shrink: 0;
  background: var(--color-bg-page);
  border-radius: var(--radius-md);
  padding: var(--space-2);
}

.audit-menu {
  border-right: none;
  background-color: transparent;
}

:deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
  margin: 2px 0;
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  color: var(--color-text-regular);
  padding-left: var(--space-4) !important;
}

:deep(.el-menu-item:hover) {
  background-color: var(--color-bg-card) !important;
  color: var(--color-primary) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: var(--color-primary-light) !important;
  color: var(--color-primary) !important;
  font-weight: 600;
  position: relative;
}

:deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background: var(--color-primary);
  border-radius: 0 3px 3px 0;
}

.audit-main {
  flex: 1;
  min-width: 0;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: var(--color-primary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .audit-content {
    flex-direction: column;
  }

  .audit-nav {
    width: 100%;
    margin-bottom: var(--space-4);
  }

  .audit-menu {
    display: flex;
    overflow-x: auto;
    flex-wrap: nowrap;
  }

  :deep(.el-menu-item) {
    white-space: nowrap;
    margin: 0 4px;
  }
}
</style>