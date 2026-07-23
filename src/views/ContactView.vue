<template>
  <div class="min-h-screen bg-neutral-950 text-white">
    <div v-if="loading" class="animate-pulse" aria-label="Cargando página de contacto">
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
        <div class="aspect-video rounded bg-neutral-800"></div>
        <div class="h-64 rounded bg-neutral-900"></div>
      </div>
    </div>

    <template v-else-if="error && !contactData">
      <div class="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 py-24 text-center">
        <p class="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">Contacto</p>
        <h1 class="mt-4 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
          No se pudo cargar la página
        </h1>
        <p class="mt-4 text-neutral-400" role="alert">{{ error }}</p>
        <button
          type="button"
          class="mt-8 inline-flex items-center gap-2 rounded-sm border border-amber-400 bg-amber-400 px-6 py-3 text-sm font-bold uppercase tracking-wider text-neutral-950 transition hover:bg-transparent hover:text-amber-300"
          @click="loadContact"
        >
          Reintentar
        </button>
      </div>
    </template>

    <template v-else>
      <!-- Hero (mismo patrón visual que Home) -->
      <section
        class="relative isolate flex min-h-screen items-center overflow-hidden border-b border-neutral-800"
        aria-labelledby="contact-hero-title"
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
          :alt="contactHero?.bgMedia?.node?.altText || ''"
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
              {{ contactHero?.overline || 'Contacto · Soporte técnico' }}
            </p>
            <component
              :is="heroTitleTag"
              id="contact-hero-title"
              class="max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl lg:text-8xl"
            >
              {{ contactHero?.titleText || 'Hablemos de tu próximo proyecto' }}
            </component>
            <div
              class="mt-7 max-w-2xl text-base leading-7 text-neutral-300 sm:text-lg"
              v-html="
                contactHero?.description ||
                'Estamos listos para cotizar refacciones, resolver dudas técnicas y acompañar tu operación.'
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
                      target: heroButtonDestination.target ?? '_blank',
                      rel: 'noopener noreferrer',
                    }
              "
              class="mt-9 inline-flex items-center gap-3 rounded-sm border border-amber-400 bg-amber-400 px-6 py-3 text-sm font-bold uppercase tracking-wider text-neutral-950 transition hover:bg-transparent hover:text-amber-300"
            >
              Escríbenos
              <span aria-hidden="true">→</span>
            </component>
          </div>
        </div>
      </section>

      <!-- Detalles + mapa -->
      <section
        class="border-b border-neutral-800 bg-neutral-900 py-16 sm:py-24"
        aria-labelledby="contact-details-title"
      >
        <div class="mx-auto max-w-7xl px-4 md:px-6">
          <div class="mb-10 max-w-2xl">
            <p class="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">Ubicación y canales</p>
            <h2
              id="contact-details-title"
              class="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl"
            >
              Datos de contacto
            </h2>
          </div>

          <div class="grid grid-cols-1 gap-1 lg:grid-cols-2 lg:items-stretch">
            <div
              class="relative min-h-[280px] w-full overflow-hidden rounded-sm border border-neutral-800 bg-neutral-950 lg:min-h-0 lg:h-auto"
            >
              <div
                v-if="contactDetails?.mapsIframe"
                class="contact-map absolute inset-0 [&_iframe]:h-full [&_iframe]:w-full [&_iframe]:border-0"
                v-html="contactDetails.mapsIframe"
              ></div>
              <div
                v-else
                class="flex h-full min-h-[280px] items-center justify-center bg-neutral-950 text-sm text-neutral-500 lg:absolute lg:inset-0 lg:min-h-0"
              >
                Mapa no disponible
              </div>
            </div>

            <div class="flex h-full flex-col justify-center space-y-6 border border-neutral-800 bg-neutral-950 p-6 sm:p-8">
              <article class="border-b border-neutral-800 pb-6">
                <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400">Dirección</p>
                <p class="mt-2 whitespace-pre-line text-base leading-7 text-neutral-200">
                  {{ contactDetails?.addressText || 'Dirección por confirmar' }}
                </p>
              </article>

              <article class="border-b border-neutral-800 pb-6">
                <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400">Teléfono</p>
                <a
                  v-if="contactDetails?.phoneNumber"
                  :href="`tel:${plainPhone(contactDetails.phoneNumber)}`"
                  class="mt-2 inline-block text-lg font-semibold text-white transition hover:text-amber-400"
                >
                  {{ contactDetails.phoneNumber }}
                </a>
                <p v-else class="mt-2 text-neutral-500">No disponible</p>
              </article>

              <article class="border-b border-neutral-800 pb-6">
                <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400">Correo</p>
                <a
                  v-if="contactDetails?.emailAddress"
                  :href="`mailto:${contactDetails.emailAddress}`"
                  class="mt-2 inline-block text-lg font-semibold text-white transition hover:text-amber-400"
                >
                  {{ contactDetails.emailAddress }}
                </a>
                <p v-else class="mt-2 text-neutral-500">No disponible</p>
              </article>

              <article>
                <p class="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-400">
                  Horarios de atención
                </p>
                <div
                  class="mt-2 text-base leading-7 text-neutral-300"
                  v-html="contactDetails?.openingHours || 'Lunes a viernes · 9:00 – 18:00'"
                ></div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA de cierre (WhatsApp / acción principal) -->
      <section class="bg-neutral-950 py-20 sm:py-24" aria-labelledby="contact-cta-title">
        <div class="mx-auto max-w-7xl px-4 md:px-6">
          <div class="border-l-2 border-amber-400 bg-neutral-900 px-6 py-10 sm:px-10 sm:py-14">
            <p class="text-xs font-bold uppercase tracking-[0.3em] text-amber-400">Canal directo</p>
            <h2
              id="contact-cta-title"
              class="mt-4 max-w-3xl text-3xl font-black uppercase tracking-tight text-white sm:text-5xl"
            >
              {{ contactIntroCta?.title || '¿Prefieres WhatsApp?' }}
            </h2>
            <div
              class="mt-5 max-w-2xl text-base leading-8 text-neutral-300 sm:text-lg"
              v-html="
                contactIntroCta?.description ||
                'Escríbenos por WhatsApp y un asesor te responde con la información técnica que necesitas.'
              "
            ></div>

            <component
              :is="ctaButtonDestination.isInternal ? RouterLink : 'a'"
              v-if="ctaButtonDestination.href"
              v-bind="
                ctaButtonDestination.isInternal
                  ? { to: ctaButtonDestination.href }
                  : {
                      href: ctaButtonDestination.href,
                      target: ctaButtonDestination.target ?? '_blank',
                      rel: 'noopener noreferrer',
                    }
              "
              class="mt-8 inline-flex items-center gap-3 rounded-sm border border-amber-400 bg-amber-400 px-6 py-3 text-sm font-bold uppercase tracking-wider text-neutral-950 transition hover:bg-transparent hover:text-amber-300"
            >
              Abrir WhatsApp
              <span aria-hidden="true">→</span>
            </component>
          </div>
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
import { graphQLClient } from '@/api/client';
import { GET_CONTACT_DATA_QUERY } from '@/api/contact';
import type {
  ContactDataQueryResponse,
  ContactDataQueryVariables,
  ContactDetails,
  ContactHero,
  ContactIntroCta,
  ContactPageData,
  ContactTitleTag,
} from '@/types/contact';

