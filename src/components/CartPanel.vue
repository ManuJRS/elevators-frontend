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
  border: 1px solid #404040;
  border-radius: 0.125rem;
  background: #171717;
  color: #ffffff;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.cart-toggle:hover {
  background: #262626;
  border-color: #fbbf24;
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
  background: #fbbf24;
  color: #0a0a0a;
  font-size: 0.65rem;
  font-weight: 700;
  line-height: 1.15rem;
  text-align: center;
}

.cart-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
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
  background: #0a0a0a;
  border-left: 1px solid #262626;
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.45);
  z-index: 100;
  color: #fafafa;
}

.cart-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #262626;
}

.cart-panel-header h2 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #ffffff;
}

.close-btn {
  border: none;
  background: transparent;
  color: #a3a3a3;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
}

.close-btn:hover {
  color: #fbbf24;
}

.cart-empty {
  padding: 2rem 1.25rem;
  color: #a3a3a3;
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
  border-bottom: 1px solid #262626;
}

.item-thumb {
  width: 4rem;
  height: 4rem;
  border-radius: 0.125rem;
  overflow: hidden;
  background: #171717;
  border: 1px solid #262626;
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
  color: #737373;
  text-align: center;
}

.item-details {
  min-width: 0;
}

.item-name {
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffffff;
}

.item-variant,
.item-sku,
.item-meta {
  margin: 0;
  font-size: 0.78rem;
  color: #a3a3a3;
}

.remove-btn {
  border: none;
  background: transparent;
  color: #737373;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}

.remove-btn:hover {
  color: #f87171;
}

.cart-panel-footer {
  padding: 1rem 1.25rem 1.25rem;
  border-top: 1px solid #262626;
}

.cart-summary {
  margin: 0 0 0.75rem;
  font-size: 0.85rem;
  color: #a3a3a3;
}

.checkout-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #fbbf24;
  border-radius: 0.125rem;
  background: #fbbf24;
  color: #0a0a0a;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.checkout-btn:hover {
  background: transparent;
  color: #fcd34d;
}
</style>
