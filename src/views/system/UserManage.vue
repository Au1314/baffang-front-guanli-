<template>
  <div class="user-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>用户管理</h2>
        </div>
      </template>
      
      <!-- 搜索过滤区域 -->
      <el-form :model="searchForm" :inline="true" label-width="80px" class="search-form">
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="用户名/昵称/手机号"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        
        <el-form-item label="用户类型">
          <el-select v-model="searchForm.type" placeholder="全部" clearable style="width: 120px;">
            <el-option label="普通用户" :value="'0'" />
            <el-option label="VIP用户" :value="'1'" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="车辆认证">
          <el-select v-model="searchForm.authVehicle" placeholder="全部" clearable style="width: 120px;">
            <el-option label="未认证" :value="'0'" />
            <el-option label="审核中" :value="'1'" />
            <el-option label="已认证" :value="'2'" />
            <el-option label="已拒绝" :value="'3'" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="充电桩认证" label-width="100px">
          <el-select v-model="searchForm.authChargingStation" placeholder="全部" clearable style="width: 120px;">
            <el-option label="未认证" :value="'0'" />
            <el-option label="审核中" :value="'1'" />
            <el-option label="已认证" :value="'2'" />
            <el-option label="已拒绝" :value="'3'" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="账户状态">
          <el-select v-model="searchForm.status" placeholder="全部" clearable style="width: 120px;">
            <el-option label="正常" :value="'0'" />
            <el-option label="已禁用" :value="'1'" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
      
      <!-- 操作栏 -->
      <div class="operation-bar" style="margin-bottom: 16px;">
        <el-button 
          type="danger" 
          @click="handleBatchDelete" 
          :disabled="selectedIds.length === 0"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </div>
      
      <!-- 用户列表 -->
      <el-table
        :data="userList"
        stripe
        border
        style="width: 100%"
        v-loading="loading"
        @row-click="handleRowClick"
        :row-class-name="'user-row'"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="用户ID" width="80" align="center" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="name" label="昵称" width="120" />
        <el-table-column prop="email" label="邮箱" width="180" />
        <el-table-column prop="phone" label="手机号" width="120" />
        <el-table-column prop="typeName" label="用户类型" width="100" align="center" />
        <el-table-column prop="authVehicleName" label="车辆认证" width="120" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.authVehicle === 2 ? 'success' : scope.row.authVehicle === 1 ? 'warning' : 'info'"
            >
              {{ scope.row.authVehicleName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="authChargingStationName" label="充电桩认证" width="120" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.authChargingStation === 2 ? 'success' : scope.row.authChargingStation === 1 ? 'warning' : 'info'"
            >
              {{ scope.row.authChargingStationName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="balance" label="余额" width="100" align="center">
          <template #default="scope">
            {{ scope.row.balance.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="points" label="积分" width="80" align="center" />
        <el-table-column prop="statusName" label="账户状态" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.statusName === '正常' ? 'success' : 'danger'">
              {{ scope.row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="注册时间" width="180" align="center" />
        <el-table-column prop="lastLoginTime" label="最后登录" width="180" align="center" />
        <el-table-column label="操作" min-width="400px" align="center">
          <template #default="scope">
            <el-button type="primary" size="small" @click.stop="handleViewDetail(scope.row.id)">
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button
              v-if="scope.row.statusName === '正常'"
              type="danger"
              size="small"
              @click.stop="handleDisableUser(scope.row)"
            >
              <el-icon><Close /></el-icon>
              禁用
            </el-button>
            <el-button
              v-else
              type="success"
              size="small"
              @click.stop="handleEnableUser(scope.row)"
            >
              <el-icon><Check /></el-icon>
              启用
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click.stop="handleResetPassword(scope.row)"
            >
              <el-icon><Key /></el-icon>
              重置密码
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click.stop="handleDeleteUser(scope.row)"
            >
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.pageNum"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Delete, View, Check, Close, Key } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'

// 路由
const router = useRouter()

// 加载状态
const loading = ref(false)

// 搜索表单
const searchForm = ref({
  keyword: '',
  type: null,
  authVehicle: null,
  authChargingStation: null,
  status: null,
  startTime: undefined,
  endTime: undefined
})

// 用户列表数据
const userList = ref([])

// 选中的用户ID列表
const selectedIds = ref([])

// 分页信息
const pagination = ref({
  pageNum: 1,
  pageSize: 10,
  total: 0,
  pages: 0
})

// 获取用户列表
const getUserList = async () => {
  loading.value = true
  try {
    const params = {
      ...searchForm.value,
      pageNum: pagination.value.pageNum,
      pageSize: pagination.value.pageSize
    }
    
    // 将字符串类型的参数转换为数字类型
    if (params.type !== null && params.type !== undefined) {
      params.type = Number(params.type)
    }
    if (params.authVehicle !== null && params.authVehicle !== undefined) {
      params.authVehicle = Number(params.authVehicle)
    }
    if (params.authChargingStation !== null && params.authChargingStation !== undefined) {
      params.authChargingStation = Number(params.authChargingStation)
    }
    if (params.status !== null && params.status !== undefined) {
      params.status = Number(params.status)
    }
    
    // 移除null和undefined值
    Object.keys(params).forEach(key => {
      if (params[key] === null || params[key] === undefined) {
        delete params[key]
      }
    })
    
    const response = await authApi.getUserList(params)
    userList.value = response.list || []
    pagination.value.total = response.total || 0
    pagination.value.pages = response.pages || 0
  } catch (error) {
    ElMessage.error('获取用户列表失败')
    console.error('获取用户列表失败:', error)
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  pagination.value.pageNum = 1
  getUserList()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value = {
    keyword: '',
    type: null,
    authVehicle: null,
    authChargingStation: null,
    status: null,
    startTime: undefined,
    endTime: undefined
  }
  pagination.value.pageNum = 1
  getUserList()
}

// 页码变化
const handleCurrentChange = (current) => {
  pagination.value.pageNum = current
  getUserList()
}

// 每页条数变化
const handleSizeChange = (size) => {
  pagination.value.pageSize = size
  pagination.value.pageNum = 1
  getUserList()
}

// 查看详情
const handleViewDetail = (userId) => {
  router.push(`/system/user/${userId}`)
}

// 表格行点击
const handleRowClick = (row) => {
  router.push(`/system/user/${row.id}`)
}

// 禁用用户
const handleDisableUser = async (row) => {
  try {
    // 显示确认对话框，要求输入禁用原因
    const reason = await ElMessageBox.prompt(
      '请输入禁用原因',
      '确认禁用用户',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputValidator: (value) => {
          if (!value || value.trim() === '') {
            return '请输入禁用原因'
          }
        }
      }
    )
    
    // 调用API禁用用户
    await authApi.setUserStatus(row.id, 1, reason.value)
    ElMessage.success('用户已禁用')
    
    // 更新用户列表中的状态显示
    row.statusName = '已禁用'
  } catch (error) {
    if (error.type !== 'cancel') {
      ElMessage.error('禁用失败')
      console.error('禁用用户失败:', error)
    }
  }
}

// 启用用户
const handleEnableUser = async (row) => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      '确定要启用该用户吗？',
      '确认启用用户',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 调用API启用用户
    await authApi.setUserStatus(row.id, 0, '')
    ElMessage.success('用户已启用')
    
    // 更新用户列表中的状态显示
    row.statusName = '正常'
  } catch (error) {
    if (error.type !== 'cancel') {
      // 打印完整的错误信息，以便定位问题
      console.error('启用用户失败，完整错误信息:', error)
      // 显示更详细的错误信息
      if (error.response && error.response.data && error.response.data.msg) {
        ElMessage.error(`启用失败：${error.response.data.msg}`)
      } else {
        ElMessage.error('启用失败')
      }
    }
  }
}

// 重置用户密码
const handleResetPassword = async (row) => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      '确定要重置该用户的密码吗？重置后会生成新的随机密码。',
      '确认重置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 调用API重置密码
    const response = await authApi.resetUserPassword(row.id)
    
    // 显示成功提示，并展示生成的新密码
    ElMessage.success('密码重置成功')
    ElMessageBox.alert(
      `新密码：${response}`,
      '密码重置成功',
      {
        confirmButtonText: '确定',
        type: 'success'
      }
    )
  } catch (error) {
    if (error.type !== 'cancel') {
      // 打印完整的错误信息，以便定位问题
      console.error('重置密码失败，完整错误信息:', error)
      // 显示更详细的错误信息
      if (error.response && error.response.data && error.response.data.msg) {
        ElMessage.error(`重置密码失败：${error.response.data.msg}`)
      } else {
        ElMessage.error('重置密码失败')
      }
    }
  }
}

// 删除用户
const handleDeleteUser = async (row) => {
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      '确定要删除该用户吗？此操作不可恢复！',
      '确认删除用户',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // 调用API删除用户
    await authApi.deleteUser(row.id)
    
    // 显示成功提示
    ElMessage.success('用户删除成功')
    
    // 刷新用户列表
    getUserList()
  } catch (error) {
    if (error.type !== 'cancel') {
      // 打印完整的错误信息，以便定位问题
      console.error('删除用户失败，完整错误信息:', error)
      // 显示更详细的错误信息
      if (error.response && error.response.data && error.response.data.msg) {
        ElMessage.error(`删除失败：${error.response.data.msg}`)
      } else {
        ElMessage.error('删除失败')
      }
    }
  }
}

// 处理选择变化
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

// 批量删除用户
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning('请选择要删除的用户')
    return
  }
  
  try {
    // 显示确认对话框
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedIds.value.length} 个用户吗？此操作不可恢复！`,
      '确认批量删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // 调用API批量删除
    await authApi.deleteUsersBatch(selectedIds.value)
    
    // 显示成功提示
    ElMessage.success('批量删除成功')
    
    // 清空选择
    selectedIds.value = []
    
    // 刷新用户列表
    getUserList()
  } catch (error) {
    if (error.type !== 'cancel') {
      // 打印完整的错误信息，以便定位问题
      console.error('批量删除失败，完整错误信息:', error)
      // 显示更详细的错误信息
      if (error.response && error.response.data && error.response.data.msg) {
        ElMessage.error(`批量删除失败：${error.response.data.msg}`)
      } else {
        ElMessage.error('批量删除失败')
      }
    }
  }
}

// 初始加载数据
onMounted(() => {
  getUserList()
})
</script>

<style scoped>
.user-manage {
  padding: 0 20px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
  padding: 10px;
  background-color: var(--color-bg-page);
  border-radius: 4px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

/* 表格行样式 */
:deep(.el-table__row) {
  cursor: pointer;
  transition: all 0.3s;
}

/* 操作按钮间距优化 */
:deep(.el-table .el-button) {
  margin-right: 6px;
}

:deep(.el-table .el-button:last-child) {
  margin-right: 0;
}

:deep(.el-table__row):hover {
  background-color: #f0f5ff !important;
}

:deep(.el-table__row.current-row) {
  background-color: #e6f2ff !important;
}
</style>