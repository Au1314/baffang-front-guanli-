import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import { ElMessage } from 'element-plus'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { 
      requiresAuth: false,
      hideLayout: true
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: {
      requiresAuth: false,
      hideLayout: true
    }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: {
      requiresAuth: true,
      title: '控制台',
      hideLayout: false
    }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/Statistics.vue'),
    meta: {
      requiresAuth: true,
      title: '统计模块',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    }
  },
  {
    path: '/decision',
    name: 'Decision',
    component: () => import('@/views/Decision.vue'),
    meta: {
      requiresAuth: true,
      title: '决策模块',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    },
    children: [
      {
        path: 'list',
        name: 'DecisionList',
        component: () => import('@/views/DecisionList.vue'),
        meta: {
          title: '决策列表'
        }
      },
      {
        path: 'request',
        name: 'AIDecisionRequest',
        component: () => import('@/views/AIDecisionRequest.vue'),
        meta: {
          title: 'AI决策请求'
        }
      },
      {
        path: 'audit-suggest',
        name: 'AIAuditSuggest',
        component: () => import('@/views/AIAuditSuggest.vue'),
        meta: {
          title: 'AI审核建议'
        }
      },
      {
        path: 'anomaly-detection',
        name: 'AIAnomalyDetection',
        component: () => import('@/views/AIAnomalyDetection.vue'),
        meta: {
          title: 'AI异常检测'
        }
      },
      {
          path: 'operation-optimization',
          name: 'AIROperationOptimization',
          component: () => import('@/views/AIROperationOptimization.vue'),
          meta: {
            title: 'AI运营优化建议'
          }
        },
        {
          path: 'risk-assessment',
          name: 'AIRiskAssessment',
          component: () => import('@/views/AIRiskAssessment.vue'),
          meta: {
            title: 'AI风险评估'
          }
        }
      ]
  },
  {
    path: '/statistics/quick-analysis',
    name: 'QuickAnalysis',
    component: () => import('@/views/QuickAnalysis.vue'),
    meta: {
      requiresAuth: true,
      title: '快速分析',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    }
  },
  {
    path: '/statistics/comprehensive',
    name: 'StatisticsComprehensive',
    component: () => import('@/views/StatisticsComprehensive.vue'),
    meta: {
      requiresAuth: true,
      title: '综合数据分析',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    }
  },
  {
    path: '/statistics/module-analysis',
    name: 'StatisticsModuleAnalysis',
    component: () => import('@/views/StatisticsModuleAnalysis.vue'),
    meta: {
      requiresAuth: true,
      title: '模块数据分析',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    }
  },
  {
    path: '/statistics/custom-analysis',
    name: 'StatisticsCustomAnalysis',
    component: () => import('@/views/StatisticsCustomAnalysis.vue'),
    meta: {
      requiresAuth: true,
      title: '自定义问题分析',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    }
  },
  {
    path: '/statistics/customer-service',
    name: 'StatisticsCustomerService',
    component: () => import('@/views/StatisticsCustomerService.vue'),
    meta: {
      requiresAuth: true,
      title: '个人客服统计',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员', '客服']
    }
  },
  {
    path: '/statistics/all-customer-service',
    name: 'StatisticsAllCustomerService',
    component: () => import('@/views/StatisticsAllCustomerService.vue'),
    meta: {
      requiresAuth: true,
      title: '所有客服统计',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    }
  },
  {
    path: '/statistics/customer-service-overview',
    name: 'StatisticsCustomerServiceOverview',
    component: () => import('@/views/StatisticsCustomerServiceOverview.vue'),
    meta: {
      requiresAuth: true,
      title: '客服统计概览',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员', '客服']
    }
  },
  {
    path: '/statistics/emergency',
    name: 'StatisticsEmergency',
    component: () => import('@/views/StatisticsEmergency.vue'),
    meta: {
      requiresAuth: true,
      title: '紧急响应统计',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员', '紧急响应人员']
    }
  },
  {
    path: '/statistics/forum',
    name: 'StatisticsForum',
    component: () => import('@/views/StatisticsForum.vue'),
    meta: {
      requiresAuth: true,
      title: '论坛统计',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员', '论坛管理员']
    }
  },
  {
    path: '/statistics/audit',
    name: 'StatisticsAudit',
    component: () => import('@/views/StatisticsAudit.vue'),
    meta: {
      requiresAuth: true,
      title: '审核统计',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员', '审核员']
    }
  },
  {
    path: '/statistics/complaint',
    name: 'StatisticsComplaint',
    component: () => import('@/views/StatisticsComplaint.vue'),
    meta: {
      requiresAuth: true,
      title: '故障/投诉统计',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员', '审核员', '客服']
    }
  },
  {
    path: '/statistics/vehicle-audit',
    name: 'StatisticsVehicleAudit',
    component: () => import('@/views/StatisticsVehicleAudit.vue'),
    meta: {
      requiresAuth: true,
      title: '车主审核认证统计',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员', '审核员']
    }
  },
  {
    path: '/statistics/private-station-distribution',
    name: 'StatisticsPrivateStation',
    component: () => import('@/views/StatisticsPrivateStation.vue'),
    meta: {
      requiresAuth: true,
      title: '私桩分布数据统计',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    }
  },
  {
    path: '/statistics/platform',
    name: 'StatisticsPlatform',
    component: () => import('@/views/StatisticsPlatform.vue'),
    meta: {
      requiresAuth: true,
      title: '用户日活/总数统计',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: {
      requiresAuth: true,
      title: '个人中心',
      hideLayout: false
    }
  },
  {
    path: '/platform-manage',
    name: 'PlatformManage',
    component: () => import('@/views/PlatformManage.vue'),
    meta: {
      requiresAuth: true,
      title: '平台管理',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    }
  },
  {
    path: '/platform-manage/member/:id',
    name: 'MemberDetail',
    component: () => import('@/views/MemberDetail.vue'),
    meta: {
      requiresAuth: true,
      title: '管理员详情',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    }
  },
  {
    path: '/private-station-manage',
    name: 'PrivateStationManage',
    component: () => import('@/views/PrivateStationManage.vue'),
    meta: {
      requiresAuth: true,
      title: '私人电桩管理',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    }
  },
  {
    path: '/audit',
    name: 'Audit',
    component: () => import('@/views/Audit.vue'),
    meta: {
      requiresAuth: true,
      title: '审核管理',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员', '审核员', '客服', '紧急响应人员']
    },
    children: [
      {
        path: 'private-station',
        name: 'PrivateStationAudit',
        component: () => import('@/views/PrivateStationAudit.vue'),
        meta: {
          title: '私人电桩认证审核'
        }
      },
      {
        path: 'car-owner',
        name: 'CarOwnerAudit',
        component: () => import('@/views/CarOwnerAudit.vue'),
        meta: {
          title: '车主认证审核'
        }
      },
      {
        path: 'charging-complaint',
        name: 'ChargingComplaintAudit',
        component: () => import('@/views/ChargingComplaintAudit.vue'),
        meta: {
          title: '充电桩投诉审核'
        }
      },
      {
        path: 'charging-fault',
        name: 'ChargingFaultAudit',
        component: () => import('@/views/ChargingFaultAudit.vue'),
        meta: {
          title: '充电桩故障审核'
        }
      },
      {
        path: 'comment-report',
        name: 'CommentReportAudit',
        component: () => import('@/views/CommentReportAudit.vue'),
        meta: {
          title: '评论举报审核'
        }
      },
      {
          path: 'transaction-appeal',
          name: 'TransactionAppealAudit',
          component: () => import('@/views/TransactionAppealAudit.vue'),
          meta: {
            title: '交易申诉审核'
          }
        },
        {
        path: 'record-list',
        name: 'AuditRecordList',
        component: () => import('@/views/AuditRecordList.vue'),
        meta: {
          title: '全部审核记录'
        }
      }
    ]
  },
  {
    path: '/data-screen',
    name: 'DataScreen',
    component: () => import('@/views/DataScreen.vue'),
    meta: {
      requiresAuth: true,
      title: '数据大屏',
      hideLayout: true
    }
  },
  {
    path: '/data-export',
    name: 'DataExport',
    component: () => import('@/views/DataExport.vue'),
    meta: {
      requiresAuth: true,
      title: '数据导出',
      hideLayout: false,
      permission: ['超级管理员']
    }
  },
  {
    path: '/forum-manage',
    name: 'ForumManage',
    component: () => import('@/views/ForumManage.vue'),
    meta: {
      requiresAuth: true,
      title: '论坛管理',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员', '论坛管理员']
    }
  },
  {
    path: '/customer-service',
    name: 'CustomerService',
    component: () => import('@/views/CustomerService.vue'),
    meta: {
      requiresAuth: true,
      title: '客服管理',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员', '客服']
    }
  },
  {
    path: '/emergency',
    name: 'Emergency',
    component: () => import('@/views/Emergency.vue'),
    meta: {
      requiresAuth: true,
      title: '紧急响应',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员', '紧急响应人员']
    }
  },
  {
    path: '/system/user',
    name: 'UserManage',
    component: () => import('@/views/system/UserManage.vue'),
    meta: {
      requiresAuth: true,
      title: '用户管理',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    }
  },
  {
    path: '/system/user/:id',
    name: 'UserDetail',
    component: () => import('@/views/system/UserDetail.vue'),
    meta: {
      requiresAuth: true,
      title: '用户详情',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    }
  },
  {
    path: '/system/role',
    name: 'RoleManage',
    component: () => import('@/views/system/RoleManage.vue'),
    meta: {
      requiresAuth: true,
      title: '角色管理',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    }
  },
  {
    path: '/system/log',
    name: 'LogManage',
    component: () => import('@/views/system/LogManage.vue'),
    meta: {
      requiresAuth: true,
      title: '操作日志',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    }
  },
  {
    path: '/notice',
    name: 'Notice',
    component: () => import('@/views/Notice.vue'),
    meta: {
      requiresAuth: true,
      title: '通知管理',
      hideLayout: false,
      permission: ['超级管理员', '普通管理员']
    },
    children: [
      {
        path: 'list',
        name: 'NoticeList',
        component: () => import('@/views/NoticeList.vue'),
        meta: {
          title: '通知列表'
        }
      },
      {
        path: 'broadcast',
        name: 'NoticeBroadcast',
        component: () => import('@/views/NoticeBroadcast.vue'),
        meta: {
          title: '发送系统公告'
        }
      },
      {
        path: 'send',
        name: 'NoticeSend',
        component: () => import('@/views/NoticeSend.vue'),
        meta: {
          title: '发送通知给指定用户'
        }
      },
      {
        path: 'batch-send',
        name: 'NoticeBatchSend',
        component: () => import('@/views/NoticeBatchSend.vue'),
        meta: {
          title: '批量发送通知'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // 设置页面标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - 后台管理系统`
  }
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    if (authStore.isLoggedIn) {
      // 检查权限
      if (to.meta.permission) {
        if (authStore.hasPermission(to.meta.permission)) {
          next()
        } else {
          ElMessage.error('没有访问权限')
          next('/')  // 跳转到首页
        }
      } else {
        next()
      }
    } else {
      next('/login')
    }
  } else {
    // 如果已经登录，访问登录页则跳转到首页
    if (to.path === '/login' && authStore.isLoggedIn) {
      next('/')
    } else {
      next()
    }
  }
})

export default router