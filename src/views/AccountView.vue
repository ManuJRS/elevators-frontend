<template>
  <div class="min-h-[calc(100vh-5rem)] bg-slate-950 px-4 py-6 md:px-6 md:py-8">
    <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 lg:flex-row">
      <!-- Sidebar -->
      <aside
        class="w-full shrink-0 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl shadow-black/40 lg:w-72 lg:p-5"
        aria-label="Menú de cuenta"
      >
        <div class="mb-6 border-b border-slate-700 pb-5">
          <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Mi cuenta</p>
          <h1 class="mt-2 text-xl font-bold text-white">Panel corporativo</h1>
          <p class="mt-1 truncate text-sm text-slate-400">
            {{ authStore.userEmail || 'Cuenta B2B' }}
          </p>
        </div>

        <nav class="space-y-1">
          <button
            v-for="item in sidebarItems"
            :key="item.id"
            type="button"
            class="sidebar-link"
            :class="{ 'sidebar-link--active': activeTab === item.id }"
            :aria-current="activeTab === item.id ? 'page' : undefined"
            @click="setActiveTab(item.id)"
          >
            <span class="sidebar-link__icon" aria-hidden="true">
              <component :is="item.icon" />
            </span>
            <span class="min-w-0 flex-1 text-left">
              <span class="block text-sm font-semibold">{{ item.label }}</span>
              <span class="block truncate text-xs text-slate-500">{{ item.description }}</span>
            </span>
          </button>
        </nav>
      </aside>

      <!-- Main content -->
      <main class="min-w-0 flex-1">
        <!-- Escritorio -->
        <section
          v-if="activeTab === 'escritorio'"
          class="panel-card space-y-6"
          aria-labelledby="dashboard-heading"
        >
          <header>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Escritorio</p>
            <h2 id="dashboard-heading" class="mt-2 text-2xl font-bold text-white">
              ¡Bienvenido de vuelta, {{ welcomeName }}!
            </h2>
            <p class="mt-2 max-w-2xl text-sm text-slate-400">
              Desde aquí puedes consultar pedidos, revisar cotizaciones y mantener actualizados los
              datos operativos de tu empresa.
            </p>
          </header>

          <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
            <button
              type="button"
              class="quick-card group"
              @click="setActiveTab('pedidos')"
            >
              <span class="quick-card__icon">
                <IconOrders />
              </span>
              <span>
                <span class="block text-base font-semibold text-white group-hover:text-sky-300">
                  Ver mis pedidos
                </span>
                <span class="mt-1 block text-sm text-slate-400">
                  Historial de compras y estados de entrega en WooCommerce.
                </span>
              </span>
            </button>

            <button
              type="button"
              class="quick-card group"
              @click="setActiveTab('cotizaciones')"
            >
              <span class="quick-card__icon">
                <IconQuotes />
              </span>
              <span>
                <span class="block text-base font-semibold text-white group-hover:text-sky-300">
                  Revisar cotizaciones
                </span>
                <span class="mt-1 block text-sm text-slate-400">
                  Solicitudes enviadas al cotizador industrial de la plataforma.
                </span>
              </span>
            </button>

            <button
              type="button"
              class="quick-card group"
              @click="setActiveTab('datos')"
            >
              <span class="quick-card__icon">
                <IconCompany />
              </span>
              <span>
                <span class="block text-base font-semibold text-white group-hover:text-sky-300">
                  Actualizar datos corporativos
                </span>
                <span class="mt-1 block text-sm text-slate-400">
                  Teléfono, empresa y dirección de envío sincronizados con WordPress.
                </span>
              </span>
            </button>

            <RouterLink to="/catalogo" class="quick-card group">
              <span class="quick-card__icon">
                <IconCatalog />
              </span>
              <span>
                <span class="block text-base font-semibold text-white group-hover:text-sky-300">
                  Ir al catálogo
                </span>
                <span class="mt-1 block text-sm text-slate-400">
                  Explora refacciones y agrega productos al carrito híbrido.
                </span>
              </span>
            </RouterLink>
          </div>
        </section>

        <!-- Pedidos -->
        <CustomerOrdersSection v-else-if="activeTab === 'pedidos'" />

        <!-- Cotizaciones -->
        <section
          v-else-if="activeTab === 'cotizaciones'"
          class="panel-card space-y-6"
          aria-labelledby="quotes-heading"
        >
          <header>
            <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Cotizaciones</p>
            <h2 id="quotes-heading" class="mt-2 text-2xl font-bold text-white">Mis cotizaciones</h2>
            <p class="mt-2 text-sm text-slate-400">
              Solicitudes enviadas al cotizador. Vista de demostración con estados de seguimiento.
            </p>
          </header>

          <div class="space-y-3">
            <article
              v-for="quote in placeholderQuotes"
              :key="quote.id"
              class="quote-card"
            >
              <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {{ quote.id }}
                  </p>
                  <h3 class="mt-1 text-base font-semibold text-white">{{ quote.title }}</h3>
                  <p class="mt-1 text-sm text-slate-400">Enviada el {{ quote.date }}</p>
                </div>

                <span class="status-badge" :class="quote.statusClass">
                  {{ quote.status }}
                </span>
              </div>
            </article>

            <p class="rounded-lg border border-dashed border-slate-700 bg-slate-900/50 px-4 py-3 text-center text-sm text-slate-500">
              Las cotizaciones reales se conectarán al cotizador en una fase posterior del proyecto.
            </p>
          </div>
        </section>

        <!-- Datos corporativos + seguridad -->
        <section
          v-else-if="activeTab === 'datos'"
          class="space-y-6"
          aria-labelledby="corporate-data-heading"
        >
          <div class="grid grid-cols-1 gap-6 xl:grid-cols-2 xl:items-start">
            <CorporateDetailsSection />
            <PasswordChangeSection />
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h, ref, type FunctionalComponent } from 'vue';
import { RouterLink } from 'vue-router';
import CorporateDetailsSection from '../components/account/CorporateDetailsSection.vue';
import CustomerOrdersSection from '../components/account/CustomerOrdersSection.vue';
import PasswordChangeSection from '../components/account/PasswordChangeSection.vue';
import { useAuthStore } from '../stores/auth';

