<template>
  <div class="profile-container">
    <div class="profile-header">
      <h2>个人资料</h2>
    </div>
    
    <div class="profile-content">
      <el-card shadow="hover" class="profile-card">
        <!-- 头像部分 -->
        <div class="avatar-section">
          <el-avatar :size="120" :src="userInfo.avatar">
            <el-icon><UserFilled /></el-icon>
          </el-avatar>
        </div>
        
        <!-- 基本信息部分 -->
        <div class="info-section">
          <el-row :gutter="20">
            <!-- 用户名 -->
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">用户名</label>
                <div class="info-value">{{ userInfo.username || '-' }}</div>
              </div>
            </el-col>
            
            <!-- 昵称 -->
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">昵称</label>
                <div class="info-value">{{ userInfo.name || '-' }}</div>
              </div>
            </el-col>
            
            <!-- 管理员类型 -->
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">管理员类型</label>
                <div class="info-value">{{ userInfo.typeName || '-' }}</div>
              </div>
            </el-col>
            
            <!-- 最后登录时间 -->
            <el-col :span="12">
              <div class="info-item">
                <label class="info-label">最后登录时间</label>
                <div class="info-value">{{ formatDate(userInfo.lastLoginTime) || '-' }}</div>
              </div>
            </el-col>
            
            <!-- 创建时间 -->
            <el-col :span="24">
              <div class="info-item">
                <label class="info-label">创建时间</label>
                <div class="info-value">{{ formatDate(userInfo.createTime) || '-' }}</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </el-card>
      
      <!-- 操作按钮 -->
      <div class="action-section">
        <el-button type="primary" @click="editProfile">编辑资料</el-button>
        <el-button @click="showChangePasswordDialog">修改密码</el-button>
      </div>
    </div>
    
    <!-- 编辑资料对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="编辑资料"
      width="500px"
    >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item label="昵称" prop="name">
          <el-input v-model="editForm.name" placeholder="请输入昵称" />
        </el-form-item>
        
        <el-form-item label="头像">
          <el-upload
            class="avatar-uploader"
            :show-file-list="false"
            :before-upload="beforeAvatarUpload"
            :auto-upload="false"
            @change="handleAvatarChange"
            ref="avatarUploadRef"
          >
            <el-avatar :size="100" :src="editForm.avatar">
              <el-icon v-if="uploadLoading"><Loading /></el-icon>
              <el-icon v-else><UserFilled /></el-icon>
            </el-avatar>
            <template #trigger>
              <div class="avatar-upload-btn">
                <el-icon><Upload /></el-icon>
                更换头像
              </div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveProfile" :loading="saveLoading">保存</el-button>
        </div>
      </template>
    </el-dialog>
    
    <!-- 修改密码对话框 -->
    <el-dialog
      v-model="passwordDialogVisible"
      title="修改密码"
      width="500px"
    >
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入旧密码"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码（8-20位，包含字母和数字）"
            show-password
          />
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="changePassword" :loading="passwordLoading">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { UserFilled, Upload, Loading } from '@element-plus/icons-vue'
import { authApi } from '@/api/auth'
import { useAdminStore } from '@/store/adminStore'

const adminStore = useAdminStore()

// 用户信息数据
const userInfo = ref({
  id: '',
  username: '',
  name: '',
  avatar: '',
  createTime: '',
  lastLoginTime: '',
  type: 0,
  typeName: ''
})

// 编辑对话框状态
const dialogVisible = ref(false)
const saveLoading = ref(false)
const uploadLoading = ref(false)

// 修改密码对话框状态
const passwordDialogVisible = ref(false)
const passwordLoading = ref(false)

// 编辑表单
const editForm = reactive({
  name: '',
  avatar: ''
})

// 修改密码表单
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单引用
const editFormRef = ref()
const avatarUploadRef = ref()
const passwordFormRef = ref()

// 表单验证规则
const editRules = {
  name: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '昵称长度在 2 到 20 个字符', trigger: 'blur' }
  ]
}

