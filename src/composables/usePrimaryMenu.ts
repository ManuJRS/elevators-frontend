import { onMounted, ref, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { fetchPrimaryNavMenu } from '../api/menu';
import type { NavMenuItem } from '../types/menu';

interface UsePrimaryMenuReturn {
  menuItems: Ref<NavMenuItem[]>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  reload: () => Promise<void>;
}

export const usePrimaryMenu = (): UsePrimaryMenuReturn => {
  const router = useRouter();
  const menuItems = ref<NavMenuItem[]>([]);
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);

  const reload = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      menuItems.value = await fetchPrimaryNavMenu(router);
    } catch (err) {
      console.error('[Menu] No se pudo cargar el menú principal:', err);
      error.value = 'No se pudo cargar el menú de navegación.';
      menuItems.value = [];
    } finally {
      isLoading.value = false;
    }
  };

  onMounted(() => {
    void reload();
  });

  return {
    menuItems,
    isLoading,
    error,
    reload,
  };
};
