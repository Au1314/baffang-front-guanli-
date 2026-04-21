<template>
  <div class="platform-manage-container">
    <el-card shadow="never" class="platform-manage-card">
      <template #header>
        <div class="card-header">
          <span>平台管理</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab" type="border-card">
        <!-- 成员管理标签页 -->
        <el-tab-pane label="成员管理" name="member">
          <div class="tab-content">
            
            <el-table :data="memberList" stripe style="width: 100%" :loading="memberLoading" @row-click="handleRowClick" class="member-table">
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="username" label="用户名" min-width="120">
                <template #default="scope">
                  <el-tooltip :content="scope.row.username" placement="top">
                    <span class="ellipsis">{{ scope.row.username }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="name" label="昵称" min-width="120">
                <template #default="scope">
                  <el-tooltip :content="scope.row.name" placement="top">
                    <span class="ellipsis">{{ scope.row.name }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="typeName" label="角色" width="120">
                <template #default="scope">
                  <el-tag :type="getRoleTypeTag(scope.row.type)" size="small" effect="dark">
                    {{ scope.row.typeName || getRoleTypeName(scope.row.type) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="createTime" label="创建时间" width="180">
                <template #default="scope">
                  <el-tooltip :content="scope.row.createTime" placement="top">
                    <span class="ellipsis">{{ scope.row.createTime }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column prop="updateTime" label="更新时间" width="180">
                <template #default="scope">
                  <el-tooltip :content="scope.row.updateTime" placement="top">
                    <span class="ellipsis">{{ scope.row.updateTime }}</span>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="180" fixed="right">
                <template #default="scope">
                  <div class="operation-buttons">
                    <!-- 详情按钮 -->
                    <el-button 
                      size="small" 
                      type="primary" 
                      @click.stop="handleShowMemberDetail(scope.row)"
                      class="detail-button"
                    >
                      详情
                    </el-button>
                    
                    <!-- 修改身份按钮 -->
                    <el-button 
                      size="small" 
                      type="warning" 
                      @click.stop="handleEditMemberRole(scope.row)"
                      :disabled="!canManageMember(scope.row)"
                      class="edit-button"
                    >
                      修改身份
                    </el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>
            
            <!-- 分页控件 -->
            <div class="pagination" style="margin-top: 16px;">
              <el-pagination
                v-model:current-page="memberPage"
                v-model:page-size="memberPageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="memberTotal"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleMemberSizeChange"
                @current-change="handleMemberPageChange"
                class="custom-pagination"
              />
            </div>
          </div>
        </el-tab-pane>
        
        <!-- 参数配置标签页 -->
        <el-tab-pane label="参数配置" name="config">
          <div class="tab-content">
            <el-form :model="configForm" label-width="120px">
              <el-form-item label="默认呼叫范围">
                <el-input v-model="configForm.defaultCallRange" placeholder="请输入默认呼叫范围" />
              </el-form-item>
              <el-form-item label="积分奖励">
                <el-input-number v-model="configForm.creditReward" :min="0" :step="1" placeholder="请输入积分奖励" />
              </el-form-item>
              <el-form-item label="日志记录字段">
                <el-checkbox-group v-model="configForm.logFields">
                  <el-checkbox label="操作时间" />
                  <el-checkbox label="操作人" />
                  <el-checkbox label="操作类型" />
                  <el-checkbox label="操作内容" />
                  <el-checkbox label="IP地址" />
                  <el-checkbox label="设备信息" />
                </el-checkbox-group>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" @click="handleSaveConfig">保存配置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-tab-pane>
        
        <!-- 日志查看标签页 -->
        <el-tab-pane label="日志查看" name="log">
          <div class="tab-content">
            <div class="filter-bar" style="margin-bottom: 16px;">
              <el-input 
                v-model="logFilter.keyword" 
                placeholder="请输入日志关键字" 
                style="width: 200px; margin-right: 10px;" 
                clearable
                @keyup.enter="handleSearchLog"
              />
              <el-input 
                v-model="logFilter.module" 
                placeholder="请输入模块名称" 
                style="width: 150px; margin-right: 10px;" 
                clearable
                @keyup.enter="handleSearchLog"
              />
              <el-input 
                v-model="logFilter.action" 
                placeholder="请输入操作名称" 
                style="width: 150px; margin-right: 10px;" 
                clearable
                @keyup.enter="handleSearchLog"
              />
              <el-select 
                v-model="logFilter.status" 
                placeholder="操作状态" 
                style="width: 120px; margin-right: 10px;"
                clearable
              >
                <el-option label="成功" :value="1" />
                <el-option label="失败" :value="0" />
              </el-select>
              <el-input 
                v-model="logFilter.adminId" 
                placeholder="管理员ID" 
                style="width: 120px; margin-right: 10px;" 
                clearable
                @keyup.enter="handleSearchLog"
              />
              <el-input 
                v-model="logFilter.userId" 
                placeholder="用户ID" 
                style="width: 120px; margin-right: 10px;" 
                clearable
                @keyup.enter="handleSearchLog"
              />
              <el-date-picker
                v-model="logFilter.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="margin-right: 10px;"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
              <el-button type="primary" @click="handleSearchLog">查询</el-button>
              <el-button @click="handleResetLogFilter">重置</el-button>
            </div>
            
            <el-table 
              :data="logList" 
              stripe 
              style="width: 100%" 
              :loading="logLoading"
              @row-click="handleLogRowClick"
              highlight-current-row
            >
              <el-table-column prop="id" label="ID" width="80" />
              <el-table-column prop="adminId" label="管理员ID" width="120" />
              <el-table-column prop="adminName" label="管理员名称" width="120" />
              <el-table-column prop="userId" label="用户ID" width="100" />
              <el-table-column prop="module" label="操作模块" width="120" />
              <el-table-column prop="action" label="操作行为" width="150" />
              <el-table-column prop="method" label="请求方法" width="100" />
              <el-table-column prop="url" label="请求URL" min-width="200" show-overflow-tooltip />
              <el-table-column prop="ip" label="IP地址" width="150" />
              <el-table-column prop="status" label="操作状态" width="100">
                <template #default="scope">
                  <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">
                    {{ scope.row.status === 1 ? '成功' : '失败' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="executionTime" label="执行时长(ms)" width="120" />
              <el-table-column prop="createTime" label="操作时间" width="180" />
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="scope">
                  <el-button 
                    size="small" 
                    type="primary" 
                    @click.stop="handleViewLogDetail(scope.row)"
                  >
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
            
            <div class="pagination" style="margin-top: 16px;">
              <el-pagination
                v-model:current-page="logPage"
                v-model:page-size="logPageSize"
                :page-sizes="[10, 20, 50, 100]"
                :total="logTotal"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleLogSizeChange"
                @current-change="handleLogPageChange"
              />
            </div>
          </div>
        </el-tab-pane>

        <!-- 邀请码管理标签页 - 仅超级管理员可见 -->
        <el-tab-pane v-if="isSuperAdmin" label="邀请码管理" name="inviteCode">
          <div class="tab-content">
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card shadow="hover" class="invite-card">
                  <template #header>
                    <div class="card-header">
                      <span>生成邀请码</span>
                    </div>
                  </template>
                  <el-form :model="inviteForm" label-width="100px">
                    <el-form-item label="自定义邀请码">
                      <el-input 
                        v-model="inviteForm.code" 
                        placeholder="留空则随机生成" 
                        style="width: 100%"
                        maxlength="20"
                        show-word-limit
                      />
                    </el-form-item>
                    <el-form-item label="权限类型" required>
                      <el-select v-model="inviteForm.targetType" placeholder="请选择权限类型" style="width: 100%">
                        <el-option label="普通管理员" :value="adminStore.AdminType.NORMAL_ADMIN" />
                        <el-option label="审核员" :value="adminStore.AdminType.AUDITOR" />
                        <el-option label="客服" :value="adminStore.AdminType.CUSTOMER_SERVICE" />
                        <el-option label="紧急响应人员" :value="adminStore.AdminType.EMERGENCY_RESPONDER" />
                        <el-option label="论坛管理员" :value="5" />
                      </el-select>
                    </el-form-item>
                    <el-form-item label="最大使用次数" required>
                      <el-input-number v-model="inviteForm.maxUses" :min="1" :max="100" style="width: 100%" />
                    </el-form-item>
                    <el-form-item label="过期小时数" required>
                      <el-input-number v-model="inviteForm.expireHours" :min="1" :max="168" style="width: 100%" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="handleGenerateInviteCode" :loading="generating">
                        生成邀请码
                      </el-button>
                    </el-form-item>
                  </el-form>
                </el-card>
              </el-col>
              <el-col :span="16">
                <el-card shadow="hover" class="invite-card">
                  <template #header>
                    <div class="card-header">
                      <span>已生成的邀请码</span>
                      <div class="header-buttons">
                        <!-- 批量删除按钮 -->
                        <el-button
                          type="danger"
                          size="small"
                          @click="handleBatchDelete"
                          :disabled="selectedInviteCodes.length === 0"
                          :loading="loading"
                          style="margin-right: 8px"
                        >
                          批量删除 ({{ selectedInviteCodes.length }})
                        </el-button>
                        <el-button type="primary" size="small" @click="fetchInviteCodeList" :loading="loading">
                          刷新列表
                        </el-button>
                      </div>
                    </div>
                  </template>
                  <el-table :data="inviteCodeList" stripe style="width: 100%" max-height="400" @selection-change="handleSelectionChange">
                    <!-- 复选框列 -->
                    <el-table-column type="selection" width="55" />
                    <el-table-column prop="code" label="邀请码" width="160">
                      <template #default="scope">
                        <el-tooltip :content="scope.row.code" placement="top">
                          <span class="code-text">{{ scope.row.code }}</span>
                        </el-tooltip>
                      </template>
                    </el-table-column>
                    <el-table-column prop="targetTypeName" label="权限类型" width="120">
                      <template #default="scope">
                        {{ scope.row.targetTypeName || getRoleTypeName(scope.row.targetType) }}
                      </template>
                    </el-table-column>
                    <el-table-column prop="maxUses" label="最大使用次数" width="110" />
                    <el-table-column prop="usedCount" label="已使用次数" width="110" />
                    <el-table-column prop="status" label="状态" width="100">
                      <template #default="scope">
                        <el-tag :type="getInviteCodeStatusType(scope.row)">
                          {{ getInviteCodeStatusText(scope.row) }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="createTime" label="创建时间" width="180" />
                    <el-table-column prop="expireTime" label="过期时间" width="180">
                      <template #default="scope">
                        {{ scope.row.expireTime || '永久有效' }}
                      </template>
                    </el-table-column>
                    <el-table-column label="操作" width="260" fixed="right">
                      <template #default="scope">
                        <div class="operation-buttons">
                          <!-- 复制按钮 -->
                          <el-button
                            v-if="scope.row.usedCount < scope.row.maxUses && scope.row.status !== 1"
                            type="primary"
                            size="small"
                            @click="copyInviteCode(scope.row.code)"
                          >
                            复制
                          </el-button>
                          <span v-else style="color: #909399; font-size: 12px;">
                            不可用
                          </span>
                          
                          <!-- 禁用/启用按钮 -->
                          <el-button
                            v-if="scope.row.status === 0"
                            type="danger"
                            size="small"
                            @click="handleToggleInviteCodeStatus(scope.row.id, 1)"
                            style="margin-left: 8px"
                          >
                            禁用
                          </el-button>
                          <el-button
                            v-else
                            type="success"
                            size="small"
                            @click="handleToggleInviteCodeStatus(scope.row.id, 0)"
                            style="margin-left: 8px"
                          >
                            启用
                          </el-button>
                          
                          <!-- 删除按钮 -->
                          <el-button
                            type="warning"
                            size="small"
                            @click="handleDeleteInviteCode(scope.row.id, scope.row.code)"
                            style="margin-left: 8px"
                          >
                            删除
                          </el-button>
                        </div>
                      </template>
                    </el-table-column>
                  </el-table>
                  <div class="pagination" v-if="inviteTotal > 10">
                    <el-pagination
                      v-model:current-page="invitePage"
                      v-model:page-size="invitePageSize"
                      :page-sizes="[10, 20, 50]"
                      :total="inviteTotal"
                      layout="total, sizes, prev, pager, next"
                      @size-change="handleInviteSizeChange"
                      @current-change="handleInvitePageChange"
                    />
                  </div>
                </el-card>
              </el-col>
            </el-row>
            <el-dialog v-model="showGeneratedCodes" title="生成的邀请码" width="500px" center>
              <div class="generated-codes-container">
                <el-input
                  v-for="(code, index) in generatedCodes"
                  :key="index"
                  v-model="generatedCodes[index]"
                  readonly
                  style="margin-bottom: 10px"
                >
                  <template #append>
                    <el-button @click="copyGeneratedCode(index)">
                      <el-icon><CopyDocument /></el-icon>
                    </el-button>
                  </template>
                </el-input>
              </div>
              <template #footer>
                <el-button type="primary" @click="copyAllCodes">复制全部</el-button>
                <el-button @click="showGeneratedCodes = false">关闭</el-button>
              </template>
            </el-dialog>
          </div>
        </el-tab-pane>


      </el-tabs>
      
      <!-- 修改身份弹窗 -->
      <el-dialog
        v-model="showEditRole"
        title="修改管理员身份"
        width="500px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        center
      >
        <el-form v-loading="editRoleLoading" label-width="100px">
          <el-form-item label="用户名">
            <span>{{ editingMember?.username }}</span>
          </el-form-item>
          <el-form-item label="当前角色">
            <span>{{ editingMember?.typeName || getRoleTypeName(editingMember?.type) }}</span>
          </el-form-item>
          <el-form-item label="新角色" required>
            <el-select v-model="newRoleType" placeholder="请选择新角色" style="width: 100%">
              <!-- 只有超级管理员可以选择普通管理员 -->
              <el-option v-if="isSuperAdmin" label="普通管理员" :value="adminStore.AdminType.NORMAL_ADMIN" />
              <el-option label="审核员" :value="adminStore.AdminType.AUDITOR" />
              <el-option label="客服" :value="adminStore.AdminType.CUSTOMER_SERVICE" />
              <el-option label="紧急响应人员" :value="adminStore.AdminType.EMERGENCY_RESPONDER" />
              <!-- 只有超级管理员可以选择论坛管理员 -->
              <el-option v-if="isSuperAdmin" label="论坛管理员" :value="5" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="closeEditRoleDialog">取消</el-button>
            <el-button type="primary" @click="submitEditRole" :loading="editRoleLoading">确认修改</el-button>
          </span>
        </template>
      </el-dialog>
      
      <!-- 管理员详情弹窗 -->
      <el-dialog
        v-model="showMemberDetail"
        title="管理员详情"
        width="600px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        center
      >
        <el-card shadow="never" v-loading="detailLoading">
          <el-descriptions :column="1" border>
            <el-descriptions-item label="用户名">{{ memberDetail.username }}</el-descriptions-item>
            <el-descriptions-item label="昵称">{{ memberDetail.name }}</el-descriptions-item>
            <el-descriptions-item label="角色">{{ memberDetail.typeName || getRoleTypeName(memberDetail.type) }}</el-descriptions-item>
            <el-descriptions-item label="ID">{{ memberDetail.id }}</el-descriptions-item>
            <el-descriptions-item label="头像">{{ memberDetail.avatar || '无' }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ memberDetail.createTime }}</el-descriptions-item>
            <el-descriptions-item label="更新时间">{{ memberDetail.updateTime }}</el-descriptions-item>
          </el-descriptions>
        </el-card>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="closeMemberDetail">关闭</el-button>
          </span>
        </template>
      </el-dialog>
      
      <!-- 日志详情弹窗 -->
      <el-dialog
        v-model="logDetailVisible"
        title="日志详情"
        width="800px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
        center
      >
        <el-card shadow="never" v-loading="logDetailLoading">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="日志ID">{{ logDetail.id }}</el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ logDetail.createTime }}</el-descriptions-item>
            <el-descriptions-item label="管理员ID">{{ logDetail.adminId || '无' }}</el-descriptions-item>
            <el-descriptions-item label="管理员名称">{{ logDetail.adminName || '无' }}</el-descriptions-item>
            <el-descriptions-item label="用户ID">{{ logDetail.userId || '无' }}</el-descriptions-item>
            <el-descriptions-item label="用户名">{{ logDetail.userName || '无' }}</el-descriptions-item>
            <el-descriptions-item label="操作模块">{{ logDetail.module }}</el-descriptions-item>
            <el-descriptions-item label="操作行为">{{ logDetail.action }}</el-descriptions-item>
            <el-descriptions-item label="请求方法">{{ logDetail.method }}</el-descriptions-item>
            <el-descriptions-item label="请求URL">{{ logDetail.url }}</el-descriptions-item>
            <el-descriptions-item label="IP地址">{{ logDetail.ip }}</el-descriptions-item>
            <el-descriptions-item label="执行时长">{{ logDetail.executionTime }}ms</el-descriptions-item>
            <el-descriptions-item label="操作状态">
              <el-tag :type="logDetail.status === 1 ? 'success' : 'danger'">
                {{ logDetail.status === 1 ? '成功' : '失败' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="错误信息">{{ logDetail.errorMsg || '无' }}</el-descriptions-item>
          </el-descriptions>
          
          <!-- 请求参数 -->
          <el-divider content-position="left">请求参数</el-divider>
          <el-card shadow="hover" v-if="logDetail.params" class="json-card">
            <pre>{{ formatJson(logDetail.params) }}</pre>
          </el-card>
          <el-card shadow="hover" v-else class="json-card">
            <span>无</span>
          </el-card>
          
          <!-- 返回结果 -->
          <el-divider content-position="left">返回结果</el-divider>
          <el-card shadow="hover" v-if="logDetail.result" class="json-card">
            <pre>{{ formatJson(logDetail.result) }}</pre>
          </el-card>
          <el-card shadow="hover" v-else class="json-card">
            <span>无</span>
          </el-card>
          
          <!-- 用户代理 -->
          <el-divider content-position="left">用户代理</el-divider>
          <el-card shadow="hover" class="json-card">
            <span>{{ logDetail.userAgent || '无' }}</span>
          </el-card>
        </el-card>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="logDetailVisible = false">关闭</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import { useAdminStore } from '@/store/adminStore'
import { authApi } from '@/api/auth'
import { useRouter } from 'vue-router'
import { CopyDocument } from '@element-plus/icons-vue'


// 实例化adminStore
const adminStore = useAdminStore()
const router = useRouter()

// 标签页状态
const activeTab = ref('member')

// 权限相关计算属性
const isSuperAdmin = computed(() => adminStore.isSuperAdmin)
const isNormalAdmin = computed(() => adminStore.isNormalAdmin)
const currentAdminType = computed(() => adminStore.adminType)

// 成员管理数据
const memberList = ref([])
const memberTotal = ref(0)
const memberPage = ref(1)
const memberPageSize = ref(20)
const memberLoading = ref(false)

// 管理员详情数据
const showMemberDetail = ref(false)
const selectedMember = ref(null)
const memberDetail = ref({})
const detailLoading = ref(false)

// 修改身份数据
const showEditRole = ref(false)
const editingMember = ref(null)
const newRoleType = ref(null)
const editRoleLoading = ref(false)

// 参数配置表单
const configForm = reactive({
  defaultCallRange: '',
  creditReward: 0,
  logFields: ['操作时间', '操作人', '操作类型']
})

// 日志查看数据
const logFilter = reactive({
  keyword: '',
  dateRange: null,
  module: '',
  action: '',
  status: '',
  adminId: '',
  userId: ''
})

const logList = ref([])
const logTotal = ref(0)
const logLoading = ref(false)
const logPage = ref(1)
const logPageSize = ref(10)

// 日志详情数据
const logDetail = ref({})
const logDetailVisible = ref(false)
const logDetailLoading = ref(false)



// 邀请码管理数据
const inviteForm = reactive({
  code: '', // 自定义邀请码
  targetType: null, // 目标类型
  maxUses: 5,
  expireHours: 72 // 过期小时数
})

const inviteCodeList = computed(() => adminStore.inviteCodeList)
const loading = computed(() => adminStore.inviteCodeLoading)
const generating = ref(false)
const invitePage = ref(1)
const invitePageSize = ref(10)
const inviteTotal = ref(0)
const showGeneratedCodes = ref(false)
const generatedCodes = ref([])

// 批量操作相关
const selectedInviteCodes = ref([]) // 存储选中的邀请码

// 处理选中的邀请码变化
const handleSelectionChange = (selection) => {
  selectedInviteCodes.value = selection
}

const getRoleTypeName = (type) => {
  const roleMap = {
    [adminStore.AdminType.NORMAL_ADMIN]: '普通管理员',
    [adminStore.AdminType.AUDITOR]: '审核员',
    [adminStore.AdminType.CUSTOMER_SERVICE]: '客服',
    [adminStore.AdminType.EMERGENCY_RESPONDER]: '紧急响应人员'
  }
  return roleMap[type] || '未知类型'
}

// 获取角色标签类型
const getRoleTypeTag = (type) => {
  const roleTagMap = {
    [adminStore.AdminType.NORMAL_ADMIN]: 'primary', // 普通管理员用蓝色
    [adminStore.AdminType.AUDITOR]: 'success', // 审核员用绿色
    [adminStore.AdminType.CUSTOMER_SERVICE]: 'info', // 客服用灰色
    [adminStore.AdminType.EMERGENCY_RESPONDER]: 'warning', // 紧急响应人员用橙色
    5: 'danger' // 论坛管理员用红色
  }
  return roleTagMap[type] || 'info'
}

// 获取邀请码状态文本
const getInviteCodeStatusText = (inviteCode) => {
  if (inviteCode.status === 1) {
    return '已禁用'
  }
  if (inviteCode.usedCount >= inviteCode.maxUses) {
    return '已用完'
  }
  if (inviteCode.usedCount === 0) {
    return '未使用'
  }
  return '使用中'
}

// 获取邀请码状态类型（用于标签颜色）
const getInviteCodeStatusType = (inviteCode) => {
  if (inviteCode.status === 1) {
    return 'danger'
  }
  if (inviteCode.usedCount >= inviteCode.maxUses) {
    return 'info'
  }
  if (inviteCode.usedCount === 0) {
    return 'success'
  }
  return 'warning'
}

const disabledDate = (time) => {
  return time.getTime() < Date.now() - 8.64e7
}

const handleGenerateInviteCode = async () => {
  if (!inviteForm.targetType) {
    ElMessage.warning('请选择权限类型')
    return
  }

  generating.value = true
  try {
    // 构建请求数据，只发送后端支持的字段
    const requestData = {
      targetType: inviteForm.targetType,
      maxUses: inviteForm.maxUses,
      expireHours: inviteForm.expireHours
    }
    
    const response = await adminStore.generateInviteCode(requestData)

    // 处理API响应，根据返回格式调整
    // 注意：响应拦截器已经将成功响应的data提取出来，所以直接处理response
    if (response.code) {
      // 单个邀请码情况
      generatedCodes.value = [response.code]
      showGeneratedCodes.value = true
      ElMessage.success('邀请码生成成功')
    } else if (response.codes) {
      // 多个邀请码情况（随机生成时）
      generatedCodes.value = response.codes
      showGeneratedCodes.value = true
      ElMessage.success(`成功生成 ${response.codes.length} 个邀请码`)
    } else {
      // 处理后端直接返回邀请码对象的情况
      generatedCodes.value = [response.code || response]
      showGeneratedCodes.value = true
      ElMessage.success('邀请码生成成功')
    }
    fetchInviteCodeList()
  } catch (error) {
    console.error('生成邀请码错误:', error)
    ElMessage.error('生成邀请码失败')
  } finally {
    generating.value = false
  }
}

const fetchInviteCodeList = async () => {
  try {
    const response = await adminStore.getInviteCodeList({
      page: invitePage.value,
      pageSize: invitePageSize.value
    })
    // API直接返回邀请码数组，没有total字段
    inviteTotal.value = adminStore.inviteCodeList.length
  } catch (error) {
    console.error('获取邀请码列表错误:', error)
    ElMessage.error('获取邀请码列表失败')
  }
}

const handleInviteSizeChange = (size) => {
  invitePageSize.value = size
  fetchInviteCodeList()
}

const handleInvitePageChange = (page) => {
  invitePage.value = page
  fetchInviteCodeList()
}

// 获取成员列表
const fetchMemberList = async () => {
  try {
    console.log('fetchMemberList函数被调用')
    memberLoading.value = true
    
    const params = {
      page: memberPage.value,
      pageSize: memberPageSize.value
    }
    
    // 使用authApi.getMemberList方法获取成员列表
    const response = await authApi.getMemberList(params)
    
    console.log('fetchMemberList API响应:', response)
    
    // 确保response是有效的对象
    if (!response || typeof response !== 'object') {
      console.error('获取成员列表失败：响应无效', response)
      ElMessage.error('获取成员列表失败：响应无效')
      memberList.value = []
      memberTotal.value = 0
      return
    }
    
    memberList.value = response.list || []
    memberTotal.value = response.total || 0
    
    console.log('获取成员列表成功，共', memberTotal.value, '条记录')
  } catch (error) {
    console.error('获取成员列表失败:', error)
    ElMessage.error('获取成员列表失败：' + (error.message || '未知错误'))
    memberList.value = []
    memberTotal.value = 0
  } finally {
    memberLoading.value = false
  }
}

// 成员列表分页大小变化
const handleMemberSizeChange = (size) => {
  memberPageSize.value = size
  memberPage.value = 1 // 重置到第一页
  fetchMemberList()
}

// 成员列表页码变化
const handleMemberPageChange = (page) => {
  memberPage.value = page
  fetchMemberList()
}

// 处理显示管理员详情
const handleShowMemberDetail = async (member) => {
  selectedMember.value = member
  await fetchMemberDetail(member.id)
  showMemberDetail.value = true
}

// 获取管理员详情
const fetchMemberDetail = async (adminId) => {
  try {
    detailLoading.value = true
    const response = await authApi.getMemberDetail(adminId)
    memberDetail.value = response || {}
  } catch (error) {
    console.error('获取管理员详情失败:', error)
    ElMessage.error('获取管理员详情失败')
    memberDetail.value = {}
  } finally {
    detailLoading.value = false
  }
}

// 关闭管理员详情弹窗
const closeMemberDetail = () => {
  showMemberDetail.value = false
  selectedMember.value = null
  memberDetail.value = {}
}

// 处理修改管理员身份
const handleEditMemberRole = (member) => {
  editingMember.value = member
  newRoleType.value = member.type
  // 使用nextTick确保数据更新完成后再显示弹窗，避免闪动
  nextTick(() => {
    showEditRole.value = true
  })
}

// 提交修改管理员身份
const submitEditRole = async () => {
  if (!newRoleType.value) {
    ElMessage.warning('请选择新角色')
    return
  }

  // 权限检查：只有超级管理员可以设置为普通管理员
  if (newRoleType.value === adminStore.AdminType.NORMAL_ADMIN && !isSuperAdmin.value) {
    ElMessage.error('只有超级管理员可以设置成员为普通管理员')
    return
  }

  // 权限检查：只有超级管理员可以设置为论坛管理员
  if (newRoleType.value === 5 && !isSuperAdmin.value) {
    ElMessage.error('只有超级管理员可以设置成员为论坛管理员')
    return
  }

  try {
    editRoleLoading.value = true
    await authApi.updateMemberRole(editingMember.value.id, newRoleType.value)
    ElMessage.success('管理员身份修改成功')
    showEditRole.value = false
    fetchMemberList() // 刷新列表
  } catch (error) {
    console.error('修改管理员身份失败:', error)
    ElMessage.error('修改管理员身份失败')
  } finally {
    editRoleLoading.value = false
  }
}

// 关闭修改身份弹窗
const closeEditRoleDialog = () => {
  showEditRole.value = false
  // 使用nextTick确保弹窗关闭后再清空数据，避免闪动
  nextTick(() => {
    editingMember.value = null
    newRoleType.value = null
  })
}

// 处理点击列表行事件，跳转到管理员详情页
const handleRowClick = (row) => {
  router.push(`/platform-manage/member/${row.id}`)
}

const copyInviteCode = (code) => {
  navigator.clipboard.writeText(code).then(() => {
    ElMessage.success('邀请码已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const copyGeneratedCode = (index) => {
  navigator.clipboard.writeText(generatedCodes.value[index]).then(() => {
    ElMessage.success('邀请码已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

const copyAllCodes = async () => {
  try {
    await navigator.clipboard.writeText(generatedCodes.value.join('\n'))
    ElMessage.success('所有邀请码已复制到剪贴板')
  } catch (err) {
    ElMessage.error('复制失败，请手动复制')
  }
}

// 切换邀请码状态
const handleToggleInviteCodeStatus = async (codeId, newStatus) => {
  try {
    await adminStore.updateInviteCodeStatus(codeId, newStatus)
    ElMessage.success(newStatus === 1 ? '邀请码已禁用' : '邀请码已启用')
    fetchInviteCodeList() // 刷新列表
  } catch (error) {
    console.error('修改邀请码状态失败:', error)
    ElMessage.error('修改邀请码状态失败')
  }
}

// 删除邀请码
const handleDeleteInviteCode = async (codeId, code) => {
  try {
    // 弹出确认对话框
    await ElMessageBox.confirm(
      `确定要删除邀请码 "${code}" 吗？`,
      '删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 调用删除API
    await adminStore.deleteInviteCode(codeId)
    ElMessage.success('邀请码已删除')
    fetchInviteCodeList() // 刷新列表
  } catch (error) {
    // 如果是用户取消，不显示错误信息
    if (error !== 'cancel') {
      console.error('删除邀请码失败:', error)
      ElMessage.error('删除邀请码失败')
    }
  }
}

// 批量删除邀请码
const handleBatchDelete = async () => {
  try {
    // 检查是否有选中的邀请码
    if (selectedInviteCodes.value.length === 0) {
      ElMessage.warning('请先选择要删除的邀请码')
      return
    }
    
    // 弹出确认对话框
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedInviteCodes.value.length} 个邀请码吗？`,
      '批量删除确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 提取选中邀请码的ID
    const ids = selectedInviteCodes.value.map(code => code.id)
    
    // 调用批量删除API
    const response = await adminStore.batchDeleteInviteCode(ids)
    
    // 显示删除结果
    // 检查响应中是否有successCount和failCount
    if (response && response.successCount !== undefined) {
      // API返回了详细的删除结果
      let message = `成功删除 ${response.successCount} 个邀请码`
      if (response.failCount > 0) {
        message += `，失败 ${response.failCount} 个邀请码`
        if (response.failIds && response.failIds.length > 0) {
          message += `，失败ID：${response.failIds.join(', ')}`
        }
      }
      ElMessage.success(message)
    } else {
      // API返回了成功响应，但没有详细的删除结果
      ElMessage.success(`成功删除 ${ids.length} 个邀请码`)
    }
    
    fetchInviteCodeList() // 刷新列表
  } catch (error) {
    // 如果是用户取消，不显示错误信息
    if (error !== 'cancel') {
      console.error('批量删除邀请码失败:', error)
      ElMessage.error('批量删除邀请码失败')
    }
  }
}

let inviteTabInitialized = false


// 检查是否可以管理该成员
const canManageMember = (member) => {
  // 额外安全检查：超级管理员永远不能被管理
  if (member.type === adminStore.AdminType.SUPER_ADMIN) {
    return false
  }
  
  // 超级管理员可以管理所有其他成员
  if (isSuperAdmin.value) {
    return true
  }
  
  // 普通管理员只能管理权限比自己低的成员
  if (isNormalAdmin.value) {
    // 普通管理员只能管理权限比自己低的成员，且不能管理其他管理员
    return member.type > adminStore.AdminType.NORMAL_ADMIN
  }
  
  return false
}

// 成员管理方法
const handleAddMember = () => {
  ElMessage.info('新增成员功能开发中')
}

const handleSetAdmin = () => {
  ElMessage.info('设置为管理员功能开发中')
}

const handleSetRole = () => {
  ElMessage.info('设置成员角色功能开发中')
}

const handleRemoveMember = () => {
  ElMessage.info('剥夺成员身份功能开发中')
}

// 参数配置方法
const handleSaveConfig = () => {
  ElMessage.info('保存配置功能开发中')
}

// 日志查看方法
const fetchLogList = async () => {
  try {
    logLoading.value = true
    
    const params = {
      page: logPage.value,
      size: logPageSize.value,
      module: logFilter.module,
      action: logFilter.action,
      status: logFilter.status,
      adminId: logFilter.adminId,
      userId: logFilter.userId
    }
    
    // 处理日期范围
    if (logFilter.dateRange && logFilter.dateRange.length === 2) {
      params.startTime = logFilter.dateRange[0]
      params.endTime = logFilter.dateRange[1]
    }
    
    // 处理关键字搜索（如果API支持的话，这里假设API支持keyword参数）
    if (logFilter.keyword) {
      // 这里根据API实际情况调整，可能需要将keyword映射到module或action字段
      params.module = params.module || logFilter.keyword
      params.action = params.action || logFilter.keyword
    }
    
    const response = await authApi.getLogList(params)
    console.log('日志列表响应:', response)
    
    // 处理API响应
    if (response && response.list) {
      logList.value = response.list
      logTotal.value = response.total || 0
    } else {
      logList.value = []
      logTotal.value = 0
    }
  } catch (error) {
    console.error('获取日志列表失败:', error)
    ElMessage.error('获取日志列表失败')
    logList.value = []
    logTotal.value = 0
  } finally {
    logLoading.value = false
  }
}

const handleSearchLog = () => {
  logPage.value = 1 // 重置到第一页
  fetchLogList()
}

const handleResetLogFilter = () => {
  logFilter.keyword = ''
  logFilter.dateRange = null
  logFilter.module = ''
  logFilter.action = ''
  logFilter.status = ''
  logFilter.adminId = ''
  logFilter.userId = ''
  logPage.value = 1 // 重置到第一页
  fetchLogList()
}

const handleLogSizeChange = (size) => {
  logPageSize.value = size
  logPage.value = 1 // 重置到第一页
  fetchLogList()
}

const handleLogPageChange = (page) => {
  logPage.value = page
  fetchLogList()
}

// 格式化JSON数据
const formatJson = (jsonStr) => {
  try {
    if (typeof jsonStr === 'string') {
      const parsed = JSON.parse(jsonStr)
      return JSON.stringify(parsed, null, 2)
    } else if (typeof jsonStr === 'object') {
      return JSON.stringify(jsonStr, null, 2)
    }
    return jsonStr
  } catch (error) {
    console.error('格式化JSON失败:', error)
    return jsonStr
  }
}

// 获取单条日志详情
const fetchLogDetail = async (logId) => {
  try {
    logDetailLoading.value = true
    const response = await authApi.getLogDetail(logId)
    console.log('日志详情响应:', response)
    
    // 处理API响应
    if (response) {
      logDetail.value = response
    } else {
      logDetail.value = {}
    }
  } catch (error) {
    console.error('获取日志详情失败:', error)
    ElMessage.error('获取日志详情失败')
    logDetail.value = {}
  } finally {
    logDetailLoading.value = false
  }
}

// 查看日志详情
const handleViewLogDetail = (log) => {
  if (log && log.id) {
    fetchLogDetail(log.id)
    logDetailVisible.value = true
  }
}

// 行点击查看日志详情
const handleLogRowClick = (log) => {
  handleViewLogDetail(log)
}

// 组件挂载时初始化
onMounted(async () => {
  await fetchMemberList() // 自动加载管理员列表
})

// 监听tab切换
watch(activeTab, async (newTab) => {
  if (newTab === 'inviteCode' && !inviteTabInitialized) {
    await fetchInviteCodeList()
    inviteTabInitialized = true
  } else if (newTab === 'member') {
    await fetchMemberList()
  } else if (newTab === 'log') {
    await fetchLogList()
  }
})

// 组件卸载时清理资源
onUnmounted(() => {
  // 组件中没有使用echarts图表，无需清理
})
</script>

<style scoped>
.platform-manage-container {
  padding: 20px;
  min-height: calc(100vh - 120px);
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.platform-manage-card {
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: #fff;
}

.platform-manage-card:hover {
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
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
}

:deep(.el-dialog__header) {
  background-color: #fafafa;
  border-bottom: 1px solid #ebeef5;
  padding: 16px 20px;
}

:deep(.el-dialog__title) {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

:deep(.el-dialog__body) {
  padding: 20px;
}

:deep(.el-dialog__footer) {
  padding: 16px 20px;
  border-top: 1px solid #ebeef5;
  background-color: #fafafa;
}

:deep(.el-descriptions) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-descriptions__header) {
  background-color: #fafafa;
  padding: 12px 16px;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-descriptions__title) {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

:deep(.el-descriptions__body) {
  padding: 16px;
}

:deep(.el-descriptions__row) {
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-descriptions__row:last-child) {
  border-bottom: none;
}

:deep(.el-descriptions__label) {
  font-weight: 500;
  color: #606266;
  padding: 12px 16px;
  background-color: #fafafa;
}

:deep(.el-descriptions__content) {
  padding: 12px 16px;
  color: #303133;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .platform-manage-container {
    padding: 10px;
  }
  
  :deep(.el-tabs__header) {
    padding: 0 10px;
  }
  
  :deep(.el-tabs__item) {
    padding: 0 12px;
    font-size: 13px;
  }
  
  :deep(.el-tabs__content) {
    padding: 10px;
  }
  
  .member-table {
    font-size: 13px;
  }
  
  :deep(.el-table th) {
    padding: 8px 0;
    font-size: 12px;
  }
  
  :deep(.el-table td) {
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

/* 标签页样式优化 */
:deep(.el-tabs) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-tabs__header) {
  margin: 0;
  padding: 0 20px;
  background-color: #fafafa;
  border-bottom: 1px solid #ebeef5;
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
  position: relative;
}

:deep(.el-tabs__item:hover) {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.05);
}

:deep(.el-tabs__item.is-active) {
  color: #409eff;
  background-color: #fff;
  border: 1px solid #ebeef5;
  border-bottom-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  font-weight: 600;
}

:deep(.el-tabs__active-bar) {
  background-color: #409eff;
  height: 3px;
  border-radius: 3px;
  bottom: 0;
  transition: all 0.3s ease;
}

:deep(.el-tabs__content) {
  padding: 20px;
  background-color: #fff;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-buttons {
  display: flex;
  align-items: center;
}

.tab-content {
  padding: 20px 0;
}

.action-bar {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

/* 数据表格样式优化 */
.member-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.member-table:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

:deep(.el-table) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #fafafa;
  font-weight: 600;
  color: #333;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
}

:deep(.el-table tr:hover > td) {
  background-color: rgba(64, 158, 255, 0.05) !important;
  transition: all 0.3s ease;
}

:deep(.el-table__row:nth-child(even)) {
  background-color: #fafafa;
}

:deep(.el-table__row:nth-child(odd)) {
  background-color: #fff;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  width: 100%;
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
  background-color: #409eff;
  border-color: #409eff;
}

.operation-buttons .edit-button {
  background-color: #e6a23c;
  border-color: #e6a23c;
  color: #fff;
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
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
}

:deep(.custom-pagination .el-pagination__jump .el-input__inner:hover) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.custom-pagination .el-pagination__jump .el-input__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

:deep(.custom-pagination .el-pagination__button) {
  border-radius: 6px;
  transition: all 0.3s ease;
  border: 1px solid #dcdfe6;
}

:deep(.custom-pagination .el-pagination__button:hover) {
  border-color: #409eff;
  color: #409eff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

:deep(.custom-pagination .el-pagination__button--active) {
  background-color: #409eff;
  border-color: #409eff;
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
  border: 1px solid #dcdfe6;
  transition: all 0.3s ease;
}

:deep(.custom-pagination .el-pagination__sizes .el-select .el-input__inner:hover) {
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

:deep(.custom-pagination .el-pagination__sizes .el-select .el-input__inner:focus) {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.2);
}

.filter-bar .el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.filter-bar .el-button:not(.el-button--primary) {
  background-color: #fff;
  border-color: #dcdfe6;
  color: #606266;
}

.filter-bar .el-button:not(.el-button--primary):hover {
  border-color: #409eff;
  color: #409eff;
  background-color: #ecf5ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.more-filters {
  margin-top: 16px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 12px;
  border: 1px solid #ebeef5;
  transition: all 0.3s ease;
}

.more-filters:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.operation-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

/* 表格样式优化 */
.member-table {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.member-table:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

:deep(.member-table .el-table__header-wrapper) {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ebeef5;
}

:deep(.member-table .el-table__header-cell) {
  font-weight: 600;
  color: #303133;
  padding: 12px;
  text-align: left;
}

:deep(.member-table .el-table__row) {
  transition: all 0.3s ease;
}

:deep(.member-table .el-table__row:hover) {
  background-color: #f5f7fa !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

:deep(.member-table .el-table__row.el-table__row--striped) {
  background-color: #fafafa;
}

:deep(.member-table .el-table__cell) {
  padding: 12px;
  border-bottom: 1px solid #f0f2f5;
}

/* 文本溢出省略样式 */
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 100%;
}

/* 操作按钮样式优化 */
.detail-button {
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  transition: all 0.3s ease;
}

.detail-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.edit-button {
  border-radius: 6px;
  padding: 4px 12px;
  font-size: 12px;
  transition: all 0.3s ease;
}

.edit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(230, 162, 60, 0.3);
}

.edit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 角色标签样式 */
:deep(.el-tag) {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.3s ease;
}

:deep(.el-tag:hover) {
  transform: scale(1.05);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.invite-card {
  height: 100%;
}

.code-text {
  font-family: monospace;
  font-size: 13px;
  cursor: pointer;
}

.generated-codes-container {
  max-height: 400px;
  overflow-y: auto;
}

/* JSON数据卡片样式 */
.json-card {
  margin-bottom: 16px;
}

.json-card pre {
  margin: 0;
  padding: 12px;
  background-color: #f6f8fa;
  border-radius: 4px;
  overflow-x: auto;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  line-height: 1.5;
}

</style>