<template>
  <div class="data-export-container">
    <el-card shadow="never" class="data-export-card">
      <template #header>
        <div class="card-header">
          <span>数据导出管理</span>
          <el-alert
            type="warning"
            :closable="false"
            :show-icon="true"
            style="margin-left: 20px; flex: 1; max-width: 500px"
          >
            数据导出功能仅允许超级管理员使用，导出文件将通过浏览器下载
          </el-alert>
        </div>
      </template>
      
      <!-- 导出功能列表 -->
      <div class="export-functions">
        <!-- 审核记录导出 -->
        <el-card shadow="hover" class="export-card">
          <template #header>
            <div class="export-card-header">
              <el-icon class="card-icon"><Document /></el-icon>
              <span>审核记录导出</span>
            </div>
          </template>
          <div class="export-description">
            导出系统所有审核记录，包括私桩认证、车主认证、投诉、故障等
          </div>
          <div class="export-filters">
            <el-date-picker
              v-model="exportParams.auditRecords.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 300px; margin-right: 10px"
            />
            <el-select
              v-model="exportParams.auditRecords.auditType"
              placeholder="审核类型"
              style="width: 150px; margin-right: 10px"
              clearable
            >
              <el-option label="全部" :value="null" />
              <el-option label="私桩认证" :value="0" />
              <el-option label="车主认证" :value="1" />
              <el-option label="充电桩投诉" :value="2" />
              <el-option label="充电桩故障" :value="3" />
              <el-option label="评论举报" :value="4" />
              <el-option label="交易申诉" :value="5" />
            </el-select>
          </div>
          <div class="export-actions">
            <el-button
              type="primary"
              @click="handleExport('auditRecords')"
              :loading="exportLoading.auditRecords"
              size="large"
            >
              <el-icon><Download /></el-icon>
              导出审核记录
            </el-button>
            <el-tag v-if="exportStatus.auditRecords" :type="exportStatus.auditRecords === 'success' ? 'success' : 'warning'">
              {{ exportStatus.auditRecords === 'success' ? '导出成功' : '导出中...' }}
            </el-tag>
          </div>
        </el-card>
        
        <!-- 订单&用户数据导出 -->
        <el-card shadow="hover" class="export-card">
          <template #header>
            <div class="export-card-header">
              <el-icon class="card-icon"><List /></el-icon>
              <span>订单&用户数据导出</span>
            </div>
          </template>
          <div class="export-description">
            导出系统订单数据和用户信息，包括订单数量、用户统计等
          </div>
          <div class="export-filters">
            <el-date-picker
              v-model="exportParams.orderUser.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 300px; margin-right: 10px"
            />
          </div>
          <div class="export-actions">
            <el-button
              type="primary"
              @click="handleExport('orderUser')"
              :loading="exportLoading.orderUser"
              size="large"
            >
              <el-icon><Download /></el-icon>
              导出订单&用户数据
            </el-button>
            <el-tag v-if="exportStatus.orderUser" :type="exportStatus.orderUser === 'success' ? 'success' : 'warning'">
              {{ exportStatus.orderUser === 'success' ? '导出成功' : '导出中...' }}
            </el-tag>
          </div>
        </el-card>
        
        <!-- 订单明细/交易流水/退款记录导出 -->
        <el-card shadow="hover" class="export-card">
          <template #header>
            <div class="export-card-header">
              <el-icon class="card-icon"><Wallet /></el-icon>
              <span>订单明细/交易流水/退款记录导出</span>
            </div>
          </template>
          <div class="export-description">
            导出详细的订单明细、交易流水和退款记录，包含完整的交易信息
          </div>
          <div class="export-filters">
            <el-date-picker
              v-model="exportParams.orderDetails.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 300px; margin-right: 10px"
            />
            <el-select
              v-model="exportParams.orderDetails.orderType"
              placeholder="订单类型"
              style="width: 150px; margin-right: 10px"
              clearable
            >
              <el-option label="全部" :value="null" />
              <el-option label="充电订单" :value="0" />
              <el-option label="支付订单" :value="1" />
              <el-option label="退款订单" :value="2" />
            </el-select>
          </div>
          <div class="export-actions">
            <el-button
              type="primary"
              @click="handleExport('orderDetails')"
              :loading="exportLoading.orderDetails"
              size="large"
            >
              <el-icon><Download /></el-icon>
              导出订单明细
            </el-button>
            <el-tag v-if="exportStatus.orderDetails" :type="exportStatus.orderDetails === 'success' ? 'success' : 'warning'">
              {{ exportStatus.orderDetails === 'success' ? '导出成功' : '导出中...' }}
            </el-tag>
          </div>
        </el-card>
        
        <!-- 用户列表/黑白名单/成就激励记录导出 -->
        <el-card shadow="hover" class="export-card">
          <template #header>
            <div class="export-card-header">
              <el-icon class="card-icon"><User /></el-icon>
              <span>用户列表/黑白名单/成就激励记录导出</span>
            </div>
          </template>
          <div class="export-description">
            导出用户列表、黑白名单和成就激励记录，包含用户详细信息
          </div>
          <div class="export-filters">
            <el-select
              v-model="exportParams.userLists.exportType"
              placeholder="导出类型"
              style="width: 200px; margin-right: 10px"
              clearable
            >
              <el-option label="全部用户" :value="0" />
              <el-option label="黑名单用户" :value="1" />
              <el-option label="成就激励记录" :value="2" />
            </el-select>
          </div>
          <div class="export-actions">
            <el-button
              type="primary"
              @click="handleExport('userLists')"
              :loading="exportLoading.userLists"
              size="large"
            >
              <el-icon><Download /></el-icon>
              导出用户数据
            </el-button>
            <el-tag v-if="exportStatus.userLists" :type="exportStatus.userLists === 'success' ? 'success' : 'warning'">
              {{ exportStatus.userLists === 'success' ? '导出成功' : '导出中...' }}
            </el-tag>
          </div>
        </el-card>
        
        <!-- 平台数据备份与恢复 -->
        <el-card shadow="hover" class="export-card backup-card">
          <template #header>
            <div class="export-card-header">
              <el-icon class="card-icon"><Box /></el-icon>
              <span>平台数据管理</span>
            </div>
          </template>
          
          <!-- 备份平台数据 -->
          <div class="backup-section">
            <h4>备份平台数据</h4>
            <div class="export-description">
              备份当前平台所有数据，生成备份文件用于数据恢复
            </div>
            <div class="export-actions">
              <el-button
                type="primary"
                @click="handleBackup"
                :loading="exportLoading.backup"
                size="large"
              >
                <el-icon><Upload /></el-icon>
                备份平台数据
              </el-button>
              <el-tag v-if="exportStatus.backup" :type="exportStatus.backup === 'success' ? 'success' : 'warning'">
                {{ exportStatus.backup === 'success' ? '备份成功' : '备份中...' }}
              </el-tag>
            </div>
          </div>
          
          <!-- 回滚平台数据 -->
          <div class="rollback-section">
            <h4>回滚平台数据</h4>
            <div class="export-description">
              从备份文件中恢复平台数据，请谨慎操作，此操作不可逆
            </div>
            <div class="export-filters">
              <el-select
                v-model="exportParams.rollback.backupId"
                placeholder="选择备份文件"
                style="width: 250px; margin-right: 10px"
              >
                <el-option
                  v-for="backup in backupList"
                  :key="backup.id"
                  :label="`${backup.fileName} (${backup.createTime})`"
                  :value="backup.id"
                />
              </el-select>
            </div>
            <div class="export-actions">
              <el-button
                type="danger"
                @click="handleRollback"
                :loading="exportLoading.rollback"
                size="large"
              >
                <el-icon><RefreshRight /></el-icon>
                回滚平台数据
              </el-button>
              <el-tag v-if="exportStatus.rollback" :type="exportStatus.rollback === 'success' ? 'success' : 'warning'">
                {{ exportStatus.rollback === 'success' ? '回滚成功' : '回滚中...' }}
              </el-tag>
            </div>
          </div>
        </el-card>
      </div>
    </el-card>
    
    <!-- 导出进度弹窗 -->
    <el-dialog
      v-model="showProgressDialog"
      title="导出进度"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="progress-content">
        <el-progress :percentage="exportProgress" :status="exportProgress === 100 ? 'success' : 'active'" />
        <div class="progress-text">{{ progressText }}</div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showProgressDialog = false" :disabled="exportProgress < 100">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import {
  Document,
  List,
  Wallet,
  User,
  Box,
  Upload,
  Download,
  RefreshRight
} from '@element-plus/icons-vue'

