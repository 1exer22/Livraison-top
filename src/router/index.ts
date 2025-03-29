import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "../stores/auth";
import Home from "../views/Home.vue";
import Login from "../views/auth/Login.vue";
import Register from "../views/auth/Register.vue";
import AdminDashboard from "../views/admin/Dashboard.vue";
import RestaurantDashboard from "../views/restaurant/Dashboard.vue";
import RestaurantSetup from "../views/restaurant/Setup.vue";
import RestaurantMenu from "../views/RestaurantMenu.vue";
import DeliveryDashboard from "../views/delivery/Dashboard.vue";
import DeliverySetup from "../views/delivery/Setup.vue";
import ClientProfile from "../views/client/Profile.vue";
import ClientOrders from "../views/client/Orders.vue";
import DeliveryManagement from "../views/admin/DeliveryManagement.vue";
import DeliveryScheduling from "../views/admin/DeliveryScheduling.vue";

const routes = [
  {
    path: "/",
    name: "home",
    component: Home,
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/register",
    name: "register",
    component: Register,
  },
  {
    path: "/profile",
    name: "profile",
    component: ClientProfile,
    meta: { requiresAuth: true, requiresClient: true },
  },
  {
    path: "/orders",
    name: "orders",
    component: ClientOrders,
    meta: { requiresAuth: true, requiresClient: true },
  },
  {
    path: "/orders/:id",
    name: "order-details",
    component: () => import("../views/client/OrderDetails.vue"),
    meta: { requiresAuth: true, requiresClient: true },
  },
  {
    path: "/admin",
    name: "admin",
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/delivery-management",
    name: "delivery-management",
    component: DeliveryManagement,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/admin/delivery-scheduling",
    name: "delivery-scheduling",
    component: DeliveryScheduling,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/restaurant/setup",
    name: "restaurant-setup",
    component: RestaurantSetup,
    meta: {
      requiresAuth: true,
      requiresRestaurant: true,
      requiresIncomplete: true,
    },
  },
  {
    path: "/restaurant",
    name: "restaurant",
    component: RestaurantDashboard,
    meta: {
      requiresAuth: true,
      requiresRestaurant: true,
      requiresComplete: true,
    },
  },
  {
    path: "/restaurant/:id",
    name: "restaurant-menu",
    component: RestaurantMenu,
  },
  {
    path: "/delivery/setup",
    name: "delivery-setup",
    component: DeliverySetup,
    meta: {
      requiresAuth: true,
      requiresDelivery: true,
      requiresIncomplete: true,
    },
  },
  {
    path: "/delivery",
    name: "delivery",
    component: DeliveryDashboard,
    meta: {
      requiresAuth: true,
      requiresDelivery: true,
      requiresComplete: true,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
  const requiresRestaurant = to.matched.some(
    (record) => record.meta.requiresRestaurant
  );
  const requiresDelivery = to.matched.some(
    (record) => record.meta.requiresDelivery
  );
  const requiresClient = to.matched.some(
    (record) => record.meta.requiresClient
  );
  const requiresComplete = to.matched.some(
    (record) => record.meta.requiresComplete
  );
  const requiresIncomplete = to.matched.some(
    (record) => record.meta.requiresIncomplete
  );

  if (requiresAuth && !authStore.user) {
    next("/login");
    return;
  }

  if (requiresAdmin && !authStore.isAdmin()) {
    next("/");
    return;
  }

  if (requiresRestaurant && !authStore.isRestaurant()) {
    next("/");
    return;
  }

  if (requiresDelivery && !authStore.isDelivery()) {
    next("/");
    return;
  }

  if (requiresClient && !authStore.isClient()) {
    next("/");
    return;
  }

  if (
    requiresComplete &&
    authStore.userProfile &&
    !authStore.userProfile.isProfileComplete
  ) {
    next(authStore.isRestaurant() ? "/restaurant/setup" : "/delivery/setup");
    return;
  }

  if (requiresIncomplete && authStore.userProfile?.isProfileComplete) {
    next(authStore.isRestaurant() ? "/restaurant" : "/delivery");
    return;
  }

  next();
});

export default router;
