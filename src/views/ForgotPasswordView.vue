<template>
  <div
    class="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-slate-950 px-4 py-10"
  >
    <section
      class="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl shadow-black/40"
    >
      <div class="mb-8 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Recuperación de acceso</p>
        <h1 class="mt-2 text-2xl font-bold text-white">¿Olvidaste tu contraseña?</h1>
        <p class="mt-2 text-sm text-slate-400">
          Ingresa el correo asociado a tu cuenta corporativa y te enviaremos un enlace para restablecerla.
        </p>
      </div>

      <form v-if="!isSuccess" class="space-y-5" @submit.prevent="handleSubmit">
        <div>
          <label for="forgot-email" class="mb-1.5 block text-sm font-semibold text-slate-300">
            Correo electrónico <span class="text-red-400">*</span>
          </label>
          <input
            id="forgot-email"
            v-model="email"
            type="email"
            autocomplete="email"
            required
            placeholder="usuario@empresa.com"
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
          class="flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {{ isLoading ? 'Enviando enlace...' : 'Enviar enlace de recuperación' }}
        </button>
      </form>

      <div
        v-else
        class="rounded-lg border border-emerald-500/40 bg-emerald-950/30 px-4 py-3 text-sm text-emerald-200"
        role="status"
      >
        Si el correo existe, recibirás un enlace para restablecer tu contraseña en unos minutos.
      </div>

      <RouterLink
        to="/login"
        class="mt-6 flex w-full items-center justify-center rounded-lg border border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-slate-500 hover:bg-slate-800"
      >
        Volver a iniciar sesión
      </RouterLink>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();

const email = ref<string>('');
const isLoading = ref<boolean>(false);
const isSuccess = ref<boolean>(false);
const errorMessage = ref<string | null>(null);

const handleSubmit = async (): Promise<void> => {
  errorMessage.value = null;

  const trimmedEmail = email.value.trim();
  if (!trimmedEmail) {
    errorMessage.value = 'El correo electrónico es obligatorio.';
    return;
  }

  isLoading.value = true;

  try {
    await authStore.sendPasswordResetEmail(trimmedEmail);
    isSuccess.value = true;
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'No se pudo enviar el correo. Intenta de nuevo.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.field-input {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid #334155;
  background-color: #0f172a;
  padding: 0.625rem 0.875rem;
  color: #f8fafc;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.field-input::placeholder {
  color: #64748b;
}

.field-input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}
</style>
