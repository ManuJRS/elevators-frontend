import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
// 1. Importamos la vista del catálogo
import CatalogView from '../views/CatalogView.vue' 

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    // 2. Registramos la ruta del catálogo bajo la URL /catalogo
    {
      path: '/catalogo',
      name: 'catalog',
      component: CatalogView
    },
    // Dejamos lista también la del cotizador para más adelante
    {
      path: '/cotizador',
      name: 'quote',
      component: () => import('../views/QuoteView.vue')
    }
  ]
})

export default router