<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div
        class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center"
      >
        <h1 class="text-3xl font-bold text-gray-900">Mon Profil</h1>
        <div class="flex items-center space-x-4">
          <router-link
            to="/orders"
            class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Mes commandes
          </router-link>
          <button
            @click="authStore.signOut"
            class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="bg-white shadow rounded-lg p-6">
        <form @submit.prevent="updateProfile" class="space-y-6">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Nom complet
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">
              Numéro de téléphone
            </label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              for="address"
              class="block text-sm font-medium text-gray-700"
            >
              Adresse de livraison
            </label>
            <textarea
              id="address"
              v-model="formData.address"
              rows="3"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>

          <div>
            <label
              for="deliveryInstructions"
              class="block text-sm font-medium text-gray-700"
            >
              Instructions de livraison (optionnel)
            </label>
            <textarea
              id="deliveryInstructions"
              v-model="formData.deliveryInstructions"
              rows="2"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Code d'entrée, étage, etc."
            ></textarea>
          </div>

          <div class="flex justify-end">
            <button
              type="submit"
              :disabled="loading"
              class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {{ loading ? "Enregistrement..." : "Enregistrer" }}
            </button>
          </div>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useAuthStore } from "../../stores/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

const authStore = useAuthStore();
const loading = ref(false);

const formData = ref({
  name: "",
  phone: "",
  address: "",
  deliveryInstructions: "",
});

const loadProfile = async () => {
  if (!authStore.user) return;

  const profileDoc = await getDoc(
    doc(db, "clientProfiles", authStore.user.uid)
  );
  if (profileDoc.exists()) {
    const data = profileDoc.data();
    formData.value = {
      name: data.name || "",
      phone: data.phone || "",
      address: data.address || "",
      deliveryInstructions: data.deliveryInstructions || "",
    };
  }
};

const updateProfile = async () => {
  if (!authStore.user) return;

  loading.value = true;
  try {
    await setDoc(
      doc(db, "clientProfiles", authStore.user.uid),
      {
        ...formData.value,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProfile();
});
</script>
