<template>
  <modal-base :show="modelValue" @close="$emit('update:modelValue', false)">
    <template #title>
      {{ restaurant ? "Modifier le restaurant" : "Ajouter un restaurant" }}
    </template>

    <template #content>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- Informations de base -->
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
            <select v-model="form.cuisineType" class="form-select" required>
              <option v-for="type in cuisineTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea
            v-model="form.description"
            rows="3"
            class="form-input"
          ></textarea>
        </div>

        <!-- Contact -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label>Email</label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label>Téléphone</label>
            <input
              v-model="form.phone"
              type="tel"
              class="form-input"
              required
            />
          </div>
        </div>

        <!-- Adresse -->
        <div class="form-group">
          <label>Adresse</label>
          <input
            v-model="form.address"
            type="text"
            class="form-input"
            required
          />
        </div>

        <!-- Paramètres de livraison -->
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label>Frais de livraison (€)</label>
            <input
              v-model="form.deliveryFee"
              type="number"
              step="0.01"
              min="0"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label>Commande minimum (€)</label>
            <input
              v-model="form.minimumOrder"
              type="number"
              step="0.01"
              min="0"
              class="form-input"
              required
            />
          </div>
        </div>

        <!-- Horaires -->
        <div class="form-group">
          <label>Temps de préparation moyen (minutes)</label>
          <input
            v-model="form.prepTime"
            type="number"
            min="0"
            class="form-input"
            required
          />
        </div>

        <!-- Commission -->
        <div class="form-group">
          <label>Commission (%)</label>
          <input
            v-model="form.commission"
            type="number"
            step="0.1"
            min="0"
            max="100"
            class="form-input"
            required
          />
        </div>

        <!-- Images -->
        <div class="form-group">
          <label>Image principale</label>
          <div class="flex items-center space-x-4">
            <img
              :src="form.image || '/placeholder-restaurant.jpg'"
              class="w-24 h-24 object-cover rounded-lg"
            />
            <input
              type="file"
              accept="image/*"
              @change="handleImageUpload"
              class="form-input"
            />
          </div>
        </div>

        <!-- Statut -->
        <div class="flex items-center justify-between">
          <label class="font-medium">Actif</label>
          <toggle-switch v-model="form.active" />
        </div>
      </form>
    </template>

    <template #footer>
      <button
        type="button"
        class="btn-secondary mr-3"
        @click="$emit('update:modelValue', false)"
      >
        Annuler
      </button>
      <button
        type="submit"
        class="btn-primary"
        :disabled="loading"
        @click="handleSubmit"
      >
        {{
          loading ? "Enregistrement..." : restaurant ? "Modifier" : "Ajouter"
        }}
      </button>
    </template>
  </modal-base>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import ModalBase from "@/components/common/ModalBase.vue";
import ToggleSwitch from "@/components/common/ToggleSwitch.vue";

const props = defineProps({
  modelValue: Boolean,
  restaurant: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "save"]);

const loading = ref(false);
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

const form = reactive({
  name: "",
  cuisineType: "",
  description: "",
  email: "",
  phone: "",
  address: "",
  deliveryFee: 0,
  minimumOrder: 0,
  prepTime: 30,
  commission: 15,
  image: "",
  active: true,
});

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      form.image = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    await emit("save", form);
    emit("update:modelValue", false);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  if (props.restaurant) {
    Object.assign(form, props.restaurant);
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
