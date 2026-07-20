<template>
  <section class="panel-card space-y-6" aria-labelledby="orders-heading">
    <header>
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Pedidos</p>
      <h2 id="orders-heading" class="mt-2 text-2xl font-bold text-white">Mis pedidos</h2>
      <p class="mt-2 text-sm text-neutral-400">
        Historial de compras sincronizado con WooCommerce en tiempo real.
      </p>
    </header>

    <p v-if="isLoading" class="text-sm font-medium text-amber-300">Cargando pedidos...</p>

    <p
      v-if="errorMessage"
      class="rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-300"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <div class="overflow-hidden rounded-sm border border-neutral-700">
      <div class="overflow-x-auto">
        <table class="min-w-full text-left text-sm">
          <thead class="bg-neutral-800/80 text-xs uppercase tracking-wide text-neutral-400">
            <tr>
              <th class="px-4 py-3 font-semibold" scope="col">ID Pedido</th>
              <th class="px-4 py-3 font-semibold" scope="col">Fecha</th>
              <th class="px-4 py-3 font-semibold" scope="col">Estado</th>
              <th class="px-4 py-3 font-semibold" scope="col">Total</th>
              <th class="px-4 py-3 font-semibold text-right" scope="col">Acción</th>
            </tr>
          </thead>
          <tbody v-if="orders.length > 0" class="divide-y divide-neutral-800">
            <tr
              v-for="order in orders"
              :key="order.databaseId"
              class="bg-neutral-900/40 transition hover:bg-neutral-800/50"
            >
              <td class="px-4 py-3 font-semibold text-neutral-100">#{{ order.databaseId }}</td>
              <td class="px-4 py-3 text-neutral-300">{{ formatOrderDate(order.date) }}</td>
              <td class="px-4 py-3">
                <span class="status-pill" :class="getStatusClass(order.status)">
                  {{ formatOrderStatus(order.status) }}
                </span>
              </td>
              <td class="px-4 py-3 font-medium text-neutral-100">
                {{ order.total || '—' }}
              </td>
              <td class="px-4 py-3 text-right">
                <button
                  type="button"
                  class="details-btn"
                  @click="openDetails(order)"
                >
                  Detalles
                </button>
              </td>
            </tr>
          </tbody>
          <tbody v-else-if="!isLoading && !errorMessage">
            <tr>
              <td colspan="5" class="px-4 py-14 text-center">
                <div class="mx-auto flex max-w-sm flex-col items-center gap-3">
                  <span
                    class="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-800 text-neutral-400"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.75"
                      stroke="currentColor"
                      class="h-6 w-6"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </span>
                  <p class="text-base font-semibold text-neutral-200">Aún no tienes pedidos registrados</p>
                  <p class="text-sm text-neutral-500">
                    Cuando completes una compra en la plataforma, aparecerá aquí con su estado y total.
                  </p>
                  <RouterLink
                    to="/catalogo"
                    class="mt-2 rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-400"
                  >
                    Explorar catálogo
                  </RouterLink>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <Teleport to="body">
    <div
      v-if="isModalOpen && selectedOrder"
      class="modal-overlay"
      role="presentation"
      @click.self="closeDetails"
    >
      <div
        class="modal-panel"
        role="dialog"
        aria-modal="true"
        :aria-labelledby="`order-modal-title-${selectedOrder.databaseId}`"
      >
        <header class="modal-header">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-amber-400">Pedido</p>
            <h3
              :id="`order-modal-title-${selectedOrder.databaseId}`"
              class="mt-1 text-xl font-bold text-white"
            >
              Detalles del Pedido #{{ selectedOrder.databaseId }}
            </h3>
          </div>
          <button
            type="button"
            class="modal-close-btn"
            aria-label="Cerrar detalles del pedido"
            @click="closeDetails"
          >
            X
          </button>
        </header>

        <div class="modal-meta">
          <div class="meta-item">
            <span class="meta-label">Fecha</span>
            <span class="meta-value">{{ formatOrderDate(selectedOrder.date) }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Método de pago</span>
            <span class="meta-value">{{ selectedOrder.paymentMethodTitle || '—' }}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Estado</span>
            <span class="status-pill" :class="getStatusClass(selectedOrder.status)">
              {{ formatOrderStatus(selectedOrder.status) }}
            </span>
          </div>
        </div>

        <div class="overflow-hidden rounded-sm border border-neutral-700">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-neutral-800/80 text-xs uppercase tracking-wide text-neutral-400">
              <tr>
                <th class="px-4 py-3 font-semibold" scope="col">Producto</th>
                <th class="px-4 py-3 font-semibold text-center" scope="col">Cantidad</th>
                <th class="px-4 py-3 font-semibold text-right" scope="col">Total</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-800">
              <tr
                v-for="lineItem in selectedOrder.lineItems?.nodes ?? []"
                :key="lineItem.databaseId"
                class="bg-neutral-900/40"
              >
                <td class="px-4 py-3">
                  <p class="font-medium text-neutral-100">{{ getLineItemName(lineItem) }}</p>
                  <p v-if="getLineItemSku(lineItem)" class="mt-0.5 text-xs text-neutral-500">
                    SKU: {{ getLineItemSku(lineItem) }}
                  </p>
                </td>
                <td class="px-4 py-3 text-center text-neutral-300">
                  {{ lineItem.quantity ?? '—' }}
                </td>
                <td class="px-4 py-3 text-right font-medium text-neutral-100">
                  {{ lineItem.total || '—' }}
                </td>
              </tr>
              <tr v-if="(selectedOrder.lineItems?.nodes?.length ?? 0) === 0">
                <td colspan="3" class="px-4 py-6 text-center text-sm text-neutral-500">
                  Este pedido no tiene artículos registrados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer class="modal-footer">
          <span class="text-sm font-semibold uppercase tracking-wide text-neutral-400">Total general</span>
          <span class="text-2xl font-bold text-white">{{ selectedOrder.total || '—' }}</span>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { graphQLClient } from '../../api/client';
import { useAuthStore } from '../../stores/auth';
import type {
  CustomerOrderLineItemNode,
  CustomerOrderNode,
  GetCustomerOrdersResponse,
} from '../../types/order';

const GET_CUSTOMER_ORDERS = `
  query GetCustomerOrders {
    customer {
      orders {
        nodes {
          databaseId
          date
          status
          total
          paymentMethodTitle
          lineItems {
            nodes {
              databaseId
              product {
                node {
                  name
                  sku
                }
              }
              quantity
              total
            }
          }
        }
      }
    }
  }
`;

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PROCESSING: 'Procesando',
  ON_HOLD: 'En espera',
  COMPLETED: 'Completado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
  FAILED: 'Fallido',
  TRASH: 'Eliminado',
};

