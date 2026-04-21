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
  margin-bottom: 20px;
}

.filter-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
  overflow: hidden;
}

.filter-form {
  padding: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

:deep(.el-form-item) {
  margin-bottom: 0;
  display: flex;
  align-items: center;
}

:deep(.el-form-item__label) {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  margin-right: 8px;
}

:deep(.el-select),
:deep(.el-input),
:deep(.el-date-picker) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-select:hover .el-input__wrapper),
:deep(.el-input__wrapper:hover) {
  border-color: #c0c4cc;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.el-select:focus .el-input__wrapper),
:deep(.el-input__wrapper.is-focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.search-button {
  background: linear-gradient(135deg, #1890ff 0%, #36cfc9 100%);
  border: none;
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

.search-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
}

.reset-button {
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  transition: all 0.3s ease;
  border: 1px solid #dcdfe6;
  background: white;
  color: #606266;
}

.reset-button:hover {
  border-color: #c0c4cc;
  color: #303133;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.more-button {
  border-radius: 8px;
  padding: 10px 16px;
  font-size: 14px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
  transition: all 0.3s ease;
  border: 1px solid #dcdfe6;
  background: white;
  color: #606266;
}

.more-button:hover {
  border-color: #409eff;
  color: #409eff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  :deep(.el-form-item) {
    width: 100%;
  }
  
  :deep(.el-select),
  :deep(.el-input),
  :deep(.el-date-picker) {
    width: 100% !important;
  }
  
  .search-button,
  .reset-button,
  .more-button {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>