<template>
  <div class="emergency-container">
    <el-card shadow="never" class="emergency-card">
      <template #header>
        <div class="card-header">
          <span>紧急响应</span>
        </div>
      </template>
      
      <!-- 标签页导航 -->
      <el-tabs v-model="activeTab" class="emergency-tabs">
        <!-- 响应紧急呼叫 -->
        <el-tab-pane label="响应紧急呼叫" name="respond">
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
        </el-tab-pane>
        
        <!-- 管理紧急呼叫 -->
        <el-tab-pane label="管理紧急呼叫" name="manage">
          <div class="manage-container">
            <!-- 紧急呼叫管理筛选 -->
            <div class="filter-bar">
              <el-date-picker
                v-model="manageFilter.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 300px; margin-right: 10px"
              />
              <el-select
                v-model="manageFilter.status"
                placeholder="呼叫状态"
                style="width: 120px; margin-right: 10px"
                clearable
              >
                <el-option label="全部" :value="null" />
                <el-option label="待处理" :value="0" />
                <el-option label="处理中" :value="1" />
                <el-option label="已结束" :value="2" />
              </el-select>
              <el-select
                v-model="manageFilter.type"
                placeholder="呼叫类型"
                style="width: 120px; margin-right: 10px"
                clearable
              >
                <el-option label="全部" :value="null" />
                <el-option label="呼叫拖车" :value="0" />
                <el-option label="呼叫充电桩" :value="1" />
                <el-option label="其他呼叫" :value="2" />
              </el-select>
              <el-input
                v-model="manageFilter.keyword"
                placeholder="请输入用户ID或呼叫内容"
                style="width: 250px; margin-right: 10px"
                clearable
              >
                <template #append>
                  <el-button @click="fetchManageEmergencyList"><el-icon><Search /></el-icon></el-button>
                </template>
              </el-input>
              <el-button @click="resetManageFilter">重置</el-button>
            </div>
            
            <!-- 紧急呼叫管理列表 -->
            <el-table
              v-loading="manageLoading"
              :data="manageEmergencyList"
              stripe
              style="width: 100%"
              @row-click="viewEmergencyDetail"
            >
              <el-table-column prop="id" label="呼叫ID" width="120" />
              <el-table-column prop="requestUserId" label="用户ID" width="150" />
              <el-table-column prop="requestUserName" label="用户姓名" width="150" />
              <el-table-column prop="requestUserPhone" label="用户电话" width="150" />
              <el-table-column prop="typeName" label="呼叫类型" width="120">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.type === 0 ? 'info' : scope.row.type === 1 ? 'warning' : 'danger'"
                  >
                    {{ scope.row.typeName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="statusName" label="状态" width="120">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.status === 0 ? 'warning' : scope.row.status === 1 ? 'success' : scope.row.status === 2 ? 'info' : 'danger'"
                  >
                    {{ scope.row.statusName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="callTime" label="呼叫时间" width="180" />
              <el-table-column prop="callPosition" label="呼叫位置" width="200" show-overflow-tooltip />
              <el-table-column prop="responseAdminName" label="处理人" width="150">
                <template #default="scope">
                  {{ scope.row.responseAdminName || scope.row.responseAdminId || '未分配' }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="250" fixed="right">
                <template #default="scope">
                  <el-button
                    size="small"
                    type="primary"
                    @click.stop="viewEmergencyDetail(scope.row)"
                  >
                    查看详情
                  </el-button>
                  <el-button
                    v-if="scope.row.status === 1"
                    size="small"
                    type="success"
                    @click.stop="completeEmergency(scope.row.id)"
                  >
                    完成呼叫
                  </el-button>
                  <el-button
                    v-if="scope.row.status === 1"
                    size="small"
                    type="warning"
                    @click.stop="cancelEmergency(scope.row.id)"
                  >
                    取消呼叫
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="managePage"
                v-model:page-size="managePageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="manageTotal"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleManageSizeChange"
                @current-change="handleManagePageChange"
              />
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 查看呼叫记录 -->
        <el-tab-pane label="查看呼叫记录" name="records">
          <div class="records-container">
            <!-- 记录筛选 -->
            <div class="filter-bar">
              <el-date-picker
                v-model="recordFilter.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 300px; margin-right: 10px"
              />
              <el-select
                v-model="recordFilter.level"
                placeholder="紧急等级"
                style="width: 120px; margin-right: 10px"
                clearable
              >
                <el-option label="全部" :value="null" />
                <el-option label="低危" :value="1" />
                <el-option label="中危" :value="2" />
                <el-option label="高危" :value="3" />
              </el-select>
              <el-input
                v-model="recordFilter.keyword"
                placeholder="请输入用户ID或呼叫内容"
                style="width: 250px; margin-right: 10px"
                clearable
              >
                <template #append>
                  <el-button @click="fetchEmergencyRecords"><el-icon><Search /></el-icon></el-button>
                </template>
              </el-input>
              <el-button @click="resetRecordFilter">重置</el-button>
            </div>
            
            <!-- 呼叫记录列表 -->
            <el-table
              v-loading="recordLoading"
              :data="emergencyRecords"
              stripe
              style="width: 100%"
              @row-click="viewRecordDetail"
            >
              <el-table-column prop="id" label="呼叫ID" width="120" />
              <el-table-column prop="requestUserId" label="用户ID" width="150" />
              <el-table-column prop="requestUserName" label="用户姓名" width="150" />
              <el-table-column prop="requestUserPhone" label="用户电话" width="150" />
              <el-table-column prop="typeName" label="呼叫类型" width="120">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.type === 0 ? 'info' : scope.row.type === 1 ? 'warning' : 'danger'"
                  >
                    {{ scope.row.typeName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="statusName" label="状态" width="120">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.status === 0 ? 'warning' : scope.row.status === 1 ? 'success' : scope.row.status === 2 ? 'info' : 'danger'"
                  >
                    {{ scope.row.statusName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="callTime" label="呼叫时间" width="180" />
              <el-table-column prop="callPosition" label="呼叫位置" width="200" show-overflow-tooltip />
              <el-table-column prop="responseAdminName" label="处理人" width="150">
                <template #default="scope">
                  {{ scope.row.responseAdminName || scope.row.responseAdminId || '未分配' }}
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                  <el-button
                    size="small"
                    type="primary"
                    @click.stop="viewRecordDetail(scope.row)"
                  >
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="recordPage"
                v-model:page-size="recordPageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="recordTotal"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleRecordSizeChange"
                @current-change="handleRecordPageChange"
              />
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 我的响应记录 -->
        <el-tab-pane label="我的响应记录" name="myResponses">
          <div class="my-responses-container">
            <!-- 筛选条件 -->
            <div class="filter-bar">
              <el-date-picker
                v-model="myResponsesFilter.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 300px; margin-right: 10px"
              />
              <el-select
                v-model="myResponsesFilter.status"
                placeholder="呼叫状态"
                style="width: 120px; margin-right: 10px"
                clearable
              >
                <el-option label="全部" :value="null" />
                <el-option label="待响应" :value="0" />
                <el-option label="处理中" :value="1" />
                <el-option label="已完成" :value="2" />
                <el-option label="已取消" :value="3" />
              </el-select>
              <el-select
                v-model="myResponsesFilter.type"
                placeholder="呼叫类型"
                style="width: 120px; margin-right: 10px"
                clearable
              >
                <el-option label="全部" :value="null" />
                <el-option label="呼叫拖车" :value="0" />
                <el-option label="呼叫充电桩" :value="1" />
                <el-option label="其他呼叫" :value="2" />
              </el-select>
              <el-button @click="fetchMyEmergencyResponses">查询</el-button>
              <el-button @click="resetMyResponsesFilter">重置</el-button>
            </div>
            
            <!-- 响应记录列表 -->
            <el-table
              v-loading="myResponsesLoading"
              :data="myResponsesList"
              stripe
              style="width: 100%"
              @row-click="viewMyResponseDetail"
            >
              <el-table-column prop="id" label="呼叫ID" width="120" />
              <el-table-column prop="requestUserPhone" label="用户电话" width="150" />
              <el-table-column prop="typeName" label="呼叫类型" width="120">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.type === 0 ? 'info' : scope.row.type === 1 ? 'warning' : 'danger'"
                  >
                    {{ scope.row.typeName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="statusName" label="状态" width="120">
                <template #default="scope">
                  <el-tag
                    :type="scope.row.status === 0 ? 'warning' : scope.row.status === 1 ? 'success' : scope.row.status === 2 ? 'info' : 'danger'"
                  >
                    {{ scope.row.statusName }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="callTime" label="呼叫时间" width="180" />
              <el-table-column prop="callPosition" label="呼叫位置" width="200" show-overflow-tooltip />
              <el-table-column prop="targetPosition" label="目标位置" width="200" show-overflow-tooltip />
              <el-table-column label="操作" width="150" fixed="right">
                <template #default="scope">
                  <el-button
                    size="small"
                    type="primary"
                    @click.stop="viewMyResponseDetail(scope.row)"
                  >
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 分页 -->
            <div class="pagination">
              <el-pagination
                v-model:current-page="myResponsesPage"
                v-model:page-size="myResponsesPageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="myResponsesTotal"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleMyResponsesSizeChange"
                @current-change="handleMyResponsesPageChange"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    
    <!-- 查看紧急呼叫详情弹窗 -->
    <el-dialog
      v-model="showEmergencyDetail"
      title="紧急呼叫详情"
      width="800px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <div class="detail-header">
        <div class="detail-info">
          <span class="detail-id">呼叫ID: {{ currentEmergencyDetail.id }}</span>
          <span class="detail-user">用户ID: {{ currentEmergencyDetail.requestUserId }}</span>
          <el-tag
            :type="currentEmergencyDetail.status === 0 ? 'warning' : currentEmergencyDetail.status === 1 ? 'success' : 'info'"
          >
            {{ currentEmergencyDetail.statusName }}
          </el-tag>
        </div>
        <div class="detail-time">
          <span>呼叫时间: {{ currentEmergencyDetail.callTime }}</span>
        </div>
      </div>
      
      <!-- 基本信息 -->
      <div class="detail-section">
        <h4>基本信息</h4>
        <el-descriptions :column="2" border class="detail-descriptions">
          <el-descriptions-item label="用户姓名">{{ currentEmergencyDetail.requestUserName || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="用户电话">{{ currentEmergencyDetail.requestUserPhone || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="呼叫类型">{{ currentEmergencyDetail.typeName }}</el-descriptions-item>
          <el-descriptions-item label="呼叫状态">{{ currentEmergencyDetail.statusName }}</el-descriptions-item>
          <el-descriptions-item label="呼叫位置" :span="2">{{ currentEmergencyDetail.callPosition || '未知' }}</el-descriptions-item>
          <el-descriptions-item label="目标位置" :span="2">{{ currentEmergencyDetail.targetPosition || '无' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 处理日志 -->
      <div class="detail-section">
        <h4>处理日志</h4>
        <el-scrollbar class="detail-log-scroll" max-height="300px">
          <div class="detail-log-list">
            <el-empty v-if="!emergencyDetailLogs.length" description="暂无处理日志" />
            <div
              v-for="log in emergencyDetailLogs"
              :key="log.id"
              class="log-item"
            >
              <div class="log-time">{{ log.createTime }}</div>
              <div class="log-content">{{ log.content }}</div>
            </div>
          </div>
        </el-scrollbar>
      </div>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEmergencyDetail = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { authApi } from '@/api/auth'
import { useAdminStore } from '@/store/adminStore'
import {
  Search,
  User,
  Check,
  CircleClose,
  Message,
  Location
} from '@element-plus/icons-vue'

const adminStore = useAdminStore()

// 当前激活的标签页
const activeTab = ref('respond')

// 组件挂载状态标志
const isMounted = ref(true)

// 组件卸载时设置isMounted为false
onUnmounted(() => {
  isMounted.value = false
})

// 位置信息
const currentLocation = ref(null)
// 添加默认位置 - 长沙岳麓区湖南师范大学中和楼
const defaultLocation = { longitude: 112.9384, latitude: 28.1857 } // 长沙岳麓区湖南师范大学中和楼
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

// 管理紧急呼叫
const manageEmergencyList = ref([])
const manageTotal = ref(0)
const managePage = ref(1)
const managePageSize = ref(20)
const manageLoading = ref(false)
const manageFilter = reactive({
  dateRange: [],
  keyword: '',
  status: null,
  type: null
})

// 呼叫记录
const emergencyRecords = ref([])
const recordTotal = ref(0)
const recordPage = ref(1)
const recordPageSize = ref(20)
const recordLoading = ref(false)
const recordFilter = reactive({
  dateRange: [],
  keyword: '',
  level: null
})

// 我的响应记录
const myResponsesList = ref([])
const myResponsesTotal = ref(0)
const myResponsesPage = ref(1)
const myResponsesPageSize = ref(20)
const myResponsesLoading = ref(false)
const myResponsesFilter = reactive({
  dateRange: [],
  status: null,
  type: null
})

// 详情弹窗
const showEmergencyDetail = ref(false)
const currentEmergencyDetail = ref(null)
const emergencyDetailLogs = ref([])

// 模拟数据 - 待处理紧急呼叫
const mockPendingEmergencies = [
  {
    id: 1,
    userId: 'user_001',
    status: 1,
    level: 3,
    content: '车辆发生严重事故，需要紧急救援',
    createTime: '2026-01-08 11:30:00',
    location: '北京市朝阳区建国路88号',
    contact: '13800138001',
    handlerId: 'admin_001'
  },
  {
    id: 2,
    userId: 'user_002',
    status: 0,
    level: 2,
    content: '车辆故障，无法启动',
    createTime: '2026-01-08 10:15:00',
    location: '上海市浦东新区陆家嘴环路166号',
    contact: '13900139002',
    handlerId: null
  },
  {
    id: 3,
    userId: 'user_003',
    status: 0,
    level: 1,
    content: '需要道路指引',
    createTime: '2026-01-07 16:45:00',
    location: '广州市天河区珠江新城冼村路28号',
    contact: '13700137003',
    handlerId: null
  }
]

// 模拟数据 - 处理日志
const mockHandlingLogs = {
  1: [
    { id: 1, content: '收到紧急呼叫，正在处理', createTime: '2026-01-08 11:30:00' },
    { id: 2, content: '已联系救援车辆，预计15分钟到达', createTime: '2026-01-08 11:32:00' },
    { id: 3, content: '救援车辆已出发', createTime: '2026-01-08 11:35:00' }
  ],
  2: [
    { id: 4, content: '收到紧急呼叫，正在处理', createTime: '2026-01-08 10:15:00' }
  ],
  3: [
    { id: 5, content: '收到紧急呼叫，正在处理', createTime: '2026-01-07 16:45:00' }
  ]
}

// 模拟数据 - 紧急呼叫记录
const mockEmergencyRecords = Array.from({ length: 15 }, (_, index) => ({
  id: index + 1,
  userId: `user_${String(index + 100).padStart(3, '0')}`,
  status: Math.floor(Math.random() * 3),
  level: Math.floor(Math.random() * 3) + 1,
  content: `这是第${index + 1}条紧急呼叫的内容`,
  createTime: new Date(Date.now() - index * 3600000).toLocaleString(),
  endTime: Math.random() > 0.5 ? new Date(Date.now() - index * 1800000).toLocaleString() : null,
  location: `测试位置${index + 1}`,
  contact: `13800138${String(index).padStart(3, '0')}`,
  handlerId: Math.random() > 0.3 ? `admin_00${Math.floor(Math.random() * 3) + 1}` : null
}))

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
        console.log('成功获取当前位置:', currentLocation.value)
        
        // 保存位置到缓存
        saveLocationToCache(currentLocation.value)
        
        // 获取到位置后立即获取待响应呼叫列表
        fetchPendingEmergencyList()
      },
      (error) => {
        console.error('获取位置失败:', error.message)
        locationError.value = error.message
        
        // 优化错误处理：显示更详细的错误信息
        let errorMsg = '无法获取位置信息，使用默认位置'
        let duration = 3000
        
        // 超时错误且未达到最大重试次数，进行重试
        if (error.code === error.TIMEOUT && attempt < 1) {
          console.log('获取位置超时，正在重试...')
          ElMessage.info('获取位置超时，正在重试...')
          // 延迟1秒后重试
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
        // 获取到位置后立即获取待响应呼叫列表
        fetchPendingEmergencyList()
        
        // 显示手动位置设置界面，让用户可以手动输入位置
        showManualLocation.value = true
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // 增加超时时间到15秒
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
    // 获取到位置后立即获取待响应呼叫列表
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
    console.log('使用缓存位置:', currentLocation.value)
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
    
    // 构建请求参数，前4个参数必须传
    const params = {
      pageNum: 1,
      pageSize: 10,
      longitude: currentLocation.value.longitude,
      latitude: currentLocation.value.latitude
    }
    
    // 可选参数：type只有在有值时才传递
    if (emergencyFilter.type !== null && emergencyFilter.type !== undefined) {
      params.type = emergencyFilter.type
    }
    
    // 可选参数：maxDistance只有在有值时才传递
    if (emergencyFilter.maxDistance !== null && emergencyFilter.maxDistance !== undefined) {
      params.maxDistance = emergencyFilter.maxDistance
    }
    
    const response = await authApi.getPendingEmergencyCalls(params)
    
    // 检查组件是否已卸载
    if (!isMounted.value) return
    
    // 简化数据提取逻辑，添加详细日志验证
    let listData = []
    
    console.log('=== 开始解析API响应 ===')
    console.log('完整响应:', response)
    
    if (response) {
      console.log('响应不为空，开始解析')
      
      // 情况1: 直接返回列表数据
      if (Array.isArray(response)) {
        console.log('情况1: 响应是数组，直接使用')
        listData = response
      }
      // 情况2: 响应包含list字段
      else if (response.list) {
        console.log('情况2: 响应包含list字段')
        listData = response.list
      }
      // 情况3: 响应包含data字段，data包含list字段
      else if (response.data && response.data.list) {
        console.log('情况3: 响应.data包含list字段')
        listData = response.data.list
      }
      // 情况4: 响应包含status=200，data包含list字段
      else if (response.status === 200 && response.data) {
        console.log('情况4: 响应.status=200，检查response.data')
        if (response.data.list) {
          listData = response.data.list
          console.log('情况4.1: response.data包含list字段')
        } else if (response.data.data && response.data.data.list) {
          listData = response.data.data.list
          console.log('情况4.2: response.data.data包含list字段')
        } else {
          console.log('情况4.3: response.data不包含list字段')
        }
      }
      // 情况5: 响应包含code=200，data包含list字段
      else if (response.code === 200 && response.data) {
        console.log('情况5: 响应.code=200，检查response.data')
        if (response.data.list) {
          listData = response.data.list
          console.log('情况5.1: response.data包含list字段')
        }
      }
      
      // 确保listData是数组
      if (!Array.isArray(listData)) {
        console.error('解析结果不是数组，重置为空数组:', listData)
        listData = []
      }
      
      console.log('解析后的列表数据:', listData)
      console.log('列表长度:', listData.length)
    } else {
      console.error('API响应为空')
    }
    
    console.log('=== 结束解析API响应 ===')
    
    // 按照distance字段升序排序，确保最近的呼叫显示在最前面
    listData.sort((a, b) => a.distance - b.distance)
    
    // 更新列表数据
    pendingEmergencyList.value = listData
    console.log('pendingEmergencyList更新为:', pendingEmergencyList.value)
    console.log('pendingEmergencyList长度:', pendingEmergencyList.value.length)
    
  } catch (error) {
    if (!isMounted.value) return
    
    console.error('获取待处理紧急呼叫列表失败:', error)
    
    // 区分不同类型的错误，显示更具体的错误信息
    let errorMsg = '获取待处理紧急呼叫列表失败'
    if (error.message && error.message.includes('Failed to fetch')) {
      errorMsg = '网络错误：无法连接到服务器，请检查网络连接'
    } else if (error.response) {
      // 服务器返回了错误状态码
      errorMsg = error.response.data?.msg || `服务器错误 (${error.response.status})`
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      errorMsg = '请求超时：服务器没有响应，请稍后重试'
    } else {
      // 请求配置错误或其他错误
      errorMsg = error.message || '请求失败'
    }
    
    ElMessage.error(errorMsg)
    // 确保列表为空，避免显示错误数据
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
  
  // 验证经度和纬度是否为有效的数字
  if (isNaN(longitude) || isNaN(latitude)) {
    ElMessage.error('请输入有效的经纬度数值')
    return
  }
  
  // 验证经度范围（-180~180）
  if (longitude < -180 || longitude > 180) {
    ElMessage.error('经度范围必须在-180到180之间')
    return
  }
  
  // 验证纬度范围（-90~90）
  if (latitude < -90 || latitude > 90) {
    ElMessage.error('纬度范围必须在-90到90之间')
    return
  }
  
  // 设置位置信息
  currentLocation.value = {
    longitude,
    latitude
  }
  
  // 保存手动设置的位置到缓存
  saveLocationToCache(currentLocation.value)
  
  locationError.value = null
  ElMessage.success('位置设置成功并已保存')
  
  // 立即获取待响应呼叫列表
  fetchPendingEmergencyList()
  
  // 隐藏手动位置设置界面
  showManualLocation.value = false
}

// 选择紧急呼叫
const selectEmergency = async (emergency) => {
  try {
    if (!isMounted.value) return
    
    console.log('=== 选中紧急呼叫 ===')
    console.log('选中的紧急呼叫详细信息:', emergency)
    selectedEmergencyId.value = emergency.id
    detailLoading.value = true
    // 调用API获取完整呼叫详情
  const response = await authApi.getEmergencyCallDetail(emergency.id)
  
  // 检查组件是否已卸载
  if (!isMounted.value) return
  
  console.log('获取到的完整呼叫详情:', response)
  selectedEmergency.value = response
    handlingLogs.value = [] // 初始化空日志数组
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
    
    // 检查是否有当前位置信息
    if (!currentLocation.value) {
      ElMessage.error('请先获取或设置位置信息')
      return
    }
    
    const response = await authApi.respondEmergencyCall(selectedEmergencyId.value, {
      longitude: currentLocation.value.longitude,
      latitude: currentLocation.value.latitude
    })
    
    // 检查组件是否已卸载
    if (!isMounted.value) return
    
    // 显示响应消息
    ElMessage.success(response.message || '响应成功')
    
    // 刷新呼叫列表
    fetchPendingEmergencyList()
    
    // 清除选中状态，退出详情页面
    selectedEmergencyId.value = null
    selectedEmergency.value = null
    handlingLogs.value = []
  } catch (error) {
    if (!isMounted.value) return
    
    console.error('响应紧急呼叫失败:', error)
    
    // 处理不同类型的错误
    let errorMsg = '响应紧急呼叫失败'
    if (error.response) {
      // 服务器返回了错误状态码
      errorMsg = error.response.data?.msg || `响应失败 (${error.response.status})`
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      errorMsg = '请求超时：服务器没有响应，请稍后重试'
    } else {
      // 请求配置错误或其他错误
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
    
    // 检查是否已响应呼叫
    if (selectedEmergency && selectedEmergency.status === 0) {
      ElMessage.warning('请先响应呼叫才能进行其他操作')
      return
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 500))
    // const response = await authApi.markEmergencyAsHandled(selectedEmergencyId.value)
    
    // 检查组件是否已卸载
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
    
    // 检查是否已响应呼叫
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
    // const response = await authApi.endEmergencyHandling(selectedEmergencyId.value)
    
    // 检查组件是否已卸载
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

// 完成呼叫（管理模块）
const completeEmergency = async (callId) => {
  try {
    if (!isMounted.value) return
    
    // 弹出带输入框的对话框，让用户输入备注
    const { value: remark } = await ElMessageBox.prompt('请输入完成呼叫的备注信息', '完成呼叫', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入备注信息，例如：已将车辆拖至指定4S店，用户确认无误',
      inputValidator: (value) => {
        if (!value.trim()) {
          return '备注信息不能为空'
        }
        return true
      },
      inputErrorMessage: '备注信息不能为空',
      type: 'info'
    })
    
    // 调用API完成呼叫
    const response = await authApi.completeEmergencyCall(callId, {
      remark: remark.trim()
    })
    
    // 检查组件是否已卸载
    if (!isMounted.value) return
    
    // 显示成功消息
    ElMessage.success((response && response.message) || '完成呼叫成功')
    
    // 刷新管理紧急响应列表
    fetchManageEmergencyList()
  } catch (error) {
    if (!isMounted.value || error === 'cancel' || error.name === 'ElMessageBoxCancel') {
      return
    }
    
    console.error('完成呼叫失败:', error)
    
    // 处理不同类型的错误
    let errorMsg = '完成呼叫失败'
    if (error.response) {
      // 服务器返回了错误状态码
      errorMsg = error.response.data?.msg || `完成失败 (${error.response.status})`
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      errorMsg = '请求超时：服务器没有响应，请稍后重试'
    } else {
      // 请求配置错误或其他错误
      errorMsg = error.message || '请求失败'
    }
    
    ElMessage.error(errorMsg)
  }
}

// 取消呼叫（管理模块）
const cancelEmergency = async (callId) => {
  try {
    if (!isMounted.value) return
    
    // 弹出带输入框的对话框，让用户输入取消原因
    const { value: cancelReason } = await ElMessageBox.prompt('请输入取消呼叫的原因', '取消呼叫', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入取消原因，例如：用户已自行解决问题',
      inputValidator: (value) => {
        if (!value.trim()) {
          return '取消原因不能为空'
        }
        return true
      },
      inputErrorMessage: '取消原因不能为空',
      type: 'warning'
    })
    
    // 调用API取消呼叫
    const response = await authApi.cancelEmergencyCall(callId, {
      cancelReason: cancelReason.trim()
    })
    
    // 检查组件是否已卸载
    if (!isMounted.value) return
    
    // 显示成功消息
    ElMessage.success((response && response.message) || '取消呼叫成功')
    
    // 刷新管理紧急响应列表
    fetchManageEmergencyList()
  } catch (error) {
    if (!isMounted.value || error === 'cancel' || error.name === 'ElMessageBoxCancel') {
      return
    }
    
    console.error('取消呼叫失败:', error)
    
    // 处理不同类型的错误
    let errorMsg = '取消呼叫失败'
    if (error.response) {
      // 服务器返回了错误状态码
      errorMsg = error.response.data?.msg || `取消失败 (${error.response.status})`
    } else if (error.request) {
      // 请求已发出，但没有收到响应
      errorMsg = '请求超时：服务器没有响应，请稍后重试'
    } else {
      // 请求配置错误或其他错误
      errorMsg = error.message || '请求失败'
    }
    
    ElMessage.error(errorMsg)
  }
}

// 添加处理日志
const addHandlingLog = async () => {
  if (!isMounted.value) return
  
  if (!newLogContent.trim()) {
    ElMessage.warning('请输入日志内容')
    return
  }
  
  // 检查是否已响应呼叫
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
    
    // 立即添加到日志列表
    handlingLogs.value.push(newLog)
    newLogContent.value = ''
    
    // 滚动到底部
    await nextTick()
    if (isMounted.value && logScrollRef.value) {
      const scrollEl = logScrollRef.value.wrapRef
      scrollEl.scrollTop = scrollEl.scrollHeight
    }
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 300))
    // const response = await authApi.addEmergencyLog(selectedEmergencyId.value, { content: newLog.content })
    
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

// 获取管理紧急呼叫列表
const fetchManageEmergencyList = async () => {
  try {
    if (!isMounted.value) return
    
    manageLoading.value = true
    
    // 构建请求参数
    const params = {
      pageNum: managePage.value,
      pageSize: managePageSize.value
    }
    
    // 可选参数：关键词
    if (manageFilter.keyword) {
      params.keyword = manageFilter.keyword
    }
    
    // 可选参数：状态
    if (manageFilter.status !== null && manageFilter.status !== undefined) {
      params.status = manageFilter.status
    }
    
    // 可选参数：呼叫类型
    if (manageFilter.type !== null && manageFilter.type !== undefined) {
      params.type = manageFilter.type
    }
    
    console.log('获取管理紧急呼叫列表请求参数:', params)
    
    // 使用真实API获取数据
    const response = await authApi.getEmergencyCallRecords(params)
    
    // 检查组件是否已卸载
    if (!isMounted.value) return
    
    console.log('获取管理紧急呼叫列表响应:', response)
    
    // 处理API返回数据
    if (response) {
      manageEmergencyList.value = response.list || []
      manageTotal.value = response.total || 0
      console.log('管理紧急呼叫列表数据:', manageEmergencyList.value)
      console.log('管理紧急呼叫列表总数:', manageTotal.value)
    } else {
      console.error('获取管理紧急呼叫列表响应为空')
      manageEmergencyList.value = []
      manageTotal.value = 0
    }
  } catch (error) {
    if (!isMounted.value) return
    
    console.error('获取管理紧急呼叫列表失败:', error)
    ElMessage.error('获取管理紧急呼叫列表失败')
    manageEmergencyList.value = []
    manageTotal.value = 0
  } finally {
    if (isMounted.value) {
      manageLoading.value = false
    }
  }
}

// 管理分页大小变化
const handleManageSizeChange = (size) => {
  managePageSize.value = size
  managePage.value = 1
  fetchManageEmergencyList()
}

// 管理页码变化
const handleManagePageChange = (page) => {
  managePage.value = page
  fetchManageEmergencyList()
}

// 重置管理筛选
const resetManageFilter = () => {
  Object.assign(manageFilter, {
    dateRange: [],
    keyword: '',
    status: null,
    type: null
  })
  fetchManageEmergencyList()
}

// 获取紧急呼叫记录
const fetchEmergencyRecords = async () => {
  try {
    if (!isMounted.value) return
    
    recordLoading.value = true
    
    // 构建请求参数
    const params = {
      pageNum: recordPage.value,
      pageSize: recordPageSize.value
    }
    
    // 可选参数：关键词
    if (recordFilter.keyword) {
      params.keyword = recordFilter.keyword
    }
    
    // 可选参数：日期范围
    if (recordFilter.dateRange && recordFilter.dateRange.length === 2) {
      params.startTime = recordFilter.dateRange[0] + ' 00:00:00'
      params.endTime = recordFilter.dateRange[1] + ' 23:59:59'
    }
    
    console.log('获取紧急呼叫记录请求参数:', params)
    
    // 使用真实API获取数据
    const response = await authApi.getEmergencyCallRecords(params)
    
    // 检查组件是否已卸载
    if (!isMounted.value) return
    
    console.log('获取紧急呼叫记录响应:', response)
    
    // 处理API返回数据
    if (response) {
      emergencyRecords.value = response.list || []
      recordTotal.value = response.total || 0
      console.log('紧急呼叫记录数据:', emergencyRecords.value)
      console.log('紧急呼叫记录总数:', recordTotal.value)
    } else {
      console.error('获取紧急呼叫记录响应为空')
      emergencyRecords.value = []
      recordTotal.value = 0
    }
  } catch (error) {
    if (!isMounted.value) return
    
    console.error('获取紧急呼叫记录失败:', error)
    ElMessage.error('获取紧急呼叫记录失败')
    emergencyRecords.value = []
    recordTotal.value = 0
  } finally {
    if (isMounted.value) {
      recordLoading.value = false
    }
  }
}

// 记录分页大小变化
const handleRecordSizeChange = (size) => {
  recordPageSize.value = size
  recordPage.value = 1
  fetchEmergencyRecords()
}

// 记录页码变化
const handleRecordPageChange = (page) => {
  recordPage.value = page
  fetchEmergencyRecords()
}

// 重置记录筛选
const resetRecordFilter = () => {
  Object.assign(recordFilter, {
    dateRange: [],
    keyword: '',
    level: null
  })
  fetchEmergencyRecords()
}

// 查看紧急呼叫详情
const viewEmergencyDetail = (emergency) => {
  currentEmergencyDetail.value = emergency
  emergencyDetailLogs.value = mockHandlingLogs[emergency.id] || []
  showEmergencyDetail.value = true
}

// 查看记录详情
const viewRecordDetail = (record) => {
  currentEmergencyDetail.value = record
  emergencyDetailLogs.value = mockHandlingLogs[record.id] || []
  showEmergencyDetail.value = true
}

// 获取我的响应记录
const fetchMyEmergencyResponses = async () => {
  try {
    if (!isMounted.value) return
    
    myResponsesLoading.value = true
    
    // 构建请求参数
    const params = {
      pageNum: myResponsesPage.value,
      pageSize: myResponsesPageSize.value
    }
    
    // 可选参数：状态
    if (myResponsesFilter.status !== null && myResponsesFilter.status !== undefined) {
      params.status = myResponsesFilter.status
    }
    
    // 可选参数：呼叫类型
    if (myResponsesFilter.type !== null && myResponsesFilter.type !== undefined) {
      params.type = myResponsesFilter.type
    }
    
    // 可选参数：日期范围
    if (myResponsesFilter.dateRange && myResponsesFilter.dateRange.length === 2) {
      params.startTime = myResponsesFilter.dateRange[0] + ' 00:00:00'
      params.endTime = myResponsesFilter.dateRange[1] + ' 23:59:59'
    }
    
    const response = await authApi.getMyEmergencyResponses(params)
    
    // 检查组件是否已卸载
    if (!isMounted.value) return
    
    console.log('获取我的响应记录完整响应:', response)
    
    // 处理API返回数据，支持多种响应格式
    let listData = []
    let totalCount = 0
    
    if (response) {
      // 情况1: 响应.status=200，检查response.data
      if (response.status === 200 && response.data) {
        // 子情况1.1: response.data包含code=200和data字段
        if (response.data.code === 200 && response.data.data) {
          console.log('情况1.1: 响应.data包含code=200和data字段')
          listData = response.data.data.list || []
          totalCount = response.data.data.total || 0
        }
        // 子情况1.2: response.data直接包含list字段
        else if (response.data.list) {
          console.log('情况1.2: 响应.data直接包含list字段')
          listData = response.data.list || []
          totalCount = response.data.total || 0
        }
      }
      // 情况2: 响应直接包含code=200和data字段
      else if (response.code === 200 && response.data) {
        console.log('情况2: 响应直接包含code=200和data字段')
        listData = response.data.list || []
        totalCount = response.data.total || 0
      }
      // 情况3: 响应直接包含list字段
      else if (response.list) {
        console.log('情况3: 响应直接包含list字段')
        listData = response.list || []
        totalCount = response.total || 0
      }
    } else {
      console.error('获取我的响应记录响应为空')
    }
    
    // 更新列表数据和总数
    myResponsesList.value = listData
    myResponsesTotal.value = totalCount
    console.log('我的响应记录数据:', myResponsesList.value)
    console.log('我的响应记录总数:', myResponsesTotal.value)
    
  } catch (error) {
    if (!isMounted.value) return
    
    console.error('获取我的响应记录失败:', error)
    ElMessage.error('获取我的响应记录失败')
    myResponsesList.value = []
    myResponsesTotal.value = 0
  } finally {
    if (isMounted.value) {
      myResponsesLoading.value = false
    }
  }
}

// 我的响应记录分页大小变化
const handleMyResponsesSizeChange = (size) => {
  myResponsesPageSize.value = size
  myResponsesPage.value = 1
  fetchMyEmergencyResponses()
}

// 我的响应记录页码变化
const handleMyResponsesPageChange = (page) => {
  myResponsesPage.value = page
  fetchMyEmergencyResponses()
}

// 重置我的响应记录筛选
const resetMyResponsesFilter = () => {
  Object.assign(myResponsesFilter, {
    dateRange: [],
    status: null,
    type: null
  })
  fetchMyEmergencyResponses()
}

// 查看我的响应记录详情
const viewMyResponseDetail = (response) => {
  currentEmergencyDetail.value = response
  emergencyDetailLogs.value = [] // 初始化空日志数组
  showEmergencyDetail.value = true
}

// 组件挂载时初始化数据
onMounted(() => {
  // 获取当前位置，获取到位置后会自动获取待响应呼叫列表
  getCurrentLocation()
  fetchManageEmergencyList()
  fetchEmergencyRecords()
  fetchMyEmergencyResponses()
})
</script>

<style scoped>
/* 紧急响应模块主样式 */
.emergency-container {
  padding: 20px;
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
}

.emergency-card {
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.emergency-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.card-header {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  padding: 20px;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border-bottom: none;
  color: #fff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

/* 通用面板样式 */
.emergency-list-panel, .emergency-detail-panel, .manage-container, .records-container, .my-responses-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: all 0.3s ease;
}

.emergency-list-panel:hover, .emergency-detail-panel:hover, .manage-container:hover, .records-container:hover, .my-responses-container:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.emergency-tabs {
  margin-top: 0;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-tabs__header) {
  margin: 0;
  padding: 0 20px;
  background-color: #fafafa;
  border-bottom: 1px solid #e4e7ed;
}

:deep(.el-tabs__nav) {
  margin: 0;
  height: 56px;
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-tabs__item) {
  padding: 0 20px;
  height: 56px;
  line-height: 56px;
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  transition: all 0.3s ease;
  border-radius: 8px 8px 0 0;
  margin: 0 4px;
}

:deep(.el-tabs__item:hover) {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.05);
}

:deep(.el-tabs__item.is-active) {
  color: #409eff;
  background-color: #fff;
  border: 1px solid #e4e7ed;
  border-bottom-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

:deep(.el-tabs__active-bar) {
  background-color: #409eff;
  height: 3px;
  border-radius: 3px;
  bottom: 0;
}

:deep(.el-tabs__content) {
  padding: 20px;
  background-color: #fff;
}

/* 响应紧急呼叫样式 */
.respond-container {
  display: flex;
  gap: 20px;
  height: 700px;
  margin-top: 20px;
}

/* 通用面板样式 */
.emergency-list-panel,
.emergency-detail-panel,
.manage-container,
.records-container,
.my-responses-container {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
}

.emergency-list-panel:hover,
.emergency-detail-panel:hover,
.manage-container:hover,
.records-container:hover,
.my-responses-container:hover {
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.12);
}

/* 列表面板样式 */
.emergency-list-panel {
  width: 400px;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
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
  color: #303133;
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
  border: 1px solid #dcdfe6;
  border-right: none;
  transition: all 0.3s ease;
}

:deep(.emergency-search .el-input__inner:hover) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.emergency-search .el-input__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

:deep(.emergency-search .el-button) {
  border-radius: 0 8px 8px 0;
  height: 36px;
  padding: 0 16px;
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
  transition: all 0.3s ease;
}

:deep(.emergency-search .el-button:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
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
  background-color: #f5f7fa;
  border-radius: 8px;
  border: 1px solid #e4e7ed;
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
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
}

:deep(.el-select .el-input__inner:hover) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.el-select .el-input__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

:deep(.el-input-number) {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-input-number__decrease),
:deep(.el-input-number__increase) {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
  transition: all 0.3s ease;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.el-input-number__decrease:hover),
:deep(.el-input-number__increase:hover) {
  background-color: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
}

:deep(.el-input-number__decrease.is-disabled:hover),
:deep(.el-input-number__increase.is-disabled:hover) {
  background-color: #f5f7fa;
  border-color: #dcdfe6;
  color: #c0c4cc;
}

:deep(.el-input-number__input) {
  border-radius: 0;
  height: 36px;
  border: 1px solid #dcdfe6;
  border-left: none;
  border-right: none;
  transition: all 0.3s ease;
}

:deep(.el-input-number__input:hover) {
  border-color: #409eff;
}

:deep(.el-input-number__input:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

:deep(.el-input-number .el-input__append) {
  padding: 0 10px;
  background-color: #f5f7fa;
  border-left: 1px solid #dcdfe6;
  border-radius: 0 8px 8px 0;
  font-size: 12px;
  color: #606266;
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
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

.filter-btn:first-of-type:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.filter-btn:not(:first-of-type) {
  background-color: #fff;
  border-color: #dcdfe6;
  color: #606266;
}

.filter-btn:not(:first-of-type):hover {
  border-color: #409eff;
  color: #409eff;
  background-color: #ecf5ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

/* 手动位置设置样式 */
.manual-location {
  margin: 0 15px 15px;
  padding: 16px;
  background-color: #f5f7fa;
  border-radius: 6px;
  border: 1px solid #e4e7ed;
}

.manual-location h4 {
  margin: 0 0 15px 0;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
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
  background-color: #ecf5ff;
  border-right: 4px solid #409eff;
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
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: #fff;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
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
  color: #303133;
  font-size: 16px;
}

.status-tag {
  flex-shrink: 0;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}

.status-tag[data-status="0"] {
  background-color: #fdf6ec;
  border-color: #fde2c0;
  color: #e6a23c;
}

.status-tag[data-status="1"] {
  background-color: #ecf5ff;
  border-color: #d6ecff;
  color: #409eff;
}

.status-tag[data-status="2"] {
  background-color: #f0f9eb;
  border-color: #c2e7b0;
  color: #67c23a;
}

.status-tag[data-status="3"] {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #909399;
}

.emergency-item-desc {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.emergency-content {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
  display: flex;
  align-items: center;
  gap: 6px;
}

.distance-info {
  font-weight: 600;
  color: #409eff;
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
  color: #909399;
  margin-top: 4px;
}

.type-tag {
  background-color: #f0f9eb;
  border-color: #c2e7b0;
  color: #67c23a;
  flex-shrink: 0;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  margin-left: auto;
}

/* 紧急等级头像样式 */
.emergency-avatar {
  background-color: #409eff;
  color: white;
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
  background-color: #409eff;
  border-color: #409eff;
  color: #fff;
}

.emergency-actions .el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.emergency-actions .el-button--danger {
  background-color: #f56c6c;
  border-color: #f56c6c;
  color: #fff;
}

.emergency-actions .el-button--danger:hover {
  background-color: #f78989;
  border-color: #f78989;
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
}

.emergency-actions .el-button:not(.el-button--primary):not(.el-button--danger) {
  background-color: #fff;
  border-color: #dcdfe6;
  color: #606266;
}

.emergency-actions .el-button:not(.el-button--primary):not(.el-button--danger):hover {
  border-color: #409eff;
  color: #409eff;
  background-color: #ecf5ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.emergency-info-card {
  padding: 20px;
  border-bottom: 1px solid #ebeef5;
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
  background-color: #f5f7fa;
  border-bottom: 1px solid #ebeef5;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
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
  color: #606266;
  width: 120px;
}

:deep(.emergency-info-card .el-descriptions__content) {
  color: #303133;
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
  border-bottom: 1px solid #ebeef5;
}

.card-subheader h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.log-scroll {
  flex: 1;
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid #ebeef5;
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
  border-left: 4px solid #409eff;
  position: relative;
}

.log-item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
  background-color: #fff;
}

.log-item[data-type="response"] {
  border-left-color: #409eff;
}

.log-item[data-type="handle"] {
  border-left-color: #67c23a;
}

.log-item[data-type="end"] {
  border-left-color: #f56c6c;
}

.log-item[data-type="system"] {
  border-left-color: #909399;
}

.log-item[data-type="note"] {
  border-left-color: #e6a23c;
}

.log-time {
  font-size: 12px;
  color: #909399;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.log-content {
  font-size: 14px;
  color: #606266;
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
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
  min-height: 100px;
  padding: 12px;
  font-size: 14px;
  line-height: 1.6;
}

:deep(.add-log-area .el-textarea__inner:hover) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.add-log-area .el-textarea__inner:focus) {
  border-color: #409eff;
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

/* 管理紧急呼叫样式 */
.manage-container,
.records-container,
.my-responses-container {
  padding: 20px;
  margin-top: 20px;
}

/* 筛选栏样式 */
.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

/* 表格样式 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__header-wrapper) {
  background-color: #fafafa;
}

:deep(.el-table__header th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #303133;
  border-bottom: 2px solid #e4e7ed;
}

:deep(.el-table__body tr:hover > td) {
  background-color: #fafafa !important;
}

:deep(.el-table__body tr.current-row > td) {
  background-color: #ecf5ff !important;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: #fafafa !important;
}

/* 分页样式 */
.pagination {
  margin-top: 24px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

:deep(.el-pagination) {
  font-size: 14px;
}

/* 详情弹窗样式 */
.detail-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.detail-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.detail-id,
.detail-user {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.detail-time {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #606266;
}

.detail-section {
  margin-bottom: 24px;
}

.detail-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-descriptions {
  margin-bottom: 0;
  border-radius: 6px;
  overflow: hidden;
}

.detail-log-scroll {
  margin-top: 16px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  background-color: #fafafa;
}

.detail-log-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
}

/* 标签样式统一 */
:deep(.el-tag) {
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

/* 按钮样式统一 */
:deep(.el-button) {
  border-radius: 4px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-button:hover) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:deep(.el-button:active) {
  transform: translateY(0);
}

/* 输入框样式统一 */
:deep(.el-input__wrapper) {
  border-radius: 4px;
  transition: all 0.3s ease;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

/* 选择框样式统一 */
:deep(.el-select__wrapper) {
  border-radius: 4px;
  transition: all 0.3s ease;
}

:deep(.el-select__wrapper:hover) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

:deep(.el-select__wrapper.is-focus) {
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
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
  color: #909399;
  font-size: 14px;
}

/* 按钮组样式 */
.button-group {
  display: flex;
  gap: 8px;
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
  .emergency-container {
    padding: 10px;
  }

  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item,
  .location-input {
    width: 100% !important;
  }

  .emergency-actions {
    flex-direction: column;
  }

  .detail-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-time {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}
</style>