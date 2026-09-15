<template>
  <div class="respond-container">
    <!-- 待处理紧急呼叫列表 -->
    <div class="emergency-list-panel">
      <div class="panel-header">
        <h3>待处理紧急呼叫</h3>
        <el-badge :value="pendingEmergencyList.length" type="danger" class="pending-badge" />
      </div>

      <el-input
        v-model="emergencyFilter.keyword"
        placeholder="请输入用户ID或呼叫内容"
        clearable
        @keyup.enter="fetchPendingEmergencyList"
        class="emergency-search"
      >
        <template #append>
          <el-button @click="fetchPendingEmergencyList"><el-icon><Search /></el-icon></el-button>
        </template>
      </el-input>

      <!-- 筛选条件 -->
      <div class="filter-row">
        <el-select
          v-model="emergencyFilter.type"
          placeholder="请选择呼叫类型"
          clearable
          class="filter-item"
          @change="fetchPendingEmergencyList"
        >
          <el-option label="呼叫拖车" :value="0" />
          <el-option label="呼叫充电桩" :value="1" />
          <el-option label="其他呼叫" :value="2" />
        </el-select>

        <el-input-number
          v-model="emergencyFilter.maxDistance"
          :min="1"
          :max="200"
          placeholder="最大搜索距离"
          class="filter-item"
          @change="fetchPendingEmergencyList"
        >
          <template #append>公里</template>
        </el-input-number>

        <el-button type="primary" @click="fetchPendingEmergencyList" class="filter-btn">
          筛选
        </el-button>
        <el-button @click="resetEmergencyFilter" class="filter-btn">
          重置
        </el-button>
        <el-button @click="showManualLocation = !showManualLocation" class="filter-btn">
          {{ showManualLocation ? '隐藏位置设置' : '手动设置位置' }}
        </el-button>
      </div>

      <!-- 手动位置设置 -->
      <div v-if="showManualLocation" class="manual-location">
        <h4>手动设置位置</h4>
        <div class="location-input-row">
          <el-input
            v-model="manualLocation.longitude"
            placeholder="经度（-180~180）"
            type="number"
            class="location-input"
          >
            <template #prepend>经度</template>
          </el-input>
          <el-input
            v-model="manualLocation.latitude"
            placeholder="纬度（-90~90）"
            type="number"
            class="location-input"
          >
            <template #prepend>纬度</template>
          </el-input>
          <el-button type="success" @click="setManualLocation" class="location-btn">
            设置位置
          </el-button>
        </div>
      </div>

      <el-empty v-if="!pendingEmergencyList.length && !emergencyListLoading" description="暂无待处理紧急呼叫" />

      <el-scrollbar class="emergency-list-scroll">
        <div v-if="emergencyListLoading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>
        <div v-else class="emergency-list">
          <div
            v-for="emergency in pendingEmergencyList"
            :key="emergency.id"
            class="emergency-list-item"
            :class="{ 'active': selectedEmergencyId === emergency.id }"
            @click="selectEmergency(emergency)"
          >
            <div class="emergency-item-content">
              <div class="emergency-item-avatar">
                <el-avatar :size="40" :icon="User" class="emergency-avatar" />
              </div>
              <div class="emergency-item-main">
                <div class="emergency-item-title">
                  <span class="user-phone">{{ emergency.requestUserPhone }}</span>
                  <el-tag
                    :type="emergency.status === 0 ? 'warning' : 'success'"
                    size="small"
                    class="status-tag"
                  >
                    {{ emergency.statusName }}
                  </el-tag>
                </div>
                <div class="emergency-item-desc">
                  <div class="emergency-content">
                    <el-icon><Location /></el-icon> {{ emergency.callPosition }}
                    <span class="distance-info">(距离: {{ emergency.distance }}公里)</span>
                  </div>
                  <div class="emergency-time">
                    <span>呼叫时间: {{ emergency.callTime }}</span>
                    <el-tag size="small" class="type-tag">
                      {{ emergency.typeName }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-scrollbar>
    </div>

    <!-- 紧急呼叫详情 -->
    <div class="emergency-detail-panel" v-if="selectedEmergencyId">
      <div class="panel-header">
        <h3>紧急呼叫详情</h3>
        <div class="emergency-actions">
          <!-- 只有待处理状态的呼叫才显示响应按钮 -->
          <el-button
            v-if="selectedEmergency && selectedEmergency.status === 0"
            size="small"
            type="primary"
            @click="respondEmergencyCall"
            :loading="emergencyActionLoading"
          >
            <el-icon><Message /></el-icon> 响应呼叫
          </el-button>
          <el-button size="small" @click="markAsHandled" :loading="emergencyActionLoading">
            <el-icon><Check /></el-icon> 标记已处理
          </el-button>
          <el-button size="small" type="danger" @click="handleEndEmergency" :loading="emergencyActionLoading">
            <el-icon><CircleClose /></el-icon> 结束处理
          </el-button>
        </div>
      </div>

      <el-skeleton :loading="detailLoading" animated>
        <!-- 呼叫基本信息 -->
        <div class="emergency-info-card">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="呼叫ID">{{ selectedEmergency.id }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">{{ selectedEmergency.requestUserId }}</el-descriptions-item>
            <el-descriptions-item label="用户姓名">{{ selectedEmergency.requestUserName }}</el-descriptions-item>
            <el-descriptions-item label="用户电话">{{ selectedEmergency.requestUserPhone }}</el-descriptions-item>
            <el-descriptions-item label="呼叫时间">{{ selectedEmergency.callTime }}</el-descriptions-item>
            <el-descriptions-item label="呼叫状态">{{ selectedEmergency.statusName }}</el-descriptions-item>
            <el-descriptions-item label="呼叫类型">{{ selectedEmergency.typeName }}</el-descriptions-item>
            <el-descriptions-item label="呼叫位置">{{ selectedEmergency.callPosition }}</el-descriptions-item>
            <el-descriptions-item label="目标位置">{{ selectedEmergency.targetPosition || '无' }}</el-descriptions-item>
            <el-descriptions-item label="呼叫范围">{{ selectedEmergency.callRange }}公里</el-descriptions-item>
            <el-descriptions-item label="呼叫坐标">{{ selectedEmergency.callLatitude }}, {{ selectedEmergency.callLongitude }}</el-descriptions-item>
            <el-descriptions-item label="目标坐标">{{ selectedEmergency.targetLatitude }}, {{ selectedEmergency.targetLongitude }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 处理日志 -->
        <div class="handling-log-card">
          <div class="card-subheader">
            <h4>处理日志</h4>
          </div>
          <el-scrollbar class="log-scroll" ref="logScrollRef">
            <div class="log-list">
              <el-empty v-if="!handlingLogs.length" description="暂无处理日志" />
              <div
                v-for="log in handlingLogs"
                :key="log.id"
                class="log-item"
              >
                <div class="log-time">{{ log.createTime }}</div>
                <div class="log-content">{{ log.content }}</div>
              </div>
            </div>
          </el-scrollbar>

          <!-- 添加处理日志 -->
          <div class="add-log-area">
            <el-input
              v-model="newLogContent"
              type="textarea"
              :rows="2"
              placeholder="请输入处理日志内容..."
              resize="none"
            />
            <div class="log-actions">
              <el-button
                type="primary"
                @click="addHandlingLog"
                :loading="addLogLoading"
                :disabled="!newLogContent.trim()"
              >
                提交日志
              </el-button>
            </div>
          </div>
        </div>
      </el-skeleton>
    </div>

    <!-- 未选择呼叫提示 -->
    <div class="no-emergency-selected" v-else>
      <el-empty description="请选择一个紧急呼叫开始处理" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authApi } from '@/api/auth'
import {
  Search,
  User,
  Check,
  CircleClose,
  Message,
  Location
} from '@element-plus/icons-vue'

const isMounted = ref(true)
onUnmounted(() => {
  isMounted.value = false
})

// 位置信息
const currentLocation = ref(null)
// 添加默认位置 - 长沙岳麓区湖南师范大学中和楼
const defaultLocation = { longitude: 112.9384, latitude: 28.1857 }
const locationError = ref(null)
const manualLocation = reactive({
  longitude: '',
  latitude: ''
})
const showManualLocation = ref(false)

// 响应紧急呼叫
const pendingEmergencyList = ref([])
const emergencyListLoading = ref(false)
const selectedEmergencyId = ref(null)
const selectedEmergency = ref(null)
const emergencyFilter = reactive({
  keyword: '',
  type: null,
  maxDistance: null
})

// 紧急呼叫详情
const handlingLogs = ref([])
const newLogContent = ref('')
const addLogLoading = ref(false)
const emergencyActionLoading = ref(false)
const detailLoading = ref(false)
const logScrollRef = ref(null)

// 检查地理位置权限状态
const checkLocationPermission = () => {
  if ('permissions' in navigator) {
    return navigator.permissions.query({ name: 'geolocation' })
      .then(permissionStatus => {
        return permissionStatus.state
      })
      .catch(error => {
        console.error('检查位置权限失败:', error)
        return 'error'
      })
  }
  return Promise.resolve('unsupported')
}

// 保存位置信息到缓存
const saveLocationToCache = (location) => {
  try {
    const cacheData = {
      location,
      timestamp: Date.now(),
      expiry: 60 * 60 * 1000 // 1小时过期
    }
    localStorage.setItem('emergencyLocation', JSON.stringify(cacheData))
  } catch (error) {
    console.error('保存位置缓存失败:', error)
  }
}

// 获取缓存的位置信息
const getCachedLocation = () => {
  try {
    const cachedData = localStorage.getItem('emergencyLocation')
    if (cachedData) {
      const data = JSON.parse(cachedData)
      const now = Date.now()
      if (now - data.timestamp < data.expiry) {
        return data.location
      }
    }
  } catch (error) {
    console.error('获取位置缓存失败:', error)
  }
  return null
}

// 获取当前位置（带重试机制）
const getCurrentLocationWithRetry = (attempt = 0) => {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const longitude = position.coords.longitude
        const latitude = position.coords.latitude
        currentLocation.value = { longitude, latitude }
        locationError.value = null

        // 保存位置到缓存
        saveLocationToCache(currentLocation.value)

        // 获取到位置后立即获取待响应呼叫列表
        fetchPendingEmergencyList()
      },
      (error) => {
        console.error('获取位置失败:', error.message)
        locationError.value = error.message

        let errorMsg = '无法获取位置信息，使用默认位置'
        let duration = 3000

        if (error.code === error.TIMEOUT && attempt < 1) {
          ElMessage.info('获取位置超时，正在重试...')
          setTimeout(() => {
            getCurrentLocationWithRetry(attempt + 1)
          }, 1000)
          return
        }

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = '定位权限被拒绝，请在浏览器设置中启用权限'
            duration = 5000
            break
          case error.POSITION_UNAVAILABLE:
            errorMsg = '位置信息不可用，可能是网络问题或位置服务故障'
            break
          case error.TIMEOUT:
            errorMsg = '获取位置超时，请检查网络连接并重试'
            duration = 5000
            break
          default:
            errorMsg = `获取位置失败: ${error.message}，使用默认位置`
        }

        ElMessage.warning({
          message: errorMsg,
          duration: duration,
          showClose: true
        })

        // 使用默认位置
        currentLocation.value = defaultLocation
        fetchPendingEmergencyList()

        // 显示手动位置设置界面，让用户可以手动输入位置
        showManualLocation.value = true
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000
      }
    )
  } else {
    locationError.value = '浏览器不支持地理定位'
    console.error('浏览器不支持地理定位功能')
    ElMessage.warning({
      message: '浏览器不支持地理定位功能，使用默认位置',
      duration: 5000,
      showClose: true
    })

    // 使用默认位置
    currentLocation.value = defaultLocation
    fetchPendingEmergencyList()

    // 显示手动位置设置界面，让用户可以手动输入位置
    showManualLocation.value = true
  }
}

