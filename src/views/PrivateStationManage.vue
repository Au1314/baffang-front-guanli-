<template>
  <div class="private-station-manage-container">
    <el-card shadow="never" class="private-station-manage-card">
      <template #header>
        <div class="card-header">
          <span>私人电桩管理</span>
        </div>
      </template>
      
      <div class="private-station-content">
        <!-- 筛选条件 -->
        <div class="filter-bar" style="margin-bottom: 16px;">
          <el-input 
            v-model="privateStationFilter.name" 
            placeholder="请输入电桩名称" 
            style="width: 200px;" 
            clearable
            @keyup.enter="fetchPrivateStationList"
          />
          <el-select 
            v-model="privateStationFilter.status" 
            placeholder="请选择状态" 
            style="width: 120px;"
            clearable
          >
            <el-option label="空闲" :value="0" />
            <el-option label="已预约" :value="1" />
            <el-option label="充电中" :value="2" />
            <el-option label="异常" :value="3" />
          </el-select>
          <el-select 
            v-model="privateStationFilter.authStatus" 
            placeholder="请选择认证状态" 
            style="width: 120px;"
            clearable
          >
            <el-option label="未认证" :value="0" />
            <el-option label="审核中" :value="1" />
            <el-option label="已认证" :value="2" />
            <el-option label="认证失败" :value="3" />
          </el-select>
          <el-select 
            v-model="privateStationFilter.type" 
            placeholder="请选择类型" 
            style="width: 120px;"
            clearable
          >
            <el-option label="普通" :value="0" />
            <el-option label="专业" :value="1" />
          </el-select>
          <el-select 
            v-model="privateStationFilter.openStatus" 
            placeholder="请选择开放状态" 
            style="width: 120px;"
            clearable
          >
            <el-option label="关闭" :value="0" />
            <el-option label="开启" :value="1" />
          </el-select>
          <el-select 
            v-model="privateStationFilter.priceType" 
            placeholder="请选择定价类型" 
            style="width: 120px;"
            clearable
          >
            <el-option label="固定价格" :value="0" />
            <el-option label="动态价格" :value="1" />
          </el-select>
          <el-button type="primary" @click="fetchPrivateStationList">查询</el-button>
          <el-button @click="resetPrivateStationFilter">重置</el-button>
        </div>
        
        <!-- 私桩列表 -->
        <el-table :data="privateStationList" stripe style="width: 100%" :loading="privateStationLoading" @row-click="handleViewPrivateStationDetail" highlight-current-row row-class-name="clickable-row" class="private-station-table">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="电桩名称" min-width="140">
            <template #default="scope">
              <el-tooltip :content="scope.row.name" placement="top">
                <span class="ellipsis">{{ scope.row.name }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="locationName" label="位置" min-width="180">
            <template #default="scope">
              <el-tooltip :content="scope.row.locationName" placement="top">
                <span class="ellipsis">{{ scope.row.locationName }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="price" label="价格(元/度)" width="120" />
          <el-table-column prop="priceTypeName" label="定价类型" width="100" />
          <el-table-column prop="statusName" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)" size="small" effect="dark">
                {{ scope.row.statusName }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="authStatusName" label="认证状态" width="100">
            <template #default="scope">
              <el-tooltip :content="scope.row.authStatusName" placement="top">
                <span class="ellipsis">{{ scope.row.authStatusName }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="typeName" label="类型" width="80" />
          <el-table-column prop="openStatusName" label="开放状态" width="100">
            <template #default="scope">
              <el-tooltip :content="scope.row.openStatusName" placement="top">
                <span class="ellipsis">{{ scope.row.openStatusName }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="currentTypeName" label="电流类型" width="100">
            <template #default="scope">
              <el-tooltip :content="scope.row.currentTypeName" placement="top">
                <span class="ellipsis">{{ scope.row.currentTypeName }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="maxChargePower" label="最大充电功率(W)" width="150" />
          <el-table-column prop="rating" label="评分" width="80" />
          <el-table-column prop="createTime" label="创建时间" width="180">
            <template #default="scope">
              <el-tooltip :content="scope.row.createTime" placement="top">
                <span class="ellipsis">{{ scope.row.createTime }}</span>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220" fixed="right">
            <template #default="scope">
              <div class="operation-buttons">
                <!-- 详情按钮 -->
                <el-button 
                  size="small" 
                  type="primary" 
                  @click.stop="handleViewPrivateStationDetail(scope.row)"
                  class="detail-button"
                >
                  详情
                </el-button>
                
                <!-- 编辑按钮 -->
                <el-button 
                  size="small" 
                  type="warning" 
                  @click.stop="handleEditPrivateStation(scope.row)"
                  class="edit-button"
                >
                  编辑
                </el-button>
                
                <!-- 删除按钮 -->
                <el-button 
                  size="small" 
                  type="danger" 
                  @click.stop="handleOpenDeleteConfirm(scope.row)"
                  class="delete-button"
                >
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页控件 -->
        <div class="pagination" style="margin-top: 16px;">
          <el-pagination
            v-model:current-page="privateStationPage"
            v-model:page-size="privateStationPageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="privateStationTotal"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handlePrivateStationSizeChange"
            @current-change="handlePrivateStationPageChange"
            class="custom-pagination"
          />
        </div>
        
        <!-- 私桩详情对话框 -->
        <el-dialog
          v-model="showPrivateStationDetail"
          title="私桩详情"
          width="90%"
          :close-on-click-modal="false"
          append-to-body
        >
          <div v-if="currentPrivateStation" class="private-station-detail">
            <!-- 私桩详情内容 -->
            <el-descriptions :column="2" border>
              <el-descriptions-item label="电桩名称">{{ currentPrivateStation.name }}</el-descriptions-item>
              <el-descriptions-item label="ID">{{ currentPrivateStation.id }}</el-descriptions-item>
              <el-descriptions-item label="位置">{{ currentPrivateStation.locationName }}</el-descriptions-item>
              <el-descriptions-item label="经纬度">{{ currentPrivateStation.longitude }}, {{ currentPrivateStation.latitude }}</el-descriptions-item>
              <el-descriptions-item label="价格">{{ currentPrivateStation.price || 0 }}元/度</el-descriptions-item>
              <el-descriptions-item label="定价类型">{{ currentPrivateStation.priceTypeName }}</el-descriptions-item>
              <el-descriptions-item label="状态">{{ currentPrivateStation.statusName }}</el-descriptions-item>
              <el-descriptions-item label="认证状态">{{ currentPrivateStation.authStatusName }}</el-descriptions-item>
              <el-descriptions-item label="类型">{{ currentPrivateStation.typeName }}</el-descriptions-item>
              <el-descriptions-item label="开放状态">{{ currentPrivateStation.openStatusName }}</el-descriptions-item>
              <el-descriptions-item label="电流类型">{{ currentPrivateStation.currentTypeName }}</el-descriptions-item>
              <el-descriptions-item label="最大充电功率">{{ currentPrivateStation.maxChargePower }}W</el-descriptions-item>
              <el-descriptions-item label="最大充电电压">{{ currentPrivateStation.maxChargeVoltage }}V</el-descriptions-item>
              <el-descriptions-item label="最大充电电流">{{ currentPrivateStation.maxChargeCurrent }}A</el-descriptions-item>
              <el-descriptions-item label="最大车辆数">{{ currentPrivateStation.maxVehicles }}辆</el-descriptions-item>
              <el-descriptions-item label="当前车辆数">{{ currentPrivateStation.currentVehicles }}辆</el-descriptions-item>
              <el-descriptions-item label="评分">{{ currentPrivateStation.rating }}</el-descriptions-item>
              <el-descriptions-item label="所有者ID">{{ currentPrivateStation.ownerId }}</el-descriptions-item>
              <el-descriptions-item label="所有者名称">{{ currentPrivateStation.ownerName || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="所有者电话">{{ currentPrivateStation.ownerPhone || '未知' }}</el-descriptions-item>
              <el-descriptions-item label="所有者头像">
                <el-avatar
                  v-if="currentPrivateStation.ownerAvatar"
                  :src="formatImageUrl(currentPrivateStation.ownerAvatar)"
                  :size="40"
                />
                <span v-else>无头像</span>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ currentPrivateStation.createTime }}</el-descriptions-item>
              <el-descriptions-item label="更新时间">{{ currentPrivateStation.updateTime }}</el-descriptions-item>
              <el-descriptions-item label="开启时间">{{ currentPrivateStation.openTime || '未开启' }}</el-descriptions-item>
              <el-descriptions-item label="关闭时间">{{ currentPrivateStation.closeTime || '未关闭' }}</el-descriptions-item>
              <el-descriptions-item label="描述" :span="2">{{ currentPrivateStation.description || '无描述' }}</el-descriptions-item>
            </el-descriptions>
            
            <!-- 电桩图片 -->
            <div v-if="currentPrivateStation.image" style="margin-top: 20px;">
              <h4>电桩图片</h4>
              <el-image 
                :src="formatImageUrl(currentPrivateStation.image)" 
                fit="cover" 
                style="width: 100%; max-height: 400px;" 
                :preview-src-list="[formatImageUrl(currentPrivateStation.image)]"
              />
            </div>
          </div>
        </el-dialog>
        
        <!-- 编辑私桩对话框 -->
        <el-dialog
          v-model="showEditPrivateStation"
          title="编辑私桩信息"
          width="90%"
          :close-on-click-modal="false"
          append-to-body
        >
          <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="120px">
            <el-form-item label="电桩名称" prop="name">
              <el-input v-model="editForm.name" placeholder="请输入电桩名称" />
            </el-form-item>
            <el-form-item label="位置名称" prop="locationName">
              <el-input v-model="editForm.locationName" placeholder="请输入位置名称" />
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="经度" prop="longitude">
                  <el-input-number v-model="editForm.longitude" :precision="6" placeholder="请输入经度" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="纬度" prop="latitude">
                  <el-input-number v-model="editForm.latitude" :precision="6" placeholder="请输入纬度" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="充电价格(元/度)" prop="price">
              <el-input-number v-model="editForm.price" :precision="2" :min="0" placeholder="请输入充电价格" />
            </el-form-item>
            <el-form-item label="定价类型" prop="priceType">
              <el-select v-model="editForm.priceType" placeholder="请选择定价类型">
                <el-option label="固定价格" :value="0" />
                <el-option label="分时定价" :value="1" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态" prop="status">
              <el-select v-model="editForm.status" placeholder="请选择状态">
                <el-option label="空闲" :value="0" />
                <el-option label="已预约" :value="1" />
                <el-option label="充电中" :value="2" />
                <el-option label="异常" :value="3" />
              </el-select>
            </el-form-item>
            <el-form-item label="类型" prop="type">
              <el-select v-model="editForm.type" placeholder="请选择类型">
                <el-option label="普通私桩" :value="0" />
                <el-option label="专业私桩" :value="1" />
              </el-select>
            </el-form-item>
            <el-form-item label="电流类型" prop="currentType">
              <el-select v-model="editForm.currentType" placeholder="请选择电流类型">
                <el-option label="直流电" :value="0" />
                <el-option label="交流电" :value="1" />
              </el-select>
            </el-form-item>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-form-item label="最大充电电压(V)" prop="maxChargeVoltage">
                  <el-input-number v-model="editForm.maxChargeVoltage" :min="0" placeholder="请输入最大充电电压" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="最大充电电流(A)" prop="maxChargeCurrent">
                  <el-input-number v-model="editForm.maxChargeCurrent" :min="0" placeholder="请输入最大充电电流" />
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="最大充电功率(W)" prop="maxChargePower">
                  <el-input-number v-model="editForm.maxChargePower" :min="0" placeholder="请输入最大充电功率" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="开放状态" prop="openStatus">
              <el-select v-model="editForm.openStatus" placeholder="请选择开放状态">
                <el-option label="关闭" :value="0" />
                <el-option label="开启" :value="1" />
              </el-select>
            </el-form-item>
            <el-form-item label="图片URL" prop="image">
              <el-input v-model="editForm.image" placeholder="请输入图片URL" />
            </el-form-item>
            <el-form-item label="描述" prop="description">
              <el-input v-model="editForm.description" type="textarea" rows="4" placeholder="请输入描述" />
            </el-form-item>
          </el-form>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="handleCancelEdit">取消</el-button>
              <el-button type="primary" @click="handleSubmitEdit" :loading="submitting">提交</el-button>
            </div>
          </template>
        </el-dialog>
        
        <!-- 删除私桩确认对话框 -->
        <el-dialog
          v-model="showDeleteConfirm"
          title="删除确认"
          width="400px"
          :close-on-click-modal="false"
        >
          <div class="delete-confirm-content">
            <p>确定要删除该私人电桩吗？</p>
            <p class="delete-confirm-name" v-if="deleteTargetStation">
              <strong>{{ deleteTargetStation.name }}</strong>
            </p>
          </div>
          <template #footer>
            <div class="dialog-footer">
              <el-button @click="handleCancelDelete">取消</el-button>
              <el-button type="danger" @click="handleConfirmDelete" :loading="deleting">
                确认删除
              </el-button>
            </div>
          </template>
        </el-dialog>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/auth'
import { Edit, InfoFilled, ArrowDown, Delete } from '@element-plus/icons-vue'

// 私人电桩管理
const privateStationList = ref([])
const privateStationTotal = ref(0)
const privateStationPage = ref(1)
const privateStationPageSize = ref(20)
const privateStationLoading = ref(false)
const showPrivateStationDetail = ref(false)
const currentPrivateStation = ref(null)

// 删除私桩相关
const showDeleteConfirm = ref(false)
const deleteTargetStation = ref(null)
const deleting = ref(false)

const privateStationFilter = reactive({
  name: '',
  status: null,
  authStatus: null,
  type: null,
  openStatus: null,
  priceType: null
})

// 获取私桩列表
const fetchPrivateStationList = async () => {
  try {
    privateStationLoading.value = true
    const params = {
      pageNum: privateStationPage.value,
      pageSize: privateStationPageSize.value,
      name: privateStationFilter.name,
      status: privateStationFilter.status,
      authStatus: privateStationFilter.authStatus,
      type: privateStationFilter.type,
      openStatus: privateStationFilter.openStatus,
      priceType: privateStationFilter.priceType
    }
    
    const response = await authApi.getPrivateStationList(params)
    privateStationList.value = response.list || []
    privateStationTotal.value = response.total || 0
  } catch (error) {
    console.error('获取私桩列表失败:', error)
    ElMessage.error('获取私桩列表失败')
  } finally {
    privateStationLoading.value = false
  }
}

// 重置筛选条件
const resetPrivateStationFilter = () => {
  privateStationFilter.name = ''
  privateStationFilter.status = null
  privateStationFilter.authStatus = null
  privateStationFilter.type = null
  privateStationFilter.openStatus = null
  privateStationFilter.priceType = null
  fetchPrivateStationList()
}

// 分页大小变化
const handlePrivateStationSizeChange = (size) => {
  privateStationPageSize.value = size
  privateStationPage.value = 1
  fetchPrivateStationList()
}

// 页码变化
const handlePrivateStationPageChange = (page) => {
  privateStationPage.value = page
  fetchPrivateStationList()
}

// 查看私桩详情
const handleViewPrivateStationDetail = async (station) => {
  try {
    privateStationLoading.value = true
    const response = await authApi.getPrivateStationDetail(station.id)
    currentPrivateStation.value = response
    showPrivateStationDetail.value = true
  } catch (error) {
    console.error('获取私桩详情失败:', error)
    ElMessage.error('获取私桩详情失败')
  } finally {
    privateStationLoading.value = false
  }
}

// 编辑私桩相关
const showEditPrivateStation = ref(false)
const editFormRef = ref(null)
const submitting = ref(false)
const editForm = reactive({
  id: '',
  name: '',
  locationName: '',
  longitude: 0,
  latitude: 0,
  price: 0,
  priceType: 0,
  status: 0,
  type: 0,
  currentType: 0,
  maxChargeVoltage: 0,
  maxChargeCurrent: 0,
  maxChargePower: 0,
  openStatus: 0,
  image: '',
  description: ''
})

// 编辑表单验证规则
const editRules = {
  name: [{ required: true, message: '请输入电桩名称', trigger: 'blur' }],
  price: [{ required: true, message: '请输入充电价格', trigger: 'blur' }],
  priceType: [{ required: true, message: '请选择定价类型', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  openStatus: [{ required: true, message: '请选择开放状态', trigger: 'change' }]
}

// 打开编辑对话框
const handleEditPrivateStation = (station) => {
  // 重置表单
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
  // 填充表单数据
  Object.assign(editForm, station)
  showEditPrivateStation.value = true
}

// 取消编辑
const handleCancelEdit = () => {
  showEditPrivateStation.value = false
  if (editFormRef.value) {
    editFormRef.value.resetFields()
  }
}

// 打开删除确认对话框
const handleOpenDeleteConfirm = (station) => {
  deleteTargetStation.value = station
  showDeleteConfirm.value = true
}

// 取消删除
const handleCancelDelete = () => {
  showDeleteConfirm.value = false
  deleteTargetStation.value = null
}

// 确认删除
const handleConfirmDelete = async () => {
  if (!deleteTargetStation.value) return
  
  try {
    deleting.value = true
    await authApi.deletePrivateStation(deleteTargetStation.value.id)
    
    ElMessage.success('删除成功')
    showDeleteConfirm.value = false
    deleteTargetStation.value = null
    // 刷新列表
    fetchPrivateStationList()
  } catch (error) {
    console.error('删除私桩失败:', error)
    ElMessage.error('删除失败')
  } finally {
    deleting.value = false
  }
}

// 提交编辑
const handleSubmitEdit = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    submitting.value = true
    
    // 只发送后端期望的字段，排除描述性字段和不需要的字段
    const { id, statusName, typeName, currentTypeName, openStatusName, authStatusName, priceTypeName, authStatus, ownerId, ownerName, ownerPhone, rating, createTime, ...updateData } = editForm
    
    // 调用API修改私桩信息
    await authApi.updatePrivateStation(id, updateData)
    
    ElMessage.success('修改成功')
    showEditPrivateStation.value = false
    // 刷新列表
    fetchPrivateStationList()
  } catch (error) {
    console.error('修改私桩信息失败:', error)
    if (error !== false) {
      ElMessage.error('修改失败')
    }
  } finally {
    submitting.value = false
  }
}

// 处理操作栏命令
const handleOperation = (command, row) => {
  if (command === 'edit') {
    handleEditPrivateStation(row)
  } else if (command === 'detail') {
    handleViewPrivateStationDetail(row)
  } else if (command === 'delete') {
    handleOpenDeleteConfirm(row)
  }
}

// 格式化图片URL，去除可能的反引号和空格
const formatImageUrl = (url) => {
  if (typeof url === 'string') {
    return url.trim().replace(/^[`'"\s]+|[`'"\s]+$/g, '')
  }
  return url
}

// 获取状态标签类型
const getStatusTagType = (status) => {
  const statusTagMap = {
    0: 'success', // 空闲 - 绿色
    1: 'warning', // 已预约 - 橙色
    2: 'info', // 充电中 - 蓝色
    3: 'danger' // 异常 - 红色
  }
  return statusTagMap[status] || 'info'
}

// 组件挂载时获取私桩列表
onMounted(() => {
  fetchPrivateStationList()
})
</script>

<style scoped>
.private-station-manage-container {
  padding: 20px;
  min-height: calc(100vh - 120px);
  background-color: var(--color-bg-page);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.private-station-manage-card {
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: #fff;
}

.private-station-manage-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text-primary);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.private-station-content {
  padding: 20px 0;
}

/* 筛选查询区样式 */
.filter-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  padding: 16px;
  background-color: var(--color-bg-page);
  border-radius: 12px;
  border: 1px solid var(--color-border-lighter);
  transition: all 0.3s ease;
}

.filter-bar:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.filter-bar .el-input) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.filter-bar .el-input__inner) {
  border-radius: 8px;
  height: 36px;
  border: 1px solid var(--color-border-base);
  transition: all 0.3s ease;
  padding: 8px 16px;
}

:deep(.filter-bar .el-input__inner:hover) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.filter-bar .el-input__inner:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

:deep(.filter-bar .el-select) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.filter-bar .el-select .el-input__inner) {
  border-radius: 8px;
  height: 36px;
  border: 1px solid var(--color-border-base);
  transition: all 0.3s ease;
  padding: 8px 16px;
}

:deep(.filter-bar .el-select .el-input__inner:hover) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.filter-bar .el-select .el-input__inner:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.filter-bar .el-button {
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-bar .el-button--primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.filter-bar .el-button--primary:hover {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.filter-bar .el-button:not(.el-button--primary) {
  background-color: #fff;
  border-color: var(--color-border-base);
  color: var(--color-text-regular);
}

.filter-bar .el-button:not(.el-button--primary):hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.operation-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: nowrap;
  justify-content: flex-start;
  width: 100%;
  min-width: 160px;
}

.operation-buttons .el-button {
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
  transition: all 0.3s ease;
  min-width: 55px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.operation-buttons .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.operation-buttons .detail-button {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.operation-buttons .edit-button {
  background-color: var(--color-warning);
  border-color: var(--color-warning);
  color: #fff;
}

.operation-buttons .delete-button {
  background-color: var(--color-danger);
  border-color: var(--color-danger);
  color: #fff;
}

/* 数据表格样式优化 */
.private-station-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.private-station-table:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

:deep(.private-station-table .el-table) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.private-station-table .el-table th) {
  background-color: #fafafa;
  font-weight: 600;
  color: var(--color-text-primary);
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border-lighter);
}

:deep(.private-station-table .el-table tr:hover > td) {
  background-color: rgba(64, 158, 255, 0.05) !important;
  transition: all 0.3s ease;
}

:deep(.private-station-table .el-table__row:nth-child(even)) {
  background-color: #fafafa;
}

:deep(.private-station-table .el-table__row:nth-child(odd)) {
  background-color: #fff;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  width: 100%;
}

/* 操作按钮样式 */
.operation-dropdown-button {
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 11px;
  transition: all 0.3s ease;
  min-width: 55px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.operation-dropdown-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.private-station-detail {
  padding: 10px 0;
}

.clickable-row:hover {
  cursor: pointer;
  background-color: var(--color-bg-page);
}

.delete-confirm-content {
  text-align: center;
  padding: 20px 0;
}

.delete-confirm-name {
  color: var(--color-danger);
  margin-top: 10px;
}

/* 分页控件样式优化 */
.custom-pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 16px;
}

:deep(.custom-pagination .el-pagination__jump) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.custom-pagination .el-pagination__jump .el-input) {
  width: 80px;
}

:deep(.custom-pagination .el-pagination__jump .el-input__inner) {
  border-radius: 6px;
  height: 32px;
  border: 1px solid var(--color-border-base);
  transition: all 0.3s ease;
}

:deep(.custom-pagination .el-pagination__jump .el-input__inner:hover) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.custom-pagination .el-pagination__jump .el-input__inner:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

:deep(.custom-pagination .el-pagination__button) {
  border-radius: 6px;
  transition: all 0.3s ease;
  border: 1px solid var(--color-border-base);
}

:deep(.custom-pagination .el-pagination__button:hover) {
  border-color: var(--color-primary);
  color: var(--color-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

:deep(.custom-pagination .el-pagination__button--active) {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

:deep(.custom-pagination .el-pagination__sizes) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.custom-pagination .el-pagination__sizes .el-select) {
  width: auto;
}

:deep(.custom-pagination .el-pagination__sizes .el-select .el-input__inner) {
  border-radius: 6px;
  height: 32px;
  border: 1px solid var(--color-border-base);
  transition: all 0.3s ease;
}

:deep(.custom-pagination .el-pagination__sizes .el-select .el-input__inner:hover) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.custom-pagination .el-pagination__sizes .el-select .el-input__inner:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

/* 全局样式优化 */
:deep(.el-card) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

:deep(.el-card:hover) {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

:deep(.el-button) {
  border-radius: 8px;
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.el-tag) {
  border-radius: 4px;
  font-size: 12px;
  padding: 2px 8px;
}

:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
  margin-top: 5vh !important;
  max-width: 90vw;
}

:deep(.el-dialog__body) {
  padding: 20px;
  max-height: 70vh;
  overflow-y: auto;
}

:deep(.el-dialog__header) {
  background-color: #fafafa;
  border-bottom: 1px solid var(--color-border-lighter);
  padding: 16px 20px;
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 16px 20px;
  border-top: 1px solid var(--color-border-lighter);
  background-color: #fafafa;
}

:deep(.el-descriptions) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-descriptions__header) {
  background-color: #fafafa;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border-lighter);
}

:deep(.el-descriptions__title) {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

:deep(.el-descriptions__body) {
  padding: 16px;
}

:deep(.el-descriptions__row) {
  border-bottom: 1px solid var(--color-border-lighter);
}

:deep(.el-descriptions__row:last-child) {
  border-bottom: none;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  color: var(--color-text-regular);
  padding: 12px 16px;
  background-color: #fafafa;
}

:deep(.el-descriptions__content) {
  padding: 12px 16px;
  color: var(--color-text-primary);
}

/* 响应式设计 */
@media screen and (max-width: 1366px) {
  .filter-bar {
    flex-wrap: wrap;
    gap: 12px;
  }
  
  .private-station-table {
    font-size: 13px;
  }
  
  :deep(.private-station-table .el-table th) {
    padding: 8px 0;
    font-size: 12px;
  }
  
  :deep(.private-station-table .el-table td) {
    padding: 8px 0;
    font-size: 12px;
  }
  
  .operation-buttons .el-button {
    font-size: 11px;
    padding: 2px 8px;
    min-width: 50px;
  }
  
  .custom-pagination {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  :deep(.custom-pagination .el-pagination__jump .el-input) {
    width: 60px;
  }
}
</style>