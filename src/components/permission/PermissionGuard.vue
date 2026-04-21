<template>
  <div v-if="hasPermission">
    <slot></slot>
  </div>
  <div v-else-if="showError" class="permission-error">
    <el-empty description="无权限访问" />
  </div>
  <div v-else>
    <slot name="fallback"></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAdminStore } from '@/store/adminStore'

const props = defineProps({
  requiredType: {
    type: [String, Array],
    default: null
  },
  showError: {
    type: Boolean,
    default: true
  }
})

const adminStore = useAdminStore()

const hasPermission = computed(() => {
  if (!props.requiredType) return true
  return adminStore.hasPermission(props.requiredType)
})
</script>

<style scoped>
.permission-error {
  padding: 40px 0;
  text-align: center;
}
</style>