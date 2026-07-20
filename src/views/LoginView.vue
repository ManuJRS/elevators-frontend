<template>
  <div
    class="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-neutral-950 px-4 py-10"
  >
    <section
      class="w-full max-w-md rounded-sm border border-neutral-800 bg-neutral-900 p-8 shadow-2xl shadow-black/40"
    >
      <div class="mb-8 text-center">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">Acceso corporativo</p>
        <h1 class="mt-2 text-2xl font-black uppercase tracking-tight text-white">Elevadores Configurator</h1>
        <p class="mt-2 text-sm text-neutral-400">
          Inicia sesión para acceder al catálogo y al checkout híbrido.
        </p>
      </div>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label for="username" class="mb-1.5 block text-sm font-semibold text-neutral-300">
            Usuario
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            required
            placeholder="usuario@empresa.com"
            class="w-full rounded-sm border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
        </div>

        <div>
          <label for="password" class="mb-1.5 block text-sm font-semibold text-neutral-300">
            Contraseña
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            placeholder="••••••••"
            class="w-full rounded-sm border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-white outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
          />
          <div class="mt-2 text-right">
            <RouterLink
              to="/forgot-password"
              class="text-xs font-medium text-neutral-500 transition hover:text-amber-400"
            >
              ¿Olvidaste tu contraseña?
            </RouterLink>
          </div>
        </div>

        <p
          v-if="successMessage"
          class="rounded-sm border border-emerald-800 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-300"
          role="status"
        >
          {{ successMessage }}
        </p>

        <p
          v-if="errorMessage"
          class="rounded-sm border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300"
          role="alert"
        >
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="isLoading"
          class="flex w-full items-center justify-center rounded-sm border border-amber-400 bg-amber-400 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-neutral-950 transition hover:bg-transparent hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {{ isLoading ? 'Validando credenciales...' : 'Iniciar sesión' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-neutral-500">
        ¿No tienes cuenta?
        <RouterLink to="/register" class="font-semibold text-amber-400 hover:text-amber-500">
          Regístrate
        </RouterLink>
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const username = ref<string>('');
const password = ref<string>('');
const isLoading = ref<boolean>(false);
const errorMessage = ref<string | null>(null);

const successMessage = computed<string | null>(() => {
  if (route.query.passwordReset === 'success') {
    return 'Tu contraseña se actualizó correctamente. Ya puedes iniciar sesión.';
  }

  return null;
});

const resolveRedirectPath = (): string => {
  const redirect = route.query.redirect;

  if (typeof redirect === 'string' && redirect.startsWith('/')) {
    return redirect;
  }

  return '/catalogo';
};

const handleSubmit = async (): Promise<void> => {
  errorMessage.value = null;
  isLoading.value = true;

  try {
    await authStore.login(username.value, password.value);
    await router.replace(resolveRedirectPath());
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'No se pudo iniciar sesión. Intenta de nuevo.';
  } finally {
    isLoading.value = false;
  }
};
</script>
