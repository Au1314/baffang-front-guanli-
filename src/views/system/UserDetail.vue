<template>
  <div class="user-detail">
    <el-card>
      <template #header>
        <div class="card-header">
          <h2>用户详情</h2>
          <div class="header-buttons">
            <el-button v-if="!isEditing" type="primary" @click="handleEdit">
              <el-icon><EditPen /></el-icon>
              编辑
            </el-button>
            <template v-else>
              <el-button type="success" @click="handleSave">
                <el-icon><Check /></el-icon>
                保存
              </el-button>
              <el-button type="info" @click="handleCancel">
                <el-icon><Close /></el-icon>
                取消
              </el-button>
            </template>
            <el-button type="primary" @click="handleBack">
              <el-icon><ArrowLeft /></el-icon>
              返回列表
            </el-button>
          </div>
        </div>
      </template>
      
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <!-- 用户详情内容 -->
      <template v-else>
        <!-- 基本信息 -->
        <el-card class="detail-section">
          <template #header>
            <h3>基本信息</h3>
          </template>
          
          <!-- 查看模式 -->
          <div v-if="!isEditing" class="detail-content">
            <div class="detail-row">
              <div class="detail-item">
                <label>用户ID：</label>
                <span>{{ userInfo.id }}</span>
              </div>
              <div class="detail-item">
                <label>用户名：</label>
                <span>{{ userInfo.username }}</span>
              </div>
              <div class="detail-item">
                <label>昵称：</label>
                <span>{{ userInfo.name }}</span>
              </div>
              <div class="detail-item">
                <label>邮箱：</label>
                <span>{{ userInfo.email }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <label>手机号：</label>
                <span>{{ userInfo.phone }}</span>
              </div>
              <div class="detail-item">
                <label>用户类型：</label>
                <el-tag :type="userInfo.type === 0 ? 'info' : 'success'">
                  {{ userInfo.typeName }}
                </el-tag>
              </div>
              <div class="detail-item">
                <label>账户状态：</label>
                <el-tag :type="userInfo.statusName === '正常' ? 'success' : 'danger'">
                  {{ userInfo.statusName }}
                </el-tag>
              </div>
              <div class="detail-item">
                <label>注册时间：</label>
                <span>{{ userInfo.createTime }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <label>最后登录时间：</label>
                <span>{{ userInfo.lastLoginTime || '从未登录' }}</span>
              </div>
              <div class="detail-item">
                <label>更新时间：</label>
                <span>{{ userInfo.updateTime }}</span>
              </div>
              <div class="detail-item">
                <label>头像：</label>
                <el-avatar :size="60" :src="userInfo.avatar || ''">
                  {{ userInfo.name?.charAt(0) || 'U' }}
                </el-avatar>
              </div>
            </div>
          </div>
          
          <!-- 编辑模式 -->
          <el-form
            v-else
            :model="editForm"
            :rules="editFormRules"
            label-width="100px"
            class="edit-form"
          >
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="昵称" prop="name">
                  <el-input v-model="editForm.name" placeholder="请输入昵称" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="手机号" prop="phone">
                  <el-input v-model="editForm.phone" placeholder="请输入手机号" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="editForm.email" placeholder="请输入邮箱" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="用户类型" prop="type">
                  <el-select v-model="editForm.type" placeholder="请选择用户类型">
                    <el-option label="普通用户" :value="0" />
                    <el-option label="VIP用户" :value="1" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="积分" prop="points">
                  <el-input-number v-model="editForm.points" :min="0" placeholder="请输入积分" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="余额" prop="balance">
                  <el-input-number v-model="editForm.balance" :min="0" :step="0.01" placeholder="请输入余额" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>
        
        <!-- 认证信息 -->
        <el-card class="detail-section">
          <template #header>
            <h3>认证信息</h3>
          </template>
          <div class="detail-content">
            <div class="detail-row">
              <div class="detail-item">
                <label>车辆认证：</label>
                <el-tag
                  :type="userInfo.authVehicle === 2 ? 'success' : userInfo.authVehicle === 1 ? 'warning' : 'info'"
                >
                  {{ userInfo.authVehicleName }}
                </el-tag>
              </div>
              <div class="detail-item">
                <label>充电桩认证：</label>
                <el-tag
                  :type="userInfo.authChargingStation === 2 ? 'success' : userInfo.authChargingStation === 1 ? 'warning' : 'info'"
                >
                  {{ userInfo.authChargingStationName }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 隐私设置 -->
        <el-card class="detail-section">
          <template #header>
            <h3>隐私设置</h3>
          </template>
          <div class="detail-content">
            <div class="detail-row">
              <div class="detail-item">
                <label>车辆信息隐私：</label>
                <el-tag :type="userInfo.privacyVehicle === 0 ? 'info' : 'warning'">
                  {{ userInfo.privacyVehicleName }}
                </el-tag>
              </div>
              <div class="detail-item">
                <label>充电桩信息隐私：</label>
                <el-tag :type="userInfo.privacyStation === 0 ? 'info' : 'warning'">
                  {{ userInfo.privacyStationName }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 资产信息 -->
        <el-card class="detail-section">
          <template #header>
            <h3>资产信息</h3>
          </template>
          <div class="detail-content">
            <div class="detail-row">
              <div class="detail-item">
                <label>余额：</label>
                <span class="balance">{{ userInfo.balance.toFixed(2) }} 元</span>
              </div>
              <div class="detail-item">
                <label>积分：</label>
                <span class="points">{{ userInfo.points }}</span>
              </div>
              <div class="detail-item">
                <label>订单数量：</label>
                <span>{{ userInfo.orderCount }}</span>
              </div>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <label>车辆数量：</label>
                <span>{{ userInfo.vehicleCount }}</span>
              </div>
              <div class="detail-item">
                <label>充电桩数量：</label>
                <span>{{ userInfo.stationCount }}</span>
              </div>
            </div>
          </div>
        </el-card>
        
        <!-- 其他信息 -->
        <el-card class="detail-section">
          <template #header>
            <h3>其他信息</h3>
          </template>
          <div class="detail-content">
            <div class="detail-row">
              <div class="detail-item full-width">
                <label>个性签名：</label>
                <span>{{ userInfo.signature || '未设置' }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </template>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { 
  ElMessage, 
  ElTag, 
  ElAvatar, 
  ElSkeleton, 
  ElForm, 
  ElFormItem, 
  ElInput, 
  ElSelect, 
  ElOption, 
  ElInputNumber,
  ElRow,
  ElCol
} from 'element-plus'
import { ArrowLeft, EditPen, Check, Close } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'

// 路由和路径
const router = useRouter()
const route = useRoute()

// 加载状态
const loading = ref(false)

// 编辑状态
const isEditing = ref(false)

// 编辑表单数据
const editForm = ref({})

// 用户详情数据
const userInfo = ref({})

// 表单验证规则
const editFormRules = ref({
  name: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 1, max: 20, message: '昵称长度在 1 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择用户类型', trigger: 'change' }
  ],
  points: [
    { type: 'number', message: '积分必须为数字', trigger: 'blur' },
    { min: 0, message: '积分不能为负数', trigger: 'blur' }
  ],
  balance: [
    { type: 'number', message: '余额必须为数字', trigger: 'blur' },
    { min: 0, message: '余额不能为负数', trigger: 'blur' }
  ]
})

// 获取用户详情
const getUserDetail = async (userId) => {
  loading.value = true
  try {
    const response = await authApi.getUserDetail(userId)
    userInfo.value = response
    // 初始化编辑表单数据
    editForm.value = {
      name: response.name,
      phone: response.phone,
      email: response.email,
      type: response.type,
      points: response.points,
      balance: response.balance
    }
  } catch (error) {
    ElMessage.error('获取用户详情失败')
    console.error('获取用户详情失败:', error)
  } finally {
    loading.value = false
  }
}

// 开始编辑
const handleEdit = () => {
  isEditing.value = true
}

// 保存编辑
const handleSave = async () => {
  try {
    // 这里可以添加表单验证逻辑
    await authApi.updateUser(userInfo.value.id, editForm.value)
    ElMessage.success('修改成功')
    // 更新用户信息
    await getUserDetail(userInfo.value.id)
    isEditing.value = false
  } catch (error) {
    ElMessage.error('修改失败')
    console.error('修改用户信息失败:', error)
  }
}

// 取消编辑
const handleCancel = () => {
  isEditing.value = false
  // 重置表单数据
  editForm.value = {
    name: userInfo.value.name,
    phone: userInfo.value.phone,
    email: userInfo.value.email,
    type: userInfo.value.type,
    points: userInfo.value.points,
    balance: userInfo.value.balance
  }
}

// 返回列表
const handleBack = () => {
  router.push('/system/user')
}

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    getUserDetail(newId)
  }
}, { immediate: true })

// 初始加载数据
onMounted(() => {
  const userId = route.params.id
  if (userId) {
    getUserDetail(userId)
  }
})
</script>

<style scoped>
.user-detail {
  padding: 0 20px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.loading-container {
  padding: 20px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h3 {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
}

.detail-content {
  padding: 10px 0;
}

.detail-row {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 15px;
}

.detail-item {
  flex: 0 0 25%;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
}

.detail-item.full-width {
  flex: 0 0 100%;
}

.detail-item label {
  width: 100px;
  font-weight: bold;
  color: #606266;
}

.detail-item span {
  color: #303133;
}

.balance {
  color: #67c23a;
  font-weight: bold;
}

.points {
  color: #e6a23c;
  font-weight: bold;
}

/* 编辑表单样式 */
.edit-form {
  padding: 20px 0;
}

/* 头部按钮样式 */
.header-buttons {
  display: flex;
  gap: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>