const authStore = useAuthStore();

const orders = ref<CustomerOrderNode[]>([]);
const isLoading = ref<boolean>(true);
const errorMessage = ref<string | null>(null);
const isModalOpen = ref<boolean>(false);
const selectedOrder = ref<CustomerOrderNode | null>(null);

const openDetails = (order: CustomerOrderNode): void => {
  selectedOrder.value = order;
  isModalOpen.value = true;
};

const closeDetails = (): void => {
  isModalOpen.value = false;
  selectedOrder.value = null;
};

const getLineItemName = (lineItem: CustomerOrderLineItemNode): string =>
  lineItem.product?.node?.name?.trim() || 'Producto sin nombre';

const getLineItemSku = (lineItem: CustomerOrderLineItemNode): string | null => {
  const sku = lineItem.product?.node?.sku?.trim();
  return sku || null;
};

const formatOrderDate = (value: string | null): string => {
  if (!value) {
    return '—';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsedDate);
};

const formatOrderStatus = (status: string | null): string => {
  if (!status) {
    return 'Desconocido';
  }

  const normalized = status.toUpperCase().replace(/^WC-/, '');
  return ORDER_STATUS_LABELS[normalized] ?? status;
};

const getStatusClass = (status: string | null): string => {
  const normalized = status?.toUpperCase().replace(/^WC-/, '') ?? '';

  if (normalized === 'COMPLETED') {
    return 'status-pill--completed';
  }

  if (normalized === 'PROCESSING' || normalized === 'PENDING') {
    return 'status-pill--processing';
  }

  if (normalized === 'CANCELLED' || normalized === 'FAILED' || normalized === 'REFUNDED') {
    return 'status-pill--cancelled';
  }

  return 'status-pill--default';
};