const authStore = useAuthStore()

// 导出加载状态
const exportLoading = reactive({
  auditRecords: false,
  orderUser: false,
  orderDetails: false,
  userLists: false,
  backup: false,
  rollback: false
})

// 导出状态
const exportStatus = reactive({
  auditRecords: null,
  orderUser: null,
  orderDetails: null,
  userLists: null,
  backup: null,
  rollback: null
})

// 导出参数
const exportParams = reactive({
  auditRecords: {
    dateRange: [],
    auditType: null
  },
  orderUser: {
    dateRange: []
  },
  orderDetails: {
    dateRange: [],
    orderType: null
  },
  userLists: {
    exportType: 0
  },
  rollback: {
    backupId: ''
  }
})

// 备份列表
const backupList = ref([
  { id: 'backup_20260108_1000', fileName: 'platform_backup_20260108_1000.sql', createTime: '2026-01-08 10:00:00' },
  { id: 'backup_20260107_2200', fileName: 'platform_backup_20260107_2200.sql', createTime: '2026-01-07 22:00:00' },
  { id: 'backup_20260106_2200', fileName: 'platform_backup_20260106_2200.sql', createTime: '2026-01-06 22:00:00' }
])

// 导出进度
const showProgressDialog = ref(false)
const exportProgress = ref(0)
const progressText = ref('')