type AccountTab = 'escritorio' | 'pedidos' | 'cotizaciones' | 'datos';

type QuoteStatus = 'En revisión' | 'Aprobado';

interface SidebarItem {
  id: AccountTab;
  label: string;
  description: string;
  icon: FunctionalComponent;
}

interface PlaceholderQuote {
  id: string;
  title: string;
  date: string;
  status: QuoteStatus;
  statusClass: string;
}

const authStore = useAuthStore();
const activeTab = ref<AccountTab>('escritorio');

const welcomeName = computed<string>(() => {
  const displayName = authStore.displayName?.trim();
  if (displayName) {
    return displayName.split(' ')[0] ?? displayName;
  }

  const emailPrefix = authStore.userEmail?.split('@')[0];
  return emailPrefix || 'Usuario';
});

const placeholderQuotes: PlaceholderQuote[] = [
  {
    id: 'COT-2026-0142',
    title: 'Modernización de cabina — Torre Corporativa Norte',
    date: '08 jul 2026',
    status: 'En revisión',
    statusClass: 'status-badge--review',
  },
  {
    id: 'COT-2026-0098',
    title: 'Paquete de refacciones para mantenimiento preventivo',
    date: '22 jun 2026',
    status: 'Aprobado',
    statusClass: 'status-badge--approved',
  },
];

const iconProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  fill: 'none',
  viewBox: '0 0 24 24',
  stroke: 'currentColor',
  'stroke-width': '1.75',
  class: 'h-5 w-5',
};

const IconDashboard: FunctionalComponent = () =>
  h('svg', iconProps, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z',
    }),
  ]);

const IconOrders: FunctionalComponent = () =>
  h('svg', iconProps, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    }),
  ]);

const IconQuotes: FunctionalComponent = () =>
  h('svg', iconProps, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    }),
  ]);

const IconCompany: FunctionalComponent = () =>
  h('svg', iconProps, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2m-16 0H3m2 0h10M9 7h1m-1 4h1m4-4h1m-1 4h1',
    }),
  ]);

const IconCatalog: FunctionalComponent = () =>
  h('svg', iconProps, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M4 6h16M4 10h16M4 14h10M4 18h6',
    }),
  ]);

const sidebarItems: SidebarItem[] = [
  {
    id: 'escritorio',
    label: 'Escritorio',
    description: 'Resumen y accesos rápidos',
    icon: IconDashboard,
  },
  {
    id: 'pedidos',
    label: 'Mis Pedidos',
    description: 'Historial de compras',
    icon: IconOrders,
  },
  {
    id: 'cotizaciones',
    label: 'Mis Cotizaciones',
    description: 'Solicitudes al cotizador',
    icon: IconQuotes,
  },
  {
    id: 'datos',
    label: 'Datos de Envío y Empresa',
    description: 'Facturación y entrega',
    icon: IconCompany,
  },
];

const setActiveTab = (tab: AccountTab): void => {
  activeTab.value = tab;
};
</script>

<style scoped>
.panel-card {
  border-radius: 1rem;
  border: 1px solid #334155;
  background-color: #0f172a;
  padding: 1.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.45);
}

@media (min-width: 768px) {
  .panel-card {
    padding: 2rem;
  }
}

.sidebar-link {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid transparent;
  border-left: 3px solid transparent;
  padding: 0.75rem;
  color: #cbd5e1;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;
}

.sidebar-link:hover {
  background-color: #1e293b;
  color: #f8fafc;
}

.sidebar-link--active {
  border-left-color: #38bdf8;
  background-color: rgba(14, 165, 233, 0.1);
  color: #f8fafc;
}

.sidebar-link__icon {
  display: flex;
  height: 2.25rem;
  width: 2.25rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background-color: #1e293b;
  color: #7dd3fc;
}

.sidebar-link--active .sidebar-link__icon {
  background-color: rgba(14, 165, 233, 0.2);
  color: #bae6fd;
}

.quick-card {
  display: flex;
  gap: 1rem;
  border-radius: 0.875rem;
  border: 1px solid #334155;
  background-color: #111827;
  padding: 1.25rem;
  text-align: left;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    transform 0.15s ease;
}

.quick-card:hover {
  border-color: #38bdf8;
  background-color: #172554;
  transform: translateY(-1px);
}

.quick-card__icon {
  display: flex;
  height: 2.75rem;
  width: 2.75rem;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  background-color: #1e293b;
  color: #7dd3fc;
}

.quote-card {
  border-radius: 0.875rem;
  border: 1px solid #334155;
  background-color: #111827;
  padding: 1rem 1.25rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  padding: 0.35rem 0.85rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.status-badge--review {
  border: 1px solid rgba(251, 191, 36, 0.35);
  background-color: rgba(120, 53, 15, 0.35);
  color: #fcd34d;
}

.status-badge--approved {
  border: 1px solid rgba(52, 211, 153, 0.35);
  background-color: rgba(6, 78, 59, 0.35);
  color: #6ee7b7;
}
</style>
