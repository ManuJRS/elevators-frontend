<template>
  <div class="catalog-container">
    <p class="catalog-overline">Catálogo industrial</p>
    <h1 class="title">Refacciones de Elevadores</h1>

    <div v-if="loading" class="loading-state">
      <p>Consultando catálogo en Docker...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <template v-else>
      <section class="filters-bar" aria-label="Buscador y filtros del catálogo">
        <div class="search-wrapper">
          <label for="catalog-search" class="filter-label">Buscar refacción</label>
          <input
            id="catalog-search"
            v-model="searchQuery"
            type="search"
            class="search-input"
            placeholder="Nombre, SKU o referencia..."
            autocomplete="off"
          />
        </div>

        <div class="filter-group">
          <label for="category-filter" class="filter-label">Categoría</label>
          <select id="category-filter" v-model="selectedCategory" class="filter-select">
            <option value="">Todas las categorías</option>
            <option
              v-for="category in availableCategories"
              :key="category.value"
              :value="category.value"
            >
              {{ category.label }}
            </option>
          </select>
        </div>
      </section>

      <p class="results-summary">
        Mostrando {{ filteredProducts.length }} de {{ products.length }} productos
      </p>

      <div v-if="filteredProducts.length === 0" class="empty-state">
        <p>No se encontraron productos con los criterios seleccionados.</p>
        <button type="button" class="clear-filters-btn" @click="clearFilters">
          Limpiar filtros
        </button>
      </div>

      <div v-else class="products-grid">
        <div v-for="product in filteredProducts" :key="product.id" class="product-card">
          <div class="img-wrapper">
            <template v-if="getSelectedImage(product)">
              <img
                :src="getSelectedImage(product)!.sourceUrl"
                :alt="getSelectedImage(product)!.altText || product.name"
                class="product-img"
              />
            </template>
            <div v-else class="no-img">Sin imagen industrial</div>
          </div>

          <div class="product-info">
            <h3>{{ product.name }}</h3>

            <div v-if="hasShortDescription(product)" class="short-desc-section">
              <p class="meta-label">Descripción corta</p>
              <div v-html="product.shortDescription" class="short-desc"></div>
            </div>

            <div v-if="getDisplaySkus(product).length" class="sku-section">
              <p
                v-for="skuEntry in getDisplaySkus(product)"
                :key="skuEntry.key"
                class="sku-tag"
              >
                <span class="meta-label">{{ skuEntry.label }}:</span>
                {{ skuEntry.value }}
              </p>
            </div>

            <div v-if="product.variations?.nodes?.length" class="variations-section">
              <label :for="'variant-' + product.id">{{ getVariationSectionLabel(product) }}</label>
              <select
                :id="'variant-' + product.id"
                :value="selectedVariations[product.id]"
                @change="handleVariationChange(product.id, $event)"
              >
                <option
                  v-for="variant in product.variations.nodes"
                  :key="variant.id"
                  :value="variant.id"
                >
                  {{ formatVariationLabel(product.name, variant.name) }}
                </option>
              </select>

              <p class="price-display">
                Precio: <span>{{ getSelectedPrice(product) }}</span>
              </p>
            </div>

            <div v-else class="variations-section">
              <p class="price-display">Precio base bajo cotización</p>
            </div>

            <div class="card-actions">
              <RouterLink
                :to="`/producto/${product.slug}`"
                class="view-detail-btn"
              >
                Ver ficha técnica
              </RouterLink>

              <button
                type="button"
                class="add-to-cart-btn"
                @click="handleAddToCart(product)"
              >
                Añadir al carrito
              </button>
            </div>

            <p v-if="addedProductIds.has(product.id)" class="added-feedback" role="status">
              Refacción añadida al carrito.
            </p>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter, RouterLink } from 'vue-router';