// 模拟导出进度
const simulateExportProgress = () => {
  showProgressDialog.value = true
  exportProgress.value = 0
  progressText.value = '开始导出...'
  
  const interval = setInterval(() => {
    exportProgress.value += Math.floor(Math.random() * 20) + 10
    
    if (exportProgress.value < 30) {
      progressText.value = '正在准备数据...'
    } else if (exportProgress.value < 70) {
      progressText.value = '正在生成文件...'
    } else if (exportProgress.value < 90) {
      progressText.value = '正在压缩文件...'
    } else {
      progressText.value = '导出完成，准备下载...'
    }
    
    if (exportProgress.value >= 100) {
      exportProgress.value = 100
      clearInterval(interval)
      setTimeout(() => {
        showProgressDialog.value = false
      }, 1000)
    }
  }, 500)
}

// 处理导出
const handleExport = async (type) => {
  try {
    exportLoading[type] = true
    exportStatus[type] = 'exporting'
    
    // 模拟API调用
    simulateExportProgress()
    
    // 模拟导出延迟
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    // 根据类型调用不同的API
    let response
    switch (type) {
      case 'auditRecords':
        response = await authApi.exportAuditRecords(exportParams.auditRecords)
        break
      case 'orderUser':
        response = await authApi.exportOrderUserData(exportParams.orderUser)
        break
      case 'orderDetails':
        response = await authApi.exportOrderDetails(exportParams.orderDetails)
        break
      case 'userLists':
        response = await authApi.exportUserLists(exportParams.userLists)
        break
      default:
        break
    }
    
    // 模拟文件下载
    const fileName = `${type}_export_${new Date().toISOString().slice(0, 10)}.xlsx`
    
    // 模拟下载成功
    ElMessage.success(`${type === 'auditRecords' ? '审核记录' : type === 'orderUser' ? '订单&用户数据' : type === 'orderDetails' ? '订单明细' : '用户数据'}导出成功`)
    exportStatus[type] = 'success'
    
    // 3秒后清除状态
    setTimeout(() => {
      exportStatus[type] = null
    }, 3000)
  } catch (error) {
    console.error(`${type}导出失败:`, error)
    ElMessage.error(`${type === 'auditRecords' ? '审核记录' : type === 'orderUser' ? '订单&用户数据' : type === 'orderDetails' ? '订单明细' : '用户数据'}导出失败`)
    exportStatus[type] = null
  } finally {
    exportLoading[type] = false
  }
}

