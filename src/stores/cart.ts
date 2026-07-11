import { ref, computed, watch } from 'vue';
import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

export const CART_STORAGE_KEY = 'cart_items';
const LEGACY_CART_STORAGE_KEY = 'elevadores-cart-items';
export const CHECKOUT_RETURN_QUERY_PARAM = 'from_checkout';
export const PURCHASE_SUCCESS_QUERY_PARAM = 'purchase_success';

export const isPurchaseSuccessQuery = (
  query: Record<string, unknown> | { [key: string]: unknown },
): boolean => {
  const value = query[PURCHASE_SUCCESS_QUERY_PARAM];

  if (value === 'true') {
    return true;
  }

  return Array.isArray(value) && value[0] === 'true';
};

export const isCheckoutReturnFromUrl = (search: string): boolean =>
  new URLSearchParams(search).get(CHECKOUT_RETURN_QUERY_PARAM) === 'true';

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
  const normalized = price.replace(/[^0-9.,-]/g, '').replace(/,/g, '');
  const parsed = Number.parseFloat(normalized);
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

const clearCartStorage = (): void => {
  localStorage.removeItem(CART_STORAGE_KEY);
  localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
};

const persistCart = (cartItems: CartItem[]): void => {
  if (cartItems.length === 0) {
    clearCartStorage();
    return;
  }

  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  localStorage.removeItem(LEGACY_CART_STORAGE_KEY);
};

const CHECKOUT_SLUG = '/finalizar-compra/';
const CHECKOUT_JWT_QUERY_PARAM = 'vue_jwt';

const formatCartLoadPayload = (items: CartItem[]): string =>
  items.map((item) => `${item.id}:${item.quantity}`).join(',');

const buildCheckoutRedirectUrl = (items: CartItem[], authToken: string | null): string => {
  const checkoutBase = `${resolveWooCommerceBaseUrl()}${CHECKOUT_SLUG}`;

  const url = new URL(checkoutBase);

  if (items.length > 0) {
    url.searchParams.set('cargar-carrito', formatCartLoadPayload(items));
  }

  if (authToken) {
    url.searchParams.set(CHECKOUT_JWT_QUERY_PARAM, authToken);
    console.info('[Auth] Redirigiendo al checkout con token JWT para sincronización híbrida.');
  }

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
    clearCartStorage();
  }

  function handleCheckout(): void {
    if (items.value.length === 0) {
      return;
    }

    const authStore = useAuthStore();
    const checkoutUrl = buildCheckoutRedirectUrl(items.value, authStore.token);

    if (authStore.isAuthenticated) {
      console.info('[Auth] Usuario autenticado en Vue. Token enviado al checkout de WordPress.');
    }

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
