<template>
  <el-card
    :shadow="shadow"
    :class="[`role-card-${size}`]"
    :style="cardStyle"
  >
    <template #header v-if="header">
      <div class="card-header">
        <span class="card-title">{{ header }}</span>
        <slot name="header-extra"></slot>
      </div>
    </template>
    <slot></slot>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { roleColorByDesc } from '@/utils/roleColors'

const props = defineProps({
  header: {
    type: String,
    default: ''
  },
  shadow: {
    type: String,
    default: 'never'
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

const authStore = useAuthStore()

const actualRoleType = computed(() => props.roleType || authStore.adminTypeDesc)

const cardStyle = computed(() => {
  const { main, light } = roleColorByDesc(actualRoleType.value)
  return {
    '--role-color': main,
    '--role-color-light': light
  }
})
</script>

<style scoped>
.role-card-default {
  height: 100%;
  border: 1px solid var(--color-border-extra-light);
  border-radius: var(--radius-lg);
}

.role-card-small {
  padding: var(--space-2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  position: relative;
  padding-left: var(--space-3);
}

.card-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 14px;
  background: var(--role-color, var(--color-primary));
  border-radius: 2px;
}
</style>
