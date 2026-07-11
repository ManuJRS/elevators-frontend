<template>
  <section class="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-black/30 md:p-8">
    <div class="mb-6 border-b border-slate-700 pb-5">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Acceso seguro</p>
      <h2 class="mt-1 text-xl font-bold text-white">Seguridad y Contraseña</h2>
      <p class="mt-1 text-sm text-slate-400">
        Actualiza tu contraseña de acceso corporativo. El cambio se sincroniza directamente con WordPress.
      </p>
    </div>

    <form class="space-y-5" @submit.prevent="handleSubmit">
      <div class="space-y-4">
        <div>
          <label for="account-new-password" class="mb-1.5 block text-sm font-semibold text-slate-300">
            Nueva Contraseña <span class="text-red-400">*</span>
          </label>
          <input
            id="account-new-password"
            v-model="newPassword"
            type="password"
            autocomplete="new-password"
            required
            :minlength="MIN_PASSWORD_LENGTH"
            :disabled="isLoadingPassword"
            placeholder="Mínimo 8 caracteres"
            class="field-input"
          />
        </div>

        <div>
          <label for="account-confirm-password" class="mb-1.5 block text-sm font-semibold text-slate-300">
            Confirmar Nueva Contraseña <span class="text-red-400">*</span>
          </label>
          <input
            id="account-confirm-password"
            v-model="confirmPassword"
            type="password"
            autocomplete="new-password"
            required
            :minlength="MIN_PASSWORD_LENGTH"
            :disabled="isLoadingPassword"
            placeholder="Repite la nueva contraseña"
            class="field-input"
          />
        </div>
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
        :disabled="isLoadingPassword"
        class="flex w-full items-center justify-center rounded-lg border border-amber-500/30 bg-amber-600/90 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/20 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[220px]"
      >
        {{ isLoadingPassword ? 'Cargando...' : 'Actualizar Contraseña' }}
      </button>
    </form>

    <Transition name="toast">
      <div
        v-if="showSuccessToast"
        class="success-toast"
        role="status"
        aria-live="polite"
      >
        ¡Contraseña actualizada correctamente!
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '../../stores/auth';

const MIN_PASSWORD_LENGTH = 8;

const authStore = useAuthStore();

const newPassword = ref<string>('');
const confirmPassword = ref<string>('');
const errorMessage = ref<string | null>(null);
const showSuccessToast = ref<boolean>(false);

let successToastTimer: ReturnType<typeof setTimeout> | null = null;

const isLoadingPassword = computed<boolean>(() => authStore.isChangingPassword);

const clearPasswordFields = (): void => {
  newPassword.value = '';
  confirmPassword.value = '';
};

const showSuccessNotification = (): void => {
  if (successToastTimer) {
    clearTimeout(successToastTimer);
  }

  showSuccessToast.value = true;

  successToastTimer = setTimeout(() => {
    showSuccessToast.value = false;
    successToastTimer = null;
  }, 4500);
};

const validatePasswordForm = (): string | null => {
  const trimmedPassword = newPassword.value.trim();
  const trimmedConfirm = confirmPassword.value.trim();

  if (!trimmedPassword) {
    return 'La nueva contraseña es obligatoria.';
  }

  if (trimmedPassword.length < MIN_PASSWORD_LENGTH) {
    return `La contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres.`;
  }

  if (!trimmedConfirm) {
    return 'Debes confirmar la nueva contraseña.';
  }

  if (trimmedPassword !== trimmedConfirm) {
    return 'Las contraseñas no coinciden.';
  }

  return null;
};

const handleSubmit = async (): Promise<void> => {
  errorMessage.value = null;

  const validationError = validatePasswordForm();
  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  try {
    const success = await authStore.changePassword(newPassword.value);

    if (success) {
      clearPasswordFields();
      showSuccessNotification();
    }
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No se pudo actualizar la contraseña. Intenta de nuevo.';
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

.field-input:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.success-toast {
  position: fixed;
  right: 1.25rem;
  bottom: 1.25rem;
  z-index: 50;
  max-width: 24rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(52, 211, 153, 0.35);
  background: rgba(6, 78, 59, 0.95);
  padding: 0.875rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #d1fae5;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(0.75rem);
}
</style>
