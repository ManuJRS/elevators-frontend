<template>
  <div
    class="flex min-h-[calc(100vh-5rem)] items-center justify-center bg-slate-950 px-4 py-10"
  >
    <section
      class="w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 p-8 shadow-2xl shadow-black/40"
    >
      <div class="mb-8 text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Alta corporativa</p>
        <h1 class="mt-2 text-2xl font-bold text-white">Crear cuenta empresarial</h1>
        <p class="mt-2 text-sm text-slate-400">
          Registra tus datos de facturación y envío para cotizar y comprar en la plataforma híbrida.
        </p>
      </div>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-300">Acceso</h2>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="md:col-span-1">
              <label for="register-username" class="mb-1.5 block text-sm font-semibold text-slate-300">
                Nombre de usuario <span class="text-red-400">*</span>
              </label>
              <input
                id="register-username"
                v-model="username"
                type="text"
                autocomplete="username"
                required
                placeholder="usuario_empresa"
                class="field-input"
              />
            </div>

            <div class="md:col-span-1">
              <label for="register-first-name" class="mb-1.5 block text-sm font-semibold text-slate-300">
                Nombre <span class="text-red-400">*</span>
              </label>
              <input
                id="register-first-name"
                v-model="firstName"
                type="text"
                autocomplete="given-name"
                required
                placeholder="Juan"
                class="field-input"
              />
            </div>

            <div class="md:col-span-1">
              <label for="register-last-name" class="mb-1.5 block text-sm font-semibold text-slate-300">
                Apellidos <span class="text-red-400">*</span>
              </label>
              <input
                id="register-last-name"
                v-model="lastName"
                type="text"
                autocomplete="family-name"
                required
                placeholder="Pérez García"
                class="field-input"
              />
            </div>

            <div class="md:col-span-1">
              <label for="register-email" class="mb-1.5 block text-sm font-semibold text-slate-300">
                Correo electrónico <span class="text-red-400">*</span>
              </label>
              <input
                id="register-email"
                v-model="email"
                type="email"
                autocomplete="email"
                required
                placeholder="usuario@empresa.com"
                class="field-input"
              />
            </div>

            <div class="md:col-span-2">
              <label for="register-password" class="mb-1.5 block text-sm font-semibold text-slate-300">
                Contraseña <span class="text-red-400">*</span>
              </label>
              <input
                id="register-password"
                v-model="password"
                type="password"
                autocomplete="new-password"
                required
                minlength="8"
                placeholder="Mínimo 8 caracteres"
                class="field-input"
              />
            </div>
          </div>
        </div>

        <div class="space-y-4 border-t border-slate-700 pt-6">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-300">Facturación</h2>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label for="register-phone" class="mb-1.5 block text-sm font-semibold text-slate-300">
                Teléfono de facturación <span class="text-red-400">*</span>
              </label>
              <input
                id="register-phone"
                v-model="phone"
                type="tel"
                autocomplete="tel"
                required
                placeholder="+52 55 1234 5678"
                class="field-input"
              />
            </div>

            <div>
              <label for="register-company" class="mb-1.5 block text-sm font-semibold text-slate-300">
                Nombre de la empresa
              </label>
              <input
                id="register-company"
                v-model="company"
                type="text"
                autocomplete="organization"
                placeholder="Elevadores del Norte S.A."
                class="field-input"
              />
            </div>
          </div>
        </div>

        <div class="space-y-4 border-t border-slate-700 pt-6">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-300">Envío</h2>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div class="md:col-span-2">
              <label for="register-address" class="mb-1.5 block text-sm font-semibold text-slate-300">
                Dirección de envío <span class="text-red-400">*</span>
              </label>
              <input
                id="register-address"
                v-model="address1"
                type="text"
                autocomplete="street-address"
                required
                placeholder="Av. Industrial 120, Col. Centro"
                class="field-input"
              />
            </div>

            <div>
              <label for="register-city" class="mb-1.5 block text-sm font-semibold text-slate-300">
                Ciudad <span class="text-red-400">*</span>
              </label>
              <input
                id="register-city"
                v-model="city"
                type="text"
                autocomplete="address-level2"
                required
                placeholder="Ciudad de México"
                class="field-input"
              />
            </div>

            <div>
              <label for="register-postcode" class="mb-1.5 block text-sm font-semibold text-slate-300">
                Código postal <span class="text-red-400">*</span>
              </label>
              <input
                id="register-postcode"
                v-model="postcode"
                type="text"
                autocomplete="postal-code"
                required
                placeholder="01000"
                class="field-input"
              />
            </div>
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
          :disabled="isLoading"
          class="flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {{ isLoading ? 'Creando cuenta corporativa...' : 'Registrarse' }}
        </button>
      </form>

      <p class="mt-6 text-center text-sm text-slate-400">
        ¿Ya tienes cuenta?
        <RouterLink to="/login" class="font-semibold text-sky-400 hover:text-sky-300">
          Inicia sesión
        </RouterLink>
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import type { RegisterCorporateInput } from '../types/auth';

const authStore = useAuthStore();
const router = useRouter();

const username = ref<string>('');
const firstName = ref<string>('');
const lastName = ref<string>('');
const email = ref<string>('');
const password = ref<string>('');
const phone = ref<string>('');
const company = ref<string>('');
const address1 = ref<string>('');
const city = ref<string>('');
const postcode = ref<string>('');

const isLoading = ref<boolean>(false);
const errorMessage = ref<string | null>(null);

const validateForm = (): string | null => {
  if (!username.value.trim()) return 'El nombre de usuario es obligatorio.';
  if (!firstName.value.trim()) return 'El nombre es obligatorio.';
  if (!lastName.value.trim()) return 'Los apellidos son obligatorios.';
  if (!email.value.trim()) return 'El correo electrónico es obligatorio.';
  if (!password.value.trim()) return 'La contraseña es obligatoria.';
  if (password.value.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!phone.value.trim()) return 'El teléfono de facturación es obligatorio.';
  if (!address1.value.trim()) return 'La dirección de envío es obligatoria.';
  if (!city.value.trim()) return 'La ciudad es obligatoria.';
  if (!postcode.value.trim()) return 'El código postal es obligatorio.';

  return null;
};

const buildRegisterPayload = (): RegisterCorporateInput => ({
  username: username.value.trim(),
  firstName: firstName.value.trim(),
  lastName: lastName.value.trim(),
  email: email.value.trim(),
  password: password.value,
  phone: phone.value.trim(),
  company: company.value.trim() || undefined,
  address1: address1.value.trim(),
  city: city.value.trim(),
  postcode: postcode.value.trim(),
});

const handleSubmit = async (): Promise<void> => {
  errorMessage.value = null;

  const validationError = validateForm();
  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  isLoading.value = true;

  try {
    await authStore.register(buildRegisterPayload());
    await router.replace('/catalogo');
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : 'No se pudo completar el registro. Intenta de nuevo.';
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
