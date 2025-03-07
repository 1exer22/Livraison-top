import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Home from '../views/Home.vue';
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import AdminDashboard from '../views/admin/Dashboard.vue';
import RestaurantDashboard from '../views/restaurant/Dashboard.vue';
import DeliveryDashboard from '../views/delivery/Dashboard.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/register',
    name: 'register',
    component: Register
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/restaurant',
    name: 'restaurant',
    component: RestaurantDashboard,
    meta: { requiresAuth: true, requiresRestaurant: true }
  },
  {
    path: '/delivery',
    name: 'delivery',
    component: DeliveryDashboard,
    meta: { requiresAuth: true, requiresDelivery: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
  const requiresRestaurant = to.matched.some(record => record.meta.requiresRestaurant);
  const requiresDelivery = to.matched.some(record => record.meta.requiresDelivery);

  if (requiresAuth && !authStore.user) {
    next('/login');
    return;
  }

  if (requiresAdmin && !authStore.isAdmin()) {
    next('/');
    return;
  }

  if (requiresRestaurant && !authStore.isRestaurant()) {
    next('/');
    return;
  }

  if (requiresDelivery && !authStore.isDelivery()) {
    next('/');
    return;
  }

  next();
});

export default router;