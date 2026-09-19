# 八方互充 · 充电服务平台管理后台（前端）

> 面向新能源车主的智慧充电服务平台（找桩 / 充电 / 论坛 / 客服 / 紧急求助）的 **Web 管理端**，覆盖平台运营的完整管理链路。

[![Vue](https://img.shields.io/badge/Vue-3.5-42b883?logo=vue.js)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646cff?logo=vite)](https://vitejs.dev/)
[![Element Plus](https://img.shields.io/badge/Element_Plus-2.11-409eff)](https://element-plus.org/)

---

## ✨ 功能特性

一套覆盖「认证权限、审核、AI 决策、客服、紧急求助、论坛、通知、统计、数据大屏」的全场景管理后台：

- **认证与权限**：JWT 登录 / 注册，**6 角色 3 层权限体系**（路由守卫 + 组件级控制 + 动态菜单），会话持久化、401 自动登出
- **综合审核**：私桩认证、车主认证、充电投诉、充电故障、评论/帖子举报、交易申诉共 **7 类审核流程**，支持筛选 / 分页 / 批量审核 / 日志追溯
- **AI 决策模块**：AI 决策请求、审核建议、异常检测、运营优化建议、风险评估共 **5 个子功能**，长耗时接口差异化超时（90s~180s）
- **统计与数据大屏**：**20+ 分角色统计报表** + 全屏数据大屏，ECharts 折线 / 柱状 / 饼图 / 雷达 / 热力图可视化，自动 / 手动刷新
- **实时客服**：基于 **WebSocket** 的客服工作台，30s 心跳保活、会话接入 / 转接 / 关闭 / 已读回执、历史消息分页
- **紧急响应**：待处理呼叫列表、按类型 / 距离筛选、经纬度定位响应呼叫
- **运营管理**：成员与角色管理、邀请码生成、私人电桩管理、论坛管理、通知广播、数据导出（XLSX）

## 🛠 技术栈

| 类别 | 选型 | 说明 |
|---|---|---|
| 框架 | Vue 3（`<script setup>` 组合式 API） | 响应式开发 |
| 构建 | Vite 7 | 代理、按需导入、vendor 拆包 |
| UI | Element Plus 2 | 组件 + API 按需自动引入 |
| 状态管理 | Pinia 2 | `authStore` / `inviteCodeStore` |
| 路由 | Vue Router 4（history） | 全量懒加载 + 全局权限守卫 |
| HTTP | Axios | 拦截器统一鉴权 / 解包 / 错误处理 |
| 可视化 | ECharts 6（`echarts/core` 按需装配） | 折线 / 柱状 / 饼图 / 雷达 / 热力图 |
| 实时通信 | 原生 WebSocket（自封装类） | 30s 心跳 + 消息分发 |
| 导出 | SheetJS（XLSX） | Excel 文件下载 |

## 📁 目录结构

```
src/
├── api/          # axios 实例 + 按业务域拆分的 API 模块（auth / audit 等）
├── components/   # 通用组件 / 布局 / 权限组件
├── composables/  # 可复用 hook（usePagination 统一分页逻辑）
├── router/       # 路由表 + 全局前置守卫
├── store/        # Pinia：authStore / inviteCodeStore
├── styles/       # CSS 设计变量（颜色 / 圆角 / 间距 / 阴影统一）
├── utils/        # WS 类、echarts 装配、状态映射、日期、角色配色
├── views/        # 50+ 页面（含 system/ 子目录）
└── main.js       # 入口（全局注册 icons、pinia、router）
```

## 🚀 快速开始

### 环境要求

- **Node.js 20.19+**（或 22.12+，Vite 7 要求）
- 后端服务：Java Spring Boot（见 [admin 后端](../admin)），提供 `/api/v1/admin` 接口

### 安装依赖

```bash
npm install
```

### 开发

```bash
npm run dev
```

开发服务器默认运行在 **http://localhost:6101**，并将 `/api/*` 代理到后端（见下方「环境变量」）。

### 构建与预览

```bash
npm run build     # 产物输出到 dist/
npm run preview   # 预览构建产物
```

## ⚙️ 环境变量

开发 / 生产环境分别读取 `.env.development` / `.env.production`，改后端地址只需改环境变量文件、无需改代码：

| 变量 | 默认值 | 说明 |
|---|---|---|
| `VITE_API_TARGET` | `http://localhost:8080` | 后端接口地址（REST） |
| `VITE_WS_BASE_URL` | `ws://localhost:8080` | 客服 WebSocket 地址 |

> 前端通过 Vite 代理把 `/api` 转发到 `VITE_API_TARGET`；客服 WebSocket 直连 `VITE_WS_BASE_URL`，不经过代理。

## 🔗 后端对接

- REST 接口统一走 `baseURL: /api/v1/admin`（axios 实例见 `src/api/index.js`）
- 请求自动注入 `Authorization: <tokenType> <token>`，响应统一解包 `{ code, data, message }`
- 登录 / 权限 / 认证接口见 `admin/` 后端项目（Spring Boot 3 + MyBatis + MySQL + JWT）

## 🔐 权限模型

管理员类型（`AdminType` 枚举）：

| code | 角色 | code | 角色 |
|---|---|---|---|
| 0 | 超级管理员 | 3 | 客服 |
| 1 | 普通管理员 | 4 | 紧急响应人员 |
| 2 | 审核员 | 5 | 论坛管理员 |

- **路由守卫**：`beforeEach` 校验 `meta.requiresAuth` + `meta.permission`，失败拦截并提示
- **组件级**：`PermissionGuard` / `RoleBasedCard` 按角色控制 UI 可见性
- **菜单级**：侧边栏按角色动态渲染；超级管理员恒放行

## 📄 License

内部课程项目（软件工程实践），未指定开源许可。
