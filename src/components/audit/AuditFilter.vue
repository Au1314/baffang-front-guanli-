<template>
  <div class="audit-filter">
    <el-card shadow="never" class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <template v-for="(item, index) in filterItems" :key="index">
          <el-form-item :label="item.label" v-if="item.type === 'select'">
            <el-select 
              v-model="filterForm[item.prop]" 
              :placeholder="item.placeholder" 
              :clearable="item.clearable || true"
              :style="{ width: item.width || '150px' }"
            >
              <el-option 
                v-for="option in item.options" 
                :key="option.value" 
                :label="option.label" 
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item :label="item.label" v-else-if="item.type === 'input'">
            <el-input 
              v-model="filterForm[item.prop]" 
              :placeholder="item.placeholder" 
              :clearable="item.clearable || true"
              :style="{ width: item.width || '200px' }"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item :label="item.label" v-else-if="item.type === 'date'">
            <el-date-picker
              v-model="filterForm[item.prop]"
              :type="item.dateType || 'daterange'"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :style="{ width: item.width || '240px' }"
            />
          </el-form-item>
        </template>
        <template v-if="showMoreFilters">
          <el-form-item v-for="(item, index) in moreFilterItems" :key="'more-' + index">
            <el-select 
              v-if="item.type === 'select'"
              v-model="filterForm[item.prop]" 
              :placeholder="item.placeholder" 
              :clearable="item.clearable || true"
              :style="{ width: item.width || '150px' }"
            >
              <el-option 
                v-for="option in item.options" 
                :key="option.value" 
                :label="option.label" 
                :value="option.value"
              />
            </el-select>
            <el-input 
              v-else-if="item.type === 'input'"
              v-model="filterForm[item.prop]" 
              :placeholder="item.placeholder" 
              :clearable="item.clearable || true"
              :style="{ width: item.width || '200px' }"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
        </template>
        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleSearch"
            class="search-button"
          >
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button 
            @click="handleReset"
            class="reset-button"
          >
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
          <el-button 
            v-if="moreFilterItems.length > 0"
            @click="showMoreFilters = !showMoreFilters"
            class="more-button"
          >
            <el-icon v-if="!showMoreFilters"><ArrowDown /></el-icon>
            <el-icon v-else><ArrowUp /></el-icon>
            {{ showMoreFilters ? '收起' : '展开更多' }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'
import { Search, Refresh, ArrowDown, ArrowUp } from '@element-plus/icons-vue'

const props = defineProps({
  filterForm: {
    type: Object,
    required: true
  },
  filterItems: {
    type: Array,
    default: () => []
  },
  moreFilterItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['search', 'reset'])

const showMoreFilters = ref(false)

const handleSearch = () => {
  emit('search')
}

const handleReset = () => {
  emit('reset')
}
</script>

<style scoped>
.audit-filter {
  margin-bottom: var(--space-4);
}

.filter-card {
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  border: 1px solid var(--color-border-extra-light);
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  align-items: center;
}

:deep(.el-form-item) {
  margin-bottom: 0;
  display: flex;
  align-items: center;
}

:deep(.el-form-item__label) {
  font-size: var(--font-size-base);
  font-weight: 500;
  color: var(--color-text-regular);
  margin-right: var(--space-2);
}

@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-3);
  }

  :deep(.el-form-item) {
    width: 100%;
  }

  :deep(.el-select),
  :deep(.el-input),
  :deep(.el-date-picker) {
    width: 100% !important;
  }
}
</style>