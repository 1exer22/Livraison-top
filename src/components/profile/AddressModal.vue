<template>
  <modal-base :show="modelValue" @close="$emit('update:modelValue', false)">
    <template #title>
      {{ address ? "Modifier l'adresse" : "Nouvelle adresse" }}
    </template>

    <template #content>
      <form @submit.prevent="saveAddress" class="space-y-4">
        <div class="form-group">
          <label>Nom de l'adresse</label>
          <input
            v-model="form.label"
            type="text"
            class="form-input"
            placeholder="Ex: Domicile, Bureau..."
            required
          />
        </div>

        <div class="form-group">
          <label>Adresse complète</label>
          <input
            v-model="form.street"
            type="text"
            class="form-input"
            placeholder="Numéro et nom de rue"
            required
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label>Code postal</label>
            <input
              v-model="form.postalCode"
              type="text"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label>Ville</label>
            <input
              v-model="form.city"
              type="text"
              class="form-input"
              required
            />
          </div>
        </div>

        <div class="form-group">
          <label>Instructions de livraison (optionnel)</label>
          <textarea
            v-model="form.instructions"
            rows="2"
            class="form-input"
            placeholder="Code d'entrée, étage, etc."
          ></textarea>
        </div>

        <div class="flex items-center">
          <input
            v-model="form.isDefault"
            type="checkbox"
            id="default-address"
            class="form-checkbox"
          />
          <label for="default-address" class="ml-2">
            Définir comme adresse par défaut
          </label>
        </div>
      </form>
    </template>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('update:modelValue', false)"
          class="btn-secondary"
        >
          Annuler
        </button>
        <button @click="saveAddress" class="btn-primary" :disabled="saving">
          {{ saving ? "Enregistrement..." : address ? "Modifier" : "Ajouter" }}
        </button>
      </div>
    </template>
  </modal-base>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import ModalBase from "@/components/common/ModalBase.vue";

const props = defineProps({
  modelValue: Boolean,
  address: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["update:modelValue", "save"]);

const saving = ref(false);
const form = reactive({
  label: "",
  street: "",
  postalCode: "",
  city: "",
  instructions: "",
  isDefault: false,
});

const saveAddress = async () => {
  try {
    saving.value = true;
    await emit("save", form);
    emit("update:modelValue", false);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'adresse:", error);
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  if (props.address) {
    Object.assign(form, props.address);
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

.form-checkbox {
  @apply h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded;
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
