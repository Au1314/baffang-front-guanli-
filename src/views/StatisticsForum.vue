<template>
  <div class="forum-statistics-container">
    <el-card shadow="never" class="forum-statistics-card">
      <template #header>
        <div class="card-header">
          <span>论坛统计</span>
        </div>
      </template>
      
      <!-- 操作栏 -->
      <div class="action-bar">
        <div class="overview-info">
          <el-tag type="info">数据更新时间：{{ formatUpdateTime }}</el-tag>
        </div>
        <div class="refresh-btn">
          <el-button type="primary" @click="loadForumStatistics" :loading="loading">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
        </div>
      </div>
      
      <!-- 加载状态 -->
      <el-skeleton :loading="loading" animated>
        <template #template>
          <div class="stats-grid">
            <div v-for="i in 9" :key="i" class="stats-item">
              <el-skeleton-item variant="text" style="width: 60%;" />
              <el-skeleton-item variant="text" style="width: 40%;" />
            </div>
          </div>
        </template>
        
        <!-- 统计数据展示 -->
        <div v-if="forumStats" class="stats-content">
          <!-- 帖子统计 -->
          <div class="stats-section">
            <h3 class="section-title">帖子统计</h3>
            <div class="stats-grid">
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Document /></el-icon>
                  <span>总帖子数</span>
                </div>
                <div class="stats-item-value">{{ forumStats.totalPostCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Calendar /></el-icon>
                  <span>今日帖子数</span>
                </div>
                <div class="stats-item-value">{{ forumStats.todayPostCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><ArrowUp /></el-icon>
                  <span>置顶帖子数</span>
                </div>
                <div class="stats-item-value">{{ forumStats.topPostCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Star /></el-icon>
                  <span>精华帖子数</span>
                </div>
                <div class="stats-item-value">{{ forumStats.essencePostCount }}</div>
              </el-card>
            </div>
          </div>
          
          <!-- 回复统计 -->
          <div class="stats-section">
            <h3 class="section-title">回复统计</h3>
            <div class="stats-grid">
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><ChatDotRound /></el-icon>
                  <span>总回复数</span>
                </div>
                <div class="stats-item-value">{{ forumStats.totalReplyCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Message /></el-icon>
                  <span>今日回复数</span>
                </div>
                <div class="stats-item-value">{{ forumStats.todayReplyCount }}</div>
              </el-card>
            </div>
          </div>
          
          <!-- 举报统计 -->
          <div class="stats-section">
            <h3 class="section-title">举报统计</h3>
            <div class="stats-grid">
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Warning /></el-icon>
                  <span>待处理帖子举报数</span>
                </div>
                <div class="stats-item-value">{{ forumStats.pendingPostReportCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Warning /></el-icon>
                  <span>待处理回复举报数</span>
                </div>
                <div class="stats-item-value">{{ forumStats.pendingReplyReportCount }}</div>
              </el-card>
              
              <el-card shadow="hover" class="stats-card-item">
                <div class="stats-item-header">
                  <el-icon class="stats-icon"><Check /></el-icon>
                  <span>本月已处理举报数</span>
                </div>
                <div class="stats-item-value">{{ forumStats.monthProcessedReportCount }}</div>
              </el-card>
            </div>
          </div>
        </div>
        
        <!-- 空数据提示 -->
        <div v-else-if="!loading" class="empty-container">
          <el-empty
            description="暂无数据"
            image="empty"
          >
            <el-button type="primary" @click="loadForumStatistics">重新加载</el-button>
          </el-empty>
        </div>
      </el-skeleton>
      
      <!-- 错误提示 -->
      <div v-if="error" class="error-container">
        <el-alert
          title="数据加载失败"
          :description="error"
          type="error"
          show-icon
          :closable="false"
        />
        <el-button type="primary" @click="loadForumStatistics" style="margin-top: 16px;">
          重新加载
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'
import { 
  Refresh, 
  Document, 
  Calendar, 
  ArrowUp, 
  Star, 
  ChatDotRound, 
  Message, 
  Warning, 
  Check 
} from '@element-plus/icons-vue'

// 状态管理
const loading = ref(true)
const error = ref('')
const forumStats = ref(null)
const updateTime = ref(new Date())

// 格式化更新时间
const formatUpdateTime = computed(() => {
  return updateTime.value.toLocaleString()
})

// 加载论坛统计数据
const loadForumStatistics = async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await authApi.getForumStatistics()
    forumStats.value = data
    updateTime.value = new Date()
    ElMessage.success('数据加载成功')
  } catch (err) {
    console.error('加载论坛统计数据失败:', err)
    error.value = '网络错误，请稍后重试'
    ElMessage.error('网络错误，请稍后重试')
  } finally {
    loading.value = false
  }
}

// 页面挂载时加载数据
onMounted(() => {
  loadForumStatistics()
})
</script>

<style scoped>
.forum-statistics-container {
  padding: 0 20px 20px;
}

.forum-statistics-card {
  margin-bottom: 20px;
}

.card-header {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.overview-info {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.refresh-btn {
  margin-left: auto;
}

.stats-content {
  padding: 20px 0;
}

.stats-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text-primary);
  margin-bottom: 16px;
  padding-left: 8px;
  border-left: 4px solid var(--color-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.stats-card-item {
  border: 1px solid var(--color-border-lighter);
  transition: all 0.3s ease;
  min-height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.stats-card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.stats-item-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  color: var(--color-text-regular);
  font-size: 14px;
  justify-content: center;
}

.stats-icon {
  margin-right: 8px;
  font-size: 18px;
  color: var(--color-primary);
}

.stats-item-value {
  font-size: 36px;
  font-weight: bold;
  color: var(--color-text-primary);
  text-align: center;
}

.empty-container {
  text-align: center;
  padding: 40px 0;
}

.error-container {
  text-align: center;
  padding: 40px 0;
}
</style>