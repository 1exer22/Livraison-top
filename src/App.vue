<template>
  <div class="app">
    <nav-bar />
    <router-view />
    <app-footer />
  </div>
</template>

<script setup>
import NavBar from '@/components/common/NavBar.vue'
import AppFooter from '@/components/common/AppFooter.vue'
</script>

<style lang="scss">
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
