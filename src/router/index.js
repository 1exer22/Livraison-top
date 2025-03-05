import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Pages publiques
import Home from "@/views/Home.vue";
import RestaurantList from "@/views/client/RestaurantList.vue";
import RestaurantDetail from "@/views/client/RestaurantDetail.vue";
import Login from "@/views/auth/Login.vue";
import Register from "@/views/auth/Register.vue";
import FAQ from "@/components/support/FAQ.vue";

// Pages client
import ClientDashboard from "@/views/client/Dashboard.vue";
import Checkout from "@/views/client/Checkout.vue";
import OrderTracking from "@/views/client/OrderTracking.vue";
import UserProfile from "@/views/client/UserProfile.vue";
import OrderHistory from "@/views/client/OrderHistory.vue";

// Pages restaurant
import RestaurantDashboard from "@/views/restaurant/Dashboard.vue";
import MenuManagement from "@/views/restaurant/MenuManagement.vue";
import OrderManagement from "@/views/restaurant/OrderManagement.vue";
import RestaurantProfile from "@/views/restaurant/Profile.vue";
import RestaurantAnalytics from "@/views/restaurant/Analytics.vue";

// Pages livreur
import DriverDashboard from "@/views/driver/Dashboard.vue";
import DeliveryManagement from "@/views/driver/DeliveryManagement.vue";
import DriverProfile from "@/views/driver/Profile.vue";
import DriverEarnings from "@/views/driver/Earnings.vue";

// Pages admin
import AdminDashboard from "@/views/admin/Dashboard.vue";
import UserManagement from "@/views/admin/UserManagement.vue";
import RestaurantManagement from "@/views/admin/RestaurantManagement.vue";
import SystemConfiguration from "@/views/admin/SystemConfiguration.vue";
import AdvancedAnalytics from "@/views/admin/Analytics.vue";

const routes = [
  // Routes publiques
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/restaurants",
    name: "RestaurantList",
    component: RestaurantList,
  },
  {
    path: "/restaurant/:id",
    name: "RestaurantDetail",
    component: RestaurantDetail,
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { guest: true },
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
    meta: { guest: true },
  },
  {
    path: "/faq",
    name: "FAQ",
    component: FAQ,
  },

  // Routes client
  {
    path: "/client",
    name: "ClientDashboard",
    component: ClientDashboard,
    meta: { requiresAuth: true, role: "client" },
  },
  {
    path: "/checkout",
    name: "Checkout",
    component: Checkout,
    meta: { requiresAuth: true, role: "client" },
  },
  {
    path: "/order/:id/tracking",
    name: "OrderTracking",
    component: OrderTracking,
    meta: { requiresAuth: true, role: "client" },
  },
  {
    path: "/profile",
    name: "UserProfile",
    component: UserProfile,
    meta: { requiresAuth: true },
  },
  {
    path: "/orders",
    name: "OrderHistory",
    component: OrderHistory,
    meta: { requiresAuth: true, role: "client" },
  },

  // Routes restaurant
  {
    path: "/restaurant-dashboard",
    name: "RestaurantDashboard",
    component: RestaurantDashboard,
    meta: { requiresAuth: true, role: "restaurant" },
  },
  {
    path: "/restaurant/menu",
    name: "MenuManagement",
    component: MenuManagement,
    meta: { requiresAuth: true, role: "restaurant" },
  },
  {
    path: "/restaurant/orders",
    name: "RestaurantOrders",
    component: OrderManagement,
    meta: { requiresAuth: true, role: "restaurant" },
  },
  {
    path: "/restaurant/profile",
    name: "RestaurantProfile",
    component: RestaurantProfile,
    meta: { requiresAuth: true, role: "restaurant" },
  },
  {
    path: "/restaurant/analytics",
    name: "RestaurantAnalytics",
    component: RestaurantAnalytics,
    meta: { requiresAuth: true, role: "restaurant" },
  },

  // Routes livreur
  {
    path: "/driver",
    name: "DriverDashboard",
    component: DriverDashboard,
    meta: { requiresAuth: true, role: "driver" },
  },
  {
    path: "/driver/deliveries",
    name: "DeliveryManagement",
    component: DeliveryManagement,
    meta: { requiresAuth: true, role: "driver" },
  },
  {
    path: "/driver/profile",
    name: "DriverProfile",
    component: DriverProfile,
    meta: { requiresAuth: true, role: "driver" },
  },
  {
    path: "/driver/earnings",
    name: "DriverEarnings",
    component: DriverEarnings,
    meta: { requiresAuth: true, role: "driver" },
  },

  // Routes admin
  {
    path: "/admin",
    name: "AdminDashboard",
    component: AdminDashboard,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/users",
    name: "UserManagement",
    component: UserManagement,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/restaurants",
    name: "RestaurantManagement",
    component: RestaurantManagement,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/configuration",
    name: "SystemConfiguration",
    component: SystemConfiguration,
    meta: { requiresAuth: true, role: "admin" },
  },
  {
    path: "/admin/analytics",
    name: "AdvancedAnalytics",
    component: AdvancedAnalytics,
    meta: { requiresAuth: true, role: "admin" },
  },

  // Route 404
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
});

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresGuest = to.matched.some((record) => record.meta.guest);
  const requiresRole = to.meta.role;

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = authStore.isAuthenticated;
  const userRole = authStore.userRole;

  if (requiresAuth && !isAuthenticated) {
    // Rediriger vers la page de connexion si l'authentification est requise
    next({
      name: "Login",
      query: { redirect: to.fullPath },
    });
  } else if (requiresGuest && isAuthenticated) {
    // Rediriger vers le dashboard approprié si l'utilisateur est déjà connecté
    next(getDashboardRoute(userRole));
  } else if (requiresRole && userRole !== requiresRole) {
    // Rediriger vers le dashboard approprié si le rôle ne correspond pas
    next(getDashboardRoute(userRole));
  } else {
    next();
  }
});

// Fonction utilitaire pour obtenir la route du dashboard selon le rôle
function getDashboardRoute(role) {
  const dashboards = {
    client: { name: "ClientDashboard" },
    restaurant: { name: "RestaurantDashboard" },
    driver: { name: "DriverDashboard" },
    admin: { name: "AdminDashboard" },
  };
  return dashboards[role] || { name: "Home" };
}

export default router;