// 处理备份
const handleBackup = async () => {
  try {
    exportLoading.backup = true
    exportStatus.backup = 'exporting'
    
    // 模拟备份进度
    simulateExportProgress()
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 3000))
    const response = await authApi.backupPlatformData({})
    
    // 模拟备份成功
    ElMessage.success('平台数据备份成功')
    exportStatus.backup = 'success'
    
    // 添加新备份到列表
    backupList.value.unshift({
      id: `backup_${Date.now()}`,
      fileName: `platform_backup_${new Date().toISOString().slice(0, 10)}_${Date.now()}.sql`,
      createTime: new Date().toLocaleString()
    })
    
    // 3秒后清除状态
    setTimeout(() => {
      exportStatus.backup = null
    }, 3000)
  } catch (error) {
    console.error('备份失败:', error)
    ElMessage.error('平台数据备份失败')
    exportStatus.backup = null
  } finally {
    exportLoading.backup = false
  }
}

// 处理回滚
const handleRollback = async () => {
  if (!exportParams.rollback.backupId) {
    ElMessage.warning('请选择备份文件')
    return
  }
  
  try {
    exportLoading.rollback = true
    exportStatus.rollback = 'exporting'
    
    // 确认回滚操作
    await ElMessageBox.confirm('确定要回滚平台数据吗？此操作不可逆，会覆盖当前所有数据！', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    // 模拟回滚进度
    simulateExportProgress()
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 3500))
    const response = await authApi.rollbackPlatformData({
      backupId: exportParams.rollback.backupId
    })
    
    // 模拟回滚成功
    ElMessage.success('平台数据回滚成功')
    exportStatus.rollback = 'success'
    
    // 3秒后清除状态
    setTimeout(() => {
      exportStatus.rollback = null
    }, 3000)
  } catch (error) {
    if (error === 'cancel') {
      return
    }
    console.error('回滚失败:', error)
    ElMessage.error('平台数据回滚失败')
    exportStatus.rollback = null
  } finally {
    exportLoading.rollback = false
  }
}

// 组件挂载时检查权限
onMounted(() => {
  if (!authStore.isSuperAdmin) {
    ElMessage.error('没有访问权限')
  }
})
</script>

<style scoped>
.data-export-container {
  padding: 20px;
  min-height: calc(100vh - 120px);
  background-color: var(--color-bg-page);
}

.data-export-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.export-functions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.export-card {
  margin-bottom: 10px;
  border-left: 4px solid var(--color-primary);
}

.export-card-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.card-icon {
  margin-right: 8px;
  color: var(--color-primary);
  font-size: 18px;
}

.export-description {
  margin: 15px 0;
  color: var(--color-text-regular);
  line-height: 1.5;
}

.export-filters {
  margin: 15px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.export-actions {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.backup-card {
  border-left-color: var(--color-success);
}

.backup-section,
.rollback-section {
  margin: 20px 0;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
}

.rollback-section {
  margin-top: 30px;
  border-top: 1px solid var(--color-border-lighter);
  padding-top: 25px;
}

.backup-section h4,
.rollback-section h4 {
  margin: 0 0 10px 0;
  font-size: 14px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.progress-content {
  padding: 20px 0;
}

.progress-text {
  margin-top: 15px;
  text-align: center;
  color: var(--color-text-regular);
}
</style>