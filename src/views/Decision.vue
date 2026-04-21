<template>
  <div class="decision-container">
    <h2 class="page-title">决策模块</h2>
    
    <!-- 导航菜单 -->
    <el-card class="nav-card">
      <el-menu :default-active="activeMenu" class="el-menu--horizontal" router>
        <el-menu-item index="/decision/list">
          决策列表
        </el-menu-item>
        <el-menu-item index="/decision/request">
          AI决策请求
        </el-menu-item>
        <el-menu-item index="/decision/audit-suggest">
          AI审核建议
        </el-menu-item>
        <el-menu-item index="/decision/anomaly-detection">
          AI异常检测
        </el-menu-item>
        <el-menu-item index="/decision/operation-optimization">
          AI运营优化建议
        </el-menu-item>
        <el-menu-item index="/decision/risk-assessment">
          AI风险评估
        </el-menu-item>
      </el-menu>
    </el-card>
    
    <!-- 路由视图 -->
    <router-view />
    
    <!-- 决策详情弹窗 -->
    <el-dialog v-model="detailDialogVisible" title="决策详情" width="80%" append-to-body>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="决策ID">{{ decisionDetail.id }}</el-descriptions-item>
        <el-descriptions-item label="决策编号">{{ decisionDetail.decisionNo }}</el-descriptions-item>
        <el-descriptions-item label="决策类型">{{ decisionDetail.decisionTypeName }}</el-descriptions-item>
        <el-descriptions-item label="触发类型">{{ decisionDetail.triggerTypeName }}</el-descriptions-item>
        <el-descriptions-item label="业务类型">{{ decisionDetail.businessType }}</el-descriptions-item>
        <el-descriptions-item label="业务ID">{{ decisionDetail.businessId }}</el-descriptions-item>
        <el-descriptions-item label="置信度" span="2">{{ decisionDetail.confidence }}%</el-descriptions-item>
        <el-descriptions-item label="优先级">{{ decisionDetail.priorityName }}</el-descriptions-item>
        <el-descriptions-item label="状态">{{ decisionDetail.statusName }}</el-descriptions-item>
        <el-descriptions-item label="自动执行">
          <el-tag :type="decisionDetail.autoExecute ? 'success' : 'info'">
            {{ decisionDetail.autoExecute ? '是' : '否' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="处理人">{{ decisionDetail.handlerName || '无' }}</el-descriptions-item>
        <el-descriptions-item label="创建时间" span="2">{{ decisionDetail.createTime }}</el-descriptions-item>
        <el-descriptions-item label="处理时间">{{ decisionDetail.handleTime || '未处理' }}</el-descriptions-item>
        <el-descriptions-item label="AI分析" span="2">
          <el-divider orientation="left">AI分析内容</el-divider>
          <div class="ai-analysis-content">{{ decisionDetail.aiAnalysis || '无' }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="输入数据" span="2">
          <el-divider orientation="left">输入数据</el-divider>
          <pre class="json-content">{{ formatJson(decisionDetail.inputData) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="决策结果" span="2">
          <el-divider orientation="left">决策结果</el-divider>
          <pre class="json-content">{{ formatJson(decisionDetail.decisionResult) }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="建议操作" span="2">
          <el-divider orientation="left">建议操作</el-divider>
          <div v-if="decisionDetail.suggestedActions && decisionDetail.suggestedActions.length > 0">
            <el-collapse>
              <el-collapse-item v-for="(action, index) in decisionDetail.suggestedActions" :key="index" :title="`操作 ${index + 1}`">
                <pre class="json-content">{{ formatJson(action) }}</pre>
              </el-collapse-item>
            </el-collapse>
          </div>
          <div v-else>无建议操作</div>
        </el-descriptions-item>
        <el-descriptions-item label="操作日志" span="2">
          <el-divider orientation="left">操作日志</el-divider>
          <div v-if="decisionDetail.actionLogs && decisionDetail.actionLogs.length > 0">
            <el-timeline>
              <el-timeline-item v-for="(log, index) in decisionDetail.actionLogs" :key="index" :timestamp="log.createTime">
                {{ log.action }} - {{ log.description }}
              </el-timeline-item>
            </el-timeline>
          </div>
          <div v-else>无操作日志</div>
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { authApi } from '@/api/auth'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// 当前激活的菜单
const activeMenu = computed(() => {
  return route.fullPath
})

// 详情弹窗可见性
const detailDialogVisible = ref(false)

// 决策详情数据
const decisionDetail = ref({})

// 格式化JSON数据的辅助函数
const formatJson = (data) => {
  if (!data) return '无'
  try {
    return JSON.stringify(data, null, 2)
  } catch (error) {
    return data
  }
}

// 获取决策详情
const fetchDecisionDetail = async (id) => {
  try {
    const response = await authApi.getDecisionDetail(id)
    decisionDetail.value = response
    detailDialogVisible.value = true
  } catch (error) {
    console.error('获取决策详情失败:', error)
    ElMessage.error('获取决策详情失败')
  }
}

// 显示决策详情
const showDecisionDetail = (rowOrId) => {
  const id = typeof rowOrId === 'number' ? rowOrId : rowOrId.id
  fetchDecisionDetail(id)
}

// 组件挂载时，默认跳转到决策列表
onMounted(() => {
  if (route.path === '/decision' && !route.fullPath.includes('/decision/')) {
    router.push('/decision/list')
  }
})
</script>

<style scoped>
.decision-container {
  padding: 20px;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 20px;
  color: #303133;
}

.query-card {
  margin-bottom: 20px;
}

.demo-form-inline {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 详情弹窗样式 */
.json-content {
  background-color: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
}

.ai-analysis-content {
  padding: 10px;
  line-height: 1.5;
}

/* 统计数据样式 */
.statistics-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.statistics-row {
  margin-bottom: 20px;
}

.statistic-card {
  height: 100%;
  transition: all 0.3s ease;
}

.statistic-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}

.statistic-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
}

.statistic-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.statistic-value.pending {
  color: #e6a23c;
}

.statistic-value.adopted {
  color: #67c23a;
}

.statistic-value.today {
  color: #409eff;
}

.statistic-value.executed {
  color: #909399;
}

.statistic-value.failed {
  color: #f56c6c;
}

.statistic-value.ignored {
  color: #909399;
}

.statistic-value.confidence {
  color: #67c23a;
}

.statistics-detail-row {
  margin-top: 20px;
}

.detail-card {
  height: 100%;
}

.detail-header {
  font-size: 14px;
  font-weight: bold;
  color: #303133;
}
</style>