<template>
  <div class="min-h-screen bg-gray-100">
    <!-- En-tête -->
    <header class="bg-white shadow">
      <div
        class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center"
      >
        <h1 class="text-3xl font-bold text-gray-900">
          Tableau de bord administrateur
        </h1>
        <button
          @click="authStore.signOut"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
        >
          Déconnexion
        </button>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Statistiques générales -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg
                  class="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Clients
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.clients }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg
                  class="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Restaurants
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.restaurants }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg
                  class="h-6 w-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">
                    Livreurs
                  </dt>
                  <dd class="text-lg font-medium text-gray-900">
                    {{ stats.deliverers }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gestion des comptes -->
      <div class="bg-white shadow rounded-lg mb-8">
        <div class="px-4 py-5 sm:p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">
            Créer un nouveau compte
          </h2>

          <form @submit.prevent="handleCreateAccount" class="space-y-4">
            <div>
              <label
                for="accountType"
                class="block text-sm font-medium text-gray-700"
                >Type de compte</label
              >
              <select
                id="accountType"
                v-model="newAccount.type"
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="restaurant">Restaurant</option>
                <option value="livreur">Livreur</option>
              </select>
            </div>

            <div>
              <label for="email" class="block text-sm font-medium text-gray-700"
                >Email</label
              >
              <input
                type="email"
                id="email"
                v-model="newAccount.email"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label
                for="password"
                class="block text-sm font-medium text-gray-700"
                >Mot de passe</label
              >
              <input
                type="password"
                id="password"
                v-model="newAccount.password"
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>

            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="loading"
                class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {{ loading ? "Création en cours..." : "Créer le compte" }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <!-- Liste des utilisateurs -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h2 class="text-lg font-medium text-gray-900 mb-4">Utilisateurs</h2>

          <div class="flex flex-col">
            <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div
                class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8"
              >
                <div
                  class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
                >
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Email
                        </th>
                        <th
                          scope="col"
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Rôle
                        </th>
                        <th
                          scope="col"
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Statut
                        </th>
                        <th
                          scope="col"
                          class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Profil
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="user in users" :key="user.uid">
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900"
                        >
                          {{ user.email }}
                        </td>
                        <td
                          class="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {{ formatRole(user.role) }}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span
                            class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                          >
                            Actif
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span
                            :class="[
                              'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                              user.isProfileComplete
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800',
                            ]"
                          >
                            {{
                              user.isProfileComplete ? "Complété" : "En attente"
                            }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import type { UserProfile } from "../../stores/auth";

const authStore = useAuthStore();
const loading = ref(false);
const users = ref<UserProfile[]>([]);

const stats = computed(() => {
  if (!users.value) return { clients: 0, restaurants: 0, deliverers: 0 };

  return {
    clients: users.value.filter((user) => user.role === "client").length,
    restaurants: users.value.filter((user) => user.role === "restaurant")
      .length,
    deliverers: users.value.filter((user) => user.role === "livreur").length,
  };
});

const newAccount = ref({
  type: "restaurant" as "restaurant" | "livreur",
  email: "",
  password: "",
});

const formatRole = (role: string) => {
  const roles = {
    client: "Client",
    restaurant: "Restaurant",
    livreur: "Livreur",
    admin: "Administrateur",
  };
  return roles[role as keyof typeof roles] || role;
};

const loadUsers = async () => {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(query(usersRef));
  users.value = snapshot.docs.map((doc) => ({ ...doc.data() } as UserProfile));
};

const handleCreateAccount = async () => {
  loading.value = true;
  try {
    if (newAccount.value.type === "restaurant") {
      await authStore.createRestaurantAccount(
        newAccount.value.email,
        newAccount.value.password
      );
    } else {
      await authStore.createDeliveryAccount(
        newAccount.value.email,
        newAccount.value.password
      );
    }

    // Réinitialisation du formulaire
    newAccount.value = {
      type: "restaurant",
      email: "",
      password: "",
    };

    // Rechargement de la liste des utilisateurs
    await loadUsers();
  } catch (error: any) {
    console.error("Erreur lors de la création du compte:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadUsers();
});
</script>
