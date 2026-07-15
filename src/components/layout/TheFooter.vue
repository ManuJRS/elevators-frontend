<template>
  <footer class="mt-auto border-t border-neutral-800 bg-neutral-900 text-neutral-300">
    <div class="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
      <p v-if="isLoading" class="text-sm text-neutral-500">Cargando menú de pie de página…</p>

      <p v-else-if="error" class="text-sm text-red-400/90" role="alert">
        {{ error }}
      </p>

      <div
        v-else-if="columns.length > 0"
        class="grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-10"
      >
        <section v-for="column in columns" :key="column.id">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-white">
            {{ column.title }}
          </h2>

          <ul v-if="column.links.length > 0" class="mt-4 space-y-2">
            <li v-for="link in column.links" :key="link.id">
              <RouterLink
                v-if="link.internalTo"
                :to="link.internalTo"
                class="text-sm text-neutral-400 transition hover:text-white"
              >
                {{ link.label }}
              </RouterLink>

              <a
                v-else
                :href="link.externalHref ?? '#'"
                class="text-sm text-neutral-400 transition hover:text-white"
                :target="isExternalAbsolute(link.externalHref) ? '_blank' : undefined"
                :rel="isExternalAbsolute(link.externalHref) ? 'noopener noreferrer' : undefined"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>

    <div class="border-t border-neutral-800 bg-neutral-950">
      <div
        class="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-center text-xs text-neutral-500 sm:flex-row sm:text-left md:px-6"
      >
        <p>&copy; {{ currentYear }} Citizacion Ecommerce. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { buildFooterColumns, fetchFooterMenuNodes } from '../../api/menu';
import type { FooterColumn, WpMenuItemNode } from '../../types/menu';

const router = useRouter();

const menuNodes = ref<WpMenuItemNode[]>([]);
const isLoading = ref<boolean>(false);
const error = ref<string | null>(null);

/** Columnas: raíces = títulos; hijos = enlaces agrupados bajo cada padre. */
const columns = computed<FooterColumn[]>(() => buildFooterColumns(menuNodes.value, router));

const currentYear = computed<number>(() => new Date().getFullYear());

const isExternalAbsolute = (href: string | null | undefined): boolean => {
  if (!href || href === '#') return false;
  try {
    const parsed = new URL(href, window.location.origin);
    return parsed.origin !== window.location.origin;
  } catch {
    return false;
  }
};

const loadFooterMenu = async (): Promise<void> => {
  isLoading.value = true;
  error.value = null;

  try {
    menuNodes.value = await fetchFooterMenuNodes();
  } catch (err) {
    console.error('[Footer] No se pudo cargar el menú FOOTER:', err);
    error.value = 'No se pudo cargar el menú de pie de página.';
    menuNodes.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  void loadFooterMenu();
});
</script>
