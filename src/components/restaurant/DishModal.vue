<template>
  <modal-base :show="modelValue" @close="$emit('update:modelValue', false)">
    <template #title>
      {{ dish ? "Modifier le plat" : "Nouveau plat" }}
    </template>

    <template #content>
      <form @submit.prevent="saveDish" class="space-y-4">
        <div class="form-group">
          <label>Nom du plat</label>
          <input
            v-model="formData.name"
            type="text"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea
            v-model="formData.description"
            rows="3"
            class="form-input"
          ></textarea>
        </div>

        <div class="form-group">
          <label>Prix</label>
          <input
            v-model="formData.price"
            type="number"
            step="0.01"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Image</label>
          <input
            type="file"
            @change="handleImageUpload"
            accept="image/*"
            class="form-input"
          />
        </div>

        <!-- Options du plat -->
        <div class="form-group">
          <label>Options</label>
          <div class="space-y-2">
            <div
              v-for="(option, index) in formData.options"
              :key="index"
              class="flex gap-2"
            >
              <input
                v-model="option.name"
                placeholder="Nom"
                class="form-input flex-grow"
              />
              <input
                v-model="option.price"
                type="number"
                step="0.01"
                placeholder="Prix"
                class="form-input w-24"
              />
              <button
                @click="removeOption(index)"
                type="button"
                class="text-red-500"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
            <button @click="addOption" type="button" class="btn-secondary">
              Ajouter une option
            </button>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <button @click="$emit('update:modelValue', false)" class="btn-secondary">
        Annuler
      </button>
      <button @click="saveDish" class="btn-primary">
        {{ dish ? "Modifier" : "Créer" }}
      </button>
    </template>
  </modal-base>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ModalBase from "../components/common/ModalBase.vue";

const props = defineProps({
  modelValue: Boolean,
  dish: Object,
  categoryId: String,
});

const emit = defineEmits(["update:modelValue", "save"]);

const formData = ref({
  name: "",
  description: "",
  price: 0,
  image: "",
  options: [],
  available: true,
});

const addOption = () => {
  formData.value.options.push({ name: "", price: 0 });
};

const removeOption = (index) => {
  formData.value.options.splice(index, 1);
};

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Simuler le téléchargement d'image
    formData.value.image = URL.createObjectURL(file);
  }
};

const saveDish = () => {
  emit("save", {
    ...formData.value,
    categoryId: props.categoryId,
  });
};

onMounted(() => {
  if (props.dish) {
    formData.value = { ...props.dish };
  }
});
</script>

<style lang="scss" scoped>
.form-input {
  @apply w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.btn-primary {
  @apply bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300;
}
</style>