// 获取当前位置
const getCurrentLocation = async () => {
  // 首先尝试获取缓存位置
  const cachedLocation = getCachedLocation()
  if (cachedLocation) {
    currentLocation.value = cachedLocation
    locationError.value = null
    fetchPendingEmergencyList()
    return
  }

  // 检查地理位置权限
  const permissionState = await checkLocationPermission()

  if (permissionState === 'denied') {
    console.error('地理位置权限被拒绝')
    locationError.value = '地理位置权限被拒绝'
    ElMessage.warning({
      message: '地理位置权限被拒绝，请在浏览器设置中启用权限',
      duration: 5000,
      showClose: true
    })

    // 使用默认位置
    currentLocation.value = defaultLocation
    fetchPendingEmergencyList()
    showManualLocation.value = true
    return
  }

  if (permissionState === 'unsupported') {
    console.warn('浏览器不支持权限检查')
  }

  // 调用带重试机制的位置获取函数
  getCurrentLocationWithRetry()
}

// 获取待处理紧急呼叫列表
const fetchPendingEmergencyList = async () => {
  try {
    if (!isMounted.value) return

    emergencyListLoading.value = true

    if (!currentLocation.value) {
      // 如果还没有位置信息，先获取位置
      getCurrentLocation()
      return
    }

    const params = {
      pageNum: 1,
      pageSize: 10,
      longitude: currentLocation.value.longitude,
      latitude: currentLocation.value.latitude
    }

    if (emergencyFilter.type !== null && emergencyFilter.type !== undefined) {
      params.type = emergencyFilter.type
    }

    if (emergencyFilter.maxDistance !== null && emergencyFilter.maxDistance !== undefined) {
      params.maxDistance = emergencyFilter.maxDistance
    }

    const response = await authApi.getPendingEmergencyCalls(params)

    if (!isMounted.value) return

    let listData = []

    if (response) {
      if (Array.isArray(response)) {
        listData = response
      } else if (response.list) {
        listData = response.list
      } else if (response.data && response.data.list) {
        listData = response.data.list
      } else if (response.status === 200 && response.data) {
        if (response.data.list) {
          listData = response.data.list
        } else if (response.data.data && response.data.data.list) {
          listData = response.data.data.list
        }
      } else if (response.code === 200 && response.data) {
        if (response.data.list) {
          listData = response.data.list
        }
      }

      if (!Array.isArray(listData)) {
        console.error('解析结果不是数组，重置为空数组:', listData)
        listData = []
      }
    } else {
      console.error('API响应为空')
    }

    // 按照distance字段升序排序，确保最近的呼叫显示在最前面
    listData.sort((a, b) => a.distance - b.distance)

    pendingEmergencyList.value = listData
  } catch (error) {
    if (!isMounted.value) return

    console.error('获取待处理紧急呼叫列表失败:', error)

    let errorMsg = '获取待处理紧急呼叫列表失败'
    if (error.message && error.message.includes('Failed to fetch')) {
      errorMsg = '网络错误：无法连接到服务器，请检查网络连接'
    } else if (error.response) {
      errorMsg = error.response.data?.msg || `服务器错误 (${error.response.status})`
    } else if (error.request) {
      errorMsg = '请求超时：服务器没有响应，请稍后重试'
    } else {
      errorMsg = error.message || '请求失败'
    }

    ElMessage.error(errorMsg)
    pendingEmergencyList.value = []
  } finally {
    if (isMounted.value) {
      emergencyListLoading.value = false
    }
  }
}

