# 统计模块页面 UI 优化 - 实现计划

## [x] 任务1: 优化一级标签导航样式
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 统一一级标签的样式
  - 区分选中态和未选中态（选中态用主色背景 + 下划线，未选中态用浅灰文字）
  - 优化标签的间距、圆角、hover 效果
- **Acceptance Criteria Addressed**: AC-1, AC-4
- **Test Requirements**:
  - `human-judgment` TR-1.1: 一级标签样式统一，选中态和未选中态区分明显
  - `human-judgment` TR-1.2: 标签的间距、圆角、hover 效果优化，操作直观
- **Notes**: 使用 Element Plus 的 el-tabs 组件，通过 CSS 调整样式

## [x] 任务2: 优化二级标签导航样式
- **Priority**: P0
- **Depends On**: 任务1
- **Description**:
  - 统一二级标签的样式
  - 区分选中态和未选中态
  - 优化标签的间距、圆角、hover 效果
  - 不同状态的二级标签可以用不同颜色区分，保持整体和谐
- **Acceptance Criteria Addressed**: AC-1, AC-3, AC-4
- **Test Requirements**:
  - `human-judgment` TR-2.1: 二级标签样式统一，选中态和未选中态区分明显
  - `human-judgment` TR-2.2: 不同状态的二级标签用不同颜色区分，整体和谐
  - `human-judgment` TR-2.3: 标签的间距、圆角、hover 效果优化，操作直观
- **Notes**: 使用 Element Plus 的 el-tabs 或 el-button-group 组件，通过 CSS 调整样式

## [x] 任务3: 优化数据卡片样式和排版
- **Priority**: P0
- **Depends On**: 任务1-2
- **Description**:
  - 统一数据卡片的样式，增加轻微阴影和圆角
  - 优化图标和文字排版，让数据更醒目，区分标题和数值（数值放大加粗）
  - 为卡片增加 hover 效果，提升交互反馈
  - 统一不同模块下卡片的间距、尺寸，保持视觉一致性
- **Acceptance Criteria Addressed**: AC-2, AC-4
- **Test Requirements**:
  - `human-judgment` TR-3.1: 数据卡片样式统一，有轻微阴影和圆角
  - `human-judgment` TR-3.2: 图标和文字排版合理，数据醒目，标题和数值区分明显
  - `human-judgment` TR-3.3: 卡片有 hover 效果，交互反馈良好
  - `human-judgment` TR-3.4: 不同模块下卡片的间距、尺寸统一，视觉一致
- **Notes**: 使用 Element Plus 的 el-card 组件，通过 CSS 调整样式

## [x] 任务4: 统一配色和字体
- **Priority**: P1
- **Depends On**: 任务1-3
- **Description**:
  - 统一配色方案，与其他后台模块保持一致
  - 统一字体和字号，确保信息层级清晰
  - 统一间距和边距，提升界面整体感
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-4.1: 配色方案与其他后台模块保持一致
  - `human-judgment` TR-4.2: 字体和字号统一，信息层级清晰
  - `human-judgment` TR-4.3: 间距和边距统一，界面整体感强
- **Notes**: 参考其他后台模块的样式，通过 CSS 变量统一管理

## [x] 任务5: 优化响应式布局
- **Priority**: P1
- **Depends On**: 任务1-4
- **Description**:
  - 优化数据卡片的响应式布局，避免在不同屏幕下变形
  - 确保标签导航在小屏幕下的显示效果
  - 适配不同屏幕尺寸，保持界面美观
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgment` TR-5.1: 数据卡片在不同屏幕尺寸下布局合理，不变形
  - `human-judgment` TR-5.2: 标签导航在小屏幕下显示正常
  - `human-judgment` TR-5.3: 界面在不同屏幕尺寸下保持美观
- **Notes**: 使用 CSS media queries 实现响应式布局

## [x] 任务6: 补充加载和空状态样式
- **Priority**: P2
- **Depends On**: 任务1-5
- **Description**:
  - 为数据卡片添加加载状态的样式
  - 为数据为空时添加空状态的样式
  - 确保加载和空状态的样式美观，与整体风格一致
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgment` TR-6.1: 数据加载中显示适当的加载状态，样式美观
  - `human-judgment` TR-6.2: 数据为空时显示适当的空状态提示，样式美观
  - `human-judgment` TR-6.3: 加载和空状态的样式与整体风格一致
- **Notes**: 使用 Element Plus 的 el-skeleton 和 el-empty 组件

## [x] 任务7: 测试和验证
- **Priority**: P1
- **Depends On**: 任务1-6
- **Description**:
  - 测试统计模块页面的显示效果
  - 验证标签导航的样式和交互
  - 验证数据卡片的样式和排版
  - 验证信息层级的清晰度
  - 验证与其他后台模块的风格一致性
  - 验证在不同屏幕尺寸下的显示效果
  - 验证加载和空状态的样式
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6
- **Test Requirements**:
  - `human-judgment` TR-7.1: 标签导航样式统一，选中态和未选中态区分明显
  - `human-judgment` TR-7.2: 数据卡片样式统一，排版合理，交互良好
  - `human-judgment` TR-7.3: 信息层级清晰，界面不杂乱
  - `human-judgment` TR-7.4: 风格与其他后台模块保持一致
  - `human-judgment` TR-7.5: 在不同屏幕尺寸下显示正常
  - `human-judgment` TR-7.6: 加载和空状态样式美观
- **Notes**: 测试时注意检查不同屏幕尺寸下的显示效果