<template>
  <el-card 
    :shadow="shadow" 
    :class="[`role-card-${roleType}`, `role-card-${size}`]"
    :style="cardStyle"
  >
    <template #header v-if="header">
      <div class="card-header">
        <span>{{ header }}</span>
        <slot name="header-extra"></slot>
      </div>
    </template>
    <slot></slot>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { useAdminStore } from '@/store/adminStore'

const props = defineProps({
  header: {
    type: String,
    default: ''
  },
  shadow: {
    type: String,
    default: 'hover'
  },
  size: {
    type: String,
    default: 'default'
  },
  roleType: {
    type: String,
    default: null
  }
})

const adminStore = useAdminStore()

const actualRoleType = computed(() => {
  return props.roleType || adminStore.adminTypeDesc
})

const cardStyle = computed(() => {
  const roleColors = {
    '超级管理员': '#1890ff',
    '普通管理员': '#40a9ff',
    '审核员': '#52c41a',
    '客服': '#fa8c16',
    '紧急响应人员': '#ff4d4f',
    '论坛管理员': '#722ed1'
  }
  
  const color = roleColors[actualRoleType.value] || '#1890ff'
  
  return {
    '--role-color': color
  }
})
</script>

<style scoped>
.role-card {
  transition: all 0.3s ease;
}

.role-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.role-card-default {
  height: 100%;
}

.role-card-small {
  padding: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: var(--role-color, #1890ff);
}

/* 角色专属样式 */
.role-card-超级管理员 {
  border-left: 4px solid #1890ff;
}

.role-card-普通管理员 {
  border-left: 4px solid #40a9ff;
}

.role-card-审核员 {
  border-left: 4px solid #52c41a;
}

.role-card-客服 {
  border-left: 4px solid #fa8c16;
}

.role-card-紧急响应人员 {
  border-left: 4px solid #ff4d4f;
}

.role-card-论坛管理员 {
  border-left: 4px solid #722ed1;
}
</style>