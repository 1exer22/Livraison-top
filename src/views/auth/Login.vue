<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Connexion
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Email"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Mot de passe</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
              placeholder="Mot de passe"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ loading ? "Connexion en cours..." : "Se connecter" }}
          </button>
        </div>

        <div v-if="error" class="text-red-600 text-center text-sm">
          {{ error }}
        </div>

        <div class="text-sm text-center">
          <router-link
            v-if="!isAdminLogin"
            to="/register"
            class="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Pas encore de compte ? Inscrivez-vous
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "../../stores/auth";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

const isAdminLogin = computed(() => route.query.admin === "true");

const handleSubmit = async () => {
  loading.value = true;
  error.value = "";

  try {
    await authStore.signIn(email.value, password.value);
    const userRole = authStore.userProfile?.role;

    switch (userRole) {
      case "admin":
        router.push("/admin");
        break;
      case "restaurant":
        router.push("/restaurant");
        break;
      case "livreur":
        router.push("/delivery");
        break;
      default:
        router.push("/");
    }
  } catch (e: any) {
    error.value = "Email ou mot de passe incorrect";
    console.error("Erreur de connexion:", e);
  } finally {
    loading.value = false;
  }
};
</script>
