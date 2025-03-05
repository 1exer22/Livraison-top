<template>
  <nav class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo et navigation principale -->
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <router-link to="/">
              <img class="h-8 w-auto" src="@/assets/logo.png" alt="Logo" />
            </router-link>
          </div>

          <!-- Navigation principale -->
          <div class="hidden sm:ml-6 sm:flex sm:space-x-8">
            <!-- Navigation Client -->
            <template v-if="userRole === 'client'">
              <router-link
                to="/restaurants"
                class="nav-link"
                active-class="active"
              >
                Restaurants
              </router-link>
              <router-link to="/orders" class="nav-link" active-class="active">
                Mes commandes
              </router-link>
            </template>

            <!-- Navigation Restaurant -->
            <template v-if="userRole === 'restaurant'">
              <router-link
                to="/restaurant-dashboard"
                class="nav-link"
                active-class="active"
              >
                Dashboard
              </router-link>
              <router-link
                to="/restaurant/orders"
                class="nav-link"
                active-class="active"
              >
                Commandes
              </router-link>
              <router-link
                to="/restaurant/menu"
                class="nav-link"
                active-class="active"
              >
                Menu
              </router-link>
            </template>

            <!-- Navigation Livreur -->
            <template v-if="userRole === 'driver'">
              <router-link to="/driver" class="nav-link" active-class="active">
                Dashboard
              </router-link>
              <router-link
                to="/driver/deliveries"
                class="nav-link"
                active-class="active"
              >
                Livraisons
              </router-link>
              <router-link
                to="/driver/earnings"
                class="nav-link"
                active-class="active"
              >
                Gains
              </router-link>
            </template>

            <!-- Navigation Admin -->
            <template v-if="userRole === 'admin'">
              <router-link to="/admin" class="nav-link" active-class="active">
                Dashboard
              </router-link>
              <router-link
                to="/admin/users"
                class="nav-link"
                active-class="active"
              >
                Utilisateurs
              </router-link>
              <router-link
                to="/admin/restaurants"
                class="nav-link"
                active-class="active"
              >
                Restaurants
              </router-link>
            </template>
          </div>
        </div>

        <!-- Actions utilisateur -->
        <div class="flex items-center">
          <!-- Recherche -->
          <div
            class="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end"
          >
            <div class="max-w-lg w-full lg:max-w-xs">
              <label for="search" class="sr-only">Rechercher</label>
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                >
                  <i class="fas fa-search text-gray-400"></i>
                </div>
                <input
                  id="search"
                  v-model="searchQuery"
                  class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Rechercher..."
                  type="search"
                  @input="handleSearch"
                />
              </div>
            </div>
          </div>

          <!-- Panier (Client uniquement) -->
          <div v-if="userRole === 'client'" class="ml-4 flex items-center">
            <router-link
              to="/cart"
              class="relative p-2 text-gray-600 hover:text-gray-800"
            >
              <i class="fas fa-shopping-cart"></i>
              <span
                v-if="cartItemsCount > 0"
                class="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
              >
                {{ cartItemsCount }}
              </span>
            </router-link>
          </div>

          <!-- Notifications -->
          <notification-center class="ml-4" />

          <!-- Menu utilisateur -->
          <div class="ml-4 relative">
            <div>
              <button
                @click="toggleUserMenu"
                class="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <img
                  :src="user?.avatar || '/default-avatar.png'"
                  class="h-8 w-8 rounded-full"
                  alt="Avatar"
                />
              </button>
            </div>

            <!-- Menu déroulant -->
            <div
              v-if="showUserMenu"
              class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
            >
              <template v-if="isAuthenticated">
                <router-link :to="profileRoute" class="menu-item">
                  <i class="fas fa-user mr-2"></i>Profil
                </router-link>

                <router-link to="/settings" class="menu-item">
                  <i class="fas fa-cog mr-2"></i>Paramètres
                </router-link>

                <hr class="my-1" />

                <button
                  @click="logout"
                  class="menu-item text-red-600 hover:text-red-800"
                >
                  <i class="fas fa-sign-out-alt mr-2"></i>Déconnexion
                </button>
              </template>
              <template v-else>
                <router-link to="/login" class="menu-item">
                  <i class="fas fa-sign-in-alt mr-2"></i>Connexion
                </router-link>

                <router-link to="/register" class="menu-item">
                  <i class="fas fa-user-plus mr-2"></i>Inscription
                </router-link>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu mobile -->
    <div class="sm:hidden">
      <div class="pt-2 pb-3 space-y-1">
        <!-- Navigation mobile selon le rôle -->
        <template v-if="userRole === 'client'">
          <router-link
            to="/restaurants"
            class="mobile-nav-link"
            active-class="active"
          >
            Restaurants
          </router-link>
          <router-link
            to="/orders"
            class="mobile-nav-link"
            active-class="active"
          >
            Mes commandes
          </router-link>
        </template>

        <!-- Ajouter les autres navigations mobiles selon le rôle -->
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useCartStore } from "@/stores/cart";
import NotificationCenter from "@/components/common/NotificationCenter.vue";

const router = useRouter();
const authStore = useAuthStore();
const cartStore = useCartStore();

// États
const showUserMenu = ref(false);
const searchQuery = ref("");

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated);
const user = computed(() => authStore.user);
const userRole = computed(() => authStore.userRole);
const cartItemsCount = computed(() => cartStore.itemCount);

const profileRoute = computed(() => {
  const routes = {
    client: "/profile",
    restaurant: "/restaurant/profile",
    driver: "/driver/profile",
    admin: "/admin/profile",
  };
  return routes[userRole.value] || "/profile";
});

// Méthodes
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const handleSearch = () => {
  // Implémenter la logique de recherche
};

const logout = async () => {
  try {
    await authStore.logout();
    router.push("/");
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
  }
};

// Fermer le menu utilisateur lors d'un clic à l'extérieur
const handleClickOutside = (event) => {
  if (showUserMenu.value && !event.target.closest(".user-menu")) {
    showUserMenu.value = false;
  }
};

// Event listeners
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style lang="scss" scoped>
.nav-link {
  @apply inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
         text-gray-500 hover:text-gray-700 hover:border-gray-300;

  &.active {
    @apply border-primary-500 text-gray-900;
  }
}

.mobile-nav-link {
  @apply block pl-3 pr-4 py-2 border-l-4 text-base font-medium
         text-gray-500 hover:text-gray-700 hover:bg-gray-50 hover:border-gray-300;

  &.active {
    @apply bg-primary-50 border-primary-500 text-primary-700;
  }
}

.menu-item {
  @apply block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left;
}
</style>
