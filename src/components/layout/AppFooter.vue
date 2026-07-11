<template>
  <footer class="mt-auto border-t border-slate-800 bg-[#1e1e24] text-slate-300">
    <div class="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
      <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
        <section class="sm:col-span-2 lg:col-span-1">
          <RouterLink to="/" class="text-lg font-bold tracking-wide text-white transition hover:text-sky-300">
            Elevadores Configurator
          </RouterLink>
          <p class="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
            Plataforma corporativa para refacciones, cotizaciones y gestión de pedidos B2B.
          </p>
        </section>

        <section>
          <h2 class="text-sm font-semibold uppercase tracking-wider text-white">Navegación</h2>
          <ul class="mt-4 space-y-2">
            <li v-for="link in navLinks" :key="link.to">
              <RouterLink :to="link.to" class="footer-link">
                {{ link.label }}
              </RouterLink>
            </li>
          </ul>
        </section>

        <section>
          <h2 class="text-sm font-semibold uppercase tracking-wider text-white">Cuenta</h2>
          <ul class="mt-4 space-y-2">
            <template v-if="!authStore.isAuthenticated">
              <li>
                <RouterLink to="/login" class="footer-link">Iniciar sesión</RouterLink>
              </li>
              <li>
                <RouterLink to="/register" class="footer-link">Registrarse</RouterLink>
              </li>
            </template>
            <template v-else>
              <li>
                <RouterLink to="/mi-cuenta" class="footer-link">Mi cuenta</RouterLink>
              </li>
            </template>
            <li>
              <RouterLink to="/forgot-password" class="footer-link">Recuperar contraseña</RouterLink>
            </li>
          </ul>
        </section>

        <section>
          <h2 class="text-sm font-semibold uppercase tracking-wider text-white">Contacto</h2>
          <ul class="mt-4 space-y-3 text-sm">
            <li class="flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="mt-0.5 h-4 w-4 shrink-0 text-sky-500"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
              <a href="mailto:ventas@elevadores.com" class="footer-link">ventas@elevadores.com</a>
            </li>
            <li class="flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="mt-0.5 h-4 w-4 shrink-0 text-sky-500"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"
                />
              </svg>
              <a href="tel:+525512345678" class="footer-link">+52 55 1234 5678</a>
            </li>
            <li class="flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="mt-0.5 h-4 w-4 shrink-0 text-sky-500"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              <span class="text-slate-400">Ciudad de México, México</span>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <div class="border-t border-slate-800 bg-[#1a1a20]">
      <div class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-center text-xs text-slate-500 sm:flex-row sm:text-left md:px-6">
        <p>&copy; {{ currentYear }} Elevadores Configurator. Todos los derechos reservados.</p>
        <p class="text-slate-600">Refacciones y cotizaciones para el sector elevación.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

interface FooterLink {
  to: string;
  label: string;
}

const navLinks: FooterLink[] = [
  { to: '/', label: 'Inicio' },
  { to: '/catalogo', label: 'Catálogo de Refacciones' },
  { to: '/cotizador', label: 'Cotizador' },
];

const authStore = useAuthStore();

const currentYear = computed<number>(() => new Date().getFullYear());
</script>

<style scoped>
.footer-link {
  font-size: 0.9rem;
  color: #a0a0a5;
  text-decoration: none;
  transition: color 0.2s ease;
}

.footer-link:hover,
.footer-link.router-link-active {
  color: #ffffff;
}
</style>
