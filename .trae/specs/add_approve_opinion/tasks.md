# 私人电桩认证审核 - 通过审核需要审核意见功能增强 - 实现计划

## [ ] Task 1: 修改handleApprove函数，添加审核意见输入
- **Priority**: P0
- **Depends On**: None
- **Description**: 
  - 修改`handleApprove`函数，将简单的确认对话框改为输入框对话框
  - 使用`ElMessageBox.prompt`替代`ElMessageBox.confirm`
  - 添加审核意见的验证逻辑，确保不能为空
  - 将用户输入的审核意见作为`opinion`参数传递给API
- **Acceptance Criteria Addressed**: AC-1, AC-2, AC-3
- **Test Requirements**:
  - `human-judgment` TR-1.1: 点击"通过"按钮时，弹出输入框要求输入审核意见
  - `human-judgment` TR-1.2: 不输入审核意见直接点击确定时，显示错误提示
  - `programmatic` TR-1.3: 审核意见作为参数正确传递给API
- **Notes**: 参考`handleReject`函数的实现方式，保持操作流程的一致性

## [ ] Task 2: 测试功能完整性
- **Priority**: P1
- **Depends On**: Task 1
- **Description**:
  - 测试通过审核时的审核意见输入功能
  - 测试审核意见为空时的验证
  - 测试审核操作成功后的提示和列表刷新
  - 测试驳回操作是否仍然正常工作
- **Acceptance Criteria Addressed**: AC-4
- **Test Requirements**:
  - `human-judgment` TR-2.1: 审核操作成功后，显示成功提示并刷新审核列表
  - `human-judgment` TR-2.2: 驳回操作仍然正常工作，要求输入驳回原因
- **Notes**: 确保修改不会影响现有的驳回操作功能