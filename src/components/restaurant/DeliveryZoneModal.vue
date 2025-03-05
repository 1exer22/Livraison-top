<template>
  <modal-base :show="modelValue" @close="$emit('update:modelValue', false)">
    <template #title>
      <h3 class="text-lg font-medium">Zone de livraison</h3>
    </template>

    <template #content>
      <div class="space-y-6">
        <!-- Carte -->
        <div class="h-[400px] rounded-lg border" ref="mapContainer"></div>

        <!-- Paramètres de la zone -->
        <div class="space-y-4">
          <div class="form-group">
            <label>Rayon de livraison (km)</label>
            <input
              v-model="deliveryRadius"
              type="number"
              min="0.5"
              max="20"
              step="0.5"
              class="form-input"
              @input="updateZone"
            />
          </div>

          <div class="form-group">
            <label>Frais de livraison par zone</label>
            <div class="space-y-2">
              <div
                v-for="(zone, index) in deliveryZones"
                :key="index"
                class="grid grid-cols-3 gap-2"
              >
                <div class="col-span-2">
                  <input
                    v-model="zone.range"
                    type="text"
                    class="form-input"
                    placeholder="0-2km"
                  />
                </div>
                <div>
                  <input
                    v-model="zone.fee"
                    type="number"
                    min="0"
                    step="0.5"
                    class="form-input"
                    placeholder="Prix"
                  />
                </div>
              </div>
              <button @click="addZone" class="btn-secondary w-full">
                <i class="fas fa-plus mr-2"></i>Ajouter une zone
              </button>
            </div>
          </div>

          <!-- Options avancées -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label>Zones exclues</label>
              <toggle-switch
                v-model="showExcludedZones"
                @change="toggleExcludedZones"
              />
            </div>
            <div class="flex items-center justify-between">
              <label>Limiter par temps de trajet</label>
              <toggle-switch v-model="limitByTravelTime" @change="updateZone" />
            </div>
            <div v-if="limitByTravelTime" class="form-group">
              <label>Temps de trajet maximum (minutes)</label>
              <input
                v-model="maxTravelTime"
                type="number"
                min="5"
                max="60"
                class="form-input"
                @input="updateZone"
              />
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between w-full">
        <button @click="resetZone" class="btn-danger">Réinitialiser</button>
        <div class="flex space-x-2">
          <button
            @click="$emit('update:modelValue', false)"
            class="btn-secondary"
          >
            Annuler
          </button>
          <button @click="saveZone" class="btn-primary" :disabled="saving">
            {{ saving ? "Enregistrement..." : "Enregistrer" }}
          </button>
        </div>
      </div>
    </template>
  </modal-base>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import ModalBase from "@/components/common/ModalBase.vue";
import ToggleSwitch from "@/components/common/ToggleSwitch.vue";
import { initMap, drawZone, clearZone } from "@/services/mapService";

const props = defineProps({
  modelValue: Boolean,
  zone: {
    type: Object,
    default: () => ({
      radius: 5,
      zones: [],
      excludedAreas: [],
      maxTravelTime: 30,
    }),
  },
});

const emit = defineEmits(["update:modelValue", "save"]);

// États
const mapContainer = ref(null);
const map = ref(null);
const deliveryRadius = ref(props.zone.radius);
const deliveryZones = ref(props.zone.zones || []);
const showExcludedZones = ref(false);
const limitByTravelTime = ref(false);
const maxTravelTime = ref(props.zone.maxTravelTime);
const saving = ref(false);

// Méthodes
const initializeMap = async () => {
  map.value = await initMap(mapContainer.value);
  if (props.zone) {
    drawZone(map.value, props.zone);
  }
};

const updateZone = () => {
  if (!map.value) return;

  clearZone(map.value);
  drawZone(map.value, {
    radius: deliveryRadius.value,
    zones: deliveryZones.value,
    maxTravelTime: limitByTravelTime.value ? maxTravelTime.value : null,
  });
};

const addZone = () => {
  deliveryZones.value.push({
    range: "",
    fee: 0,
  });
};

const toggleExcludedZones = () => {
  // Implémenter la logique pour dessiner/masquer les zones exclues
};

const resetZone = () => {
  deliveryRadius.value = 5;
  deliveryZones.value = [];
  showExcludedZones.value = false;
  limitByTravelTime.value = false;
  maxTravelTime.value = 30;
  updateZone();
};

const saveZone = async () => {
  try {
    saving.value = true;
    const zoneData = {
      radius: deliveryRadius.value,
      zones: deliveryZones.value,
      excludedAreas: [], // À implémenter
      maxTravelTime: limitByTravelTime.value ? maxTravelTime.value : null,
    };
    await emit("save", zoneData);
    emit("update:modelValue", false);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la zone:", error);
  } finally {
    saving.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  initializeMap();
});

onUnmounted(() => {
  if (map.value) {
    // Nettoyer la carte si nécessaire
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

.btn-primary {
  @apply px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
         disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 
         transition-colors duration-200;
}

.btn-danger {
  @apply px-4 py-2 text-red-600 border border-red-200 rounded-lg 
         hover:bg-red-50 transition-colors duration-200;
}
</style>
