<template>
  <footer class="mt-auto border-t border-neutral-800 bg-neutral-900 text-neutral-300">
    <div class="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
      <p v-if="isLoading" class="text-sm text-neutral-500">Cargando menú de pie de página…</p>

      <p v-else-if="error" class="text-sm text-red-400/90" role="alert">
        {{ error }}
      </p>

      <div
        v-else-if="columns.length > 0"
        class="grid grid-cols-2 gap-8 md:grid-cols-4"
      >
        <section v-for="column in columns" :key="column.id">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-white">
            {{ column.title }}
          </h2>

          <ul v-if="column.links.length > 0" class="mt-4 space-y-3">
            <li v-for="subItem in column.links" :key="subItem.id">
              <!-- Mapa embebido: solo iframe, sin texto ni SVG -->
              <iframe
                v-if="subItem.isMap && subItem.mapEmbedSrc"
                :src="subItem.mapEmbedSrc"
                :title="subItem.label || 'Mapa de ubicación'"
                class="h-44 w-full rounded border border-neutral-800 bg-neutral-950"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                allowfullscreen
              />

              <!-- Enlace interno SPA -->
              <RouterLink
                v-else-if="!subItem.isMap && subItem.internalTo"
                :to="subItem.internalTo"
                class="group inline-flex items-center text-sm text-neutral-400 transition hover:text-white"
              >
                <img
                  v-if="subItem.footerSvg"
                  :src="subItem.footerSvg"
                  :alt="`${subItem.label} icon`"
                  class="mr-2 h-5 w-5 object-contain opacity-70 invert transition-all group-hover:opacity-100"
                  width="20"
                  height="20"
                  loading="lazy"
                  decoding="async"
                />
                <span>{{ subItem.label }}</span>
              </RouterLink>

              <!-- Enlace externo / hash / tel / mailto -->
              <a
                v-else-if="!subItem.isMap"
                :href="subItem.externalHref ?? '#'"
                class="group inline-flex items-center text-sm text-neutral-400 transition hover:text-white"
                :target="isExternalAbsolute(subItem.externalHref) ? '_blank' : undefined"
                :rel="isExternalAbsolute(subItem.externalHref) ? 'noopener noreferrer' : undefined"
              >
                <img
                  v-if="subItem.footerSvg"
                  :src="subItem.footerSvg"
                  :alt="`${subItem.label} icon`"
                  class="mr-2 h-5 w-5 object-contain opacity-70 invert transition-all group-hover:opacity-100"
                  width="20"
                  height="20"
                  loading="lazy"
                  decoding="async"
                />
                <span>{{ subItem.label }}</span>
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
        <p>{{ menuData.copyrightText }}</p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { buildFooterColumns, fetchFooterMenu } from '../../api/menu';
import type { FooterColumn, FooterMenuData } from '../../types/menu';

const router = useRouter();

const menuData = ref<FooterMenuData>({
  copyrightText: `© ${new Date().getFullYear()} Citizacion Ecommerce. Todos los derechos reservados.`,
  nodes: [],
});
const isLoading = ref<boolean>(false);
const error = ref<string | null>(null);

/**
 * Columnas reactivas: raíces (parentId null/vacío) = títulos;
 * hijos agrupados bajo su padre = listas / mapas de cada columna.
 */
const columns = computed<FooterColumn[]>(() => buildFooterColumns(menuData.value.nodes, router));

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
    menuData.value = await fetchFooterMenu();
  } catch (err) {
    console.error('[Footer] No se pudo cargar el menú FOOTER:', err);
    error.value = 'No se pudo cargar el menú de pie de página.';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  void loadFooterMenu();
});
</script>
