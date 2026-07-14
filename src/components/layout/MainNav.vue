<template>
  <header class="sticky top-0 z-50 border-b border-slate-800 bg-[#1e1e24] text-white shadow-lg shadow-black/20">
    <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
      <RouterLink
        to="/"
        class="shrink-0 text-base font-bold tracking-wide text-white transition hover:text-sky-300 md:text-lg"
        @click="closeAllMenus"
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

      <nav class="hidden items-center gap-1 lg:flex" aria-label="Navegación principal">
        <template v-if="isLoading">
          <span class="px-2 text-sm text-slate-500">Cargando menú…</span>
        </template>

        <template v-else>
          <template v-for="item in menuItems" :key="item.id">
            <div
              v-if="item.children.length > 0"
              class="relative"
              @mouseenter="openDesktopDropdown(item.id)"
              @mouseleave="scheduleCloseDesktopDropdown(item.id)"
            >
              <button
                type="button"
                class="nav-link inline-flex items-center gap-1.5 px-2 py-1"
                :class="{ 'text-white': openDesktopId === item.id }"
                :aria-expanded="openDesktopId === item.id"
                :aria-controls="`desktop-dropdown-${item.id}`"
                @click="toggleDesktopDropdown(item.id)"
              >
                {{ item.label }}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="h-3.5 w-3.5 transition-transform duration-200"
                  :class="{ 'rotate-180': openDesktopId === item.id }"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>

              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 -translate-y-1 scale-95"
                enter-to-class="opacity-100 translate-y-0 scale-100"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 translate-y-0 scale-100"
                leave-to-class="opacity-0 -translate-y-1 scale-95"
              >
                <div
                  v-if="openDesktopId === item.id"
                  :id="`desktop-dropdown-${item.id}`"
                  class="absolute left-0 top-full z-[60] mt-1 min-w-[14rem] rounded-lg border border-slate-700 bg-[#25252d] py-1.5 shadow-xl shadow-black/40"
                  role="menu"
                  @mouseenter="openDesktopDropdown(item.id)"
                  @mouseleave="scheduleCloseDesktopDropdown(item.id)"
                >
                  <component
                    :is="child.internalTo ? RouterLink : 'a'"
                    v-for="child in item.children"
                    :key="child.id"
                    v-bind="
                      child.internalTo
                        ? { to: child.internalTo }
                        : {
                            href: child.externalHref ?? '#',
                            target: isExternalAbsolute(child.externalHref) ? '_blank' : undefined,
                            rel: isExternalAbsolute(child.externalHref)
                              ? 'noopener noreferrer'
                              : undefined,
                          }
                    "
                    class="block px-3.5 py-2 text-sm text-slate-300 transition hover:bg-slate-800/80 hover:text-white"
                    role="menuitem"
                  >
                    {{ child.label }}
                  </component>
                </div>
              </Transition>
            </div>

            <component
              :is="item.internalTo ? RouterLink : 'a'"
              v-else
              v-bind="
                item.internalTo
                  ? { to: item.internalTo }
                  : {
                      href: item.externalHref ?? '#',
                      target: isExternalAbsolute(item.externalHref) ? '_blank' : undefined,
                      rel: isExternalAbsolute(item.externalHref) ? 'noopener noreferrer' : undefined,
                    }
              "
              class="nav-link px-2 py-1"
            >
              {{ item.label }}
            </component>
          </template>
        </template>

        <div class="ml-3 flex items-center gap-2 border-l border-slate-700 pl-4">
          <CartPanel />

          <template v-if="!authStore.token">
            <RouterLink to="/register" class="btn-ghost">Registrarse</RouterLink>
            <RouterLink to="/login" class="btn-primary">Iniciar sesión</RouterLink>
          </template>

          <template v-else>
            <RouterLink
              to="/mi-cuenta"
              class="btn-secondary max-w-[14rem] truncate"
              :title="greetingLabel"
            >
              {{ greetingLabel }}
            </RouterLink>
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
        <p v-if="isLoading" class="px-3 py-2 text-sm text-slate-500">Cargando menú…</p>

        <template v-else>
          <template v-for="item in menuItems" :key="`mobile-${item.id}`">
            <div v-if="item.children.length > 0" class="rounded-lg">
              <button
                type="button"
                class="mobile-nav-link flex w-full items-center justify-between"
                :aria-expanded="openMobileAccordionId === item.id"
                @click="toggleMobileAccordion(item.id)"
              >
                <span>{{ item.label }}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="h-4 w-4 transition-transform duration-200"
                  :class="{ 'rotate-180': openMobileAccordionId === item.id }"
                  aria-hidden="true"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>

              <Transition
                enter-active-class="transition duration-150 ease-out"
                enter-from-class="opacity-0 -translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-100 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-1"
              >
                <div
                  v-if="openMobileAccordionId === item.id"
                  class="mb-1 ml-2 space-y-0.5 border-l border-slate-700 pl-2"
                >
                  <component
                    :is="child.internalTo ? RouterLink : 'a'"
                    v-for="child in item.children"
                    :key="`mobile-child-${child.id}`"
                    v-bind="
                      child.internalTo
                        ? { to: child.internalTo }
                        : {
                            href: child.externalHref ?? '#',
                            target: isExternalAbsolute(child.externalHref) ? '_blank' : undefined,
                            rel: isExternalAbsolute(child.externalHref)
                              ? 'noopener noreferrer'
                              : undefined,
                          }
                    "
                    class="mobile-nav-link"
                    @click="closeAllMenus"
                  >
                    {{ child.label }}
                  </component>
                </div>
              </Transition>
            </div>

            <component
              :is="item.internalTo ? RouterLink : 'a'"
              v-else
              v-bind="
                item.internalTo
                  ? { to: item.internalTo }
                  : {
                      href: item.externalHref ?? '#',
                      target: isExternalAbsolute(item.externalHref) ? '_blank' : undefined,
                      rel: isExternalAbsolute(item.externalHref) ? 'noopener noreferrer' : undefined,
                    }
              "
              class="mobile-nav-link"
              @click="closeAllMenus"
            >
              {{ item.label }}
            </component>
          </template>
        </template>

        <div class="mt-3 space-y-0.5 border-t border-slate-800 pt-3">
          <template v-if="!authStore.token">
            <RouterLink to="/register" class="mobile-nav-link" @click="closeAllMenus">
              Registrarse
            </RouterLink>
            <RouterLink to="/login" class="mobile-nav-link" @click="closeAllMenus">
              Iniciar sesión
            </RouterLink>
          </template>

          <template v-else>
            <RouterLink to="/mi-cuenta" class="mobile-nav-link" @click="closeAllMenus">
              {{ greetingLabel }}
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
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import CartPanel from '../CartPanel.vue';
import { usePrimaryMenu } from '../../composables/usePrimaryMenu';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const { menuItems, isLoading } = usePrimaryMenu();

