<template>
  <modal-base :show="modelValue" @close="closeModal">
    <template #title>
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium">Gestion des catégories</h3>
        <button @click="addNewCategory" class="btn-primary text-sm">
          <i class="fas fa-plus mr-2"></i>Nouvelle catégorie
        </button>
      </div>
    </template>

    <template #content>
      <div class="space-y-6">
        <!-- Liste des catégories existantes -->
        <div class="categories-list space-y-2">
          <div
            v-for="cat in sortedCategories"
            :key="cat.id"
            class="category-item"
            :class="{ editing: editingCategory?.id === cat.id }"
          >
            <!-- Mode affichage -->
            <div
              v-if="editingCategory?.id !== cat.id"
              class="flex items-center justify-between p-3"
            >
              <div class="flex items-center">
                <i :class="[cat.icon, 'text-xl text-gray-600 mr-3']"></i>
                <div>
                  <h4 class="font-medium">{{ cat.name }}</h4>
                  <p class="text-sm text-gray-500">{{ cat.description }}</p>
                </div>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  :class="[
                    'px-2 py-1 text-xs rounded-full',
                    cat.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{ cat.active ? "Active" : "Inactive" }}
                </span>
                <button
                  @click="startEditing(cat)"
                  class="text-blue-600 hover:text-blue-800"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click="confirmDelete(cat)"
                  class="text-red-600 hover:text-red-800"
                >
                  <i class="fas fa-trash"></i>
                </button>
                <button
                  class="text-gray-600 hover:text-gray-800 cursor-move"
                  @mousedown="startDrag($event, cat)"
                >
                  <i class="fas fa-grip-vertical"></i>
                </button>
              </div>
            </div>

            <!-- Mode édition -->
            <form
              v-else
              @submit.prevent="saveCategory"
              class="p-3 bg-gray-50 rounded-lg"
            >
              <div class="grid grid-cols-1 gap-4">
                <div class="form-group">
                  <label>Nom</label>
                  <input
                    v-model="editingCategory.name"
                    type="text"
                    class="form-input"
                    required
                  />
                </div>

                <div class="form-group">
                  <label>Description</label>
                  <textarea
                    v-model="editingCategory.description"
                    rows="2"
                    class="form-input"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label>Icône</label>
                  <div class="grid grid-cols-8 gap-2">
                    <button
                      v-for="icon in availableIcons"
                      :key="icon"
                      type="button"
                      @click="editingCategory.icon = icon"
                      :class="[
                        'p-2 rounded-lg text-xl',
                        editingCategory.icon === icon
                          ? 'bg-primary-50 text-primary-600 border-2 border-primary-500'
                          : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100',
                      ]"
                    >
                      <i :class="icon"></i>
                    </button>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <div class="flex items-center">
                    <label class="mr-3">Active</label>
                    <toggle-switch v-model="editingCategory.active" />
                  </div>
                  <div class="flex space-x-2">
                    <button
                      type="button"
                      @click="cancelEditing"
                      class="btn-secondary"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      class="btn-primary"
                      :disabled="saving"
                    >
                      {{ saving ? "Enregistrement..." : "Enregistrer" }}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        <!-- Message si aucune catégorie -->
        <div
          v-if="categories.length === 0"
          class="text-center py-8 text-gray-500"
        >
          Aucune catégorie. Créez votre première catégorie !
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-between items-center w-full">
        <p class="text-sm text-gray-500">
          {{ categories.length }} catégorie(s)
        </p>
        <button @click="closeModal" class="btn-secondary">Fermer</button>
      </div>
    </template>
  </modal-base>

  <!-- Modal de confirmation de suppression -->
  <confirmation-modal
    v-if="categoryToDelete"
    v-model="showDeleteConfirmation"
    title="Supprimer la catégorie"
    :message="`Êtes-vous sûr de vouloir supprimer la catégorie '${categoryToDelete.name}' ? Cette action est irréversible.`"
    @confirm="deleteCategory"
    @cancel="cancelDelete"
  />
</template>

<script setup>
import { ref, computed } from "vue";
import ModalBase from "@/components/common/ModalBase.vue";
import ToggleSwitch from "@/components/common/ToggleSwitch.vue";
import ConfirmationModal from "@/components/common/ConfirmationModal.vue";

const props = defineProps({
  modelValue: Boolean,
  categories: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "save", "delete", "reorder"]);

// États
const editingCategory = ref(null);
const categoryToDelete = ref(null);
const showDeleteConfirmation = ref(false);
const saving = ref(false);
const draggedCategory = ref(null);
const draggedIndex = ref(null);

// Icônes disponibles
const availableIcons = [
  "fas fa-utensils",
  "fas fa-hamburger",
  "fas fa-pizza-slice",
  "fas fa-fish",
  "fas fa-carrot",
  "fas fa-ice-cream",
  "fas fa-coffee",
  "fas fa-beer",
  "fas fa-drumstick-bite",
  "fas fa-bread-slice",
  "fas fa-cheese",
  "fas fa-egg",
];

// Catégories triées par ordre
const sortedCategories = computed(() => {
  return [...props.categories].sort((a, b) => a.order - b.order);
});

// Méthodes
const addNewCategory = () => {
  editingCategory.value = {
    id: null,
    name: "",
    description: "",
    icon: "fas fa-utensils",
    active: true,
    order: props.categories.length,
  };
};

const startEditing = (category) => {
  editingCategory.value = { ...category };
};

const cancelEditing = () => {
  editingCategory.value = null;
};

const saveCategory = async () => {
  try {
    saving.value = true;
    await emit("save", editingCategory.value);
    editingCategory.value = null;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde:", error);
  } finally {
    saving.value = false;
  }
};

const confirmDelete = (category) => {
  categoryToDelete.value = category;
  showDeleteConfirmation.value = true;
};

const deleteCategory = async () => {
  try {
    await emit("delete", categoryToDelete.value.id);
    showDeleteConfirmation.value = false;
    categoryToDelete.value = null;
  } catch (error) {
    console.error("Erreur lors de la suppression:", error);
  }
};

const cancelDelete = () => {
  showDeleteConfirmation.value = false;
  categoryToDelete.value = null;
};

// Gestion du drag & drop
const startDrag = (event, category) => {
  draggedCategory.value = category;
  draggedIndex.value = props.categories.findIndex((c) => c.id === category.id);
  event.dataTransfer.effectAllowed = "move";
};

const onDrag = (event, category) => {
  if (!draggedCategory.value) return;

  const currentIndex = props.categories.findIndex((c) => c.id === category.id);
  if (currentIndex === draggedIndex.value) return;

  const newCategories = [...props.categories];
  const [removed] = newCategories.splice(draggedIndex.value, 1);
  newCategories.splice(currentIndex, 0, removed);

  // Mettre à jour l'ordre
  newCategories.forEach((cat, index) => {
    cat.order = index;
  });

  emit("reorder", newCategories);
  draggedIndex.value = currentIndex;
};

const closeModal = () => {
  editingCategory.value = null;
  categoryToDelete.value = null;
  emit("update:modelValue", false);
};
</script>

<style lang="scss" scoped>
.category-item {
  @apply bg-white rounded-lg border transition-all duration-200;

  &.editing {
    @apply border-primary-500 shadow-sm;
  }

  &.dragging {
    @apply opacity-50;
  }
}

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
</style>
