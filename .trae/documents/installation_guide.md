# 充电桩管理平台前端安装说明

## 环境要求

- **Node.js**: 14.18.0 或更高版本
- **npm**: 6.14.0 或更高版本
- **浏览器**: 支持现代浏览器（Chrome、Firefox、Edge等）

## 安装步骤

### 1. 解压项目

**如果项目以压缩包形式提供**：
1. 解压压缩包到本地目录
2. 进入解压后的目录

```bash
cd project_front
```

**如果通过git克隆**：

```bash
git clone <项目仓库地址>
cd project_front
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动项目

API地址已默认配置，无需修改。

### 4. 运行项目

#### 开发模式

```bash
npm run dev
```

项目将在 `http://localhost:5173` 启动

#### 构建生产版本

```bash
npm run build
```

构建后的文件将生成在 `dist` 目录中

#### 预览生产构建

```bash
npm run preview
```

## 项目结构

```
src/
├── api/           # API请求模块
├── components/    # 组件
├── router/        # 路由配置
├── store/         # 状态管理
├── utils/         # 工具函数
├── views/         # 页面组件
├── App.vue        # 根组件
└── main.js        # 入口文件
```

## 依赖说明

- **Vue 3**: 前端框架
- **Element Plus**: UI组件库
- **Pinia**: 状态管理
- **Vue Router**: 路由管理
- **Axios**: HTTP请求
- **ECharts**: 数据可视化
- **XLSX**: Excel文件处理

## 常见问题

### 1. 依赖安装失败

**解决方案**：
- 确保Node.js版本符合要求
- 尝试使用 `npm cache clean --force` 清理缓存后重新安装
- 考虑使用 yarn 替代 npm

### 2. API请求失败

**解决方案**：
- 检查API地址配置是否正确
- 确保后端服务正在运行
- 检查网络连接和跨域设置

### 3. 页面显示异常

**解决方案**：
- 检查浏览器控制台是否有错误信息
- 确保所有依赖已正确安装
- 清除浏览器缓存后重新加载

## 构建部署

1. 执行 `npm run build` 生成生产版本
2. 将 `dist` 目录中的文件部署到Web服务器
3. 配置服务器以支持SPA应用路由（使用history模式）

## 技术支持

如有其他问题，请联系开发团队。