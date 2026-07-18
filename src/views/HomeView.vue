<template>
  <div class="min-h-screen bg-neutral-950 text-white">
    <div v-if="loading" class="animate-pulse" aria-label="Cargando página de inicio">
      <div class="min-h-screen bg-neutral-900">
        <div class="mx-auto flex min-h-screen max-w-7xl items-center px-4 md:px-6">
          <div class="w-full max-w-3xl space-y-6">
            <div class="h-4 w-32 rounded bg-neutral-700"></div>
            <div class="h-16 w-full rounded bg-neutral-800"></div>
            <div class="h-5 w-3/4 rounded bg-neutral-800"></div>
            <div class="h-12 w-40 rounded bg-neutral-700"></div>
          </div>
        </div>
      </div>
      <div class="mx-auto grid max-w-7xl gap-8 px-4 py-20 lg:grid-cols-2">
        <div class="h-64 rounded bg-neutral-800"></div>
        <div class="h-64 rounded bg-neutral-900"></div>
      </div>
    </div>

    <template v-else>
      <section
        class="relative isolate flex min-h-screen items-center overflow-hidden border-b border-neutral-800"
        aria-labelledby="home-hero-title"
      >
        <video
          v-if="heroMediaUrl && isVideoMedia(heroMediaUrl)"
          :src="heroMediaUrl"
          class="absolute inset-0 -z-20 h-full w-full object-cover"
          autoplay
          loop
          muted
          playsinline
          aria-hidden="true"
        ></video>
        <img
          v-else-if="heroMediaUrl"
          :src="heroMediaUrl"
          :alt="homeData?.homeHero?.bgMedia?.node?.altText || ''"
          class="absolute inset-0 -z-20 h-full w-full object-cover"
        />

        <div class="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/85 to-neutral-950/35"></div>
        <div
          class="absolute inset-0 -z-10 opacity-20"
          style="background-image: linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.06) 1px, transparent 1px); background-size: 48px 48px;"
        ></div>

        <div class="mx-auto w-full max-w-7xl px-4 py-24 md:px-6 lg:py-32">
          <div class="max-w-4xl">
            <p class="mb-5 text-xs font-bold uppercase tracking-[0.32em] text-amber-400">
              {{ homeData?.homeHero?.overline || 'Ingeniería · Refacciones · Elevación' }}
            </p>
            <component
              :is="heroTitleTag"
              id="home-hero-title"
              class="max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-8xl"
            >
              {{ homeData?.homeHero?.titleText || 'Soluciones industriales que mantienen todo en movimiento' }}
            </component>
            <div
              class="mt-7 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg"
              v-html="
                homeData?.homeHero?.description ||
                'Refacciones especializadas y cotizaciones técnicas para sistemas de elevación.'
              "
            ></div>

            <component
              :is="heroButtonDestination.isInternal ? RouterLink : 'a'"
              v-if="heroButtonDestination.href"
              v-bind="
                heroButtonDestination.isInternal
                  ? { to: heroButtonDestination.href }
                  : {
                      href: heroButtonDestination.href,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    }
              "
              class="mt-9 inline-flex items-center gap-3 rounded-sm border border-amber-400 bg-amber-400 px-6 py-3 text-sm font-bold uppercase tracking-wider text-neutral-950 transition hover:bg-transparent hover:text-amber-300"
            >
              Explorar soluciones
              <span aria-hidden="true">→</span>
            </component>
          </div>
        </div>
      </section>

      <section class="border-b border-neutral-800 bg-neutral-900 py-20 sm:py-24">
        <div class="mx-auto grid max-w-7xl gap-12 px-4 md:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">Capacidad técnica</p>
            <h2 class="mt-4 text-3xl font-black uppercase tracking-tight text-white sm:text-5xl">
              {{ homeData?.homeIntro?.title || 'Precisión para cada proyecto' }}
            </h2>
          </div>

          <div class="border-l-2 border-amber-400 pl-6 sm:pl-8">
            <div
              class="text-base leading-8 text-neutral-300 sm:text-lg"
              v-html="
                homeData?.homeIntro?.description ||
                'Centralizamos el catálogo, la selección técnica y el proceso de cotización para reducir tiempos y asegurar compatibilidad.'
              "
            ></div>
            <component
              :is="introButtonDestination.isInternal ? RouterLink : 'a'"
              v-if="introButtonDestination.href"
              v-bind="
                introButtonDestination.isInternal
                  ? { to: introButtonDestination.href }
                  : {
                      href: introButtonDestination.href,
                      target: '_blank',
                      rel: 'noopener noreferrer',
                    }
              "
              class="mt-7 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-amber-400 transition hover:text-amber-300"
            >
              Conocer más <span aria-hidden="true">→</span>
            </component>
          </div>
        </div>
      </section>

      <section class="bg-neutral-950 py-20 sm:py-24" aria-labelledby="featured-products-title">
        <div class="mx-auto max-w-7xl px-4 md:px-6">
          <div class="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p class="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">
                Catálogo industrial
              </p>
              <h2
                id="featured-products-title"
                class="mt-3 text-3xl font-black uppercase tracking-tight sm:text-5xl"
              >
                Refacciones destacadas
              </h2>
            </div>
            <RouterLink
              to="/catalogo"
              class="text-sm font-bold uppercase tracking-wider text-neutral-400 transition hover:text-white"
            >
              Ver catálogo completo →
            </RouterLink>
          </div>

          <div
            v-if="displayProducts.length > 0"
            class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          >
            <article
              v-for="product in displayProducts"
              :key="product.id"
              class="group flex min-h-full flex-col overflow-hidden rounded-sm border border-neutral-800 bg-neutral-900 transition duration-300 hover:-translate-y-1 hover:border-amber-400/60 hover:shadow-2xl hover:shadow-black/40"
            >
              <RouterLink
                :to="`/producto/${product.slug}`"
                class="relative block aspect-square overflow-hidden bg-neutral-800"
              >
                <img
                  v-if="product.image?.sourceUrl"
                  :src="product.image.sourceUrl"
                  :alt="product.image.altText || product.name"
                  class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                  decoding="async"
                />
                <div v-else class="flex h-full items-center justify-center text-sm text-neutral-500">
                  Imagen no disponible
                </div>
                <span
                  class="absolute left-3 top-3 rounded-sm border border-neutral-700 bg-neutral-950/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-300"
                >
                  {{ product.sku || 'Refacción' }}
                </span>
              </RouterLink>

              <div class="flex flex-1 flex-col p-5">
                <h3 class="text-lg font-bold leading-snug text-white">{{ product.name }}</h3>
                <p class="mt-2 line-clamp-3 text-sm leading-6 text-neutral-400">
                  {{ plainText(product.shortDescription) || 'Componente industrial especializado.' }}
                </p>
                <div class="mt-auto flex items-end justify-between gap-3 pt-6">
                  <p class="text-sm font-bold text-amber-400">
                    {{ productPrice(product.price) }}
                  </p>
                  <RouterLink
                    :to="`/producto/${product.slug}`"
                    class="text-xs font-bold uppercase tracking-wider text-neutral-300 transition hover:text-white"
                  >
                    Ver detalle →
                  </RouterLink>
                </div>
              </div>
            </article>
          </div>

          <p v-else class="rounded border border-neutral-800 bg-neutral-900 p-8 text-neutral-400">
            No hay refacciones disponibles en este momento.
          </p>
        </div>
      </section>

      <p
        v-if="error"
        class="border-t border-red-900/40 bg-red-950/30 px-4 py-3 text-center text-sm text-red-300"
        role="status"
      >
        {{ error }}
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { graphQLClient } from '../api/client';
import {
  GET_HOME_DATA_QUERY,
  GET_LATEST_HOME_PRODUCTS_QUERY,
} from '../api/home';
import type {
  HomeDataQueryResponse,
  HomeDataQueryVariables,
  HomeFeaturedProduct,
  HomePageData,
  HomeTitleTag,
  LatestHomeProductsQueryResponse,
} from '../types/home';

