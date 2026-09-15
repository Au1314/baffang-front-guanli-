<template>
  <div class="statistics-metrics">
    <el-row :gutter="20">
      <el-col :span="4" :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover" class="metric-card user-card">
          <div class="metric-content">
            <div class="metric-icon user-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="metric-label">用户总数</div>
            <div class="metric-value">{{ statisticsData.totalUsers.toLocaleString() }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4" :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover" class="metric-card active-card">
          <div class="metric-content">
            <div class="metric-icon active-icon">
              <el-icon><DataLine /></el-icon>
            </div>
            <div class="metric-label">日活用户</div>
            <div class="metric-value">{{ statisticsData.dailyActive.toLocaleString() }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4" :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover" class="metric-card pile-card">
          <div class="metric-content">
            <div class="metric-icon pile-icon">
              <el-icon><Lightning /></el-icon>
            </div>
            <div class="metric-label">私桩认证量</div>
            <div class="metric-value">{{ statisticsData.privatePileCert.toLocaleString() }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4" :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover" class="metric-card car-card">
          <div class="metric-content">
            <div class="metric-icon car-icon">
              <el-icon><Van /></el-icon>
            </div>
            <div class="metric-label">车主认证量</div>
            <div class="metric-value">{{ statisticsData.carOwnerCert.toLocaleString() }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4" :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover" class="metric-card monthly-card">
          <div class="metric-content">
            <div class="metric-icon monthly-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="metric-label">月活用户</div>
            <div class="metric-value">{{ statisticsData.monthlyActive.toLocaleString() }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="4" :xs="12" :sm="8" :md="6" :lg="4">
        <el-card shadow="hover" class="metric-card new-card">
          <div class="metric-content">
            <div class="metric-icon new-icon">
              <el-icon><Plus /></el-icon>
            </div>
            <div class="metric-label">新增用户</div>
            <div class="metric-value">{{ statisticsData.newUsers.toLocaleString() }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { User, DataLine, Lightning, Van, Calendar, Plus } from '@element-plus/icons-vue'

// 接收父组件传递的统计数据
const props = defineProps({
  statisticsData: {
    type: Object,
    required: true
  }
})
</script>

<style scoped>
.statistics-metrics {
  margin-bottom: 30px;
}

.metric-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--color-border-lighter);
}

.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
  border-color: #d9ecff;
}

.metric-content {
  text-align: center;
  padding: 24px 0;
}

.metric-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.metric-icon .el-icon {
  font-size: 28px;
  color: white;
}

.user-icon { background: linear-gradient(135deg, #4299e1, #3182ce); }
.active-icon { background: linear-gradient(135deg, #48bb78, #38a169); }
.pile-icon { background: linear-gradient(135deg, #ecc94b, #d69e2e); }
.car-icon { background: linear-gradient(135deg, #f56565, #e53e3e); }
.monthly-icon { background: linear-gradient(135deg, #9f7aea, #805ad5); }
.new-icon { background: linear-gradient(135deg, #ed8936, #dd6b20); }

.metric-label {
  font-size: 14px;
  color: var(--color-text-regular);
  margin-bottom: 12px;
  font-weight: 500;
  line-height: 1.4;
}

.metric-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--color-text-primary);
  line-height: 1.1;
  transition: all 0.3s ease;
}

.metric-card:hover .metric-value {
  color: var(--color-primary);
  transform: scale(1.05);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .metric-content {
    padding: 20px 0;
  }
  
  .metric-icon {
    width: 50px;
    height: 50px;
  }
  
  .metric-icon .el-icon {
    font-size: 24px;
  }
  
  .metric-value {
    font-size: 28px;
  }
}

@media (max-width: 768px) {
  .metric-card {
    margin-bottom: 15px;
  }
  
  .metric-content {
    padding: 16px 0;
  }
  
  .metric-icon {
    width: 45px;
    height: 45px;
  }
  
  .metric-icon .el-icon {
    font-size: 22px;
  }
  
  .metric-value {
    font-size: 24px;
  }
  
  .metric-label {
    font-size: 13px;
  }
}
</style>