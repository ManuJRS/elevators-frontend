<template>
  <div class="catalog-container">
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

            <button
              type="button"
              class="add-to-cart-btn"
              @click="handleAddToCart(product)"
            >
              Añadir al carrito
            </button>

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
import { ref, computed, onMounted } from 'vue';
import { graphQLClient } from '../api/client';
import { gql } from 'graphql-request';
import { useCartStore, parseProductPrice } from '../stores/cart';
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

onMounted(async () => {
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
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem;
  font-family: sans-serif;
  color: #333;
}

.title {
  border-bottom: 2px solid #0073aa;
  padding-bottom: 0.5rem;
  margin-bottom: 1.5rem;
}

.filters-bar {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1.25rem;
  background: #f8f9fb;
  border: 1px solid #e4e7ec;
  border-radius: 8px;
}

.search-wrapper,
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.filter-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4b5563;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.search-input,
.filter-select {
  width: 100%;
  padding: 0.65rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: #fff;
  font-size: 0.95rem;
  color: #111827;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.search-input:focus,
.filter-select:focus {
  outline: none;
  border-color: #0073aa;
  box-shadow: 0 0 0 3px rgba(0, 115, 170, 0.15);
}

.results-summary {
  margin: 0 0 1.25rem;
  font-size: 0.9rem;
  color: #6b7280;
}

.empty-state {
  padding: 2.5rem;
  text-align: center;
  background: #fafafa;
  border: 1px dashed #d1d5db;
  border-radius: 8px;
}

.empty-state p {
  margin: 0 0 1rem;
  color: #4b5563;
}

.clear-filters-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #0073aa;
  border-radius: 6px;
  background: #fff;
  color: #0073aa;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.clear-filters-btn:hover {
  background: #f0f8fc;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 2rem;
}

.product-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.img-wrapper {
  width: 100%;
  height: 220px;
  background: #f9f9f9;
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
  color: #888;
  font-style: italic;
}

.product-info {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

h3 {
  margin: 0 0 0.75rem;
  font-size: 1.3rem;
  color: #111;
}

.meta-label {
  margin: 0 0 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.03em;
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
  color: #374151;
  font-family: ui-monospace, monospace;
}

.sku-tag .meta-label {
  display: inline;
  margin-right: 0.35rem;
  font-family: sans-serif;
}

.short-desc {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.4;
  margin: 0;
}

.short-desc :deep(ul) {
  padding-left: 1.2rem;
  margin: 0.5rem 0;
}

.variations-section {
  background: #f5f5f5;
  padding: 1rem;
  border-radius: 6px;
  margin-top: auto;
}

.variations-section label {
  display: block;
  font-size: 0.85rem;
  font-weight: bold;
  margin-bottom: 0.3rem;
  color: #555;
}

.variations-section select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: #fff;
  font-size: 0.9rem;
  margin-bottom: 0.8rem;
}

.price-display {
  margin: 0;
  font-size: 1rem;
  font-weight: bold;
  color: #222;
}

.price-display span {
  color: #0073aa;
  font-size: 1.25rem;
}

.add-to-cart-btn {
  width: 100%;
  margin-top: 1rem;
  padding: 0.7rem 1rem;
  border: none;
  border-radius: 6px;
  background: #0073aa;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.add-to-cart-btn:hover {
  background: #005f8d;
}

.added-feedback {
  margin: 0.5rem 0 0;
  font-size: 0.82rem;
  font-weight: 600;
  color: #047857;
  text-align: center;
}

.loading-state,
.error-state {
  padding: 3rem;
  text-align: center;
  font-size: 1.2rem;
}

.error-state {
  color: #d9534f;
  background: #fdf7f7;
  border: 1px solid #d9534f;
  border-radius: 4px;
}

@media (max-width: 900px) {
  .filters-bar {
    grid-template-columns: 1fr;
  }
}
</style>
