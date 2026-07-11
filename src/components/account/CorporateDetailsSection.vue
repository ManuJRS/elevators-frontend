<template>
  <section class="rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl shadow-black/30 md:p-8">
    <div class="mb-6 flex flex-col gap-2 border-b border-slate-700 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Perfil corporativo</p>
        <h2 class="mt-1 text-xl font-bold text-white">Datos corporativos y de envío</h2>
        <p class="mt-1 text-sm text-slate-400">
          Administra la información de facturación y entrega vinculada a tu cuenta B2B.
        </p>
      </div>

      <p v-if="isLoadingInitial" class="text-sm font-medium text-sky-300">Cargando datos...</p>
    </div>

    <div
      v-if="loadErrorMessage"
      class="mb-5 rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-300"
      role="alert"
    >
      {{ loadErrorMessage }}
    </div>

    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label for="account-phone" class="mb-1.5 block text-sm font-semibold text-slate-300">
            Teléfono <span class="text-red-400">*</span>
          </label>
          <input
            id="account-phone"
            v-model="phone"
            type="tel"
            autocomplete="tel"
            required
            :disabled="isFormDisabled"
            placeholder="+52 55 1234 5678"
            class="field-input"
          />
        </div>

        <div>
          <label for="account-company" class="mb-1.5 block text-sm font-semibold text-slate-300">
            Empresa
          </label>
          <input
            id="account-company"
            v-model="company"
            type="text"
            autocomplete="organization"
            :disabled="isFormDisabled"
            placeholder="Elevadores del Norte S.A."
            class="field-input"
          />
        </div>

        <div class="md:col-span-2">
          <label for="account-address" class="mb-1.5 block text-sm font-semibold text-slate-300">
            Dirección de envío <span class="text-red-400">*</span>
          </label>
          <input
            id="account-address"
            v-model="address1"
            type="text"
            autocomplete="street-address"
            required
            :disabled="isFormDisabled"
            placeholder="Av. Industrial 120, Col. Centro"
            class="field-input"
          />
        </div>

        <div>
          <label for="account-city" class="mb-1.5 block text-sm font-semibold text-slate-300">
            Ciudad <span class="text-red-400">*</span>
          </label>
          <input
            id="account-city"
            v-model="city"
            type="text"
            autocomplete="address-level2"
            required
            :disabled="isFormDisabled"
            placeholder="Ciudad de México"
            class="field-input"
          />
        </div>

        <div>
          <label for="account-postcode" class="mb-1.5 block text-sm font-semibold text-slate-300">
            Código postal <span class="text-red-400">*</span>
          </label>
          <input
            id="account-postcode"
            v-model="postcode"
            type="text"
            autocomplete="postal-code"
            required
            :disabled="isFormDisabled"
            placeholder="01000"
            class="field-input"
          />
        </div>
      </div>

      <p
        v-if="saveErrorMessage"
        class="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-300"
        role="alert"
      >
        {{ saveErrorMessage }}
      </p>

      <button
        type="submit"
        :disabled="isFormDisabled || isSaving"
        class="flex w-full items-center justify-center rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-900/30 transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[220px]"
      >
        {{ isSaving ? 'Cargando...' : 'Guardar Cambios' }}
      </button>
    </form>

    <Transition name="toast">
      <div
        v-if="showSuccessToast"
        class="success-toast"
        role="status"
        aria-live="polite"
      >
        ¡Datos actualizados correctamente en WordPress!
      </div>
    </Transition>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from '../../stores/auth';
import type { CustomerDetailsState } from '../../types/auth';

const authStore = useAuthStore();

const phone = ref<string>('');
const company = ref<string>('');
const address1 = ref<string>('');
const city = ref<string>('');
const postcode = ref<string>('');

const isLoadingInitial = ref<boolean>(true);
const loadErrorMessage = ref<string | null>(null);
const saveErrorMessage = ref<string | null>(null);
const showSuccessToast = ref<boolean>(false);

let successToastTimer: ReturnType<typeof setTimeout> | null = null;

const isSaving = computed<boolean>(() => authStore.isUpdatingCustomer);

const isFormDisabled = computed<boolean>(
  () => isLoadingInitial.value || authStore.isLoadingCustomerDetails,
);

const applyDetailsToForm = (details: CustomerDetailsState): void => {
  phone.value = details.phone;
  company.value = details.company;
  address1.value = details.address1;
  city.value = details.city;
  postcode.value = details.postcode;
};

const loadCustomerDetails = async (): Promise<void> => {
  isLoadingInitial.value = true;
  loadErrorMessage.value = null;

  try {
    const details = await authStore.fetchCustomerDetails();
    applyDetailsToForm(details);
  } catch (error) {
    loadErrorMessage.value =
      error instanceof Error
        ? error.message
        : 'No se pudieron cargar los datos corporativos. Intenta de nuevo.';
  } finally {
    isLoadingInitial.value = false;
  }
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

const handleSubmit = async (): Promise<void> => {
  saveErrorMessage.value = null;

  try {
    const success = await authStore.updateCustomerDetails({
      phone: phone.value,
      company: company.value.trim() || undefined,
      address1: address1.value,
      city: city.value,
      postcode: postcode.value,
    });

    if (success) {
      if (authStore.customerDetails) {
        applyDetailsToForm(authStore.customerDetails);
      }

      showSuccessNotification();
    }
  } catch (error) {
    saveErrorMessage.value =
      error instanceof Error
        ? error.message
        : 'No se pudieron guardar los cambios. Intenta de nuevo.';
  }
};

onMounted(() => {
  void loadCustomerDetails();
});
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
