<template>
    <div class="catalog-container">
      <h1 class="title">Refacciones de Elevadores</h1>
      
      <div v-if="loading" class="loading-state">
        <p>Consultando catálogo en Docker...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <p>{{ error }}</p>
      </div>
      
      <div v-else class="products-grid">
        <div v-for="product in products" :key="product.id" class="product-card">
          
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
            <div v-html="product.shortDescription" class="short-desc"></div>
            
            <div v-if="product.variations?.nodes?.length" class="variations-section">
              <label :for="'variant-' + product.id">Capacidad de Carga:</label>
              <select 
                :id="'variant-' + product.id" 
                @change="handleVariationChange(product.id, $event)"
              >
                <option 
                  v-for="variant in product.variations.nodes" 
                  :key="variant.id" 
                  :value="variant.id"
                >
                  {{ variant.name.replace(product.name + ' - ', '') }}
                </option>
              </select>
  
              <p class="price-display">
                Precio: <span>{{ getSelectedPrice(product) }}</span>
              </p>
            </div>
  
            <div v-else class="variations-section">
              <p class="price-display">Precio base bajo cotización</p>
            </div>
          </div>
  
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { graphQLClient } from '../api/client';
  import { gql } from 'graphql-request';
  import type { CatalogQueryResponse, ProductImage, WCProduct } from '../types/product';
  
  // Estados reactivos y tipados estrictos
  const products = ref<WCProduct[]>([]);
  const loading = ref<boolean>(true);
  const error = ref<string | null>(null);
  
  // Diccionario para guardar qué variación (ID) tiene seleccionada cada producto
  const selectedVariations = ref<Record<string, string>>({});
  
  // Query nativa optimizada para WooGraphQL con Inline Fragments (... on VariableProduct)
  const GET_PRODUCTS_QUERY = gql`
    query GetProducts {
      products(first: 20) {
        nodes {
          id
          databaseId
          name
          shortDescription
          image {
            sourceUrl
            altText
          }
          ... on VariableProduct {
            variations {
              nodes {
                id
                name
                price
                databaseId
                image {
                  sourceUrl
                  altText
                }
              }
            }
          }
        }
      }
    }
  `;
  
  const getSelectedVariation = (product: WCProduct) => {
    const nodes = product.variations?.nodes;
    if (!nodes?.length) return null;

    const currentSelectedId = selectedVariations.value[product.id];
    return nodes.find((v) => v.id === currentSelectedId) ?? nodes[0] ?? null;
  };

  const getSelectedPrice = (product: WCProduct): string => {
    const variant = getSelectedVariation(product);
    return variant?.price ?? 'N/A';
  };

  const getSelectedImage = (product: WCProduct): ProductImage | null => {
    const variant = getSelectedVariation(product);
    return variant?.image ?? product.image;
  };
  
  // Escucha el cambio del selector y actualiza el estado local
  const handleVariationChange = (productId: string, event: Event) => {
    const target = event.target as HTMLSelectElement;
    selectedVariations.value[productId] = target.value;
  };
  
  onMounted(async () => {
    try {
      loading.value = true;
      const data = await graphQLClient.request<CatalogQueryResponse>(GET_PRODUCTS_QUERY);
      products.value = data.products.nodes;
  
      // Inicializamos el diccionario asignando la primera variación por defecto a cada producto
      products.value.forEach(product => {
        const firstVariation = product.variations?.nodes?.[0];
        if (firstVariation) {
          selectedVariations.value[product.id] = firstVariation.id;
        }
      });
    } catch (err) {
      console.error('Error al conectar con la API de Docker:', err);
      error.value = 'Error de conexión: No se pudo conectar con el catálogo. Asegúrate de que el contenedor Docker esté corriendo.';
    } finally {
      loading.value = false;
    }
  });
  </script>
  
  <style scoped>
  .catalog-container { max-width: 1100px; margin: 0 auto; padding: 2rem; font-family: sans-serif; color: #333; }
  .title { border-bottom: 2px solid #0073aa; padding-bottom: 0.5rem; margin-bottom: 2rem; }
  .products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 2rem; }
  .product-card { border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background: #fff; display: flex; flex-direction: column; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
  .img-wrapper { width: 100%; height: 220px; background: #f9f9f9; display: flex; align-items: center; justify-content: center; }
  .product-img { width: 100%; height: 100%; object-fit: cover; }
  .no-img { color: #888; font-style: italic; }
  .product-info { padding: 1.5rem; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between; }
  h3 { margin: 0 0 0.5rem 0; font-size: 1.3rem; color: #111; }
  .short-desc { font-size: 0.95rem; color: #666; line-height: 1.4; margin-bottom: 1rem; }
  .short-desc :deep(ul) { padding-left: 1.2rem; margin: 0.5rem 0; }
  .variations-section { background: #f5f5f5; padding: 1rem; border-radius: 6px; margin-top: auto; }
  label { display: block; font-size: 0.85rem; font-weight: bold; margin-bottom: 0.3rem; color: #555; }
  select { width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; background: #fff; font-size: 0.9rem; margin-bottom: 0.8rem; }
  .price-display { margin: 0; font-size: 1rem; font-weight: bold; color: #222; }
  .price-display span { color: #0073aa; font-size: 1.25rem; }
  .loading-state, .error-state { padding: 3rem; text-align: center; font-size: 1.2rem; }
  .error-state { color: #d9534f; background: #fdf7f7; border: 1px solid #d9534f; border-radius: 4px; }
  </style>