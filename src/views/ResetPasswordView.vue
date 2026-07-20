<template>
  <div
    class="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-neutral-950 px-4 py-10"
  >
    <section
      class="w-full max-w-md rounded-sm border border-neutral-700 bg-neutral-900 p-8 shadow-2xl shadow-black/40"
    >
      <div class="mb-8 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Nueva contraseña</p>
        <h1 class="mt-2 text-2xl font-bold text-white">Restablecer contraseña</h1>
        <p class="mt-2 text-sm text-neutral-400">
          Define una nueva contraseña segura para tu cuenta corporativa.
        </p>
      </div>

      <p
        v-if="!hasValidResetParams"
        class="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-300"
        role="alert"
      >
        El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo desde la pantalla de
        recuperación.
      </p>

      <form v-else class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label for="reset-password" class="mb-1.5 block text-sm font-semibold text-neutral-300">
            Nueva contraseña <span class="text-red-400">*</span>
          </label>
          <input
            id="reset-password"
            v-model="password"
            type="password"
            autocomplete="new-password"
            required
            minlength="8"
            placeholder="Mínimo 8 caracteres"
            class="field-input"
          />
        </div>

        <div>
          <label for="reset-password-confirm" class="mb-1.5 block text-sm font-semibold text-neutral-300">
            Confirmar nueva contraseña <span class="text-red-400">*</span>
          </label>
          <input
            id="reset-password-confirm"
            v-model="passwordConfirm"
            type="password"
            autocomplete="new-password"
            required
            minlength="8"
            placeholder="Repite la contraseña"
            class="field-input"
          />
        </div>

        <p
          v-if="errorMessage"
          class="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-300"
          role="alert"
        >
          {{ errorMessage }}
        </p>

        <button
          type="submit"
          :disabled="isLoading"
          class="flex w-full items-center justify-center rounded-lg border border-amber-400 bg-amber-400 px-4 py-2.5 text-sm font-bold uppercase tracking-wider text-neutral-950 transition hover:bg-transparent hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {{ isLoading ? 'Guardando contraseña...' : 'Guardar nueva contraseña' }}
        </button>
      </form>

      <RouterLink
        to="/forgot-password"
        class="mt-6 flex w-full items-center justify-center rounded-lg border border-neutral-600 px-4 py-2.5 text-sm font-semibold text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800"
      >
        Solicitar nuevo enlace
      </RouterLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();

const password = ref<string>('');
const passwordConfirm = ref<string>('');
const isLoading = ref<boolean>(false);
const errorMessage = ref<string | null>(null);

const resetKey = computed<string>(() => {
  const key = route.query.key;
  return typeof key === 'string' ? key.trim() : '';
});

const resetLogin = computed<string>(() => {
  const login = route.query.login;
  if (typeof login !== 'string') {
    return '';
  }

  try {
    return decodeURIComponent(login).trim();
  } catch {
    return login.trim();
  }
});

const hasValidResetParams = computed<boolean>(
  () => resetKey.value.length > 0 && resetLogin.value.length > 0,
);

const handleSubmit = async (): Promise<void> => {
  errorMessage.value = null;

  if (password.value.length < 8) {
    errorMessage.value = 'La contraseña debe tener al menos 8 caracteres.';
    return;
  }

  if (password.value !== passwordConfirm.value) {
    errorMessage.value = 'Las contraseñas no coinciden.';
    return;
  }

  isLoading.value = true;

  try {
    await authStore.resetUserPassword(resetKey.value, resetLogin.value, password.value);
    await router.replace({
      path: '/login',
      query: { passwordReset: 'success' },
    });
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'No se pudo restablecer la contraseña. Intenta de nuevo.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.field-input {
  width: 100%;
  border-radius: 0.125rem;
  border: 1px solid #262626;
  background-color: #171717;
  padding: 0.625rem 0.875rem;
  color: #fafafa;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.field-input::placeholder {
  color: #64748b;
}

.field-input:focus {
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.18);
}
</style>