// 手动设置位置
const setManualLocation = () => {
  const longitude = parseFloat(manualLocation.longitude)
  const latitude = parseFloat(manualLocation.latitude)

  if (isNaN(longitude) || isNaN(latitude)) {
    ElMessage.error('请输入有效的经纬度数值')
    return
  }

  if (longitude < -180 || longitude > 180) {
    ElMessage.error('经度范围必须在-180到180之间')
    return
  }

  if (latitude < -90 || latitude > 90) {
    ElMessage.error('纬度范围必须在-90到90之间')
    return
  }

  currentLocation.value = {
    longitude,
    latitude
  }

  saveLocationToCache(currentLocation.value)

  locationError.value = null
  ElMessage.success('位置设置成功并已保存')

  fetchPendingEmergencyList()

  showManualLocation.value = false
}

// 选择紧急呼叫
const selectEmergency = async (emergency) => {
  try {
    if (!isMounted.value) return

    selectedEmergencyId.value = emergency.id
    detailLoading.value = true
    const response = await authApi.getEmergencyCallDetail(emergency.id)

    if (!isMounted.value) return

    selectedEmergency.value = response
    handlingLogs.value = []
    newLogContent.value = ''
  } catch (error) {
    if (!isMounted.value) return

    console.error('获取呼叫详情失败:', error)
    ElMessage.error('获取呼叫详情失败')
  } finally {
    if (isMounted.value) {
      detailLoading.value = false
    }
  }
}

