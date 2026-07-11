<template>
  <div class="flex min-h-screen flex-col bg-[#fcfcfc]">
    <MainNav />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import AppFooter from '../components/layout/AppFooter.vue';
import MainNav from '../components/layout/MainNav.vue';
</script>
