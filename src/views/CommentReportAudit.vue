<template>
  <div class="not-implemented-container">
    <el-empty
      description="功能还未实现"
      :image-size="200"
    >
      <el-button type="primary" @click="$router.back()">返回</el-button>
    </el-empty>
  </div>
</template>

<script setup>
// 评论举报审核功能未实现
</script>

<style scoped>
.not-implemented-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 500px;
  background-color: #fafafa;
  border-radius: 8px;
}
</style>