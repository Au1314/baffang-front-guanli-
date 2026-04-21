<template>
  <div class="main-layout">
    <!-- 顶部导航栏 -->
    <el-header class="header">
      <div class="header-left">
        <span class="logo">后台管理系统</span>
      </div>
      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="admin-info">
            <el-avatar :size="32" :src="adminStore.adminInfo?.avatar || ''" />
            <span class="admin-name">{{ adminStore.adminInfo?.username }}</span>
            <span class="admin-type">{{ adminStore.adminTypeDesc }}</span>
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
    </el-header>

    <!-- 侧边栏和内容 -->
    <div class="main-content">
      <!-- 侧边栏 -->
      <el-aside class="sidebar" :width="isCollapsed ? '64px' : '200px'">
        <div class="collapse-btn" @click="toggleCollapse">
          <el-icon>
            <Expand v-if="isCollapsed" />
            <Fold v-else />
          </el-icon>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          :collapse="isCollapsed"
          :collapse-transition="false"
          router
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <!-- 控制台 -->
          <el-menu-item index="/">
            <el-icon><House /></el-icon>
            <template #title>控制台</template>
          </el-menu-item>
          
          <!-- 审核管理（超级管理员和审核员可见） -->
          <el-menu-item 
            v-if="adminStore.hasPermission('audit')" 
            index="/audit"
          >
            <el-icon><DocumentChecked /></el-icon>
            <template #title>审核管理</template>
          </el-menu-item>
          
          <!-- 紧急响应（超级管理员和紧急响应人员可见） -->
          <el-menu-item 
            v-if="adminStore.hasPermission(['超级管理员', '紧急响应人员'])" 
            index="/emergency"
          >
            <el-icon><Warning /></el-icon>
            <template #title>紧急响应</template>
          </el-menu-item>
          
          <!-- 客服管理（客服、普通管理员和超级管理员可见） -->
          <el-menu-item 
            v-if="adminStore.hasPermission(['超级管理员', '普通管理员', '客服'])" 
            index="/customer-service"
          >
            <el-icon><ChatLineSquare /></el-icon>
            <template #title>客服管理</template>
          </el-menu-item>
          
          <!-- 平台管理（超级管理员和普通管理员可见） -->
          <el-menu-item 
            v-if="adminStore.hasPermission(['超级管理员', '普通管理员'])" 
            index="/platform-manage"
          >
            <el-icon><Setting /></el-icon>
            <template #title>平台管理</template>
          </el-menu-item>

          <!-- 私人电桩管理（超级管理员和普通管理员可见） -->
          <el-menu-item 
            v-if="adminStore.hasPermission(['超级管理员', '普通管理员'])" 
            index="/private-station-manage"
          >
            <el-icon><Setting /></el-icon>
            <template #title>私人电桩管理</template>
          </el-menu-item>

          <!-- 统计模块（超级管理员和普通管理员可见） -->
          <el-menu-item 
            v-if="adminStore.hasPermission(['超级管理员', '普通管理员'])"
            index="/statistics"
          >
            <el-icon><DataAnalysis /></el-icon>
            <template #title>统计模块</template>
          </el-menu-item>
          
          <!-- 决策模块（超级管理员和普通管理员可见） -->
          <el-menu-item 
            v-if="adminStore.hasPermission(['超级管理员', '普通管理员'])"
            index="/decision"
          >
            <el-icon><DataAnalysis /></el-icon>
            <template #title>决策模块</template>
          </el-menu-item>
          
          <!-- 数据大屏（对所有用户开放） -->
          <el-menu-item 
            index="/data-screen"
          >
            <el-icon><DataAnalysis /></el-icon>
            <template #title>数据大屏</template>
          </el-menu-item>
          
          <!-- 论坛管理（超级管理员、普通管理员和论坛管理员可见） -->
          <el-menu-item 
            v-if="adminStore.hasPermission('forum_manage')"
            index="/forum-manage"
          >
            <el-icon><ChatDotRound /></el-icon>
            <template #title>论坛管理</template>
          </el-menu-item>
          
          <!-- 通知管理（超级管理员和普通管理员可见） -->
          <el-menu-item 
            v-if="adminStore.hasPermission(['超级管理员', '普通管理员'])" 
            index="/notice"
          >
            <el-icon><Bell /></el-icon>
            <template #title>通知管理</template>
          </el-menu-item>
          
          <!-- 数据导出（仅超级管理员可见） -->
          <el-menu-item 
            v-if="adminStore.isSuperAdmin"
            index="/data-export"
          >
            <el-icon><Document /></el-icon>
            <template #title>数据导出</template>
          </el-menu-item>
          
          <!-- 系统设置（超级管理员和普通管理员可见） -->
          <el-sub-menu v-if="adminStore.hasPermission(['超级管理员', '普通管理员'])" index="system">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统设置</span>
            </template>
            <el-menu-item index="/system/user">用户管理</el-menu-item>
            <el-menu-item v-if="adminStore.hasPermission(['超级管理员', '普通管理员'])" index="/system/role">角色管理</el-menu-item>
            <el-menu-item v-if="adminStore.hasPermission(['超级管理员', '普通管理员'])" index="/system/log">操作日志</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <!-- 主内容区 -->
      <div class="content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { 
  House, UserFilled, DocumentChecked, ChatLineSquare, 
  Warning, Setting, Expand, Fold, User, SwitchButton, DataAnalysis, Document, ChatDotRound, Bell 
} from '@element-plus/icons-vue'
import { useAdminStore } from '@/store/adminStore'
import { authApi } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const adminStore = useAdminStore()

// 侧边栏折叠状态
const isCollapsed = ref(false)

// 当前激活的菜单
const activeMenu = computed(() => route.path)

// 切换侧边栏折叠
const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

// 处理下拉菜单命令
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
      
      // 调用登出接口
      const response = await authApi.logout()
      
      // 清除本地状态
      adminStore.logout()
      
      // 跳转到登录页
      router.push('/login')
      
      // 退出成功消息，显示在底部，使用接口返回的message字段
      ElMessage({
        message: response.message || '已退出登录',
        type: 'success',
        position: 'bottom',
        duration: 3000
      })
    } catch {
      // 用户取消登出
    }
  }
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #304156;
  color: white;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.header-left .logo {
  font-size: 18px;
  font-weight: bold;
}

.header-right .admin-info {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: background 0.3s;
}

.header-right .admin-info:hover {
  background: rgba(255, 255, 255, 0.1);
}

.admin-name {
  margin: 0 8px;
  font-size: 14px;
}

.admin-type {
  background: #409EFF;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  margin-left: 8px;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.sidebar {
  background: #304156;
  transition: width 0.3s;
}

.collapse-btn {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  background: #263445;
  transition: background 0.3s;
}

.collapse-btn:hover {
  background: #1d2b3a;
}

.el-menu {
  border-right: none;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f0f2f5;
}
</style>