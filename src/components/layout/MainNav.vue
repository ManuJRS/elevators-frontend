<template>
  <header class="sticky top-0 z-40 border-b border-slate-800 bg-[#1e1e24] text-white shadow-lg shadow-black/20">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
      <RouterLink
        to="/"
        class="shrink-0 text-base font-bold tracking-wide text-white transition hover:text-sky-300 md:text-lg"
        @click="closeMobileMenu"
      >
        Elevadores Configurator
      </RouterLink>

      <div class="flex items-center gap-2 lg:hidden">
        <CartPanel />
        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-600 bg-slate-800 text-slate-200 transition hover:border-slate-500 hover:bg-slate-700"
          :aria-expanded="isMobileMenuOpen"
          aria-controls="main-mobile-nav"
          aria-label="Abrir menú de navegación"
          @click="toggleMobileMenu"
        >
          <svg
            v-if="!isMobileMenuOpen"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.75"
            stroke="currentColor"
            class="h-5 w-5"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.75"
            stroke="currentColor"
            class="h-5 w-5"
            aria-hidden="true"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav class="hidden items-center gap-5 lg:flex" aria-label="Navegación principal">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="nav-link"
        >
          {{ link.label }}
        </RouterLink>

        <CartPanel />

        <div class="ml-1 flex items-center gap-2 border-l border-slate-700 pl-4">
          <template v-if="!authStore.isAuthenticated">
            <RouterLink to="/register" class="btn-ghost">Registrarse</RouterLink>
            <RouterLink to="/login" class="btn-primary">Iniciar sesión</RouterLink>
          </template>

          <template v-else>
            <RouterLink to="/mi-cuenta" class="btn-secondary">Mi cuenta</RouterLink>
            <span class="hidden max-w-[10rem] truncate text-sm text-slate-300 xl:inline" :title="userLabel">
              <span class="text-sky-500" aria-hidden="true">◉</span>
              {{ userLabel }}
            </span>
            <button type="button" class="btn-ghost" @click="handleLogout">Cerrar sesión</button>
          </template>
        </div>
      </nav>
    </div>

    <nav
      v-if="isMobileMenuOpen"
      id="main-mobile-nav"
      class="border-t border-slate-800 bg-[#1a1a20] px-4 py-4 lg:hidden"
      aria-label="Navegación móvil"
    >
      <div class="mx-auto flex max-w-7xl flex-col gap-1">
        <RouterLink
          v-for="link in navLinks"
          :key="`mobile-${link.to}`"
          :to="link.to"
          class="mobile-nav-link"
          @click="closeMobileMenu"
        >
          {{ link.label }}
        </RouterLink>

        <div class="mt-3 border-t border-slate-800 pt-3">
          <template v-if="!authStore.isAuthenticated">
            <RouterLink to="/register" class="mobile-nav-link" @click="closeMobileMenu">
              Registrarse
            </RouterLink>
            <RouterLink to="/login" class="mobile-nav-link" @click="closeMobileMenu">
              Iniciar sesión
            </RouterLink>
          </template>

          <template v-else>
            <p class="mb-2 truncate px-3 text-sm text-slate-400">{{ userLabel }}</p>
            <RouterLink to="/mi-cuenta" class="mobile-nav-link" @click="closeMobileMenu">
              Mi cuenta
            </RouterLink>
            <button type="button" class="mobile-nav-link w-full text-left" @click="handleLogout">
              Cerrar sesión
            </button>
          </template>
        </div>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import CartPanel from '../CartPanel.vue';
import { useAuthStore } from '../../stores/auth';

interface NavLink {
  to: string;
  label: string;
}

const navLinks: NavLink[] = [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Catálogo de Refacciones' },
  { to: '/cotizador', label: 'Cotizador' },
];

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const isMobileMenuOpen = ref<boolean>(false);

const userLabel = computed<string>(
  () => authStore.displayName || authStore.userEmail || 'Usuario',
);

const toggleMobileMenu = (): void => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = (): void => {
  isMobileMenuOpen.value = false;
};

const handleLogout = async (): Promise<void> => {
  closeMobileMenu();
  authStore.logout();
  await router.push('/login');
};

watch(
  () => route.fullPath,
  () => {
    closeMobileMenu();
  },
);
</script>

<style scoped>
.nav-link {
  font-size: 0.9rem;
  font-weight: 500;
  color: #a0a0a5;
  text-decoration: none;
  transition: color 0.2s ease;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #ffffff;
}

.mobile-nav-link {
  display: block;
  border-radius: 0.5rem;
  padding: 0.65rem 0.75rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #d1d5db;
  text-decoration: none;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.mobile-nav-link:hover,
.mobile-nav-link.router-link-active {
  background-color: #2a2a32;
  color: #ffffff;
}

.btn-primary,
.btn-secondary,
.btn-ghost {
  border-radius: 0.5rem;
  padding: 0.45rem 0.85rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.btn-primary {
  border: 1px solid #4a4a55;
  background: #2a2a32;
  color: #ffffff;
}

.btn-primary:hover {
  background: #35353f;
  border-color: #5a5a66;
}

.btn-secondary {
  border: 1px solid #4a4a55;
  background: #2a2a32;
  color: #e5e7eb;
}

.btn-secondary:hover {
  background: #35353f;
  color: #ffffff;
}

.btn-ghost {
  border: 1px solid transparent;
  background: transparent;
  color: #a0a0a5;
  cursor: pointer;
}

.btn-ghost:hover {
  color: #ffffff;
  background: #2a2a32;
}
</style>
