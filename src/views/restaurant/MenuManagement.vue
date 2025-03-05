<template>
  <div class="menu-management">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Gestion des Menus</h1>
          <button @click="showAddCategoryModal = true" class="btn-primary">
            <i class="fas fa-plus mr-2"></i>Nouvelle Catégorie
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <!-- Liste des catégories -->
        <div class="categories-sidebar bg-white rounded-lg shadow p-4">
          <h2 class="text-lg font-semibold mb-4">Catégories</h2>
          <div class="space-y-2">
            <div
              v-for="category in categories"
              :key="category.id"
              @click="selectCategory(category)"
              :class="[
                'category-item',
                { active: selectedCategory?.id === category.id },
              ]"
            >
              <span>{{ category.name }}</span>
              <div class="flex gap-2">
                <button
                  @click.stop="editCategory(category)"
                  class="text-gray-500 hover:text-primary-500"
                >
                  <i class="fas fa-edit"></i>
                </button>
                <button
                  @click.stop="deleteCategory(category.id)"
                  class="text-gray-500 hover:text-red-500"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Liste des plats -->
        <div class="dishes-list col-span-3">
          <div class="bg-white rounded-lg shadow">
            <div class="p-4 border-b flex justify-between items-center">
              <h2 class="text-lg font-semibold">
                {{
                  selectedCategory
                    ? selectedCategory.name
                    : "Sélectionnez une catégorie"
                }}
              </h2>
              <button
                v-if="selectedCategory"
                @click="showAddDishModal = true"
                class="btn-primary"
              >
                <i class="fas fa-plus mr-2"></i>Nouveau Plat
              </button>
            </div>

            <div class="p-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <dish-card
                  v-for="dish in categoryDishes"
                  :key="dish.id"
                  :dish="dish"
                  @edit="editDish"
                  @delete="deleteDish"
                  @toggle-availability="toggleDishAvailability"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <category-modal
      v-model="showAddCategoryModal"
      :category="editingCategory"
      @save="saveCategory"
    />

    <dish-modal
      v-model="showAddDishModal"
      :dish="editingDish"
      :categoryId="selectedCategory?.id"
      @save="saveDish"
    />
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRestaurantStore } from "@/stores/restaurant";
import DishCard from "@/components/restaurant/DishCard.vue";
// import CategoryModal from '@/components/restaurant/CategoryModal.vue'
import DishModal from "@/components/restaurant/DishModal.vue";

const restaurantStore = useRestaurantStore();
const categories = ref([]);
const selectedCategory = ref(null);
const showAddCategoryModal = ref(false);
const showAddDishModal = ref(false);
const editingCategory = ref(null);
const editingDish = ref(null);

const categoryDishes = computed(() => {
  if (!selectedCategory.value) return [];
  return restaurantStore.getDishesForCategory(selectedCategory.value.id);
});

const selectCategory = (category) => {
  selectedCategory.value = category;
};

const editCategory = (category) => {
  editingCategory.value = { ...category };
  showAddCategoryModal.value = true;
};

const saveCategory = async (categoryData) => {
  try {
    if (editingCategory.value) {
      await restaurantStore.updateCategory(
        editingCategory.value.id,
        categoryData
      );
    } else {
      await restaurantStore.createCategory(categoryData);
    }
    showAddCategoryModal.value = false;
    editingCategory.value = null;
    loadCategories();
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la catégorie:", error);
  }
};

const deleteCategory = async (categoryId) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
    try {
      await restaurantStore.deleteCategory(categoryId);
      if (selectedCategory.value?.id === categoryId) {
        selectedCategory.value = null;
      }
      loadCategories();
    } catch (error) {
      console.error("Erreur lors de la suppression de la catégorie:", error);
    }
  }
};

const editDish = (dish) => {
  editingDish.value = { ...dish };
  showAddDishModal.value = true;
};

const saveDish = async (dishData) => {
  try {
    if (editingDish.value) {
      await restaurantStore.updateDish(editingDish.value.id, dishData);
    } else {
      await restaurantStore.createDish({
        ...dishData,
        categoryId: selectedCategory.value.id,
      });
    }
    showAddDishModal.value = false;
    editingDish.value = null;
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du plat:", error);
  }
};

const deleteDish = async (dishId) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce plat ?")) {
    try {
      await restaurantStore.deleteDish(dishId);
    } catch (error) {
      console.error("Erreur lors de la suppression du plat:", error);
    }
  }
};

const toggleDishAvailability = async (dish) => {
  try {
    await restaurantStore.updateDish(dish.id, {
      ...dish,
      available: !dish.available,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la disponibilité:", error);
  }
};

const loadCategories = async () => {
  try {
    categories.value = await restaurantStore.getCategories();
  } catch (error) {
    console.error("Erreur lors du chargement des catégories:", error);
  }
};

onMounted(loadCategories);
</script>

<style lang="scss" scoped>
.category-item {
  @apply flex justify-between items-center p-3 rounded-lg cursor-pointer hover:bg-gray-50;

  &.active {
    @apply bg-primary-50 text-primary-600;
  }
}

.btn-primary {
  @apply bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 
         flex items-center transition-colors duration-200;
}
</style>
