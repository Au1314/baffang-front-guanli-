# 头像显示问题分析 - 产品需求文档

## Overview
- **Summary**: 解决后台管理系统中头像显示不一致的问题，确保个人资料页面、右上角和控制台都能正确显示用户头像。
- **Purpose**: 统一用户头像显示逻辑，提升用户体验一致性。
- **Target Users**: 系统管理员和其他角色用户。

## Goals
- 确保右上角用户信息区域正确显示用户头像
- 确保控制台页面正确显示用户头像
- 保持个人资料页面头像显示功能正常
- 统一头像获取逻辑，确保所有页面使用相同的数据源

## Non-Goals (Out of Scope)
- 修改头像上传功能
- 修改头像存储方式
- 修改后端API接口

## Background & Context
- 个人资料页面可以正常显示头像，说明数据库中存在头像数据且API能正确返回
- 右上角和控制台的头像显示失败，可能是因为获取用户信息的API接口不同或数据处理逻辑问题
- 系统使用Vue3 + Vite + Pinia + Element Plus技术栈

## Functional Requirements
- **FR-1**: 右上角用户信息区域应显示用户头像
- **FR-2**: 控制台页面应显示用户头像
- **FR-3**: 个人资料页面头像显示功能应保持正常
- **FR-4**: 所有页面应使用统一的头像获取逻辑

## Non-Functional Requirements
- **NFR-1**: 头像显示应在页面加载时自动完成
- **NFR-2**: 头像显示失败时应显示用户名首字母作为替代
- **NFR-3**: 头像获取逻辑应与后端API保持一致

## Constraints
- **Technical**: 前端代码修改应基于现有技术栈，不引入新的依赖
- **Dependencies**: 依赖后端API返回包含avatar字段的用户信息

## Assumptions
- 数据库中已存储用户头像信息
- 后端API `/profile` 能正确返回包含avatar字段的用户信息
- 后端API `/auth/info` 可能未返回avatar字段

## Acceptance Criteria

### AC-1: 右上角用户信息区域显示头像
- **Given**: 用户已登录系统
- **When**: 访问系统任意页面
- **Then**: 右上角用户信息区域应显示用户头像
- **Verification**: `human-judgment`
- **Notes**: 如果头像不存在，应显示用户名首字母

### AC-2: 控制台页面显示头像
- **Given**: 用户已登录系统
- **When**: 访问控制台页面
- **Then**: 控制台页面顶部应显示用户头像
- **Verification**: `human-judgment`
- **Notes**: 如果头像不存在，应显示用户名首字母

### AC-3: 个人资料页面头像显示正常
- **Given**: 用户已登录系统
- **When**: 访问个人资料页面
- **Then**: 个人资料页面应显示用户头像
- **Verification**: `human-judgment`

### AC-4: 统一头像获取逻辑
- **Given**: 系统代码修改完成
- **When**: 检查代码实现
- **Then**: 所有页面应使用相同的用户信息获取逻辑
- **Verification**: `programmatic`
- **Notes**: 应修改adminStore中的getUserInfo方法，确保获取包含avatar字段的用户信息

## Open Questions
- [ ] 后端API `/auth/info` 是否返回avatar字段？
- [ ] 个人资料页面使用的是哪个API获取用户信息？