// 重置紧急呼叫筛选条件
const resetEmergencyFilter = () => {
  Object.assign(emergencyFilter, {
    keyword: '',
    type: null,
    maxDistance: null
  })
  fetchPendingEmergencyList()
}

// 响应紧急呼叫
const respondEmergencyCall = async () => {
  try {
    if (!isMounted.value) return

    emergencyActionLoading.value = true

    if (!currentLocation.value) {
      ElMessage.error('请先获取或设置位置信息')
      return
    }

    const response = await authApi.respondEmergencyCall(selectedEmergencyId.value, {
      longitude: currentLocation.value.longitude,
      latitude: currentLocation.value.latitude
    })

    if (!isMounted.value) return

    ElMessage.success(response.message || '响应成功')

    fetchPendingEmergencyList()

    selectedEmergencyId.value = null
    selectedEmergency.value = null
    handlingLogs.value = []
  } catch (error) {
    if (!isMounted.value) return

    console.error('响应紧急呼叫失败:', error)

    let errorMsg = '响应紧急呼叫失败'
    if (error.response) {
      errorMsg = error.response.data?.msg || `响应失败 (${error.response.status})`
    } else if (error.request) {
      errorMsg = '请求超时：服务器没有响应，请稍后重试'
    } else {
      errorMsg = error.message || '请求失败'
    }

    ElMessage.error(errorMsg)
  } finally {
    if (isMounted.value) {
      emergencyActionLoading.value = false
    }
  }
}

