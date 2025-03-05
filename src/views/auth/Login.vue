<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <img class="mx-auto h-12 w-auto" src="@/assets/logo.png" alt="Logo" />
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion à votre compte
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ou
          <router-link
            to="/register"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            créez un nouveau compte
          </router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              v-model="email"
              id="email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Adresse email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Mot de passe</label>
            <input
              v-model="password"
              id="password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Mot de passe"
            />
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              v-model="rememberMe"
              id="remember-me"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              Se souvenir de moi
            </label>
          </div>

          <div class="text-sm">
            <a
              href="#"
              class="font-medium text-primary-600 hover:text-primary-500"
            >
              Mot de passe oublié ?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span
              v-if="loading"
              class="absolute left-0 inset-y-0 flex items-center pl-3"
            >
              <i class="fas fa-spinner fa-spin"></i>
            </span>
            {{ loading ? "Connexion en cours..." : "Se connecter" }}
          </button>
        </div>
      </form>

      <!-- Séparateur -->
      <div class="mt-6">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-gray-50 text-gray-500">
              Ou continuez avec
            </span>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            @click="loginWithGoogle"
          >
            <i class="fab fa-google text-lg"></i>
            <span class="ml-2">Google</span>
          </button>

          <button
            type="button"
            class="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
            @click="loginWithFacebook"
          >
            <i class="fab fa-facebook text-lg"></i>
            <span class="ml-2">Facebook</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const rememberMe = ref(false);
const loading = ref(false);

const handleLogin = async () => {
  try {
    loading.value = true;
    await authStore.login({
      email: email.value,
      password: password.value,
      remember: rememberMe.value,
    });

    // Redirection vers la page demandée ou le dashboard approprié
    const redirectPath =
      route.query.redirect || getDashboardRoute(authStore.userRole);
    router.push(redirectPath);
  } catch (error) {
    console.error("Erreur de connexion:", error);
  } finally {
    loading.value = false;
  }
};

const loginWithGoogle = async () => {
  try {
    loading.value = true;
    await authStore.loginWithGoogle();
    router.push(getDashboardRoute(authStore.userRole));
  } catch (error) {
    console.error("Erreur de connexion Google:", error);
  } finally {
    loading.value = false;
  }
};

const loginWithFacebook = async () => {
  try {
    loading.value = true;
    await authStore.loginWithFacebook();
    router.push(getDashboardRoute(authStore.userRole));
  } catch (error) {
    console.error("Erreur de connexion Facebook:", error);
  } finally {
    loading.value = false;
  }
};

const getDashboardRoute = (role) => {
  const routes = {
    client: "/client",
    restaurant: "/restaurant-dashboard",
    driver: "/driver",
    admin: "/admin",
  };
  return routes[role] || "/";
};
</script>
