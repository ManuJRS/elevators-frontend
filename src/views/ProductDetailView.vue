<template>
  <div class="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
  <!-- Skeleton Loader -->
  <div v-if="loading" class="animate-pulse space-y-8" aria-busy="true" aria-label="Cargando ficha técnica">
    <div class="grid gap-8 lg:grid-cols-2">
      <div class="aspect-square rounded-2xl bg-slate-800" />
      <div class="space-y-4">
        <div class="h-8 w-3/4 rounded-lg bg-slate-800" />
        <div class="h-4 w-1/3 rounded bg-slate-800" />
        <div class="h-12 w-full rounded-xl bg-slate-800" />
        <div class="h-10 w-2/5 rounded-lg bg-slate-800" />
        <div class="h-12 w-full rounded-xl bg-slate-800" />
      </div>
    </div>
    <div class="h-12 rounded-xl bg-slate-800" />
    <div class="h-48 rounded-2xl bg-slate-800" />
  </div>

  <!-- Error / Not Found -->
  <div
    v-else-if="error || !product"
    class="rounded-2xl border border-red-900/50 bg-slate-900 px-6 py-16 text-center shadow-xl shadow-black/20"
    role="alert"
  >
    <p class="text-xs font-semibold uppercase tracking-[0.25em] text-red-400">Error de catálogo</p>
    <h1 class="mt-3 text-2xl font-bold text-white">
      Componente industrial no localizado en el catálogo
    </h1>
    <p class="mx-auto mt-3 max-w-lg text-sm text-slate-400">
      {{ error ?? 'No se encontró la refacción solicitada en el servidor Docker de WordPress.' }}
    </p>
    <RouterLink
      to="/catalogo"
      class="mt-8 inline-flex items-center rounded-lg border border-sky-600 bg-sky-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-600"
    >
      Volver al catálogo
    </RouterLink>
  </div>

  <!-- Product Detail -->
  <template v-else>
    <nav class="mb-6 text-sm text-slate-500" aria-label="Ruta de navegación">
      <RouterLink to="/catalogo" class="transition hover:text-sky-400">Catálogo</RouterLink>
      <span class="mx-2 text-slate-600">/</span>
      <span class="text-slate-300">{{ product.name }}</span>
    </nav>

    <!-- Purchase Block -->
    <section
      class="grid gap-8 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/30 md:p-8 lg:grid-cols-2"
      aria-label="Información de compra"
    >
      <!-- Gallery -->
      <div>
        <div
          class="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-950"
        >
          <img
            v-if="activeImage"
            :src="activeImage.sourceUrl"
            :alt="activeImage.altText || product.name"
            class="h-full w-full object-cover"
          />
          <span v-else class="text-sm italic text-slate-500">Sin imagen industrial</span>
        </div>

        <div
          v-if="galleryImages.length > 1"
          class="mt-4 flex flex-wrap gap-2"
          role="list"
          aria-label="Miniaturas del producto"
        >
          <button
            v-for="thumb in galleryImages"
            :key="thumb.sourceUrl"
            type="button"
            class="h-16 w-16 overflow-hidden rounded-lg border transition"
            :class="
              activeImage?.sourceUrl === thumb.sourceUrl
                ? 'border-sky-500 ring-2 ring-sky-500/40'
                : 'border-slate-700 hover:border-slate-500'
            "
            @click="selectedGalleryUrl = thumb.sourceUrl"
          >
            <img
              :src="thumb.sourceUrl"
              :alt="thumb.altText || product.name"
              class="h-full w-full object-cover"
            />
          </button>
        </div>
      </div>

      <!-- Buy Panel -->
      <div class="flex flex-col">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-sky-400">Ficha técnica</p>
        <h1 class="mt-2 text-2xl font-bold text-white md:text-3xl">{{ product.name }}</h1>

        <div
          v-if="productCategories.length"
          class="mt-3 flex flex-wrap gap-2"
          aria-label="Categorías del producto"
        >
          <span
            v-for="category in productCategories"
            :key="category.id"
            class="inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs font-medium text-sky-300 ring-1 ring-slate-700"
          >
            {{ category.name }}
          </span>
        </div>

        <div class="mt-6 space-y-4">
          <div
            v-for="attribute in variationAttributes"
            :key="attribute.id"
            class="space-y-2"
          >
            <label
              :for="`attr-${attribute.id}`"
              class="block text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
              {{ resolveAttributeLabel(attribute.label, attribute.name) }}
            </label>
            <select
              :id="`attr-${attribute.id}`"
              :value="selectedAttributes[getAttributeKey(attribute)] ?? ''"
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              @change="handleAttributeChange(getAttributeKey(attribute), $event)"
            >
              <option
                v-for="option in getAttributeOptions(attribute)"
                :key="option"
                :value="option"
              >
                {{ option }}
              </option>
            </select>
          </div>

          <div
            v-if="!variationAttributes.length && product.variations?.nodes?.length"
            class="space-y-2"
          >
            <label
              for="variant-select"
              class="block text-xs font-semibold uppercase tracking-wider text-slate-400"
            >
              Variante
            </label>
            <select
              id="variant-select"
              :value="selectedVariationId"
              class="w-full rounded-lg border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
              @change="handleVariationSelectChange"
            >
              <option
                v-for="variant in product.variations.nodes"
                :key="variant.id"
                :value="variant.id"
              >
                {{ formatVariationLabel(product.name, variant.name) }}
              </option>
            </select>
          </div>
        </div>

        <dl class="mt-6 grid gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-sm">
          <div class="flex items-center justify-between gap-4">
            <dt class="text-slate-400">Precio</dt>
            <dd class="text-xl font-bold text-sky-400">
              {{ formattedPrice }}
            </dd>
          </div>
          <div class="flex items-center justify-between gap-4">
            <dt class="text-slate-400">SKU técnico</dt>
            <dd class="font-mono text-slate-200">{{ activeSku }}</dd>
          </div>
          <div class="flex items-center justify-between gap-4">
            <dt class="text-slate-400">Inventario</dt>
            <dd>
              <span
                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                :class="
                  isInStock
                    ? 'bg-emerald-900/50 text-emerald-300 ring-1 ring-emerald-700/50'
                    : 'bg-red-900/50 text-red-300 ring-1 ring-red-700/50'
                "
              >
                {{ stockLabel }}
              </span>
            </dd>
          </div>
        </dl>

        <div class="mt-6">
          <button
            v-if="canAddToCart"
            type="button"
            class="w-full rounded-xl bg-sky-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
            @click="handleAddToCart"
          >
            Añadir al carrito
          </button>
          <button
            v-else
            type="button"
            disabled
            class="w-full cursor-not-allowed rounded-xl border border-slate-700 bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-500"
          >
            Agotado
          </button>

          <p
            v-if="addedToCart"
            class="mt-3 text-center text-sm font-semibold text-emerald-400"
            role="status"
          >
            Refacción añadida al carrito.
          </p>

          <p
            v-else-if="!canAddToCart && isInStock"
            class="mt-3 text-center text-xs text-slate-500"
          >
            Precio bajo cotización. Contacte a ventas corporativas.
          </p>
        </div>
      </div>
    </section>

    <!-- Technical Tabs -->
    <section class="mt-10" aria-label="Datos técnicos avanzados">
      <div
        class="flex flex-wrap gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1"
        role="tablist"
        aria-label="Secciones de ficha técnica"
      >
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          role="tab"
          :aria-selected="activeTab === tab.id"
          :class="tabButtonClass(tab.id)"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="mt-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 md:p-8">
        <!-- Description -->
        <div v-if="activeTab === 'description'" role="tabpanel">
          <h2 class="mb-4 text-lg font-semibold text-white">Descripción comercial</h2>
          <div
            v-if="hasDescription"
            class="prose prose-invert max-w-none text-sm leading-relaxed text-slate-300 prose-headings:text-white prose-a:text-sky-400"
            v-html="product.description"
          />
          <div
            v-else-if="hasShortDescription"
            class="prose prose-invert max-w-none text-sm leading-relaxed text-slate-300"
            v-html="product.shortDescription"
          />
          <p v-else class="text-sm text-slate-500">
            No hay descripción comercial disponible para esta refacción.
          </p>
        </div>

        <!-- Specifications -->
        <div v-else-if="activeTab === 'specifications'" role="tabpanel">
          <h2 class="mb-4 text-lg font-semibold text-white">Especificaciones técnicas</h2>
          <div
            v-if="specificationRows.length"
            class="overflow-x-auto rounded-xl border border-slate-800"
          >
            <table class="min-w-full divide-y divide-slate-800 text-sm">
              <thead class="bg-slate-950/80">
                <tr>
                  <th
                    scope="col"
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Atributo
                  </th>
                  <th
                    scope="col"
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400"
                  >
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800 bg-slate-900/50">
                <tr v-for="row in specificationRows" :key="row.key">
                  <td class="px-4 py-3 font-medium text-slate-300">{{ row.label }}</td>
                  <td class="px-4 py-3 font-mono text-slate-200">{{ row.value }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-sm text-slate-500">
            No hay especificaciones técnicas registradas para esta variante.
          </p>
        </div>

        <!-- Downloads -->
        <div v-else role="tabpanel">
          <h2 class="mb-4 text-lg font-semibold text-white">Documentación técnica</h2>
          <ul v-if="downloadResources.length" class="space-y-3">
            <li
              v-for="resource in downloadResources"
              :key="resource.key"
              class="flex items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/50 px-4 py-3"
            >
              <span class="text-sm font-medium text-slate-200">{{ resource.label }}</span>
              <a
                :href="resource.url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex items-center rounded-lg border border-sky-700 bg-sky-900/40 px-3 py-1.5 text-xs font-semibold text-sky-300 transition hover:bg-sky-800/60"
              >
                Descargar
              </a>
            </li>
          </ul>
          <p v-else class="text-sm text-slate-500">
            No hay archivos técnicos disponibles para descarga en este momento.
          </p>
        </div>
      </div>
    </section>
  </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { gql } from 'graphql-request';
import { graphQLClient } from '../api/client';
import { parseProductPrice, useCartStore } from '../stores/cart';
import type { CartItem } from '../stores/cart';
import type { ProductAttribute, ProductImage } from '../types/product';
import type {
  DetailProductVariation,
  DownloadResource,
  ProductDetailTab,
  SingleProduct,
  SingleProductQueryResponse,
  SpecificationRow,
} from '../types/product-detail';
import type { ProductCategory } from '../types/product';

interface DetailTab {
  id: ProductDetailTab;
  label: string;
}

const NOT_FOUND_MESSAGE = 'Componente industrial no localizado en el catálogo';

const tabs: DetailTab[] = [
  { id: 'description', label: 'Descripción' },
  { id: 'specifications', label: 'Especificaciones' },
  { id: 'downloads', label: 'Descargas' },
];

const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      sku
      description
      shortDescription
      image {
        sourceUrl
        altText
      }
      productCategories {
        nodes {
          id
          name
          slug
        }
      }
      ... on VariableProduct {
        attributes {
          nodes {
            id
            label
            name
            variation
          }
        }
        variations {
          nodes {
            id
            databaseId
            name
            sku
            price
            stockQuantity
            manageStock
            image {
              sourceUrl
              altText
            }
            attributes {
              nodes {
                id
                name
                value
                label
              }
            }
          }
        }
      }
    }
  }
