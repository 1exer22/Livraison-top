<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="max-w-md w-full space-y-8">
      <div>
        <img class="mx-auto h-12 w-auto" src="@/assets/logo.png" alt="Logo" />
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Créer un compte
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Ou
          <router-link
            to="/login"
            class="font-medium text-primary-600 hover:text-primary-500"
          >
            connectez-vous à votre compte existant
          </router-link>
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <!-- Type de compte -->
        <div class="grid grid-cols-3 gap-3">
          <button
            v-for="type in accountTypes"
            :key="type.value"
            type="button"
            :class="[
              'py-2 px-4 border rounded-md text-sm font-medium',
              accountType === type.value
                ? 'bg-primary-50 border-primary-500 text-primary-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50',
            ]"
            @click="accountType = type.value"
          >
            <i :class="type.icon" class="mr-2"></i>
            {{ type.label }}
          </button>
        </div>

        <!-- Informations personnelles -->
        <div class="rounded-md shadow-sm space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label for="firstName" class="sr-only">Prénom</label>
              <input
                v-model="form.firstName"
                id="firstName"
                type="text"
                required
                class="form-input"
                placeholder="Prénom"
              />
            </div>
            <div>
              <label for="lastName" class="sr-only">Nom</label>
              <input
                v-model="form.lastName"
                id="lastName"
                type="text"
                required
                class="form-input"
                placeholder="Nom"
              />
            </div>
          </div>

          <div>
            <label for="email" class="sr-only">Email</label>
            <input
              v-model="form.email"
              id="email"
              type="email"
              required
              class="form-input"
              placeholder="Adresse email"
            />
          </div>

          <div>
            <label for="phone" class="sr-only">Téléphone</label>
            <input
              v-model="form.phone"
              id="phone"
              type="tel"
              required
              class="form-input"
              placeholder="Numéro de téléphone"
            />
          </div>

          <div>
            <label for="password" class="sr-only">Mot de passe</label>
            <input
              v-model="form.password"
              id="password"
              type="password"
              required
              class="form-input"
              placeholder="Mot de passe"
            />
          </div>

          <div>
            <label for="confirmPassword" class="sr-only"
              >Confirmer le mot de passe</label
            >
            <input
              v-model="form.confirmPassword"
              id="confirmPassword"
              type="password"
              required
              class="form-input"
              placeholder="Confirmer le mot de passe"
            />
          </div>

          <!-- Champs spécifiques au type de compte -->
          <template v-if="accountType === 'restaurant'">
            <div>
              <label for="restaurantName" class="sr-only"
                >Nom du restaurant</label
              >
              <input
                v-model="form.restaurantName"
                id="restaurantName"
                type="text"
                required
                class="form-input"
                placeholder="Nom du restaurant"
              />
            </div>
            <div>
              <label for="cuisineType" class="sr-only">Type de cuisine</label>
              <select
                v-model="form.cuisineType"
                id="cuisineType"
                required
                class="form-select"
              >
                <option value="">Type de cuisine</option>
                <option v-for="type in cuisineTypes" :key="type" :value="type">
                  {{ type }}
                </option>
              </select>
            </div>
          </template>

          <template v-if="accountType === 'driver'">
            <div>
              <label for="vehicleType" class="sr-only">Type de véhicule</label>
              <select
                v-model="form.vehicleType"
                id="vehicleType"
                required
                class="form-select"
              >
                <option value="">Type de véhicule</option>
                <option value="bike">Vélo</option>
                <option value="scooter">Scooter</option>
                <option value="car">Voiture</option>
              </select>
            </div>
            <div>
              <label for="licenseNumber" class="sr-only"
                >Numéro de permis</label
              >
              <input
                v-model="form.licenseNumber"
                id="licenseNumber"
                type="text"
                required
                class="form-input"
                placeholder="Numéro de permis"
              />
            </div>
          </template>
        </div>

        <!-- Conditions d'utilisation -->
        <div class="flex items-center">
          <input
            v-model="form.acceptTerms"
            id="accept-terms"
            type="checkbox"
            required
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label for="accept-terms" class="ml-2 block text-sm text-gray-900">
            J'accepte les
            <a
              href="#"
              class="font-medium text-primary-600 hover:text-primary-500"
            >
              conditions d'utilisation
            </a>
          </label>
        </div>

        <!-- Bouton d'inscription -->
        <div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <span v-if="loading" class="mr-2">
              <i class="fas fa-spinner fa-spin"></i>
            </span>
            {{ loading ? "Inscription en cours..." : "S'inscrire" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const accountTypes = [
  { value: "client", label: "Client", icon: "fas fa-user" },
  { value: "restaurant", label: "Restaurant", icon: "fas fa-store" },
  { value: "driver", label: "Livreur", icon: "fas fa-motorcycle" },
];

const cuisineTypes = [
  "Française",
  "Italienne",
  "Japonaise",
  "Chinoise",
  "Indienne",
  "Mexicaine",
  "Thaïlandaise",
  "Végétarienne",
];

const accountType = ref("client");
const loading = ref(false);

const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
  restaurantName: "",
  cuisineType: "",
  vehicleType: "",
  licenseNumber: "",
  acceptTerms: false,
});

const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    // Gérer l'erreur de confirmation de mot de passe
    return;
  }

  try {
    loading.value = true;

    const userData = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phone: form.phone,
      password: form.password,
      type: accountType.value,
      ...(accountType.value === "restaurant" && {
        restaurantName: form.restaurantName,
        cuisineType: form.cuisineType,
      }),
      ...(accountType.value === "driver" && {
        vehicleType: form.vehicleType,
        licenseNumber: form.licenseNumber,
      }),
    };

    await authStore.register(userData);

    // Redirection vers la page appropriée
    const redirectPath = getRedirectPath(accountType.value);
    router.push(redirectPath);
  } catch (error) {
    console.error("Erreur d'inscription:", error);
  } finally {
    loading.value = false;
  }
};

const getRedirectPath = (type) => {
  const paths = {
    client: "/client",
    restaurant: "/restaurant-dashboard",
    driver: "/driver",
  };
  return paths[type] || "/";
};
</script>

<style lang="scss" scoped>
.form-input {
  @apply appearance-none rounded-lg relative block w-full px-3 py-2 border
         border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none
         focus:ring-primary-500 focus:border-primary-500 sm:text-sm;
}

.form-select {
  @apply appearance-none rounded-lg relative block w-full px-3 py-2 border
         border-gray-300 text-gray-900 focus:outline-none focus:ring-primary-500
         focus:border-primary-500 sm:text-sm;
}
</style>
