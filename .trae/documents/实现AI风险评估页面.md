# 实现AI风险评估页面

## 1. 功能需求

* 在决策模块下新增AI风险评估页面

* 实现API调用，请求参数包括businessType和businessId

* 展示返回的响应结果，包括风险等级、置信度、风险因素和建议操作

## 2. 技术方案

### 2.1 文件结构

* 创建新组件：`src/views/AIRiskAssessment.vue`

* 修改现有文件：

  * `src/router/index.js` - 添加路由配置

  * `src/views/Decision.vue` - 添加菜单选项

  * `src/api/auth.js` - 添加API调用方法

### 2.2 组件设计

#### 2.2.1 表单设计

* 业务类型选择框（businessType）

* 业务ID输入框（businessId）

* 提交按钮

#### 2.2.2 结果展示

* 风险评估结果卡片

  * 风险等级

  * 置信度

  * 优先级

* 风险因素列表

* 建议操作列表

### 2.3 API集成

* 在authApi中添加新方法：`riskAssessment(params)`

* 请求URL：`/ai/decision/risk/assess`

* 请求方式：POST

* 请求参数：businessType, businessId

### 2.4 样式设计

* 采用Element Plus组件库

* 保持与现有决策模块页面一致的样式

* 使用卡片布局展示结果

* 使用表格展示风险因素和建议操作

## 3. 实现步骤

### 3.1 第一步：添加API调用方法

在`src/api/auth.js`中添加新的API调用方法：

```javascript
// AI风险评估
riskAssessment(params) {
  return request.post('/ai/decision/risk/assess', params, {
    timeout: 180000 // 3分钟超时
  })
}
```

### 3.2 第二步：添加路由配置

在`src/router/index.js`的decision路由下添加子路由：

```javascript
{
  path: 'risk-assessment',
  name: 'AIRiskAssessment',
  component: () => import('@/views/AIRiskAssessment.vue'),
  meta: {
    title: 'AI风险评估'
  }
}
```

### 3.3 第三步：添加菜单选项

在`src/views/Decision.vue`的导航菜单中添加新选项：

```vue
<el-menu-item index="/decision/risk-assessment">
  AI风险评估
</el-menu-item>
```

### 3.4 第四步：创建AI风险评估组件

创建`src/views/AIRiskAssessment.vue`组件，包含以下功能：

* 表单提交功能

* API调用逻辑

* 结果展示界面

* 数据处理逻辑

## 4. 预期效果

* 用户可以在决策模块下看到"AI风险评估"菜单选项

* 点击进入后，可以输入业务类型和业务ID进行风险评估

* 提交后，展示风险评估结果，包括风险等级、置信度、风险因素和建议操作

* 页面样式与现有决策模块页面保持一致

## 5. 技术要点

* 使用Vue 3 Composition API

* 集成Element Plus组件库

* 处理异步API调用

* 展示结构化数据

* 保持代码风格一致性

