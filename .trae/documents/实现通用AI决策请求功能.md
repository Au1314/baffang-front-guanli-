# 实现通用AI决策请求功能方案

## 1. 方案概述
在现有决策页面下添加一个新的子页面，用于实现通用AI决策请求功能。该页面将提供表单用于输入请求参数，调用指定API接口，并将返回的响应数据完整转化后显示出来。

## 2. 实现步骤

### 2.1 添加API请求方法
在 `src/api/auth.js` 文件中添加通用AI决策请求的API方法：
```javascript
// 通用AI决策请求
requestAIDecision(data) {
  return request.post('/api/v1/admin/ai/decision/request', data, {
    timeout: 180000 // 3分钟超时，适应AI分析可能的长时间处理
  })
}
```

### 2.2 修改Decision.vue，添加子路由支持
1. 在Decision.vue中添加导航菜单，支持切换到新的AI决策请求页面
2. 添加路由视图，用于显示子页面内容
3. 修改现有代码，使其支持子路由结构

### 2.3 创建新的AI决策请求页面
创建 `src/views/AIDecisionRequest.vue` 文件，包含以下功能：

#### 2.3.1 表单设计
- 决策类型：下拉选择框（0-4，对应不同决策类型）
- 业务类型：输入框（必填）
- 业务ID：输入框（审核建议时必填）
- 说明：文本域
- 自动执行：开关按钮

#### 2.3.2 功能实现
- 表单验证逻辑
- API请求发送功能
- 响应数据解析和处理
- 结果展示功能

#### 2.3.3 结果展示设计
- 基本信息展示：决策ID、决策编号、置信度等
- AI分析结果：包含异常检测和建议操作
- 建议操作列表：清晰展示每个建议操作的详细信息

### 2.4 配置路由
在 `src/router/index.js` 中添加新页面的路由配置：
```javascript
{
  path: '/decision',
  name: 'Decision',
  component: () => import('@/views/Decision.vue'),
  meta: {
    requiresAuth: true,
    title: '决策模块',
    hideLayout: false
  },
  children: [
    {
      path: 'request',
      name: 'AIDecisionRequest',
      component: () => import('@/views/AIDecisionRequest.vue'),
      meta: {
        title: 'AI决策请求'
      }
    }
  ]
}
```

## 3. 技术要点

### 3.1 表单验证
- 使用Element Plus的表单验证功能
- 实现条件必填项验证（如businessId在decisionType为0时必填）

### 3.2 响应数据处理
- 解析API返回的JSON数据
- 处理analysis字段中的JSON字符串
- 将数据转化为适合展示的格式

### 3.3 结果展示
- 使用Element Plus的组件展示结果，如Card、Descriptions、Table等
- 对不同类型的数据使用不同的展示方式，提高可读性
- 对异常和建议操作进行分类展示

### 3.4 用户体验优化
- 添加加载状态提示
- 添加请求超时处理
- 添加错误提示
- 对长文本进行格式化展示

## 4. 预期效果

用户可以通过决策页面的导航菜单进入AI决策请求页面，填写相关参数后发送请求，系统将调用AI决策API并将结果展示在页面上。展示内容包括决策基本信息、AI分析结果（异常检测）和建议操作列表，所有数据均经过格式化处理，清晰易读。