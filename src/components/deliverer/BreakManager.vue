<template>
  <div class="bg-white rounded-lg shadow-md p-4">
    <h2 class="text-xl font-semibold mb-4">Gestion des pauses</h2>
    
    <div v-if="loading" class="flex justify-center my-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else>
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-700 mb-2">Pauses actives</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Début
                </th>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fin
                </th>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Raison
                </th>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="breakItem in activeBreaks" :key="breakItem.id" class="hover:bg-gray-50">
                <td class="py-2 px-4 border-b border-gray-200">
                  {{ formatDate(breakItem.startTime) }}
                </td>
                <td class="py-2 px-4 border-b border-gray-200">
                  {{ formatDate(breakItem.endTime) }}
                </td>
                <td class="py-2 px-4 border-b border-gray-200">
                  {{ breakItem.reason }}
                </td>
                <td class="py-2 px-4 border-b border-gray-200">
                  <button 
                    @click="confirmCancelBreak(breakItem.id)"
                    class="text-red-600 hover:text-red-900"
                  >
                    <i class="fas fa-times-circle mr-1"></i> Annuler
                  </button>
                </td>
              </tr>
              <tr v-if="activeBreaks.length === 0">
                <td colspan="4" class="py-4 text-center text-gray-500">
                  Aucune pause active actuellement.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="mb-6" v-if="isAdmin">
        <h3 class="text-lg font-medium text-gray-700 mb-2">Demandes en attente</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Livreur
                </th>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Début
                </th>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fin
                </th>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Raison
                </th>
                <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="breakItem in pendingBreaks" :key="breakItem.id" class="hover:bg-gray-50">
                <td class="py-2 px-4 border-b border-gray-200">
                  {{ getDelivererName(breakItem.delivererId) }}
                </td>
                <td class="py-2 px-4 border-b border-gray-200">
                  {{ formatDate(breakItem.startTime) }}
                </td>
                <td class="py-2 px-4 border-b border-gray-200">
                  {{ formatDate(breakItem.endTime) }}
                </td>
                <td class="py-2 px-4 border-b border-gray-200">
                  {{ breakItem.reason }}
                </td>
                <td class="py-2 px-4 border-b border-gray-200 flex space-x-2">
                  <button 
                    @click="approveBreak(breakItem.id)"
                    class="text-green-600 hover:text-green-900"
                  >
                    <i class="fas fa-check mr-1"></i> Approuver
                  </button>
                  <button 
                    @click="confirmCancelBreak(breakItem.id)"
                    class="text-red-600 hover:text-red-900 ml-2"
                  >
                    <i class="fas fa-times mr-1"></i> Refuser
                  </button>
                </td>
              </tr>
              <tr v-if="pendingBreaks.length === 0">
                <td colspan="5" class="py-4 text-center text-gray-500">
                  Aucune demande de pause en attente.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div class="mt-4 flex justify-end">
        <button 
          @click="showAddModal = true"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
        >
          <i class="fas fa-plus mr-2"></i> Demander une pause
        </button>
      </div>
    </div>
    
    <!-- Modal pour demander une pause -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Demander une pause</h3>
        
        <form @submit.prevent="requestBreak">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input 
              type="datetime-local" 
              v-model="breakRequest.startTimeStr" 
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input 
              type="datetime-local" 
              v-model="breakRequest.endTimeStr" 
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Raison</label>
            <select 
              v-model="breakRequest.reason" 
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">-- Sélectionner une raison --</option>
              <option value="Pause déjeuner">Pause déjeuner</option>
              <option value="Pause courte">Pause courte</option>
              <option value="Rendez-vous médical">Rendez-vous médical</option>
              <option value="Urgence personnelle">Urgence personnelle</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          
          <div class="mb-4" v-if="breakRequest.reason === 'Autre'">
            <label class="block text-sm font-medium text-gray-700 mb-1">Précisez</label>
            <textarea 
              v-model="breakRequest.customReason" 
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              required
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              type="button"
              @click="closeModal"
              class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button 
              type="submit"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              :disabled="loading"
            >
              {{ loading ? 'Chargement...' : 'Demander' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Modal de confirmation d'annulation -->
    <div v-if="showCancelModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4 text-red-600">Confirmer l'annulation</h3>
        <p class="mb-4">Êtes-vous sûr de vouloir annuler cette pause ?</p>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="showCancelModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Retour
          </button>
          <button 
            @click="cancelBreak"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            :disabled="loading"
          >
            {{ loading ? 'Chargement...' : 'Confirmer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useScheduleStore, type Break } from '../../stores/schedules';
import { useAuthStore } from '../../stores/auth';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const props = defineProps<{
  delivererId: string;
  // Si mode admin, on montre toutes les pauses, sinon juste celles du livreur
  adminMode?: boolean;
}>();

// Stores
const scheduleStore = useScheduleStore();
const authStore = useAuthStore();

// État local
const loading = ref(false);
const error = ref('');
const allBreaks = ref<Break[]>([]);
const deliverers = ref<Record<string, any>>({});
const showAddModal = ref(false);
const showCancelModal = ref(false);
const breakToCancel = ref<string | null>(null);

// Computed properties
const isAdmin = computed(() => {
  return authStore.userProfile?.role === 'admin';
});

const activeBreaks = computed(() => {
  return allBreaks.value.filter(breakItem => {
    return breakItem.approved && 
           breakItem.delivererId === props.delivererId &&
           new Date(breakItem.endTime.toDate()) > new Date();
  });
});

const pendingBreaks = computed(() => {
  if (props.adminMode || isAdmin.value) {
    return allBreaks.value.filter(breakItem => !breakItem.approved);
  } else {
    return allBreaks.value.filter(breakItem => 
      !breakItem.approved && breakItem.delivererId === props.delivererId
    );
  }
});

// Demande de pause
const breakRequest = ref({
  startTimeStr: formatDateForInput(new Date()),
  endTimeStr: formatDateForInput(new Date(Date.now() + 30 * 60 * 1000)), // +30 minutes par défaut
  reason: '',
  customReason: ''
});

// Initialisation
onMounted(async () => {
  await loadBreaks();
  if (props.adminMode || isAdmin.value) {
    await loadDeliverers();
  }
});

// Charger les pauses
const loadBreaks = async () => {
  loading.value = true;
  try {
    if (props.adminMode || isAdmin.value) {
      // En mode admin, on charge toutes les pauses
      const breaksCollection = await scheduleStore.fetchDelivererBreaks('all');
      allBreaks.value = breaksCollection;
    } else {
      // Sinon juste les pauses du livreur
      const breaksCollection = await scheduleStore.fetchDelivererBreaks(props.delivererId || '');
      allBreaks.value = breaksCollection;
    }
  } catch (err: any) {
    console.error("Erreur lors du chargement des pauses:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Charger les infos des livreurs (pour le mode admin)
const loadDeliverers = async () => {
  // Cette fonction chargerait les infos des livreurs depuis le store approprié
  // Pour simplifier, on utilise un objet fictif
  deliverers.value = {
    // Simuler des données (à remplacer par une vraie implémentation)
    'deliverer1': { name: 'Jean Dupont' },
    'deliverer2': { name: 'Marie Martin' },
  };
};

// Surveiller les changements du delivererId
watch(() => props.delivererId, async (newId: string) => {
  if (newId) {
    await loadBreaks();
  }
});

// Actions
const closeModal = () => {
  showAddModal.value = false;
  // Réinitialiser le formulaire
  breakRequest.value = {
    startTimeStr: formatDateForInput(new Date()),
    endTimeStr: formatDateForInput(new Date(Date.now() + 30 * 60 * 1000)),
    reason: '',
    customReason: ''
  };
};

const requestBreak = async () => {
  loading.value = true;
  try {
    const reason = breakRequest.value.reason === 'Autre' 
      ? breakRequest.value.customReason 
      : breakRequest.value.reason;
    
    const startTime = new Date(breakRequest.value.startTimeStr);
    const endTime = new Date(breakRequest.value.endTimeStr);
    
    if (endTime <= startTime) {
      throw new Error("La date de fin doit être après la date de début");
    }
    
    await scheduleStore.requestBreak(
      props.delivererId || '',
      Timestamp.fromDate(startTime),
      Timestamp.fromDate(endTime),
      reason || 'Non spécifié'
    );
    
    await loadBreaks();
    closeModal();
  } catch (err: any) {
    console.error("Erreur lors de la demande de pause:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const approveBreak = async (breakId: string) => {
  loading.value = true;
  try {
    await scheduleStore.approveBreak(breakId, authStore.user?.uid || '');
    await loadBreaks();
  } catch (err: any) {
    console.error("Erreur lors de l'approbation de la pause:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const confirmCancelBreak = (breakId: string) => {
  breakToCancel.value = breakId;
  showCancelModal.value = true;
};

const cancelBreak = async () => {
  if (!breakToCancel.value) return;
  
  loading.value = true;
  try {
    await scheduleStore.cancelBreak(breakToCancel.value);
    await loadBreaks();
    showCancelModal.value = false;
  } catch (err: any) {
    console.error("Erreur lors de l'annulation de la pause:", err);
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

// Formatage
function formatDate(timestamp: any): string {
  if (!timestamp) return '';
  
  let date;
  if (timestamp instanceof Timestamp) {
    date = timestamp.toDate();
  } else if (timestamp.toDate instanceof Function) {
    date = timestamp.toDate();
  } else {
    date = new Date(timestamp);
  }
  
  return format(date, 'dd/MM/yyyy HH:mm', { locale: fr });
}

function formatDateForInput(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDelivererName(delivererId: string): string {
  return deliverers.value[delivererId]?.name || delivererId;
}
</script>
