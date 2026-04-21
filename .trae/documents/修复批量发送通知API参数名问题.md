## 问题分析

从错误信息可以看到，当发送批量通知时，API返回了错误：`{code: 1500, data: {userIds: '用户列表不能为空'}, msg: '参数校验错误'}`

通过查看代码，发现问题出在 `NoticeBatchSend.vue` 文件中的 `handleSubmit` 函数。当准备提交数据时，参数名使用了小写格式（如 `userids`），但后端API期望的是驼峰式命名（如 `userIds`）。

## 修复方案

修改 `NoticeBatchSend.vue` 文件中的 `submitData` 对象，将参数名改为驼峰式，与后端API期望的参数名一致：

1. 将 `userids` 改为 `userIds`
2. 将 `relatedid` 改为 `relatedId`
3. 将 `relatedtype` 改为 `relatedType`

## 预期效果

修复后，当发送批量通知时，API将能够正确识别参数，不再返回"用户列表不能为空"的错误，从而成功发送通知。

## 修复步骤

1. 打开 `NoticeBatchSend.vue` 文件
2. 定位到 `handleSubmit` 函数中的 `submitData` 对象
3. 修改参数名为驼峰式
4. 保存文件并测试