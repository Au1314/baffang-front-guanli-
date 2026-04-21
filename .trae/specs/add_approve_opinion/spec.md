# 私人电桩认证审核 - 通过审核需要审核意见功能增强

## Overview
- **Summary**: 为私人电桩认证审核功能增加通过审核时的审核意见输入功能，确保审核通过时也能记录详细的审核意见。
- **Purpose**: 提高审核过程的透明度和可追溯性，确保所有审核操作都有详细的审核意见记录。
- **Target Users**: 系统管理员、审核员

## Goals
- 实现通过审核时的审核意见输入功能
- 确保审核意见作为必要字段，不能为空
- 保持与驳回操作的一致性，都需要输入审核意见
- 确保审核意见能够正确传递给后端API

## Non-Goals (Out of Scope)
- 修改其他审核类型的操作流程
- 修改审核状态的定义和处理逻辑
- 添加新的审核字段或状态

## Background & Context
- 当前系统中，驳回审核时需要输入驳回原因，但通过审核时直接使用固定的"审核通过"文本，没有要求输入详细的审核意见。
- 为了保持审核过程的一致性和完整性，需要修改通过审核的操作流程，要求输入审核意见。

## Functional Requirements
- **FR-1**: 当用户点击"通过"按钮时，系统应弹出输入框要求输入审核意见
- **FR-2**: 审核意见不能为空，系统应进行验证
- **FR-3**: 审核意见应作为参数传递给后端API
- **FR-4**: 审核操作成功后，系统应显示成功提示并刷新审核列表

## Non-Functional Requirements
- **NFR-1**: 操作流程应保持与驳回操作的一致性
- **NFR-2**: 审核意见输入框应提供足够的输入空间（多行文本）
- **NFR-3**: 验证失败时应显示清晰的错误提示

## Constraints
- **Technical**: 基于现有的Element Plus组件库和Vue 3框架
- **Dependencies**: 依赖现有的`authApi.auditPrivateStation` API接口

## Assumptions
- 后端API已经支持接收并存储审核意见
- 审核意见是审核操作的必要字段

## Acceptance Criteria

### AC-1: 通过审核时要求输入审核意见
- **Given**: 用户打开私人电桩认证审核页面
- **When**: 用户点击"通过"按钮
- **Then**: 系统弹出输入框要求输入审核意见
- **Verification**: `human-judgment`

### AC-2: 审核意见不能为空
- **Given**: 用户点击"通过"按钮后弹出输入框
- **When**: 用户不输入审核意见直接点击确定
- **Then**: 系统显示错误提示，要求输入审核意见
- **Verification**: `human-judgment`

### AC-3: 审核意见正确传递给API
- **Given**: 用户输入审核意见并点击确定
- **When**: 系统调用审核API
- **Then**: 审核意见作为参数传递给后端
- **Verification**: `programmatic`

### AC-4: 审核操作成功后刷新列表
- **Given**: 用户输入审核意见并点击确定
- **When**: 审核操作成功
- **Then**: 系统显示成功提示并刷新审核列表
- **Verification**: `human-judgment`

## Open Questions
- [ ] 审核意见的最大长度限制是多少？
- [ ] 审核意见是否需要进行特殊字符过滤？