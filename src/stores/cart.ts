import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';

export const CART_STORAGE_KEY = 'cart_items';
const LEGACY_CART_STORAGE_KEY = 'elevadores-cart-items';
export const CHECKOUT_RETURN_QUERY_PARAM = 'from_checkout';

const resolveWooCommerceBaseUrl = (): string => {
  const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL as string | undefined;
  if (graphqlUrl) {
    return graphqlUrl.replace(/\/graphql\/?$/, '');
  }
  return 'http://localhost:8080';
};

export interface CartItem {
  id: number;
  name: string;
  price: number;
  sku: string;
  quantity: number;
  variantLabel: string;
  imageUrl: string;
}

export const parseProductPrice = (price: string): number => {
  const parsed = Number.parseFloat(price);
  return Number.isFinite(parsed) ? parsed : 0;
};

const parseStoredPrice = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    return parseProductPrice(value);
  }

  return 0;
};

const isCartItem = (value: unknown): value is CartItem => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === 'number' &&
    typeof item.name === 'string' &&
    (typeof item.price === 'number' || typeof item.price === 'string') &&
    typeof item.sku === 'string' &&
    typeof item.quantity === 'number' &&
    typeof item.variantLabel === 'string' &&
    typeof item.imageUrl === 'string' &&
    item.quantity > 0
  );
};

const normalizeCartItem = (value: unknown): CartItem | null => {
  if (!isCartItem(value)) {
    return null;
  }

  return {
    id: value.id,
    name: value.name,
    price: parseStoredPrice(value.price),
    sku: value.sku,
    quantity: value.quantity,
    variantLabel: value.variantLabel,
    imageUrl: value.imageUrl,
  };
};

const readStoragePayload = (): string | null =>
  localStorage.getItem(CART_STORAGE_KEY) ?? localStorage.getItem(LEGACY_CART_STORAGE_KEY);

export const loadCartFromStorage = (): CartItem[] => {
  try {
    const raw = readStoragePayload();
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((entry) => normalizeCartItem(entry))
      .filter((entry): entry is CartItem => entry !== null);
  } catch {
    return [];
  }
};

const persistCart = (items: CartItem[]): void => {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

const CHECKOUT_SLUG = '/finalizar-compra/';

const formatCartLoadPayload = (items: CartItem[]): string =>
  items.map((item) => `${item.id}:${item.quantity}`).join(',');

const buildCheckoutRedirectUrl = (items: CartItem[]): string => {
  const checkoutBase = `${resolveWooCommerceBaseUrl()}${CHECKOUT_SLUG}`;

  if (items.length === 0) {
    return checkoutBase;
  }

  const url = new URL(checkoutBase);
  url.searchParams.set('cargar-carrito', formatCartLoadPayload(items));

  return url.toString();
};

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>(loadCartFromStorage());

  const totalItems = computed<number>(() =>
    items.value.reduce((sum, item) => sum + item.quantity, 0),
  );

  watch(
    items,
    (currentItems) => {
      persistCart(currentItems);
    },
    { deep: true },
  );

  function hydrateFromStorage(): void {
    items.value = loadCartFromStorage();
  }

  function restoreFromCheckoutReturn(): void {
    hydrateFromStorage();
  }

  function addItem(item: CartItem): void {
    const existingItem = items.value.find((cartItem) => cartItem.id === item.id);

    if (existingItem) {
      existingItem.quantity += item.quantity;
      return;
    }

    items.value.push({ ...item });
  }

  function removeItem(id: number): void {
    items.value = items.value.filter((item) => item.id !== id);
  }

  function clearCart(): void {
    items.value = [];
  }

  function handleCheckout(): void {
    if (items.value.length === 0) {
      return;
    }

    const checkoutUrl = buildCheckoutRedirectUrl(items.value);
    window.location.href = checkoutUrl;
  }

  return {
    items,
    totalItems,
    hydrateFromStorage,
    restoreFromCheckoutReturn,
    addItem,
    removeItem,
    clearCart,
    handleCheckout,
  };
});
