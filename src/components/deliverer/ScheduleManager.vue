<template>
  <div class="bg-white rounded-lg shadow-md p-4">
    <h2 class="text-xl font-semibold mb-4">Planning hebdomadaire</h2>
    
    <div v-if="loading" class="flex justify-center my-4">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    </div>
    
    <div v-else>
      <!-- Tableau des horaires -->
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white">
          <thead>
            <tr>
              <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jour
              </th>
              <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Début
              </th>
              <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fin
              </th>
              <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="shift in shifts" :key="shift.id" class="hover:bg-gray-50">
              <td class="py-2 px-4 border-b border-gray-200">
                {{ getDayName(shift.day) }}
              </td>
              <td class="py-2 px-4 border-b border-gray-200">
                {{ shift.startTime }}
              </td>
              <td class="py-2 px-4 border-b border-gray-200">
                {{ shift.endTime }}
              </td>
              <td class="py-2 px-4 border-b border-gray-200">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="shift.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                >
                  {{ shift.isActive ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td class="py-2 px-4 border-b border-gray-200 flex space-x-2">
                <button 
                  @click="editShift(shift)"
                  class="text-blue-600 hover:text-blue-900"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button 
                  @click="toggleShiftStatus(shift)"
                  class="text-yellow-600 hover:text-yellow-900"
                >
                  <i class="fas fa-power-off"></i>
                </button>
                <button 
                  @click="confirmDeleteShift(shift.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
            <tr v-if="shifts.length === 0">
              <td colspan="5" class="py-4 text-center text-gray-500">
                Aucun horaire programmé. Cliquez sur "Ajouter un horaire" pour en créer un.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Bouton pour ajouter un horaire -->
      <div class="mt-4 flex justify-end">
        <button 
          @click="showAddModal = true"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
        >
          <i class="fas fa-plus mr-2"></i> Ajouter un horaire
        </button>
      </div>
    </div>
    
    <!-- Modal pour ajouter/modifier un horaire -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">
          {{ editingShift ? 'Modifier l\'horaire' : 'Ajouter un nouvel horaire' }}
        </h3>
        
        <form @submit.prevent="saveShift">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Jour</label>
            <select 
              v-model="currentShift.day" 
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option v-for="(dayName, index) in days" :key="index" :value="index">
                {{ dayName }}
              </option>
            </select>
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Heure de début</label>
            <input 
              type="time" 
              v-model="currentShift.startTime" 
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Heure de fin</label>
            <input 
              type="time" 
              v-model="currentShift.endTime" 
              class="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div class="mb-4 flex items-center">
            <input 
              type="checkbox" 
              id="isActive" 
              v-model="currentShift.isActive" 
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="isActive" class="ml-2 block text-sm text-gray-700">
              Actif
            </label>
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
              {{ loading ? 'Chargement...' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- Modal de confirmation de suppression -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4 text-red-600">Confirmer la suppression</h3>
        <p class="mb-4">Êtes-vous sûr de vouloir supprimer cet horaire ? Cette action est irréversible.</p>
        
        <div class="flex justify-end space-x-3">
          <button 
            @click="showDeleteModal = false"
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button 
            @click="deleteShift"
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            :disabled="loading"
          >
            {{ loading ? 'Chargement...' : 'Supprimer' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useScheduleStore, type ScheduleShift } from '../../stores/schedules';

// Props
interface Props {
  delivererId?: string;  // ID de l'utilisateur livreur (user ID)
}

const props = withDefaults(defineProps<Props>(), {
  delivererId: undefined
});

// Store
const scheduleStore = useScheduleStore();

// État local
const shifts = ref<ScheduleShift[]>([]);
const loading = ref(false);
const errorMessage = ref('');  // Renommé de 'error' à 'errorMessage' pour plus de clarté
const showAddModal = ref(false);
const showDeleteModal = ref(false);
const currentShift = ref<ScheduleShift>({
  delivererId: props.delivererId || '',
  day: 1, // Lundi par défaut
  startTime: '08:00',
  endTime: '16:00',
  isActive: true
});
const editingShift = ref(false);
const shiftToDeleteId = ref<string | null>(null);

// Jours de la semaine
const days = [
  'Dimanche',
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi'
];

// Initialisation
onMounted(async () => {
  await loadSchedule();
});

// Charger les horaires
const loadSchedule = async () => {
  loading.value = true;
  try {
    if (props.delivererId) {
      const data = await scheduleStore.fetchDelivererSchedule(props.delivererId);
      shifts.value = data;
    } else {
      shifts.value = [];
    }
  } catch (error: any) {
    console.error('Erreur lors du chargement des horaires:', error);
    errorMessage.value = error.message || 'Erreur inconnue';
  } finally {
    loading.value = false;
  }
};

// Surveiller les changements du delivererId
watch(() => props.delivererId, async (newId) => {
  if (newId) {
    currentShift.value.delivererId = newId;
    await loadSchedule();
  }
});

// Actions
const closeModal = () => {
  showAddModal.value = false;
  editingShift.value = false;
  // Réinitialiser le formulaire
  currentShift.value = {
    delivererId: props.delivererId || '',
    day: 1,
    startTime: '08:00',
    endTime: '16:00',
    isActive: true
  };
};

const editShift = (shift: ScheduleShift) => {
  editingShift.value = true;
  currentShift.value = { ...shift };
  showAddModal.value = true;
};

const saveShift = async () => {
  loading.value = true;
  try {
    if (editingShift.value && currentShift.value.id) {
      // Mise à jour
      const { id, ...updates } = currentShift.value;
      await scheduleStore.updateShift(id, updates);
    } else {
      // Création
      const { id, ...newShift } = currentShift.value;
      await scheduleStore.addShift(newShift);
    }
    
    await loadSchedule();
    closeModal();
  } catch (error: any) {
    console.error("Erreur lors de l'enregistrement de l'horaire:", error);
    errorMessage.value = error.message || 'Erreur inconnue';
  } finally {
    loading.value = false;
  }
};

const toggleShiftStatus = async (shift: ScheduleShift) => {
  if (!shift.id) return;
  
  loading.value = true;
  try {
    await scheduleStore.updateShift(shift.id, {
      isActive: !shift.isActive
    });
    await loadSchedule();
  } catch (error: any) {
    console.error("Erreur lors du changement de statut:", error);
    errorMessage.value = error.message || 'Erreur inconnue';
  } finally {
    loading.value = false;
  }
};

const confirmDeleteShift = (shiftId: string) => {
  shiftToDeleteId.value = shiftId;
  showDeleteModal.value = true;
};

const deleteShift = async () => {
  if (!shiftToDeleteId.value) return;
  
  loading.value = true;
  try {
    await scheduleStore.deleteShift(shiftToDeleteId.value);
    await loadSchedule();
    showDeleteModal.value = false;
  } catch (error: any) {
    console.error("Erreur lors de la suppression:", error);
    errorMessage.value = error.message || 'Erreur inconnue';
  } finally {
    loading.value = false;
  }
};

// Formatage
const getDayName = (day: number): string => {
  return days[day] || 'Inconnu';
};
</script>