import { graphQLClient } from '../api/client';
import { gql } from 'graphql-request';
import {
  isPurchaseSuccessQuery,
  PURCHASE_SUCCESS_QUERY_PARAM,
  useCartStore,
  parseProductPrice,
} from '../stores/cart';
import type { CartItem } from '../stores/cart';
import type {
  CatalogQueryResponse,
  FilterOption,
  ProductImage,
  ProductVariation,
  WCProduct,
} from '../types/product';

interface SkuDisplayEntry {
  key: string;
  label: string;
  value: string;
}

const products = ref<WCProduct[]>([]);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

const cartStore = useCartStore();
const route = useRoute();
const router = useRouter();
const addedProductIds = ref<Set<string>>(new Set());

const searchQuery = ref<string>('');
const selectedCategory = ref<string>('');

const selectedVariations = ref<Record<string, string>>({});

const GET_PRODUCTS_QUERY = gql`
  query GetProducts {
    products(first: 20) {
      nodes {
        id
        databaseId
        name
        slug
        sku
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
              name
              sku
              price
              databaseId
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
  }
`;

const normalizeText = (value: string): string =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

const fuzzyMatch = (text: string, query: string): boolean => {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) return true;
  if (normalizedText.includes(normalizedQuery)) return true;

  let queryIndex = 0;
  for (let i = 0; i < normalizedText.length && queryIndex < normalizedQuery.length; i++) {
    if (normalizedText[i] === normalizedQuery[queryIndex]) {
      queryIndex++;
    }
  }

  return queryIndex === normalizedQuery.length;
};

const formatAttributeName = (name: string): string =>
  name
    .replace(/^pa_/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const resolveAttributeLabel = (
  label: string | null | undefined,
  name: string | null | undefined,
): string | null => {
  if (label?.trim()) return label.trim();
  if (name?.trim()) return formatAttributeName(name);
  return null;
};

const getVariationSectionLabel = (product: WCProduct): string => {
  const productLevelAttribute = product.attributes?.nodes.find((attribute) => attribute.variation);
  if (productLevelAttribute) {
    const resolved = resolveAttributeLabel(
      productLevelAttribute.label,
      productLevelAttribute.name,
    );
    if (resolved) return `${resolved}:`;
  }

  const firstVariationAttribute = product.variations?.nodes[0]?.attributes?.nodes[0];
  if (firstVariationAttribute) {
    const resolved = resolveAttributeLabel(
      firstVariationAttribute.label,
      firstVariationAttribute.name,
    );
    if (resolved) return `${resolved}:`;
  }

  return 'Seleccionar variante:';
};

const getProductSearchableValues = (product: WCProduct): string[] => {
  const values: string[] = [product.name];

  if (product.sku) {
    values.push(product.sku);
  }

  product.variations?.nodes.forEach((variant) => {
    values.push(variant.name);
    if (variant.sku) {
      values.push(variant.sku);
    }
  });

  return values;
};

const productMatchesSearch = (product: WCProduct, query: string): boolean => {
  if (!query.trim()) return true;
  return getProductSearchableValues(product).some((value) => fuzzyMatch(value, query));
};

const productMatchesCategory = (product: WCProduct, categorySlug: string): boolean => {
  if (!categorySlug) return true;
  return product.productCategories?.nodes.some((category) => category.slug === categorySlug) ?? false;
};

const availableCategories = computed<FilterOption[]>(() => {
  const categoryMap = new Map<string, string>();

  products.value.forEach((product) => {
    product.productCategories?.nodes.forEach((category) => {
      categoryMap.set(category.slug, category.name);
    });
  });

  return Array.from(categoryMap.entries())
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));
});

const filteredProducts = computed<WCProduct[]>(() =>
  products.value.filter(
    (product) =>
      productMatchesSearch(product, searchQuery.value) &&
      productMatchesCategory(product, selectedCategory.value),
  ),
);

const getSelectedVariation = (product: WCProduct): ProductVariation | null => {
  const nodes = product.variations?.nodes;
  if (!nodes?.length) return null;

  const currentSelectedId = selectedVariations.value[product.id];
  return nodes.find((variant) => variant.id === currentSelectedId) ?? nodes[0] ?? null;
};

