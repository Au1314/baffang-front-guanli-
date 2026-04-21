<template>
  <router-view v-slot="{ Component }">
    <template v-if="$route.meta.hideLayout">
      <component :is="Component" />
    </template>
    <template v-else>
      <MainLayout>
        <component :is="Component" />
      </MainLayout>
    </template>
  </router-view>
</template>

<script setup>
import MainLayout from '@/components/layout/MainLayout.vue'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}
</style>