// 标记为已处理
const markAsHandled = async () => {
  try {
    if (!isMounted.value) return

    emergencyActionLoading.value = true

    if (selectedEmergency && selectedEmergency.status === 0) {
      ElMessage.warning('请先响应呼叫才能进行其他操作')
      return
    }

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    if (!isMounted.value) return

    ElMessage.success('已标记为已处理')
    fetchPendingEmergencyList()
  } catch (error) {
    if (!isMounted.value) return

    console.error('标记已处理失败:', error)
    ElMessage.error('标记已处理失败')
  } finally {
    if (isMounted.value) {
      emergencyActionLoading.value = false
    }
  }
}

// 结束处理
const handleEndEmergency = async () => {
  try {
    if (!isMounted.value) return

    if (selectedEmergency && selectedEmergency.status === 0) {
      ElMessage.warning('请先响应呼叫才能进行其他操作')
      return
    }

    await ElMessageBox.confirm('确定要结束当前紧急呼叫处理吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    emergencyActionLoading.value = true
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))

    if (!isMounted.value) return

    ElMessage.success('处理已结束')
    selectedEmergencyId.value = null
    selectedEmergency.value = null
    handlingLogs.value = []
    fetchPendingEmergencyList()
  } catch (error) {
    if (!isMounted.value || error === 'cancel') {
      return
    }

    console.error('结束处理失败:', error)
    ElMessage.error('结束处理失败')
  } finally {
    if (isMounted.value) {
      emergencyActionLoading.value = false
    }
  }
}

// 添加处理日志
const addHandlingLog = async () => {
  if (!isMounted.value) return

  if (!newLogContent.trim()) {
    ElMessage.warning('请输入日志内容')
    return
  }

  if (selectedEmergency && selectedEmergency.status === 0) {
    ElMessage.warning('请先响应呼叫才能进行其他操作')
    return
  }

  try {
    addLogLoading.value = true

    // 模拟添加日志
    const newLog = {
      id: Date.now(),
      content: newLogContent.value,
      createTime: new Date().toLocaleString()
    }

    handlingLogs.value.push(newLog)
    newLogContent.value = ''

    await nextTick()
    if (isMounted.value && logScrollRef.value) {
      const scrollEl = logScrollRef.value.wrapRef
      scrollEl.scrollTop = scrollEl.scrollHeight
    }

    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))

    if (isMounted.value) {
      ElMessage.success('日志添加成功')
    }
  } catch (error) {
    if (!isMounted.value) return

    console.error('添加日志失败:', error)
    ElMessage.error('添加日志失败')
  } finally {
    if (isMounted.value) {
      addLogLoading.value = false
    }
  }
}

onMounted(() => {
  getCurrentLocation()
})
</script>

