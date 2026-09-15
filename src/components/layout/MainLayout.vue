<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <header class="layout-header">
      <div class="header-left">
        <div class="collapse-btn" @click="toggleCollapse" :title="isCollapsed ? '展开菜单' : '收起菜单'">
          <el-icon :size="18">
            <Expand v-if="isCollapsed" />
            <Fold v-else />
          </el-icon>
        </div>
        <span class="logo">八方互充</span>
      </div>
      <div class="header-right">
        <el-icon
          class="header-action"
          :size="18"
          :title="isFullscreen ? '退出全屏' : '全屏'"
          @click="toggleFullscreen"
        >
          <FullScreen />
        </el-icon>
        <el-dropdown @command="handleCommand">
          <span class="admin-info">
            <el-avatar :size="32" :src="authStore.adminInfo?.avatar || ''">
              {{ authStore.getFirstChar() }}
            </el-avatar>
            <span class="admin-name">{{ authStore.adminInfo?.username }}</span>
            <el-tag
              size="small"
              effect="light"
              :type="roleTagType(authStore.adminTypeDesc)"
              :style="customTagStyle"
              class="admin-role"
            >
              {{ authStore.adminTypeDesc }}
            </el-tag>
            <el-icon class="dropdown-caret" :size="12"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">
                <el-icon><User /></el-icon>
                个人资料
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <el-icon><SwitchButton /></el-icon>
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 侧边栏和内容 -->
    <div class="main-content">
      <!-- 侧边栏 -->
      <aside class="sidebar" :class="{ collapsed: isCollapsed }">
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapsed"
          :collapse-transition="false"
          router
          class="layout-menu"
        >
          <!-- 控制台 -->
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <template #title>控制台</template>
          </el-menu-item>

          <!-- 业务模块 -->
          <el-menu-item-group v-if="hasBusinessGroup" title="业务">
            <el-menu-item
              v-if="authStore.hasPermission('audit')"
              index="/audit"
            >
              <el-icon><DocumentChecked /></el-icon>
              <template #title>审核管理</template>
            </el-menu-item>
            <el-menu-item
              v-if="authStore.hasPermission(['超级管理员', '紧急响应人员'])"
              index="/emergency"
            >
              <el-icon><Warning /></el-icon>
              <template #title>紧急响应</template>
            </el-menu-item>
            <el-menu-item
              v-if="authStore.hasPermission(['超级管理员', '普通管理员', '客服'])"
              index="/customer-service"
            >
              <el-icon><ChatLineSquare /></el-icon>
              <template #title>客服管理</template>
            </el-menu-item>
            <el-menu-item
              v-if="authStore.hasPermission('forum_manage')"
              index="/forum-manage"
            >
              <el-icon><ChatDotRound /></el-icon>
              <template #title>论坛管理</template>
            </el-menu-item>
          </el-menu-item-group>

          <!-- 数据 -->
          <el-menu-item-group v-if="hasDataGroup" title="数据">
            <el-menu-item
              v-if="authStore.hasPermission(['超级管理员', '普通管理员'])"
              index="/statistics"
            >
              <el-icon><DataAnalysis /></el-icon>
              <template #title>统计模块</template>
            </el-menu-item>
            <el-menu-item
              v-if="authStore.hasPermission(['超级管理员', '普通管理员'])"
              index="/decision"
            >
              <el-icon><TrendCharts /></el-icon>
              <template #title>决策模块</template>
            </el-menu-item>
            <el-menu-item index="/data-screen">
              <el-icon><Monitor /></el-icon>
              <template #title>数据大屏</template>
            </el-menu-item>
            <el-menu-item
              v-if="authStore.isSuperAdmin"
              index="/data-export"
            >
              <el-icon><Download /></el-icon>
              <template #title>数据导出</template>
            </el-menu-item>
          </el-menu-item-group>

          <!-- 管理 -->
          <el-menu-item-group v-if="hasManageGroup" title="管理">
            <el-menu-item
              v-if="authStore.hasPermission(['超级管理员', '普通管理员'])"
              index="/platform-manage"
            >
              <el-icon><OfficeBuilding /></el-icon>
              <template #title>平台管理</template>
            </el-menu-item>
            <el-menu-item
              v-if="authStore.hasPermission(['超级管理员', '普通管理员'])"
              index="/private-station-manage"
            >
              <el-icon><Lightning /></el-icon>
              <template #title>私人电桩管理</template>
            </el-menu-item>
            <el-menu-item
              v-if="authStore.hasPermission(['超级管理员', '普通管理员'])"
              index="/notice"
            >
              <el-icon><Bell /></el-icon>
              <template #title>通知管理</template>
            </el-menu-item>
            <el-sub-menu
              v-if="authStore.hasPermission(['超级管理员', '普通管理员'])"
              index="system"
            >
              <template #title>
                <el-icon><Tools /></el-icon>
                <span>系统设置</span>
              </template>
              <el-menu-item index="/system/user">用户管理</el-menu-item>
              <el-menu-item index="/system/role">角色管理</el-menu-item>
              <el-menu-item index="/system/log">操作日志</el-menu-item>
            </el-sub-menu>
          </el-menu-item-group>
        </el-menu>
      </aside>

      <!-- 主内容区 -->
      <main class="content">
        <!-- 面包屑：当前页位置导航（首页/控制台无需） -->
        <div v-if="route.path !== '/'" class="content-breadcrumb">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="route.meta.title">{{ route.meta.title }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <slot></slot>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  House, DocumentChecked, ChatLineSquare, ChatDotRound,
  Warning, Expand, Fold, User, SwitchButton, DataAnalysis,
  TrendCharts, Monitor, Download, OfficeBuilding, Lightning,
  Bell, Tools, ArrowDown, FullScreen
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth'
import { roleColorByDesc, roleTagType } from '@/utils/roleColors'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isCollapsed = ref(false)
const activeMenu = computed(() => route.path)

// 角色 tag —— 论坛管理员等无 Element Plus 默认色，用内联样式补
const customTagStyle = computed(() => {
  const desc = authStore.adminTypeDesc
  if (desc !== '论坛管理员') return {}
  const { main, light } = roleColorByDesc(desc)
  return {
    color: main,
    backgroundColor: light,
    borderColor: light
  }
})

// 分组可见性：组内任意菜单可见则分组显示（避免空标题）
const hasBusinessGroup = computed(() =>
  authStore.hasPermission('audit') ||
  authStore.hasPermission(['超级管理员', '紧急响应人员']) ||
  authStore.hasPermission(['超级管理员', '普通管理员', '客服']) ||
  authStore.hasPermission('forum_manage')
)

// 「数据大屏」对所有用户开放，因此「数据」分组恒显示
const hasDataGroup = computed(() => true)

const hasManageGroup = computed(() =>
  authStore.hasPermission(['超级管理员', '普通管理员'])
)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 全屏切换
const isFullscreen = ref(false)
const onFullscreenChange = () => {
  isFullscreen.value = !!document.fullscreenElement
}
const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen()
  } else {
    document.documentElement.requestFullscreen()
  }
}
onMounted(() => document.addEventListener('fullscreenchange', onFullscreenChange))
onBeforeUnmount(() => document.removeEventListener('fullscreenchange', onFullscreenChange))