const getSelectedPrice = (product: WCProduct): string => {
  const variant = getSelectedVariation(product);
  return variant?.price ?? 'N/A';
};

const getSelectedImage = (product: WCProduct): ProductImage | null => {
  const variant = getSelectedVariation(product);
  return variant?.image ?? product.image;
};

const hasShortDescription = (product: WCProduct): boolean => {
  const plainText = product.shortDescription
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim();

  return plainText.length > 0;
};

const getDisplaySkus = (product: WCProduct): SkuDisplayEntry[] => {
  const entries: SkuDisplayEntry[] = [];

  if (product.sku) {
    entries.push({
      key: `${product.id}-parent-sku`,
      label: 'SKU producto',
      value: product.sku,
    });
  }

  const selectedVariation = getSelectedVariation(product);
  if (selectedVariation?.sku) {
    entries.push({
      key: `${product.id}-${selectedVariation.id}-sku`,
      label: 'SKU variación',
      value: selectedVariation.sku,
    });
  }

  return entries;
};

const formatVariationLabel = (productName: string, variantName: string): string =>
  variantName.replace(`${productName} - `, '');

const handleVariationChange = (productId: string, event: Event): void => {
  const target = event.target as HTMLSelectElement;
  selectedVariations.value[productId] = target.value;
};

const clearFilters = (): void => {
  searchQuery.value = '';
  selectedCategory.value = '';
};

const buildCartItem = (product: WCProduct): CartItem => {
  const selectedVariation = getSelectedVariation(product);
  const selectedImage = getSelectedImage(product);

  if (selectedVariation) {
    return {
      id: selectedVariation.databaseId,
      name: product.name,
      price: parseProductPrice(selectedVariation.price),
      sku: selectedVariation.sku ?? '',
      quantity: 1,
      variantLabel: formatVariationLabel(product.name, selectedVariation.name),
      imageUrl: selectedImage?.sourceUrl ?? '',
    };
  }

  return {
    id: product.databaseId,
    name: product.name,
    price: 0,
    sku: product.sku ?? '',
    quantity: 1,
    variantLabel: '',
    imageUrl: selectedImage?.sourceUrl ?? '',
  };
};

const handleAddToCart = (product: WCProduct): void => {
  const cartItem = buildCartItem(product);
  cartStore.addItem(cartItem);

  addedProductIds.value = new Set(addedProductIds.value).add(product.id);

  window.setTimeout(() => {
    const nextIds = new Set(addedProductIds.value);
    nextIds.delete(product.id);
    addedProductIds.value = nextIds;
  }, 2500);
};

const handlePurchaseSuccessReturn = (): void => {
  if (!isPurchaseSuccessQuery(route.query)) {
    return;
  }

  cartStore.clearCart();

  router.replace({ path: '/catalogo' });
};

watch(
  () => route.query[PURCHASE_SUCCESS_QUERY_PARAM],
  () => {
    handlePurchaseSuccessReturn();
  },
);

