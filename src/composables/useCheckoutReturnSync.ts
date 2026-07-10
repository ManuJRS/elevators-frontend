import { onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { CHECKOUT_RETURN_QUERY_PARAM, useCartStore } from '../stores/cart';

const isCheckoutReturn = (value: unknown): value is string =>
  value === 'true' || (Array.isArray(value) && value[0] === 'true');

export const useCheckoutReturnSync = (): void => {
  const route = useRoute();
  const router = useRouter();
  const cartStore = useCartStore();

  const syncCheckoutReturn = (): void => {
    if (!isCheckoutReturn(route.query[CHECKOUT_RETURN_QUERY_PARAM])) {
      return;
    }

    cartStore.restoreFromCheckoutReturn();

    const nextQuery = { ...route.query };
    delete nextQuery[CHECKOUT_RETURN_QUERY_PARAM];

    router.replace({
      path: route.path,
      query: nextQuery,
    });
  };

  onMounted(() => {
    syncCheckoutReturn();
  });

  watch(
    () => route.query[CHECKOUT_RETURN_QUERY_PARAM],
    () => {
      syncCheckoutReturn();
    },
  );
};
