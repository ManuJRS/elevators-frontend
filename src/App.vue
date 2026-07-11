<template>
  <div class="app-wrapper">
    <header class="main-header">
      <div class="logo">Elevadores Configurator</div>
      <nav class="nav-links">
        <RouterLink to="/" class="nav-item">Inicio</RouterLink>
        <RouterLink to="/catalogo" class="nav-item">Catálogo de Refacciones</RouterLink>
        <RouterLink to="/cotizador" class="nav-item">Cotizador</RouterLink>
        <CartPanel />

        <div class="auth-section">
          <template v-if="!authStore.isAuthenticated">
            <RouterLink to="/register" class="register-btn">
              Registrarse
            </RouterLink>
            <RouterLink to="/login" class="login-btn">
              Iniciar sesión
            </RouterLink>
          </template>

          <template v-else>
            <RouterLink to="/mi-cuenta" class="account-btn">
              Mi cuenta
            </RouterLink>
            <span class="user-badge" aria-label="Usuario autenticado">
              <span class="user-icon" aria-hidden="true">◉</span>
              {{ authStore.displayName || authStore.userEmail }}
            </span>
            <button type="button" class="logout-btn" @click="handleLogout">
              Cerrar sesión
            </button>
          </template>
        </div>
      </nav>
    </header>

    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup lang="ts">
import { RouterLink, RouterView, useRouter } from 'vue-router';
import CartPanel from './components/CartPanel.vue';
import { useAuthStore } from './stores/auth';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = async (): Promise<void> => {
  authStore.logout();
  await router.push('/login');
};
</script>

<style>
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
  align-items: center;
  gap: 1.5rem;
}

.nav-item {
  color: #a0a0a5;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-item:hover,
.router-link-active {
  color: #ffffff;
}

.auth-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-left: 0.5rem;
  padding-left: 1rem;
  border-left: 1px solid #3a3a42;
}

.login-btn {
  padding: 0.45rem 0.9rem;
  border: 1px solid #4a4a55;
  border-radius: 8px;
  background: #2a2a32;
  color: #ffffff;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.login-btn:hover {
  background: #35353f;
  border-color: #5a5a66;
  color: #ffffff;
}

.register-btn {
  padding: 0.45rem 0.9rem;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: #a0a0a5;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.register-btn:hover {
  color: #ffffff;
  background: #2a2a32;
}

.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: #e5e7eb;
  font-size: 0.9rem;
  font-weight: 500;
}

.user-icon {
  color: #0073aa;
  font-size: 0.75rem;
}

.logout-btn {
  padding: 0.45rem 0.85rem;
  border: 1px solid #4a4a55;
  border-radius: 8px;
  background: transparent;
  color: #d1d5db;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.logout-btn:hover {
  background: #2a2a32;
  color: #ffffff;
}

.account-btn {
  padding: 0.45rem 0.85rem;
  border: 1px solid #4a4a55;
  border-radius: 8px;
  background: #2a2a32;
  color: #e5e7eb;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 600;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.account-btn:hover {
  background: #35353f;
  color: #ffffff;
}

.main-content {
  flex-grow: 1;
}
</style>
