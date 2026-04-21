# 私人电桩管理页面风格对齐优化 - 实现计划

## [ ] 任务1: 统一整体风格
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 调整页面布局，使用与成员管理页面一致的圆角卡片、柔和阴影
  - 统一配色方案，与成员管理页面保持一致
  - 调整整体间距和对齐方式
- **Acceptance Criteria Addressed**: AC-1
- **Test Requirements**:
  - `human-judgment` TR-1.1: 整体风格与成员管理页面一致
  - `human-judgment` TR-1.2: 圆角卡片、柔和阴影效果明显
- **Notes**: 参考成员管理页面的样式实现

## [ ] 任务2: 优化表格样式
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 为状态列添加彩色标签，不同状态显示不同颜色
  - 为长文本添加悬浮提示，保证信息完整可见
  - 调整表格列宽，避免文字被挤压截断
- **Acceptance Criteria Addressed**: AC-2, AC-5
- **Test Requirements**:
  - `human-judgment` TR-2.1: 状态列显示彩色标签，颜色区分合理
  - `human-judgment` TR-2.2: 长文本有悬浮提示，信息完整可见
  - `human-judgment` TR-2.3: 列宽合理，文字不被截断
- **Notes**: 使用Element Plus的el-tag组件实现彩色标签

## [ ] 任务3: 优化操作按钮布局
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 调整操作按钮的布局，确保单行显示
  - 调整按钮大小和间距，避免换行和拥挤
  - 统一按钮样式，与成员管理页面保持一致
- **Acceptance Criteria Addressed**: AC-3
- **Test Requirements**:
  - `human-judgment` TR-3.1: 操作按钮保持一行显示，不换行
  - `human-judgment` TR-3.2: 操作按钮排列紧凑，不拥挤
  - `human-judgment` TR-3.3: 按钮样式与成员管理页面一致
- **Notes**: 使用flex布局确保按钮一行显示

## [ ] 任务4: 优化表格交互效果
- **Priority**: P1
- **Depends On**: None
- **Description**:
  - 为表格添加行hover效果
  - 为表格添加斑马纹
  - 提升表格的可读性和交互体验
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-4.1: 表格行有明显的hover效果
  - `human-judgment` TR-4.2: 表格有斑马纹，提升可读性
- **Notes**: 使用CSS实现hover效果和斑马纹

## [ ] 任务5: 优化筛选区样式
- **Priority**: P1
- **Depends On**: None
- **Description**:
  - 调整筛选框和按钮的样式
  - 统一筛选区的间距和布局
  - 确保文字完整显示不截断
- **Acceptance Criteria Addressed**: AC-6
- **Test Requirements**:
  - `human-judgment` TR-5.1: 筛选区样式与整体风格统一
  - `human-judgment` TR-5.2: 筛选框和按钮的间距合理
  - `human-judgment` TR-5.3: 文字完整显示不截断
- **Notes**: 参考成员管理页面的筛选区样式

## [ ] 任务6: 优化分页控件
- **Priority**: P1
- **Depends On**: None
- **Description**:
  - 优化分页控件的样式，与成员管理页面保持一致
  - 缩小「Go to」输入框的宽度
  - 调整分页控件的间距和布局
- **Acceptance Criteria Addressed**: AC-7
- **Test Requirements**:
  - `human-judgment` TR-6.1: 分页控件样式与成员管理页面一致
  - `human-judgment` TR-6.2: 「Go to」输入框宽度适中
- **Notes**: 使用:deep选择器调整分页控件的样式

## [ ] 任务7: 优化弹窗显示
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 调整弹窗的位置，确保在屏幕水平 + 垂直居中显示
  - 调整弹窗的宽度，保证表格内容完整显示
  - 确保弹窗内的表格文字不被截断
- **Acceptance Criteria Addressed**: AC-8
- **Test Requirements**:
  - `human-judgment` TR-7.1: 弹窗在屏幕水平 + 垂直居中显示
  - `human-judgment` TR-7.2: 弹窗宽度足够，保证表格内容完整显示
  - `human-judgment` TR-7.3: 弹窗内的表格文字不被截断
- **Notes**: 调整弹窗的width属性和样式

## [ ] 任务8: 测试和验证
- **Priority**: P1
- **Depends On**: 任务1-7
- **Description**:
  - 测试所有优化后的功能和样式
  - 验证与成员管理页面的风格一致性
  - 验证弹窗显示是否正常
  - 检查是否有样式冲突或布局问题
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7, AC-8
- **Test Requirements**:
  - `human-judgment` TR-8.1: 整体风格与成员管理页面一致
  - `human-judgment` TR-8.2: 表格样式、操作按钮、筛选区、分页控件优化效果良好
  - `human-judgment` TR-8.3: 弹窗显示正常，内容完整
  - `human-judgment` TR-8.4: 无样式冲突或布局问题
- **Notes**: 测试时注意检查响应式设计和交互体验