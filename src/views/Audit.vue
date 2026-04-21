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
  padding: 24px;
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.audit-card {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
}

.card-header {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  padding: 20px 24px;
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  color: white;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* 审核管理布局 */
.audit-content {
  display: flex;
  gap: 24px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
}

/* 左侧导航菜单 */
.audit-nav {
  width: 240px;
  flex-shrink: 0;
  background: #f9fafb;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #e4e7ed;
}

.audit-menu {
  border-right: none;
  background-color: transparent;
  border-radius: 8px;
  overflow: hidden;
}

/* 导航菜单项样式 */
:deep(.el-menu-item) {
  height: 52px;
  line-height: 52px;
  margin: 4px 0;
  border-radius: 8px;
  font-size: 14px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  padding-left: 20px;
  color: #606266;
}

:deep(.el-menu-item:hover) {
  background-color: #ecf5ff !important;
  color: #409eff !important;
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

:deep(.el-menu-item.is-active) {
  background-color: #1890ff !important;
  color: white !important;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transform: translateX(4px);
}

:deep(.el-menu-item.is-active:hover) {
  background-color: #409eff !important;
}

/* 右侧内容区域 */
.audit-main {
  flex: 1;
  min-width: 0;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
}

/* 面包屑导航样式 */
:deep(.el-breadcrumb) {
  margin-bottom: 24px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #1890ff;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .audit-content {
    flex-direction: column;
  }
  
  .audit-nav {
    width: 100%;
    margin-bottom: 20px;
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
  
  .audit-main {
    padding: 20px;
  }
}
</style>