const isMobileMenuOpen = ref<boolean>(false);
const openDesktopId = ref<string | null>(null);
const openMobileAccordionId = ref<string | null>(null);

let dropdownCloseTimer: ReturnType<typeof setTimeout> | null = null;

const userName = computed<string>(
  () => authStore.displayName || authStore.userEmail || 'Usuario',
);

const greetingLabel = computed<string>(() => `¡Hola, ${userName.value}!`);

const isExternalAbsolute = (href: string | null | undefined): boolean => {
  if (!href) return false;
  try {
    const parsed = new URL(href, window.location.origin);
    return parsed.origin !== window.location.origin;
  } catch {
    return false;
  }
};

const clearDropdownTimer = (): void => {
  if (dropdownCloseTimer !== null) {
    clearTimeout(dropdownCloseTimer);
    dropdownCloseTimer = null;
  }
};

const openDesktopDropdown = (id: string): void => {
  clearDropdownTimer();
  openDesktopId.value = id;
};

const scheduleCloseDesktopDropdown = (id: string): void => {
  clearDropdownTimer();
  dropdownCloseTimer = setTimeout(() => {
    if (openDesktopId.value === id) {
      openDesktopId.value = null;
    }
  }, 120);
};

const toggleDesktopDropdown = (id: string): void => {
  clearDropdownTimer();
  openDesktopId.value = openDesktopId.value === id ? null : id;
};

const toggleMobileMenu = (): void => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  if (!isMobileMenuOpen.value) {
    openMobileAccordionId.value = null;
  }
};

const toggleMobileAccordion = (id: string): void => {
  openMobileAccordionId.value = openMobileAccordionId.value === id ? null : id;
};

const closeAllMenus = (): void => {
  clearDropdownTimer();
  isMobileMenuOpen.value = false;
  openDesktopId.value = null;
  openMobileAccordionId.value = null;
};

const handleLogout = async (): Promise<void> => {
  closeAllMenus();
  authStore.logout();
  await router.push('/login');
};

watch(
  () => route.fullPath,
  () => {
    closeAllMenus();
  },
);

onBeforeUnmount(() => {
  clearDropdownTimer();
});
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
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
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
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
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
