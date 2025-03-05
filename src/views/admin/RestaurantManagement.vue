<template>
  <div class="restaurant-management">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">Gestion des Restaurants</h1>
          <div class="flex gap-2">
            <button @click="showCategoryModal = true" class="btn-secondary">
              <i class="fas fa-tags mr-2"></i>Catégories
            </button>
            <button @click="showAddRestaurantModal = true" class="btn-primary">
              <i class="fas fa-plus mr-2"></i>Nouveau Restaurant
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <!-- Onglets -->
      <div class="mb-6">
        <nav class="flex space-x-4">
          <button 
            v-for="tab in tabs" 
            :key="tab.value"
            @click="currentTab = tab.value"
            :class="[
              'px-3 py-2 rounded-md text-sm font-medium',
              currentTab === tab.value 
                ? 'bg-primary-100 text-primary-700'
                : 'text-gray-500 hover:text-gray-700'
            ]"
          >
            {{ tab.label }}
            <span 
              v-if="tab.count" 
              class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100"
            >
              {{ tab.count }}
            </span>
          </button>
        </nav>
      </div>

      <!-- Filtres -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input 
              v-model="filters.search"
              type="text"
              placeholder="Rechercher un restaurant..."
              class="form-input"
            >
          </div>
          <div>
            <select v-model="filters.category" class="form-select">
              <option value="">Toutes les catégories</option>
              <option 
                v-for="category in categories" 
                :key="category.id" 
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </select>
          </div>
          <div>
            <select v-model="filters.status" class="form-select">
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="pending">En attente</option>
            </select>
          </div>
          <div>
            <button @click="resetFilters" class="btn-secondary w-full">
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      <!-- Liste des restaurants -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Restaurant
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propriétaire
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Note
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="restaurant in filteredRestaurants" :key="restaurant.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img 
                      :src="restaurant.image" 
                      class="h-10 w-10 rounded-full object-cover"
                    >
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">
                      {{ restaurant.name }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ restaurant.address }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ restaurant.owner.name }}</div>
                <div class="text-sm text-gray-500">{{ restaurant.owner.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                  {{ restaurant.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="text-yellow-400 mr-1">★</span>
                  <span>{{ restaurant.rating }}/5</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <status-badge :status="restaurant.status" />
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex justify-end space-x-2">
                  <button 
                    @click="viewRestaurant(restaurant)"
                    class="text-primary-600 hover:text-primary-900"
                  >
                    <i class="fas fa-eye"></i>
                  </button>
                  <button 
                    @click="editRestaurant(restaurant)"
                    class="text-blue-600 hover:text-blue-900"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    @click="toggleRestaurantStatus(restaurant)"
                    :class="restaurant.status === 'active' ? 'text-red-600' : 'text-green-600'"
                  >
                    <i :class="restaurant.status === 'active' ? 'fas fa-ban' : 'fas fa-check'"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t">
          <pagination 
            :total="totalRestaurants"
            :per-page="perPage"
            :current-page="currentPage"
            @page-change="changePage"
          />
        </div>
      </div>
    </main>

    <!-- Modals -->
    <restaurant-modal
      v-model="showAddRestaurantModal"
      :restaurant="editingRestaurant"
      :categories="categories"
      @save="saveRestaurant"
    />

    <category-modal
      v-model="showCategoryModal"
      :categories="categories"
      @save="saveCategory"
      @delete="deleteCategory"
    />

    <restaurant-details-modal
      v-if="selectedRestaurant"
      v-model="showDetailsModal"
      :restaurant="selectedRestaurant"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin'
import StatusBadge from '@/components/common/StatusBadge.vue'
import Pagination from '@/components/common/Pagination.vue'
import RestaurantModal from '@/components/admin/RestaurantModal.vue'
import CategoryModal from '@/components/admin/CategoryModal.vue'
import RestaurantDetailsModal from '@/components/admin/RestaurantDetailsModal.vue'

const adminStore = useAdminStore()

// État
const currentTab = ref('all')
const filters = ref({
  search: '',
  category: '',
  status: ''
})
const showAddRestaurantModal = ref(false)
const showCategoryModal = ref(false)
const showDetailsModal = ref(false)
const editingRestaurant = ref(null)
const selectedRestaurant = ref(null)
const categories = ref([])
const currentPage = ref(1)
const perPage = ref(10)
const totalRestaurants = ref(0)

// Tabs
const tabs = computed(() => [
  { label: 'Tous', value: 'all' },
  { 
    label: 'En attente', 
    value: 'pending',
    count: adminStore.restaurants.filter(r => r.status === 'pending').length
  },
  { label: 'Actifs', value: 'active' },
  { label: 'Inactifs', value: 'inactive' }
])

// Restaurants filtrés
const filteredRestaurants = computed(() => {
  return adminStore.restaurants.filter(restaurant => {
    const matchTab = currentTab.value === 'all' || restaurant.status === currentTab.value
    const matchSearch = !filters.value.search || 
      restaurant.name.toLowerCase().includes(filters.value.search.toLowerCase())
    const matchCategory = !filters.value.category || 
      restaurant.categoryId === filters.value.category
    const matchStatus = !filters.value.status || 
      restaurant.status === filters.value.status
    
    return matchTab && matchSearch && matchCategory && matchStatus
  })
})

// Méthodes
const resetFilters = () => {
  filters.value = {
    search: '',
    category: '',
    status: ''
  }
}

const viewRestaurant = (restaurant) => {
  selectedRestaurant.value = restaurant
  showDetailsModal.value = true
}

const editRestaurant = (restaurant) => {
  editingRestaurant.value = { ...restaurant }
  showAddRestaurantModal.value = true
}

const saveRestaurant = async (restaurantData) => {
  try {
    if (editingRestaurant.value) {
      await adminStore.updateRestaurant(editingRestaurant.value.id, restaurantData)
    } else {
      await adminStore.createRestaurant(restaurantData)
    }
    showAddRestaurantModal.value = false
    editingRestaurant.value = null
    loadRestaurants()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du restaurant:', error)
  }
}

const toggleRestaurantStatus = async (restaurant) => {
  try {
    const newStatus = restaurant.status === 'active' ? 'inactive' : 'active'
    await adminStore.updateRestaurantStatus(restaurant.id, newStatus)
    loadRestaurants()
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error)
  }
}

const saveCategory = async (categoryData) => {
  try {
    if (categoryData.id) {
      await adminStore.updateCategory(categoryData.id, categoryData)
    } else {
      await adminStore.createCategory(categoryData)
    }
    loadCategories()
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la catégorie:', error)
  }
}

const deleteCategory = async (categoryId) => {
  try {
    await adminStore.deleteCategory(categoryId)
    loadCategories()
  } catch (error) {
    console.error('Erreur lors de la suppression de la catégorie:', error)
  }
}

const changePage = (page) => {
  currentPage.value = page
  loadRestaurants()
}

const loadRestaurants = async () => {
  try {
    const result = await adminStore.getRestaurants({
      page: currentPage.value,
      perPage: perPage.value,
      filters: filters.value
    })
    totalRestaurants.value = result.total
  } catch (error) {
    console.error('Erreur lors du chargement des restaurants:', error)
  }
}

const loadCategories = async () => {
  try {
    categories.value = await adminStore.getCategories()
  } catch (error) {
    console.error('Erreur lors du chargement des catégories:', error)
  }
}

onMounted(() => {
  loadRestaurants()
  loadCategories()
})
</script>

<style lang="scss" scoped>
.form-input, .form-select {
  @apply w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.btn-primary {
  @apply bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 
         flex items-center transition-colors duration-200;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 
         flex items-center transition-colors duration-200;
}
</style>
