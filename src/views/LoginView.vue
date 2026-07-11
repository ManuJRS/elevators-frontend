<template>
  <div
    class="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-slate-100 px-4 py-10"
  >
    <section
      class="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60"
    >
      <div class="mb-8 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Acceso corporativo</p>
        <h1 class="mt-2 text-2xl font-bold text-slate-900">Elevadores Configurator</h1>
        <p class="mt-2 text-sm text-slate-500">
          Inicia sesión para acceder al catálogo y al checkout híbrido.
        </p>
      </div>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label for="username" class="mb-1.5 block text-sm font-semibold text-slate-700">
            Usuario
          </label>
          <input
            id="username"
            v-model="username"
            type="text"
            autocomplete="username"
            required
            placeholder="usuario@empresa.com"
            class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
        </div>

        <div>
          <label for="password" class="mb-1.5 block text-sm font-semibold text-slate-700">
            Contraseña
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            placeholder="••••••••"
            class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-slate-900 outline-none transition focus:border-sky-600 focus:bg-white focus:ring-2 focus:ring-sky-100"
          />
          <div class="mt-2 text-right">
            <RouterLink
              to="/forgot-password"
              class="text-xs font-medium text-slate-500 transition hover:text-sky-700"
            >
              ¿Olvidaste tu contraseña?
            </RouterLink>
          </div>
        </div>

        <p
          v-if="successMessage"
          class="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
          role="status"
        >
          {{ successMessage }}
        </p>

        <p
          v-if="errorMessage"
          class="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="isLoading"
          class="flex w-full items-center justify-center rounded-lg bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {{ isLoading ? 'Validando credenciales...' : 'Iniciar sesión' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-slate-500">
        ¿No tienes cuenta?
        <RouterLink to="/register" class="font-semibold text-sky-700 hover:text-sky-800">
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