onMounted(async () => {
  handlePurchaseSuccessReturn();

  try {
    loading.value = true;
    const data = await graphQLClient.request<CatalogQueryResponse>(GET_PRODUCTS_QUERY);
    products.value = data.products.nodes;

    products.value.forEach((product) => {
      const firstVariation = product.variations?.nodes?.[0];
      if (firstVariation) {
        selectedVariations.value[product.id] = firstVariation.id;
      }
    });
  } catch (err) {
    console.error('Error al conectar con la API de Docker:', err);
    error.value =
      'Error de conexión: No se pudo conectar con el catálogo. Asegúrate de que el contenedor Docker esté corriendo.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.catalog-container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 2rem 1rem 3rem;
  color: #fafafa;
  background: #0a0a0a;
}

@media (min-width: 768px) {
  .catalog-container {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

.title {
  margin: 0 0 1.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #262626;
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  text-transform: uppercase;
  color: #ffffff;
}

.catalog-overline {
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: #fbbf24;
}

.filters-bar {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1.25rem;
  background: #171717;
  border: 1px solid #262626;
  border-radius: 0.125rem;
}

.search-wrapper,
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 0.16em;
}

.search-input,
.filter-select {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid #404040;
  border-radius: 0.125rem;
  background: #0a0a0a;
  font-size: 0.95rem;
  color: #fafafa;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #fbbf24;
  box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.18);
}

.results-summary {
  margin: 0 0 1.25rem;
  font-size: 0.9rem;
  color: #a3a3a3;
}

.empty-state {
  padding: 2.5rem;
  text-align: center;
  background: #171717;
  border: 1px dashed #404040;
  border-radius: 0.125rem;
}

.empty-state p {
  margin: 0 0 1rem;
  color: #a3a3a3;
}

.clear-filters-btn {
  padding: 0.55rem 1rem;
  border: 1px solid #fbbf24;
  border-radius: 0.125rem;
  background: transparent;
  color: #fbbf24;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.clear-filters-btn:hover {
  background: #fbbf24;
  color: #0a0a0a;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.25rem;
}

.product-card {
  border: 1px solid #262626;
  border-radius: 0.125rem;
  overflow: hidden;
  background: #171717;
  display: flex;
  flex-direction: column;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.product-card:hover {
  border-color: rgba(251, 191, 36, 0.6);
  transform: translateY(-2px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
}

.img-wrapper {
  width: 100%;
  height: 220px;
  background: #262626;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-img {
  color: #737373;
  font-style: italic;
}

.product-info {
  padding: 1.25rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

h3 {
  margin: 0 0 0.75rem;
  font-size: 1.15rem;
  font-weight: 700;
  color: #ffffff;
}

.meta-label {
  margin: 0 0 0.25rem;
  font-size: 0.7rem;
  font-weight: 700;
  color: #a3a3a3;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.short-desc-section {
  margin-bottom: 0.85rem;
}

.sku-section {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
}

.sku-tag {
  margin: 0;
  font-size: 0.85rem;
  color: #d4d4d4;
  font-family: ui-monospace, monospace;
}

.sku-tag .meta-label {
  display: inline;
  margin-right: 0.35rem;
  font-family: system-ui, sans-serif;
}

.short-desc {
  font-size: 0.95rem;
  color: #a3a3a3;
  line-height: 1.5;
  margin: 0;
}

.short-desc :deep(ul) {
  padding-left: 1.2rem;
  margin: 0.5rem 0;
}

.variations-section {
  background: #0a0a0a;
  padding: 1rem;
  border: 1px solid #262626;
  border-radius: 0.125rem;
  margin-top: auto;
}

.variations-section label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 0.3rem;
  color: #a3a3a3;
}

.variations-section select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #404040;
  border-radius: 0.125rem;
  background: #171717;
  color: #fafafa;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
}

.price-display {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: #d4d4d4;
}

.price-display span {
  color: #fbbf24;
  font-size: 1.2rem;
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
}

.view-detail-btn {
  display: block;
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid #404040;
  border-radius: 0.125rem;
  background: transparent;
  color: #e5e5e5;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.view-detail-btn:hover {
  border-color: #fbbf24;
  color: #fbbf24;
}

.add-to-cart-btn {
  width: 100%;
  padding: 0.7rem 1rem;
  border: 1px solid #fbbf24;
  border-radius: 0.125rem;
  background: #fbbf24;
  color: #0a0a0a;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.add-to-cart-btn:hover {
  background: transparent;
  color: #fcd34d;
}

.added-feedback {
  margin: 0.5rem 0 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: #6ee7b7;
  text-align: center;
}

.loading-state,
.error-state {
  padding: 3rem;
  text-align: center;
  font-size: 1.1rem;
  color: #a3a3a3;
}

.error-state {
  color: #fca5a5;
  background: rgba(69, 10, 10, 0.35);
  border: 1px solid rgba(127, 29, 29, 0.6);
  border-radius: 0.125rem;
}

@media (max-width: 900px) {
  .filters-bar {
    grid-template-columns: 1fr;
  }
}
</style>
