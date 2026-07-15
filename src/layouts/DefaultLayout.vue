<template>
  <div class="flex min-h-screen flex-col bg-[#fcfcfc]">
    <MainNav />
    <main class="flex-1">
      <slot />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import MainNav from '../components/layout/MainNav.vue';
import TheFooter from '../components/layout/TheFooter.vue';
</script>
