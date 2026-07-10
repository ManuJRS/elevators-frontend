<template>
  <div class="cart-widget">
    <button
      type="button"
      class="cart-toggle"
      aria-label="Abrir carrito de refacciones"
      :aria-expanded="isOpen"
      @click="togglePanel"
    >
      <span class="cart-icon" aria-hidden="true">🛒</span>
      <span v-if="cartStore.totalItems > 0" class="cart-badge">
        {{ cartStore.totalItems }}
      </span>
    </button>

    <div v-if="isOpen" class="cart-backdrop" @click="closePanel" />

    <aside
      v-if="isOpen"
      class="cart-panel"
      role="dialog"
      aria-labelledby="cart-panel-title"
    >
      <header class="cart-panel-header">
        <h2 id="cart-panel-title">Carrito de refacciones</h2>
        <button type="button" class="close-btn" aria-label="Cerrar carrito" @click="closePanel">
          ×
        </button>
      </header>

      <div v-if="cartStore.items.length === 0" class="cart-empty">
        <p>No hay refacciones en el carrito.</p>
      </div>

      <ul v-else class="cart-items">
        <li v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <div class="item-thumb">
            <img
              v-if="item.imageUrl"
              :src="item.imageUrl"
              :alt="item.name"
              class="item-img"
            />
            <div v-else class="item-no-img">Sin imagen</div>
          </div>

          <div class="item-details">
            <p class="item-name">{{ item.name }}</p>
            <p v-if="item.variantLabel" class="item-variant">{{ item.variantLabel }}</p>
            <p v-if="item.sku" class="item-sku">SKU: {{ item.sku }}</p>
            <p class="item-meta">
              <span>Cantidad: {{ item.quantity }}</span>
              <span v-if="item.price > 0"> · ${{ item.price }}</span>
            </p>
          </div>

          <button
            type="button"
            class="remove-btn"
            aria-label="Eliminar refacción del carrito"
            @click="cartStore.removeItem(item.id)"
          >
            ×
          </button>
        </li>
      </ul>

      <footer v-if="cartStore.items.length > 0" class="cart-panel-footer">
        <p class="cart-summary">{{ cartStore.totalItems }} refacciones en total</p>
        <button type="button" class="checkout-btn" @click="handleCheckout">
          Proceder al pago
        </button>
      </footer>
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useCartStore } from '../stores/cart';

const cartStore = useCartStore();
const isOpen = ref<boolean>(false);

const togglePanel = (): void => {
  isOpen.value = !isOpen.value;
};

const closePanel = (): void => {
  isOpen.value = false;
};

const handleCheckout = (): void => {
  cartStore.handleCheckout();
  closePanel();
};
</script>

<style scoped>
.cart-widget {
  position: relative;
}

.cart-toggle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #3a3a42;
  border-radius: 8px;
  background: #2a2a32;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.cart-toggle:hover {
  background: #35353f;
  border-color: #4a4a55;
}

.cart-icon {
  font-size: 1.1rem;
  line-height: 1;
}

.cart-badge {
  position: absolute;
  top: -0.35rem;
  right: -0.35rem;
  min-width: 1.15rem;
  height: 1.15rem;
  padding: 0 0.25rem;
  border-radius: 999px;
  background: #0073aa;
  color: #ffffff;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1.15rem;
  text-align: center;
}

.cart-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 90;
}

.cart-panel {
  position: fixed;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  width: min(100%, 24rem);
  height: 100vh;
  background: #ffffff;
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.12);
  z-index: 100;
}

.cart-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e5e7eb;
}

.cart-panel-header h2 {
  margin: 0;
  font-size: 1.05rem;
  color: #111827;
}

.close-btn {
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.cart-empty {
  padding: 2rem 1.25rem;
  color: #6b7280;
  text-align: center;
}

.cart-items {
  flex: 1;
  margin: 0;
  padding: 0.75rem 0;
  list-style: none;
  overflow-y: auto;
}

.cart-item {
  display: grid;
  grid-template-columns: 4rem 1fr auto;
  gap: 0.75rem;
  align-items: start;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #f3f4f6;
}

.item-thumb {
  width: 4rem;
  height: 4rem;
  border-radius: 6px;
  overflow: hidden;
  background: #f9fafb;
}

.item-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-no-img {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 0.65rem;
  color: #9ca3af;
  text-align: center;
}

.item-details {
  min-width: 0;
}

.item-name {
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #111827;
}

.item-variant,
.item-sku,
.item-meta {
  margin: 0;
  font-size: 0.78rem;
  color: #6b7280;
}

.remove-btn {
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}

.remove-btn:hover {
  color: #d9534f;
}

.cart-panel-footer {
  padding: 1rem 1.25rem 1.25rem;
  border-top: 1px solid #e5e7eb;
}

.cart-summary {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  color: #4b5563;
}

.checkout-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 8px;
  background: #0073aa;
  color: #ffffff;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.checkout-btn:hover {
  background: #005f8d;
}
</style>