const loadCustomerOrders = async (): Promise<void> => {
  isLoading.value = true;
  errorMessage.value = null;

  if (!authStore.token) {
    isLoading.value = false;
    errorMessage.value = 'Debes iniciar sesión para consultar tu historial de pedidos.';
    return;
  }

  try {
    const response = await graphQLClient.request<GetCustomerOrdersResponse>(
      GET_CUSTOMER_ORDERS,
      undefined,
      {
        Authorization: `Bearer ${authStore.token}`,
      },
    );

    orders.value = response.customer?.orders?.nodes ?? [];
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : 'No se pudieron cargar los pedidos. Intenta de nuevo.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  void loadCustomerOrders();
});
</script>

<style scoped>
.panel-card {
  border-radius: 0.125rem;
  border: 1px solid #262626;
  background-color: #171717;
  padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
}

@media (min-width: 768px) {
  .panel-card {
    padding: 2rem;
  }
}

.status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 9999px;
  padding: 0.25rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.status-pill--completed {
  border: 1px solid rgba(52, 211, 153, 0.35);
  background-color: rgba(6, 78, 59, 0.35);
  color: #6ee7b7;
}

.status-pill--processing {
  border: 1px solid rgba(56, 189, 248, 0.35);
  background-color: rgba(12, 74, 110, 0.35);
  color: #fbbf24;
}

.status-pill--cancelled {
  border: 1px solid rgba(248, 113, 113, 0.35);
  background-color: rgba(127, 29, 29, 0.35);
  color: #fca5a5;
}

.status-pill--default {
  border: 1px solid rgba(148, 163, 184, 0.35);
  background-color: rgba(51, 65, 85, 0.35);
  color: #a3a3a3;
}

.details-btn {
  border-radius: 0.125rem;
  border: 1px solid #475569;
  background-color: #262626;
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #e2e8f0;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.details-btn:hover {
  border-color: #fbbf24;
  background-color: #0c4a6e;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.6);
  padding: 1rem;
  backdrop-filter: blur(4px);
}

.modal-panel {
  width: 100%;
  max-width: 42rem;
  max-height: calc(100vh - 2rem);
  overflow-y: auto;
  border-radius: 0.125rem;
  border: 1px solid #262626;
  background-color: #171717;
  padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.65);
}

@media (min-width: 768px) {
  .modal-panel {
    padding: 2rem;
  }
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #334155;
}

.modal-close-btn {
  display: flex;
  height: 2rem;
  width: 2rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.125rem;
  border: 1px solid #475569;
  background-color: #262626;
  color: #e2e8f0;
  font-size: 0.875rem;
  font-weight: 700;
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}

.modal-close-btn:hover {
  border-color: #fbbf24;
  background-color: #0c4a6e;
  color: #ffffff;
}

.modal-meta {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}

@media (min-width: 640px) {
  .modal-meta {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.meta-item {
  border-radius: 0.125rem;
  border: 1px solid #262626;
  background-color: #0a0a0a;
  padding: 0.75rem 1rem;
}

.meta-label {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #64748b;
}

.meta-value {
  display: block;
  margin-top: 0.35rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #e2e8f0;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid #334155;
}
</style>