<style scoped>
/* 响应紧急呼叫样式 */
.respond-container {
  display: flex;
  gap: 20px;
  height: 700px;
  margin-top: 20px;
}

.emergency-list-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.emergency-list-panel:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.12);
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid var(--color-border-lighter);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f8f9fa;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.pending-badge {
  transform: translate(0, -10px);
}

/* 搜索框样式 */
.emergency-search {
  margin: 15px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.emergency-search:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

:deep(.emergency-search .el-input__inner) {
  border-radius: 8px 0 0 8px;
  height: 36px;
  border: 1px solid var(--color-border-base);
  border-right: none;
  transition: all 0.3s ease;
}

:deep(.emergency-search .el-input__inner:hover) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.emergency-search .el-input__inner:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

:deep(.emergency-search .el-button) {
  border-radius: 0 8px 8px 0;
  height: 36px;
  padding: 0 16px;
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
  transition: all 0.3s ease;
}

:deep(.emergency-search .el-button:hover) {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

/* 筛选行样式 */
.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 0 15px 15px;
  flex-wrap: wrap;
  padding: 16px;
  background-color: var(--color-bg-page);
  border-radius: 8px;
  border: 1px solid var(--color-border-light);
}

.filter-item {
  width: 160px;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-select .el-input__inner) {
  border-radius: 8px;
  height: 36px;
  border: 1px solid var(--color-border-base);
  transition: all 0.3s ease;
}

:deep(.el-select .el-input__inner:hover) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.el-select .el-input__inner:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

:deep(.el-input-number) {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background-color: var(--color-bg-page);
  border-color: var(--color-border-base);
  transition: all 0.3s ease;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  background-color: var(--color-primary-light);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

:deep(.el-input-number__decrease.is-disabled:hover),
:deep(.el-input-number__increase.is-disabled:hover) {
  background-color: var(--color-bg-page);
  border-color: var(--color-border-base);
  color: var(--color-text-placeholder);
}

:deep(.el-input-number__input) {
  border-radius: 0;
  height: 36px;
  border: 1px solid var(--color-border-base);
  border-left: none;
  border-right: none;
  transition: all 0.3s ease;
}

:deep(.el-input-number__input:hover) {
  border-color: var(--color-primary);
}

:deep(.el-input-number__input:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

:deep(.el-input-number .el-input__append) {
  padding: 0 10px;
  background-color: var(--color-bg-page);
  border-left: 1px solid var(--color-border-base);
  border-radius: 0 8px 8px 0;
  font-size: 12px;
  color: var(--color-text-regular);
  display: flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.filter-btn {
  margin-left: auto;
  white-space: nowrap;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.filter-btn:first-of-type {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.filter-btn:first-of-type:hover {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.filter-btn:not(:first-of-type) {
  background-color: #fff;
  border-color: var(--color-border-base);
  color: var(--color-text-regular);
}

.filter-btn:not(:first-of-type):hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

/* 手动位置设置样式 */
.manual-location {
  margin: 0 15px 15px;
  padding: 16px;
  background-color: var(--color-bg-page);
  border-radius: 6px;
  border: 1px solid var(--color-border-light);
}

.manual-location h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
}

.location-input-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.location-input {
  width: 200px;
}

.location-btn {
  margin-left: 10px;
  white-space: nowrap;
}

/* 紧急呼叫列表样式 */
.emergency-list-scroll {
  flex: 1;
  overflow: hidden;
}

.emergency-list {
  padding: 0;
  margin: 0;
}

.emergency-list-item {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 20px;
  display: flex;
  align-items: flex-start;
  background-color: #fff;
  border-radius: 12px;
  margin: 10px 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.emergency-list-item:hover {
  background-color: #fafafa;
  transform: translateX(2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.emergency-list-item.active {
  background-color: var(--color-primary-light);
  border-right: 4px solid var(--color-primary);
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.15);
}

.emergency-item-content {
  display: flex;
  width: 100%;
  gap: 16px;
}

.emergency-item-avatar {
  flex-shrink: 0;
}

.emergency-avatar {
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: var(--font-size-lg);
  transition: transform var(--transition-fast);
}

.emergency-list-item:hover .emergency-avatar {
  transform: scale(1.1);
}

.emergency-item-main {
  flex: 1;
  min-width: 0;
}

.emergency-item-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.user-phone {
  font-weight: 600;
  color: var(--color-text-primary);
  font-size: 16px;
}

.status-tag {
  flex-shrink: 0;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.emergency-item-desc {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.emergency-content {
  font-size: 14px;
  color: var(--color-text-regular);
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 6px;
}

.distance-info {
  font-weight: 600;
  color: var(--color-primary);
  margin-left: auto;
  flex-shrink: 0;
  white-space: nowrap;
  font-size: 14px;
  background-color: rgba(64, 158, 255, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}

.emergency-time {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 4px;
}

.type-tag {
  background-color: var(--color-success-light);
  border-color: #c2e7b0;
  color: var(--color-success);
  flex-shrink: 0;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
}

/* 紧急呼叫详情样式 */
.emergency-detail-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.no-emergency-selected {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
}

.emergency-actions {
  display: flex;
  gap: 12px;
}

.emergency-actions .el-button {
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.emergency-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.emergency-actions .el-button--primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.emergency-actions .el-button--primary:hover {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.emergency-actions .el-button--danger {
  background-color: var(--color-danger);
  border-color: var(--color-danger);
  color: #fff;
}

.emergency-actions .el-button--danger:hover {
  background-color: #f78989;
  border-color: #f78989;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
}

.emergency-actions .el-button:not(.el-button--primary):not(.el-button--danger) {
  background-color: #fff;
  border-color: var(--color-border-base);
  color: var(--color-text-regular);
}

.emergency-actions .el-button:not(.el-button--primary):not(.el-button--danger):hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-primary-light);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.emergency-info-card {
  padding: 20px;
  border-bottom: 1px solid var(--color-border-lighter);
  background-color: #fafafa;
}

.emergency-info-card .el-descriptions {
  margin-bottom: 0;
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.emergency-info-card .el-descriptions__header) {
  padding: 16px 20px;
  background-color: var(--color-bg-page);
  border-bottom: 1px solid var(--color-border-lighter);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
}

:deep(.emergency-info-card .el-descriptions__body) {
  padding: 20px;
}

:deep(.emergency-info-card .el-descriptions__row) {
  border-bottom: 1px solid #f0f2f5;
}

:deep(.emergency-info-card .el-descriptions__row:last-child) {
  border-bottom: none;
}

:deep(.emergency-info-card .el-descriptions__label) {
  font-weight: 500;
  color: var(--color-text-regular);
  width: 120px;
}

:deep(.emergency-info-card .el-descriptions__content) {
  color: var(--color-text-primary);
  font-weight: 400;
}

.handling-log-card {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
}

.card-subheader {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border-lighter);
}

.card-subheader h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-scroll {
  flex: 1;
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid var(--color-border-lighter);
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.log-scroll:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
}

.log-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border-left: 4px solid var(--color-primary);
  position: relative;
}

.log-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
  background-color: #fff;
}

.log-time {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.log-content {
  font-size: 14px;
  color: var(--color-text-regular);
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
  padding: 12px;
  background-color: #fff;
  border-radius: 6px;
  border: 1px solid #f0f2f5;
}

.add-log-area {
  margin-top: 20px;
  padding: 20px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.add-log-area .el-textarea__inner) {
  border-radius: 8px;
  border: 1px solid var(--color-border-base);
  transition: all 0.3s ease;
  min-height: 100px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
}

:deep(.add-log-area .el-textarea__inner:hover) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.add-log-area .el-textarea__inner:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.log-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}

.log-actions .el-button {
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.log-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

/* 骨架屏样式 */
.loading-container {
  padding: 20px;
}

:deep(.el-skeleton__item) {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 空状态样式 */
:deep(.el-empty) {
  padding: 40px 0;
}

:deep(.el-empty__description) {
  color: var(--color-text-secondary);
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .respond-container {
    flex-direction: column;
    height: auto;
  }

  .emergency-list-panel {
    width: 100%;
    height: 400px;
  }

  .emergency-detail-panel {
    margin-top: 20px;
    height: 400px;
  }
}

@media (max-width: 768px) {
  .filter-item,
  .location-input {
    width: 100% !important;
  }

  .emergency-actions {
    flex-direction: column;
  }
}
</style>
