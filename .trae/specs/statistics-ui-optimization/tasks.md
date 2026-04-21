# 统计模块UI优化 - 实现计划

## [ ] Task 1: 去掉统计模块下主界面底下的数据卡片
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 修改Statistics.vue文件，移除StatisticsCharts组件的引用
  - 从模板中移除StatisticsCharts组件的使用
  - 保留StatisticsMetrics组件，只显示核心统计指标
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `human-judgment` TR-1.1: 统计模块页面中不再显示数据卡片
  - `human-judgment` TR-1.2: 只显示核心统计指标
- **Notes**: 确保移除数据卡片后不影响核心统计指标的显示

## [ ] Task 2: 优化统计模块的UI界面
- **Priority**: P1
- **Depends On**: Task 1
- **Description**: 
  - 优化Statistics.vue文件的布局和样式
  - 优化StatisticsMetrics.vue组件的样式，提供更美观的设计
  - 调整核心统计指标的布局，使其更直观、清晰
  - 优化响应式设计，确保在不同屏幕尺寸下显示正常
- **Acceptance Criteria Addressed**: [AC-2, AC-4]
- **Test Requirements**:
  - `human-judgment` TR-2.1: 统计模块界面简洁美观
  - `human-judgment` TR-2.2: 核心统计指标布局合理，清晰直观
  - `human-judgment` TR-2.3: 在不同屏幕尺寸下显示正常
- **Notes**: 参考现代UI设计标准，确保界面美观易用

## [ ] Task 3: 确保功能正常
- **Priority**: P0
- **Depends On**: Task 1, Task 2
- **Description**: 
  - 测试统计模块的数据获取功能
  - 确保核心统计指标能够正常显示
  - 测试统计模块的其他功能按钮（如快速分析等）
  - 确保数据大屏模块仍然可以正常访问
- **Acceptance Criteria Addressed**: [AC-3, AC-5]
- **Test Requirements**:
  - `programmatic` TR-3.1: 核心统计指标数据能够正常获取和显示
  - `human-judgment` TR-3.2: 统计模块的其他功能按钮能够正常工作
  - `human-judgment` TR-3.3: 数据大屏模块仍然可以正常访问
- **Notes**: 确保修改后不影响现有功能

## [ ] Task 4: 清理代码
- **Priority**: P2
- **Depends On**: Task 1, Task 2, Task 3
- **Description**: 
  - 清理Statistics.vue文件中未使用的import语句
  - 优化代码结构，移除不必要的代码
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `human-judgment` TR-4.1: 代码结构清晰，没有不必要的代码
  - `human-judgment` TR-4.2: 没有未使用的import语句和引用
- **Notes**: 确保代码清理不影响其他功能