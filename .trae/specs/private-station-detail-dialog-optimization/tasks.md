# 私桩详情弹窗优化 - 实现计划

## [x] 任务1: 为弹窗添加 append-to-body 属性
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 为私桩详情弹窗添加 append-to-body 属性，确保弹窗挂载到页面最上层
  - 脱离列表容器，避免被父容器的样式限制位置
- **Acceptance Criteria Addressed**: AC-1, AC-6
- **Test Requirements**:
  - `programmatic` TR-1.1: 弹窗通过 append-to-body 属性挂载到页面最上层
  - `human-judgment` TR-1.2: 弹窗不被列表页的任何内容遮挡或截断
- **Notes**: 使用 Element Plus 的 append-to-body 属性

## [x] 任务2: 调整弹窗位置和大小
- **Priority**: P0
- **Depends On**: 任务1
- **Description**:
  - 调整弹窗的宽度，确保适配内容
  - 设置弹窗的位置，确保在可视区域内水平居中
  - 确保弹窗位置合理，不贴顶、不贴边
- **Acceptance Criteria Addressed**: AC-2, AC-3
- **Test Requirements**:
  - `human-judgment` TR-2.1: 弹窗在可视区域内水平居中
  - `human-judgment` TR-2.2: 弹窗位置合理，不贴顶、不贴边
  - `human-judgment` TR-2.3: 弹窗宽度适配内容，保证表格信息完整显示
- **Notes**: 使用 Element Plus 的 width 属性和样式调整

## [x] 任务3: 添加弹窗内滚动条
- **Priority**: P1
- **Depends On**: 任务2
- **Description**:
  - 为弹窗添加最大高度限制
  - 当内容超出弹窗高度时，显示滚动条
  - 确保所有内容可见
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-3.1: 当内容超出弹窗高度时，弹窗内出现滚动条
  - `human-judgment` TR-3.2: 所有内容可见，滚动条操作流畅
- **Notes**: 使用 CSS 设置 max-height 和 overflow-y 属性

## [x] 任务4: 确保列表页布局不变
- **Priority**: P1
- **Depends On**: 任务1-3
- **Description**:
  - 确保弹窗的优化不影响列表页本身的高度和布局
  - 保持页面其他部分不变
- **Acceptance Criteria Addressed**: AC-5
- **Test Requirements**:
  - `human-judgment` TR-4.1: 列表页本身的高度和布局不变
  - `human-judgment` TR-4.2: 页面其他部分保持不变
- **Notes**: 确保弹窗的样式和位置调整不影响列表页

## [x] 任务5: 测试和验证
- **Priority**: P1
- **Depends On**: 任务1-4
- **Description**:
  - 测试弹窗的显示效果
  - 验证弹窗是否完全显示在列表页上方
  - 验证弹窗位置是否合理
  - 验证弹窗内容是否完整显示
  - 验证列表页布局是否不变
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6
- **Test Requirements**:
  - `human-judgment` TR-5.1: 弹窗完全显示在列表页上方，不被遮挡或截断
  - `human-judgment` TR-5.2: 弹窗在可视区域内水平居中，位置合理
  - `human-judgment` TR-5.3: 弹窗宽度和高度适配内容，保证表格信息完整显示
  - `human-judgment` TR-5.4: 当内容超出弹窗高度时，弹窗内出现滚动条
  - `human-judgment` TR-5.5: 列表页本身的高度和布局不变
  - `programmatic` TR-5.6: 弹窗通过 append-to-body 属性挂载到页面最上层
- **Notes**: 测试时注意检查不同屏幕尺寸下的显示效果