/** ID de WordPress de la página Contacto — editar según el entorno. */
const PAGE_ID = 125;

const LOCAL_APP_ORIGIN = window.location.origin;
const VALID_TITLE_TAGS: readonly ContactTitleTag[] = ['h1', 'h2', 'h3', 'h4'];

interface LinkDestination {
  href: string | null;
  isInternal: boolean;
  target: string | null;
}

const contactData = ref<ContactPageData | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

const contactHero = computed<ContactHero | null>(
  () => contactData.value?.camposDeContacto?.contactHero ?? null,
);
const contactDetails = computed<ContactDetails | null>(
  () => contactData.value?.camposDeContacto?.contactDetails ?? null,
);
const contactIntroCta = computed<ContactIntroCta | null>(
  () => contactData.value?.camposDeContacto?.contactIntroCta ?? null,
);

const heroMediaUrl = computed<string | null>(() => {
  const media = contactHero.value?.bgMedia?.node;
  return media?.sourceUrl || media?.mediaItemUrl || null;
});

const normalizeTitleTag = (
  value: ContactHero['titleTag'],
): ContactTitleTag => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw && VALID_TITLE_TAGS.includes(raw)) {
    return raw;
  }
  return 'h1';
};

const heroTitleTag = computed<ContactTitleTag>(() =>
  normalizeTitleTag(contactHero.value?.titleTag ?? null),
);

const isVideoMedia = (url: string): boolean => /\.(mp4|webm)(?:[?#].*)?$/i.test(url);

const plainPhone = (value: string): string => value.replace(/[^\d+]/g, '');

const resolveDestination = (rawUrl: string | null | undefined): LinkDestination => {
  const value = rawUrl?.trim() ?? '';
  if (!value || value === '#') {
    return { href: null, isInternal: false, target: null };
  }

  if (value.startsWith('/')) {
    return { href: value, isInternal: true, target: null };
  }

  try {
    const parsed = new URL(value, LOCAL_APP_ORIGIN);
    if (parsed.origin === LOCAL_APP_ORIGIN) {
      return {
        href: `${parsed.pathname}${parsed.search}${parsed.hash}`,
        isInternal: true,
        target: null,
      };
    }
    return { href: parsed.href, isInternal: false, target: '_blank' };
  } catch {
    return { href: value, isInternal: false, target: '_blank' };
  }
};

const heroButtonDestination = computed<LinkDestination>(() =>
  resolveDestination(contactHero.value?.button || '/catalogo'),
);

const ctaButtonDestination = computed<LinkDestination>(() =>
  resolveDestination(contactIntroCta.value?.button || 'https://wa.me/'),
);

const loadContact = async (): Promise<void> => {
  loading.value = true;
  error.value = null;

  try {
    const variables: ContactDataQueryVariables = { id: PAGE_ID };
    const response = await graphQLClient.request<ContactDataQueryResponse>(
      GET_CONTACT_DATA_QUERY,
      variables,
    );
    contactData.value = response.page;

    if (!response.page?.camposDeContacto) {
      error.value = 'La página de contacto no devolvió contenido ACF.';
    }
  } catch (err) {
    console.error('[Contact] No se pudo cargar la página de contacto:', err);
    contactData.value = null;
    error.value =
      'No fue posible cargar el contenido de contacto. Verifica la conexión o el ID de la página.';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  void loadContact();
});
</script>
