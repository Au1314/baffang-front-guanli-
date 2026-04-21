# 头像显示问题分析 - 实现计划

## [ ] Task 1: 分析个人资料页面头像显示逻辑
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 查看个人资料页面代码，了解其如何获取和显示头像
  - 确认个人资料页面使用的API接口
- **Acceptance Criteria Addressed**: [AC-3]
- **Test Requirements**:
  - `programmatic` TR-1.1: 确认个人资料页面使用的API接口
  - `programmatic` TR-1.2: 确认个人资料页面头像显示逻辑
- **Notes**: 重点关注Profile.vue文件

## [ ] Task 2: 修改adminStore中的getUserInfo方法
- **Priority**: P0
- **Depends On**: Task 1
- **Description**:
  - 将getUserInfo方法中的API调用从`getAdminInfo()`改为`getProfile()`
  - 确保adminInfo对象包含avatar字段
- **Acceptance Criteria Addressed**: [AC-4]
- **Test Requirements**:
  - `programmatic` TR-2.1: 确认getUserInfo方法调用的是getProfile()
  - `programmatic` TR-2.2: 确认adminInfo对象包含avatar字段
- **Notes**: 参考个人资料页面的实现方式

## [ ] Task 3: 验证MainLayout.vue头像显示
- **Priority**: P1
- **Depends On**: Task 2
- **Description**:
  - 检查MainLayout.vue中头像显示的代码
  - 确保使用正确的adminStore属性获取头像
- **Acceptance Criteria Addressed**: [AC-1]
- **Test Requirements**:
  - `human-judgment` TR-3.1: 验证右上角用户信息区域显示头像
- **Notes**: 确认使用`adminStore.adminInfo?.avatar`或`adminStore.getAdminBaseInfo.avatar`

## [ ] Task 4: 验证DashboardHeader.vue头像显示
- **Priority**: P1
- **Depends On**: Task 2
- **Description**:
  - 检查DashboardHeader.vue中头像显示的代码
  - 确保使用正确的adminStore属性获取头像
- **Acceptance Criteria Addressed**: [AC-2]
- **Test Requirements**:
  - `human-judgment` TR-4.1: 验证控制台页面显示头像
- **Notes**: 确认使用`adminStore.getAdminBaseInfo.avatar`

## [ ] Task 5: 测试所有页面头像显示
- **Priority**: P1
- **Depends On**: Task 3, Task 4
- **Description**:
  - 测试个人资料页面、右上角和控制台的头像显示
  - 确保所有页面都能正确显示头像
- **Acceptance Criteria Addressed**: [AC-1, AC-2, AC-3]
- **Test Requirements**:
  - `human-judgment` TR-5.1: 验证个人资料页面头像显示
  - `human-judgment` TR-5.2: 验证右上角用户信息区域显示头像
  - `human-judgment` TR-5.3: 验证控制台页面显示头像
- **Notes**: 测试不同用户角色的头像显示