`;

const route = useRoute();
const cartStore = useCartStore();

const product = ref<SingleProduct | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const activeTab = ref<ProductDetailTab>('description');
const selectedAttributes = ref<Record<string, string>>({});
const selectedVariationId = ref<string>('');
const selectedGalleryUrl = ref<string | null>(null);
const addedToCart = ref<boolean>(false);

const resolveRouteSlug = (): string | null => {
  const rawSlug = route.params.slug;
  const value = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
  const slug = value?.trim();
  return slug || null;
};

const formatAttributeName = (name: string): string =>
  name
    .replace(/^pa_/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const resolveAttributeLabel = (
  label: string | null | undefined,
  name: string | null | undefined,
): string => {
  if (label?.trim()) return label.trim();
  if (name?.trim()) return formatAttributeName(name);
  return 'Atributo';
};

const getAttributeKey = (attribute: ProductAttribute): string =>
  attribute.name?.trim() || attribute.id;

const formatVariationLabel = (productName: string, variantName: string): string =>
  variantName.replace(`${productName} - `, '');

const variationAttributes = computed<ProductAttribute[]>(() =>
  (product.value?.attributes?.nodes ?? []).filter((attribute) => attribute.variation),
);

const variations = computed<DetailProductVariation[]>(() => product.value?.variations?.nodes ?? []);

const productCategories = computed<ProductCategory[]>(
  () => product.value?.productCategories?.nodes ?? [],
);

const selectedVariation = computed<DetailProductVariation | null>(() => {
  if (!variations.value.length) return null;

  const matchedByAttributes = variations.value.find((variant) =>
    variationAttributes.value.every((attribute) => {
      const key = getAttributeKey(attribute);
      const selectedValue = selectedAttributes.value[key];
      if (!selectedValue) return true;

      return variant.attributes?.nodes.some(
        (variantAttribute) =>
          (variantAttribute.name === attribute.name ||
            variantAttribute.name === attribute.label) &&
          variantAttribute.value === selectedValue,
      );
    }),
  );

  if (matchedByAttributes) return matchedByAttributes;

  if (selectedVariationId.value) {
    return variations.value.find((variant) => variant.id === selectedVariationId.value) ?? null;
  }

  return variations.value[0] ?? null;
});

const activeImage = computed<ProductImage | null>(() => {
  if (selectedGalleryUrl.value) {
    const fromGallery = galleryImages.value.find(
      (image) => image.sourceUrl === selectedGalleryUrl.value,
    );
    if (fromGallery) return fromGallery;
  }

  return selectedVariation.value?.image ?? product.value?.image ?? null;
});

const galleryImages = computed<ProductImage[]>(() => {
  const images: ProductImage[] = [];
  const seen = new Set<string>();

  const pushImage = (image: ProductImage | null | undefined): void => {
    if (!image?.sourceUrl || seen.has(image.sourceUrl)) return;
    seen.add(image.sourceUrl);
    images.push(image);
  };

  pushImage(product.value?.image);
  variations.value.forEach((variant) => pushImage(variant.image));

  return images;
});

const selectedPrice = computed<number>(() => {
  const price = selectedVariation.value?.price;
  return price ? parseProductPrice(price) : 0;
});

const formattedPrice = computed<string>(() => {
  if (selectedPrice.value <= 0) return 'Bajo cotización';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(selectedPrice.value);
});

const activeSku = computed<string>(() => {
  const sku = selectedVariation.value?.sku ?? product.value?.sku;
  return sku?.trim() || 'N/D';
});

const isInStock = computed<boolean>(() => {
  const variant = selectedVariation.value;
  if (!variant) return false;
  if (variant.manageStock !== true) return true;
  return (variant.stockQuantity ?? 0) > 0;
});

const stockLabel = computed<string>(() => {
  const variant = selectedVariation.value;
  if (!variant) return 'Sin variante';
  if (variant.manageStock !== true) return 'Disponible';
  const qty = variant.stockQuantity ?? 0;
  return qty > 0 ? `${qty} unidades` : 'Agotado';
});

const canAddToCart = computed<boolean>(() => isInStock.value && selectedPrice.value > 0);

const hasDescription = computed<boolean>(() => {
  const plain = (product.value?.description ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
  return plain.length > 0;
});

const hasShortDescription = computed<boolean>(() => {
  const plain = (product.value?.shortDescription ?? '')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();
  return plain.length > 0;
});

const specificationRows = computed<SpecificationRow[]>(() => {
  const rows: SpecificationRow[] = [];

  if (product.value?.sku) {
    rows.push({ key: 'parent-sku', label: 'SKU producto', value: product.value.sku });
  }

  selectedVariation.value?.attributes?.nodes.forEach((attribute, index) => {
    const label = resolveAttributeLabel(attribute.label, attribute.name);
    const value = attribute.value?.trim();
    if (!value) return;
    rows.push({
      key: `${attribute.id}-${index}`,
      label,
      value,
    });
  });

  product.value?.attributes?.nodes.forEach((attribute, index) => {
    if (attribute.variation) return;
    const label = resolveAttributeLabel(attribute.label, attribute.name);
    rows.push({
      key: `product-attr-${attribute.id}-${index}`,
      label,
      value: 'Consultar ficha',
    });
  });

  if (selectedVariation.value) {
    rows.push({
      key: 'stock-qty',
      label: 'Stock gestionado',
      value:
        selectedVariation.value.manageStock === true
          ? String(selectedVariation.value.stockQuantity ?? 0)
          : 'No aplica',
    });
  }

  return rows;
});

const downloadResources = computed<DownloadResource[]>(() => {
  const technical = product.value?.acfTechnicalData;
  if (!technical) return [];

  const resources: DownloadResource[] = [];

  if (technical.manualPdf?.mediaItemUrl) {
    resources.push({
      key: 'manual-pdf',
      label: technical.manualPdf.title?.trim() || 'Manual PDF',
      url: technical.manualPdf.mediaItemUrl,
    });
  }

  if (technical.installationDiagram?.mediaItemUrl) {
    resources.push({
      key: 'installation-diagram',
      label: technical.installationDiagram.title?.trim() || 'Diagrama de instalación eléctrica',
      url: technical.installationDiagram.mediaItemUrl,
    });
  }

  if (technical.securityCertification?.mediaItemUrl) {
    resources.push({
      key: 'security-certification',
      label: technical.securityCertification.title?.trim() || 'Certificación de seguridad',
      url: technical.securityCertification.mediaItemUrl,
    });
  }

  return resources;
});

const tabButtonClass = (tabId: ProductDetailTab): string => {
  const base =
    'rounded-lg px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-sky-500/30';
  return activeTab.value === tabId
    ? `${base} bg-sky-700 text-white`
    : `${base} text-slate-400 hover:bg-slate-800 hover:text-slate-200`;
};

const getAttributeOptions = (attribute: ProductAttribute): string[] => {
  const key = getAttributeKey(attribute);
  const values = new Set<string>();

  variations.value.forEach((variant) => {
    variant.attributes?.nodes.forEach((variantAttribute) => {
      if (
        variantAttribute.name === attribute.name ||
        variantAttribute.name === attribute.label
      ) {
        const value = variantAttribute.value?.trim();
        if (value) values.add(value);
      }
    });
  });

  const current = selectedAttributes.value[key];
  if (current) values.add(current);

  return Array.from(values);
};

const initializeVariationState = (): void => {
  const firstVariation = variations.value[0];
  if (!firstVariation) return;

  selectedVariationId.value = firstVariation.id;

  const nextAttributes: Record<string, string> = {};
  variationAttributes.value.forEach((attribute) => {
    const key = getAttributeKey(attribute);
    const match = firstVariation.attributes?.nodes.find(
      (variantAttribute) =>
        variantAttribute.name === attribute.name || variantAttribute.name === attribute.label,
    );
    if (match?.value) {
      nextAttributes[key] = match.value;
    }
  });

  selectedAttributes.value = nextAttributes;
  selectedGalleryUrl.value = firstVariation.image?.sourceUrl ?? product.value?.image?.sourceUrl ?? null;
};

const handleAttributeChange = (attributeKey: string, event: Event): void => {
  const target = event.target as HTMLSelectElement;
  selectedAttributes.value = {
    ...selectedAttributes.value,
    [attributeKey]: target.value,
  };

  if (selectedVariation.value) {
    selectedVariationId.value = selectedVariation.value.id;
    selectedGalleryUrl.value =
      selectedVariation.value.image?.sourceUrl ?? selectedGalleryUrl.value;
  }
};

const handleVariationSelectChange = (event: Event): void => {
  const target = event.target as HTMLSelectElement;
  selectedVariationId.value = target.value;

  const variant = variations.value.find((entry) => entry.id === target.value);
  if (!variant) return;

  const nextAttributes: Record<string, string> = { ...selectedAttributes.value };
  variant.attributes?.nodes.forEach((attribute) => {
    if (attribute.name && attribute.value) {
      nextAttributes[attribute.name] = attribute.value;
    }
  });
  selectedAttributes.value = nextAttributes;
  selectedGalleryUrl.value = variant.image?.sourceUrl ?? selectedGalleryUrl.value;
};

const buildCartItem = (): CartItem | null => {
  if (!product.value) return null;

  const variant = selectedVariation.value;
  const image = activeImage.value;

  if (variant) {
    return {
      id: variant.databaseId,
      name: product.value.name,
      price: parseProductPrice(variant.price),
      sku: variant.sku ?? '',
      quantity: 1,
      variantLabel: formatVariationLabel(product.value.name, variant.name),
      imageUrl: image?.sourceUrl ?? '',
    };
  }

  return {
    id: product.value.databaseId,
    name: product.value.name,
    price: 0,
    sku: product.value.sku ?? '',
    quantity: 1,
    variantLabel: '',
    imageUrl: image?.sourceUrl ?? '',
  };
};

const handleAddToCart = (): void => {
  const cartItem = buildCartItem();
  if (!cartItem || !canAddToCart.value) return;

  cartStore.addItem(cartItem);
  addedToCart.value = true;

  window.setTimeout(() => {
    addedToCart.value = false;
  }, 2500);
};

const fetchProduct = async (): Promise<void> => {
  const slug = resolveRouteSlug();

  if (!slug) {
    product.value = null;
    error.value = NOT_FOUND_MESSAGE;
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = null;
  product.value = null;

  try {
    const data = await graphQLClient.request<SingleProductQueryResponse>(
      GET_PRODUCT_BY_SLUG,
      { slug },
    );

    const fetchedProduct = data.product ?? null;

    if (!fetchedProduct) {
      product.value = null;
      error.value = NOT_FOUND_MESSAGE;
      return;
    }

    product.value = fetchedProduct;
    initializeVariationState();
  } catch (err) {
    console.error('[ProductDetail] Error al consultar Docker GraphQL:', err);
    product.value = null;
    error.value = NOT_FOUND_MESSAGE;
  } finally {
    loading.value = false;
  }
};

watch(
  () => route.params.slug,
  () => {
    void fetchProduct();
  },
);

onMounted(() => {
  void fetchProduct();
});
</script>
