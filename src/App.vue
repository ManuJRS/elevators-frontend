<template>
  <div class="app-wrapper">
    <header class="main-header">
      <div class="logo">Elevadores Configurator</div>
      <nav class="nav-links">
        <RouterLink to="/" class="nav-item">Inicio</RouterLink>
        <RouterLink to="/catalogo" class="nav-item">Catálogo de Refacciones</RouterLink>
        <RouterLink to="/cotizador" class="nav-item">Cotizador</RouterLink>
        <CartPanel />
      </nav>
    </header>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router';
import CartPanel from './components/CartPanel.vue';
import { useCheckoutReturnSync } from './composables/useCheckoutReturnSync';

useCheckoutReturnSync();
</script>

<style>
/* Estilos globales básicos y limpios */
body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background-color: #fcfcfc;
}

.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  background-color: #1e1e24;
  color: #ffffff;
}

.logo {
  font-weight: bold;
  font-size: 1.2rem;
  letter-spacing: 0.5px;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
}

.nav-item {
  color: #a0a0a5;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-item:hover, .router-link-active {
  color: #ffffff;
}

.main-content {
  flex-grow: 1;
}
</style>