const handleCommand = async (command) => {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      const response = await authApi.logout()
      authStore.logout()
      router.push('/login')
      ElMessage({
        message: response.message || '已退出登录',
        type: 'success',
        position: 'bottom',
        duration: 3000
      })
    } catch {
      // 用户取消
    }
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-page);
}

/* 顶栏 */
.layout-header {
  height: var(--layout-header-height);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--space-5) 0 var(--space-2);
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border-lighter);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.collapse-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-regular);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast);
}

.collapse-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-primary);
}

.header-action {
  margin-right: var(--space-3);
  padding: 8px;
  color: var(--color-text-regular);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: background var(--transition-fast), color var(--transition-fast);
}

.header-action:hover {
  background: var(--color-bg-hover);
  color: var(--color-primary);
}

.logo {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--color-text-primary);
  letter-spacing: 0.5px;
}

.header-right .admin-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: 4px 8px 4px 4px;
  border-radius: var(--radius-pill);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.header-right .admin-info:hover {
  background: var(--color-bg-hover);
}

.admin-name {
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  font-weight: 500;
}

.admin-role {
  margin-left: 2px;
}

.dropdown-caret {
  color: var(--color-text-placeholder);
}

/* 主内容区 */
.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* 侧栏 */
.sidebar {
  width: var(--layout-sidebar-width);
  background: var(--color-bg-card);
  border-right: 1px solid var(--color-border-lighter);
  transition: width var(--transition-base);
  overflow-y: auto;
  overflow-x: hidden;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: var(--layout-sidebar-collapsed-width);
}

.layout-menu {
  border-right: none !important;
  background: transparent !important;
  padding: var(--space-2) 0;
}

/* 让分组标题样式更克制 */
.layout-menu :deep(.el-menu-item-group__title) {
  padding: var(--space-3) var(--space-5) var(--space-1);
  font-size: var(--font-size-xs);
  color: var(--color-text-placeholder);
  letter-spacing: 1px;
}

.sidebar.collapsed .layout-menu :deep(.el-menu-item-group__title) {
  display: none;
}

/* 菜单项 */
.layout-menu :deep(.el-menu-item),
.layout-menu :deep(.el-sub-menu__title) {
  height: 44px;
  line-height: 44px;
  margin: 2px var(--space-2);
  border-radius: var(--radius-md);
  color: var(--color-text-regular);
  font-size: var(--font-size-base);
}

.layout-menu :deep(.el-menu-item:hover),
.layout-menu :deep(.el-sub-menu__title:hover) {
  background: var(--color-bg-hover);
  color: var(--color-primary);
}

.layout-menu :deep(.el-menu-item.is-active) {
  background: var(--color-primary-light);
  color: var(--color-primary);
  font-weight: 600;
  position: relative;
}

.layout-menu :deep(.el-menu-item.is-active::before) {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 3px;
  background: var(--color-primary);
  border-radius: 0 3px 3px 0;
}

.sidebar.collapsed .layout-menu :deep(.el-menu-item),
.sidebar.collapsed .layout-menu :deep(.el-sub-menu__title) {
  margin: 2px var(--space-1);
}

/* 内容区 */
.content {
  flex: 1;
  padding: var(--space-5);
  overflow-y: auto;
  background: var(--color-bg-page);
}

.content-breadcrumb {
  margin-bottom: var(--space-4);
}

/* 响应式 */
@media (max-width: 768px) {
  .content {
    padding: var(--space-4);
  }

  .admin-name {
    display: none;
  }
}
</style>
