<template>
  <div class="container mx-auto px-4 py-6">
    <h1 class="text-2xl font-bold mb-6">Gestion des plannings de livraison</h1>
    
    <div v-if="loading" class="flex justify-center my-8">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else>
      <!-- Sélecteur de livreur -->
      <div class="bg-white rounded-lg shadow-md p-4 mb-6">
        <h2 class="text-lg font-semibold mb-3">Sélectionner un livreur</h2>
        
        <div class="relative">
          <select 
            v-model="selectedDelivererId"
            class="block appearance-none w-full bg-white border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Sélectionner un livreur --</option>
            <option v-for="deliverer in deliverers" :key="deliverer.id" :value="deliverer.id">
              {{ deliverer.fullName || deliverer.name || 'Sans nom' }} ({{ deliverer.vehicleInfo?.vehicleType || deliverer.vehicleType || 'Non spécifié' }})
            </option>
          </select>
          <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
            </svg>
          </div>
        </div>
      </div>
      
      <div v-if="selectedDelivererId" class="space-y-6">
        <!-- Vue d'ensemble du livreur -->
        <div class="bg-white rounded-lg shadow-md p-4">
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-xl font-semibold mb-2">{{ selectedDeliverer?.fullName || selectedDeliverer?.name || 'Sans nom' }}</h2>
              <div class="text-gray-600 mb-1">
                <i class="fas fa-phone mr-2"></i> {{ selectedDeliverer?.phone || 'Non renseigné' }}
              </div>
              <!-- Informations détaillées sur le véhicule -->
              <div class="text-gray-600 mb-1 flex items-center">
                <i class="fas fa-car mr-2 text-blue-500"></i> 
                <div>
                  <span class="font-medium">Véhicule :</span> {{ selectedDeliverer?.vehicleType || 'Non spécifié' }}
                  <span v-if="selectedDeliverer?.vehicleNumber" class="ml-1 px-2 py-0.5 bg-gray-100 rounded text-sm">
                    {{ selectedDeliverer?.vehicleNumber }}
                  </span>
                </div>
              </div>
              <div class="text-gray-600">
                <i class="fas fa-map-marker-alt mr-2"></i> {{ selectedDeliverer?.address || 'Adresse non renseignée' }}
              </div>
              <!-- Total des livraisons effectuées -->
              <div class="text-gray-600 mt-2">
                <i class="fas fa-truck mr-2 text-green-500"></i> 
                <span class="font-medium">Total des livraisons:</span> 
                <span class="bg-green-100 text-green-800 px-2 py-0.5 rounded-full text-sm ml-1">
                  {{ selectedDeliverer?.totalDeliveries || 0 }}
                </span>
              </div>
            </div>
            
            <div class="flex flex-col items-end">
              <span 
                class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full"
                :class="selectedDeliverer?.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
              >
                {{ selectedDeliverer?.isAvailable ? 'Disponible' : 'Non disponible' }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Tabs pour horaires et pauses -->
        <div class="bg-white rounded-lg shadow-md">
          <div class="border-b border-gray-200">
            <nav class="flex">
              <button 
                @click="activeTab = 'schedule'"
                class="px-6 py-4 text-center border-b-2 font-medium text-sm focus:outline-none"
                :class="activeTab === 'schedule' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                <i class="fas fa-calendar-alt mr-2"></i> Planification hebdomadaire
              </button>
              <button 
                @click="activeTab = 'breaks'"
                class="px-6 py-4 text-center border-b-2 font-medium text-sm focus:outline-none"
                :class="activeTab === 'breaks' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                <i class="fas fa-coffee mr-2"></i> Pauses et congés
              </button>
            </nav>
          </div>
          
          <div class="p-4">
            <!-- Composant de gestion des horaires -->
            <ScheduleManager 
              v-if="activeTab === 'schedule'" 
              :deliverer-id="selectedDelivererId"
            />
            
            <!-- Composant de gestion des pauses -->
            <BreakManager 
              v-if="activeTab === 'breaks'" 
              :deliverer-id="selectedDelivererId"
              :admin-mode="true"
            />
          </div>
        </div>
      </div>
      
      <div v-else class="bg-white rounded-lg shadow-md p-8 text-center">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
        <h3 class="mt-2 text-lg font-medium text-gray-900">Aucun livreur sélectionné</h3>
        <p class="mt-1 text-sm text-gray-500">
          Veuillez sélectionner un livreur dans la liste pour gérer son planning.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRestaurantStore } from '../../stores/restaurant';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import ScheduleManager from '../../components/deliverer/ScheduleManager.vue';
import BreakManager from '../../components/deliverer/BreakManager.vue';

// Store
const restaurantStore = useRestaurantStore();

// État local
const loading = ref(false);
const error = ref('');
const deliverers = ref<any[]>([]);
const selectedDelivererId = ref('');
const activeTab = ref('schedule');

// Computed
const selectedDeliverer = computed(() => {
  return deliverers.value.find(d => d.id === selectedDelivererId.value);
});

// Initialisation
onMounted(async () => {
  await loadDeliverers();
});

// Charger les livreurs
const loadDeliverers = async () => {
  loading.value = true;
  try {
    await restaurantStore.fetchDeliverers();
    deliverers.value = restaurantStore.deliverers;
    console.log("Livreurs chargés:", deliverers.value);
    
    // Afficher plus de détails sur la structure des données
    if (deliverers.value.length > 0) {
      console.log("Structure du premier livreur:", JSON.stringify(deliverers.value[0], null, 2));
    }
  } catch (err: any) {
    console.error("Erreur lors du chargement des livreurs:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Rafraîchir les informations lorsqu'on change de livreur
watch(selectedDelivererId, async () => {
  if (selectedDelivererId.value) {
    // On pourrait ajouter ici d'autres chargements spécifiques au livreur si nécessaire
  }
});
</script>
