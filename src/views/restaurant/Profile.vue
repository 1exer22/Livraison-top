<template>
  <div class="restaurant-profile">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">Profil du Restaurant</h1>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Informations principales -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold mb-6">
              Informations du restaurant
            </h2>
            <form @submit.prevent="updateProfile" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label>Nom du restaurant</label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="form-input"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Type de cuisine</label>
                  <select
                    v-model="form.cuisineType"
                    class="form-select"
                    required
                  >
                    <option
                      v-for="type in cuisineTypes"
                      :key="type"
                      :value="type"
                    >
                      {{ type }}
                    </option>
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label>Description</label>
                <textarea
                  v-model="form.description"
                  rows="4"
                  class="form-input"
                ></textarea>
              </div>

              <div class="form-group">
                <label>Adresse</label>
                <input
                  v-model="form.address"
                  type="text"
                  class="form-input"
                  required
                />
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label>Téléphone</label>
                  <input
                    v-model="form.phone"
                    type="tel"
                    class="form-input"
                    required
                  />
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input
                    v-model="form.email"
                    type="email"
                    class="form-input"
                    required
                  />
                </div>
              </div>

              <div class="flex justify-end">
                <button type="submit" class="btn-primary" :disabled="updating">
                  {{
                    updating
                      ? "Mise à jour..."
                      : "Enregistrer les modifications"
                  }}
                </button>
              </div>
            </form>
          </div>

          <!-- Horaires d'ouverture -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-lg font-semibold">Horaires d'ouverture</h2>
              <button @click="showHoursModal = true" class="btn-secondary">
                <i class="fas fa-clock mr-2"></i>Modifier les horaires
              </button>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="day in openingHours"
                :key="day.name"
                class="p-3 border rounded-lg"
              >
                <div class="flex justify-between items-center">
                  <span class="font-medium">{{ day.name }}</span>
                  <span v-if="day.closed" class="text-red-600">Fermé</span>
                  <span v-else class="text-green-600">
                    {{ formatTime(day.open) }} - {{ formatTime(day.close) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Zone de livraison -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-lg font-semibold">Zone de livraison</h2>
              <button
                @click="showDeliveryZoneModal = true"
                class="btn-secondary"
              >
                <i class="fas fa-map-marker-alt mr-2"></i>Modifier la zone
              </button>
            </div>
            <div id="delivery-zone-map" class="h-64 rounded-lg"></div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Photos -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold mb-4">Photos du restaurant</h2>
            <div class="space-y-4">
              <div class="relative">
                <img
                  :src="form.coverImage || '/default-restaurant.jpg'"
                  class="w-full h-48 object-cover rounded-lg"
                  alt="Restaurant cover"
                />
                <button
                  @click="triggerImageUpload('cover')"
                  class="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg"
                >
                  <i class="fas fa-camera"></i>
                </button>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <div
                  v-for="(image, index) in form.gallery"
                  :key="index"
                  class="relative"
                >
                  <img
                    :src="image"
                    class="w-full h-24 object-cover rounded-lg"
                    alt="Gallery image"
                  />
                  <button
                    @click="removeImage(index)"
                    class="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <button
                  v-if="form.gallery.length < 6"
                  @click="triggerImageUpload('gallery')"
                  class="w-full h-24 border-2 border-dashed rounded-lg flex items-center justify-center"
                >
                  <i class="fas fa-plus text-gray-400"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Paramètres de livraison -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold mb-4">Paramètres de livraison</h2>
            <div class="space-y-4">
              <div class="form-group">
                <label>Montant minimum de commande</label>
                <input
                  v-model="deliverySettings.minimumOrder"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>Frais de livraison</label>
                <input
                  v-model="deliverySettings.deliveryFee"
                  type="number"
                  min="0"
                  step="0.01"
                  class="form-input"
                />
              </div>
              <div class="form-group">
                <label>Temps de préparation moyen (minutes)</label>
                <input
                  v-model="deliverySettings.prepTime"
                  type="number"
                  min="0"
                  class="form-input"
                />
              </div>
              <button
                @click="updateDeliverySettings"
                class="btn-primary w-full"
              >
                Enregistrer les paramètres
              </button>
            </div>
          </div>

          <!-- Statut du restaurant -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold mb-4">Statut du restaurant</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span>Accepter les commandes</span>
                <toggle-switch
                  v-model="restaurantStatus.acceptingOrders"
                  @change="updateRestaurantStatus"
                />
              </div>
              <div class="flex items-center justify-between">
                <span>Mode vacances</span>
                <toggle-switch
                  v-model="restaurantStatus.vacationMode"
                  @change="updateRestaurantStatus"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <opening-hours-modal
      v-model="showHoursModal"
      :hours="openingHours"
      @save="updateOpeningHours"
    />

    <delivery-zone-modal
      v-model="showDeliveryZoneModal"
      :zone="deliveryZone"
      @save="updateDeliveryZone"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRestaurantStore } from "@/stores/restaurant";
import ToggleSwitch from "@/components/common/ToggleSwitch.vue";
// import OpeningHoursModal from "@/components/restaurant/OpeningHoursModal.vue";
import DeliveryZoneModal from "@/components/restaurant/DeliveryZoneModal.vue";
import { initMap, drawDeliveryZone } from "@/services/mapService";

const restaurantStore = useRestaurantStore();

// États
const form = reactive({
  name: "",
  cuisineType: "",
  description: "",
  address: "",
  phone: "",
  email: "",
  coverImage: "",
  gallery: [],
});

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

const updating = ref(false);
const showHoursModal = ref(false);
const showDeliveryZoneModal = ref(false);

const openingHours = ref([]);
const deliveryZone = ref(null);
const deliverySettings = ref({
  minimumOrder: 0,
  deliveryFee: 0,
  prepTime: 30,
});

const restaurantStatus = ref({
  acceptingOrders: true,
  vacationMode: false,
});

// Méthodes
const updateProfile = async () => {
  try {
    updating.value = true;
    await restaurantStore.updateProfile(form);
    // Afficher notification de succès
  } catch (error) {
    console.error("Erreur de mise à jour du profil:", error);
  } finally {
    updating.value = false;
  }
};

const triggerImageUpload = (type) => {
  // Implémenter la logique d'upload d'image
};

const removeImage = (index) => {
  form.gallery.splice(index, 1);
};

const updateOpeningHours = async (hours) => {
  try {
    await restaurantStore.updateOpeningHours(hours);
    openingHours.value = hours;
    showHoursModal.value = false;
  } catch (error) {
    console.error("Erreur de mise à jour des horaires:", error);
  }
};

const updateDeliveryZone = async (zone) => {
  try {
    await restaurantStore.updateDeliveryZone(zone);
    deliveryZone.value = zone;
    showDeliveryZoneModal.value = false;
    drawDeliveryZone(map, zone);
  } catch (error) {
    console.error("Erreur de mise à jour de la zone de livraison:", error);
  }
};

const updateDeliverySettings = async () => {
  try {
    await restaurantStore.updateDeliverySettings(deliverySettings.value);
    // Afficher notification de succès
  } catch (error) {
    console.error("Erreur de mise à jour des paramètres de livraison:", error);
  }
};

const updateRestaurantStatus = async () => {
  try {
    await restaurantStore.updateStatus(restaurantStatus.value);
    // Afficher notification de succès
  } catch (error) {
    console.error("Erreur de mise à jour du statut:", error);
  }
};

const formatTime = (time) => {
  return new Date(`2000-01-01T${time}`).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Initialisation
onMounted(async () => {
  try {
    // Charger les données du restaurant
    const restaurantData = await restaurantStore.getProfile();
    Object.assign(form, restaurantData);

    // Charger les horaires
    openingHours.value = await restaurantStore.getOpeningHours();

    // Charger la zone de livraison
    deliveryZone.value = await restaurantStore.getDeliveryZone();

    // Charger les paramètres de livraison
    const settings = await restaurantStore.getDeliverySettings();
    Object.assign(deliverySettings.value, settings);

    // Initialiser la carte
    const map = await initMap("delivery-zone-map");
    if (deliveryZone.value) {
      drawDeliveryZone(map, deliveryZone.value);
    }
  } catch (error) {
    console.error("Erreur de chargement des données:", error);
  }
});
</script>

<style lang="scss" scoped>
.form-group {
  @apply space-y-1;

  label {
    @apply block text-sm font-medium text-gray-700;
  }
}

.form-input {
  @apply w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.form-select {
  @apply w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.btn-primary {
  @apply px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
         disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 
         transition-colors duration-200;
}
</style>
