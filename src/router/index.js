import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { auth } from '../firebase/config'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/panel',
      name: 'panel',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true } // Por ahora requerirá auth, luego se puede restringir a roles
    }
  ]
})

// Guardia de navegación
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const currentUser = auth.currentUser

  if (requiresAuth && !currentUser) {
    // A veces currentUser es null al cargar rápido la página, 
    // lo ideal sería esperar la inicialización de Firebase pero para MVP usamos esto:
    next('/')
  } else if (!requiresAuth && currentUser && to.path === '/') {
    // Si ya está logueado y va al home, puede quedarse o ir al panel
    next()
  } else {
    next()
  }
})

export default router