// 修改密码表单验证规则
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 8, max: 20, message: '密码长度在 8 到 20 个字符', trigger: 'blur' },
    { pattern: /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/, message: '密码必须包含字母和数字', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

// 添加时间戳，破坏缓存
const addTimestamp = (url) => {
  if (!url) return url
  const timestamp = new Date().getTime()
  // 如果URL已经有参数，添加&timestamp=xxx，否则添加?timestamp=xxx
  return url.includes('?') ? `${url}&timestamp=${timestamp}` : `${url}?timestamp=${timestamp}`
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (e) {
    return dateString
  }
}

// 获取个人信息
const getProfileInfo = async () => {
  try {
    console.log('开始调用getProfile API...')
    const profileData = await authApi.getProfile()
    console.log('API响应数据:', profileData)
    console.log('响应类型:', typeof profileData)
    
    // 检查响应格式 - 注意：由于响应拦截器的处理，返回的直接是res.data
    if (typeof profileData === 'object' && profileData !== null) {
      // 检查是否包含id字段，判断是否是有效的管理员信息
      if (profileData.id !== undefined) {
        userInfo.value = profileData
        console.log('个人信息更新成功:', userInfo.value)
      } else {
        console.error('API返回错误，缺少必要字段:', profileData)
        ElMessage.error('获取个人信息失败：数据格式错误')
      }
    } else {
      console.error('API返回格式错误，预期对象但得到:', profileData)
      ElMessage.error('获取个人信息失败：API返回格式错误')
    }
  } catch (error) {
    console.error('API请求失败:', error)
    console.error('错误详情:', error.response || error.message || error)
    
    // 处理网络错误
    if (error.message === 'Failed to fetch') {
      ElMessage.error('网络请求失败，请检查网络连接或API配置')
    } else {
      ElMessage.error(`获取个人信息失败: ${error.message || '未知错误'}`)
    }
  }
}

// 编辑资料
const editProfile = () => {
  console.log('开始编辑资料...')
  // 填充编辑表单
  editForm.name = userInfo.value.name
  // 添加时间戳，破坏缓存
  editForm.avatar = addTimestamp(userInfo.value.avatar || '')
  console.log('编辑表单已填充，头像URL:', editForm.avatar)
  // 显示编辑对话框
  dialogVisible.value = true
  console.log('编辑对话框已显示')
}

// 显示修改密码对话框
const showChangePasswordDialog = () => {
  // 重置表单
  Object.assign(passwordForm, {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  // 清除表单验证
  if (passwordFormRef.value) {
    passwordFormRef.value.clearValidate()
  }
  // 显示对话框
  passwordDialogVisible.value = true
}

// 修改密码
const changePassword = async () => {
  try {
    // 表单验证
    await passwordFormRef.value.validate()
    
    // 显示加载状态
    passwordLoading.value = true
    
    // 调用API修改密码
    await authApi.changePassword({
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword
    })
    
    // 显示成功提示
    ElMessage.success('密码修改成功')
    
    // 关闭对话框
    passwordDialogVisible.value = false
    
    // 重置表单
    Object.assign(passwordForm, {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  } catch (error) {
    console.error('修改密码失败:', error)
    if (error.message !== '请求失败') {
      ElMessage.error(error.message || '修改密码失败')
    } else {
      ElMessage.error('修改密码失败：' + (error.response?.data?.msg || '未知错误'))
    }
  } finally {
    // 隐藏加载状态
    passwordLoading.value = false
  }
}

// 保存资料
const saveProfile = async () => {
  try {
    console.log('开始保存资料...')
    
    // 表单验证
    console.log('开始表单验证...')
    await editFormRef.value.validate()
    console.log('表单验证成功')
    
    // 显示保存加载状态
    saveLoading.value = true
    console.log('保存加载状态已显示')
    
    // 调用更新API
    console.log('开始调用更新API...')
    console.log('更新API参数:', {
      name: editForm.name,
      avatar: editForm.avatar
    })
    await authApi.updateProfile({
      name: editForm.name,
      avatar: editForm.avatar
    })
    console.log('更新API调用成功')
    
    // 更新本地数据
    console.log('开始更新本地数据...')
    userInfo.value.name = editForm.name
    console.log('用户名已更新:', userInfo.value.name)
    
    // 更新头像，添加时间戳，破坏缓存
    const avatarUrl = addTimestamp(editForm.avatar)
    userInfo.value.avatar = avatarUrl
    console.log('头像已更新:', avatarUrl)
    
    // 同步更新adminStore中的信息，确保右上角和控制台的头像也能显示
    console.log('开始更新adminStore...')
    adminStore.updateAdminInfo({
      name: editForm.name,
      avatar: avatarUrl
    })
    console.log('adminStore已更新')
    
    // 使用nextTick确保视图更新
    console.log('等待视图更新...')
    await nextTick()
    console.log('视图已更新')
    
    ElMessage.success('保存成功')
    console.log('保存成功，关闭对话框')
    dialogVisible.value = false
  } catch (error) {
    console.error('保存失败:', error)
    console.error('错误详情:', error.response || error.message || error)
    
    if (error.message !== '请求失败') {
      ElMessage.error(error.message || '保存失败')
    } else {
      ElMessage.error('保存失败：' + (error.response?.data?.msg || '未知错误'))
    }
  } finally {
    // 隐藏保存加载状态
    saveLoading.value = false
    console.log('保存加载状态已隐藏')
  }
}

// 处理头像选择变化
const handleAvatarChange = async (file) => {
  try {
    console.log('开始处理头像选择变化...')
    console.log('文件对象:', file)
    
    // 正确获取选中的文件
    let selectedFile
    if (file.file) {
      // 如果是包含file和fileList的对象
      selectedFile = file.file
      console.log('通过file.file获取到文件:', selectedFile)
    } else if (file.raw) {
      // 如果是Element Plus的UploadFile对象
      selectedFile = file.raw
      console.log('通过file.raw获取到文件:', selectedFile)
    } else if (Array.isArray(file)) {
      // 如果是文件列表数组
      selectedFile = file[0]?.raw || file[0]
      console.log('通过文件列表数组获取到文件:', selectedFile)
    } else if (file) {
      // 如果直接是文件对象
      selectedFile = file
      console.log('直接获取到文件:', selectedFile)
    } else {
      console.error('无法获取到选中的文件')
      return
    }
    
    if (!selectedFile) {
      console.error('未获取到选中的文件')
      return
    }
    
    // 手动调用上传前验证
    console.log('开始验证头像...')
    const isValid = beforeAvatarUpload(selectedFile)
    if (!isValid) {
      console.error('头像验证失败')
      return
    }
    console.log('头像验证成功')
    
    // 生成临时本地预览URL
    console.log('开始生成本地预览URL...')
    const localUrl = URL.createObjectURL(selectedFile)
    console.log('本地预览URL:', localUrl)
    
    // 更新编辑表单中的头像预览
    editForm.avatar = localUrl
    console.log('编辑表单头像已更新为本地预览URL')
    
    // 显示上传加载状态
    uploadLoading.value = true
    console.log('上传加载状态已显示')
    
    // 调用头像上传API
    console.log('开始调用头像上传API...')
    const uploadResponse = await authApi.uploadAvatar(selectedFile)
    console.log('头像上传API响应:', uploadResponse)
    
    // 保存上传后的头像URL到编辑表单，添加时间戳，破坏缓存
    const avatarUrl = addTimestamp(uploadResponse.data)
    editForm.avatar = avatarUrl
    console.log('编辑表单头像已更新为服务器返回的URL:', avatarUrl)
    
    // 同时更新主页面的头像，添加时间戳，破坏缓存
    userInfo.value.avatar = avatarUrl
    console.log('主页面头像已更新为服务器返回的URL:', avatarUrl)
    
    // 同步更新adminStore中的头像信息
    adminStore.updateAdminInfo({
      avatar: avatarUrl
    })
    console.log('adminStore头像已更新')
    
    // 使用nextTick确保视图更新
    await nextTick()
    console.log('视图已更新')
    
    // 释放本地URL，避免内存泄漏
    URL.revokeObjectURL(localUrl)
    console.log('本地预览URL已释放')
    
    ElMessage.success('头像上传成功')
    console.log('头像上传流程完成')
  } catch (error) {
    console.error('头像上传失败:', error)
    console.error('错误详情:', error.response || error.message || error)
    ElMessage.error('头像上传失败：' + (error.message || '未知错误'))
  } finally {
    // 隐藏上传加载状态
    uploadLoading.value = false
    console.log('上传加载状态已隐藏')
  }
}

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  
  if (!isJPG) {
    ElMessage.error('只能上传 JPG/PNG 格式的图片!')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
  }
  
  return isJPG && isLt2M
}

// 组件挂载时获取个人信息
onMounted(() => {
  getProfileInfo()
})
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  margin-bottom: 20px;
}

.profile-header h2 {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.profile-card {
  border-radius: 12px;
  overflow: hidden;
  background-color: #ffffff;
}

.avatar-section {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-section {
  padding: 20px;
}

.info-item {
  margin-bottom: 20px;
}

.info-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 8px;
}

.info-value {
  font-size: 16px;
  color: #303133;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
  min-height: 36px;
  display: flex;
  align-items: center;
}

.action-section {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

/* 编辑对话框样式 */
.avatar-upload-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  margin-top: 10px;
  background-color: #409eff;
  color: #ffffff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.avatar-upload-btn:hover {
  background-color: #66b1ff;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }
  
  .info-section {
    padding: 15px;
  }
  
  .info-value {
    font-size: 14px;
  }
}
</style>