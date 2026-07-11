import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  isPurchaseSuccessQuery,
  PURCHASE_SUCCESS_QUERY_PARAM,
  useCartStore,
} from '../stores/cart';

/**
 * Sincroniza el vaciado del carrito cuando WooCommerce redirige al catálogo
 * con ?purchase_success=true. La lógica principal vive en CatalogView.vue.
 */
export const useCheckoutReturnSync = (): void => {
  const route = useRoute();
  const router = useRouter();
  const cartStore = useCartStore();

  const clearCartOnPurchaseSuccess = (): void => {
    if (route.path !== '/catalogo' || !isPurchaseSuccessQuery(route.query)) {
      return;
    }

    cartStore.clearCart();
    router.replace({ path: '/catalogo' });
  };

  onMounted(() => {
    clearCartOnPurchaseSuccess();
  });

  watch(
    () => route.query[PURCHASE_SUCCESS_QUERY_PARAM],
    () => {
      clearCartOnPurchaseSuccess();
    },
  );
};