const HOME_PAGE_ID = 120;
const LOCAL_APP_ORIGIN = window.location.origin;

interface LinkDestination {
  href: string | null;
  isInternal: boolean;
}

const homeData = ref<HomePageData | null>(null);
const fallbackProducts = ref<HomeFeaturedProduct[]>([]);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

const selectedProducts = computed<HomeFeaturedProduct[]>(
  () => homeData.value?.productosDestacados?.featuredProducts?.nodes ?? [],
);

const displayProducts = computed<HomeFeaturedProduct[]>(() =>
  selectedProducts.value.length > 0 ? selectedProducts.value : fallbackProducts.value,
);

const heroMediaUrl = computed<string | null>(
  () => homeData.value?.homeHero?.bgMedia?.node?.sourceUrl ?? null,
);

const heroTitleTag = computed<HomeTitleTag>(
  () => homeData.value?.homeHero?.titleTag ?? 'h1',
);

const resolveDestination = (rawUrl: string | null | undefined): LinkDestination => {
  const value = rawUrl?.trim() ?? '';
  if (!value || value === '#') {
    return { href: null, isInternal: false };
  }

  if (value.startsWith('/')) {
    return { href: value, isInternal: true };
  }

  try {
    const parsed = new URL(value, LOCAL_APP_ORIGIN);
    if (parsed.origin === LOCAL_APP_ORIGIN) {
      return {
        href: `${parsed.pathname}${parsed.search}${parsed.hash}`,
        isInternal: true,
      };
    }
    return { href: parsed.href, isInternal: false };
  } catch {
    return { href: value, isInternal: false };
  }
};

const heroButtonDestination = computed<LinkDestination>(() =>
  resolveDestination(homeData.value?.homeHero?.button || '/catalogo'),
);

const introButtonDestination = computed<LinkDestination>(() =>
  resolveDestination(homeData.value?.homeIntro?.button || '/cotizador'),
);

const isVideoMedia = (url: string): boolean => /\.(mp4|webm)(?:[?#].*)?$/i.test(url);

const plainText = (html: string | null): string =>
  (html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ')
    .trim();

const productPrice = (price: string | null | undefined): string =>
  plainText(price ?? '') || 'Precio bajo cotización';

const loadLatestProducts = async (): Promise<void> => {
  const response = await graphQLClient.request<LatestHomeProductsQueryResponse>(
    GET_LATEST_HOME_PRODUCTS_QUERY,
  );
  fallbackProducts.value = response.products?.nodes ?? [];
};

const loadHome = async (): Promise<void> => {
  loading.value = true;
  error.value = null;

  try {
    const variables: HomeDataQueryVariables = { id: HOME_PAGE_ID };
    const response = await graphQLClient.request<HomeDataQueryResponse>(
      GET_HOME_DATA_QUERY,
      variables,
    );
    homeData.value = response.page;

    if (selectedProducts.value.length === 0) {
      await loadLatestProducts();
    }
  } catch (err) {
    console.error('[Home] No se pudo cargar la página de inicio:', err);
    error.value = 'No fue posible cargar todo el contenido dinámico. Mostramos la información disponible.';

    try {
      await loadLatestProducts();
    } catch (productError) {
      console.error('[Home] No se pudieron cargar los productos de respaldo:', productError);
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void loadHome();
});
</script>