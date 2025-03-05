<template>
  <div class="user-management">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-gray-900">
            Gestion des Utilisateurs
          </h1>
          <button @click="showAddUserModal = true" class="btn-primary">
            <i class="fas fa-plus mr-2"></i>Nouvel Utilisateur
          </button>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <!-- Filtres et recherche -->
      <div class="bg-white rounded-lg shadow p-4 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="search-box">
            <input
              v-model="filters.search"
              type="text"
              placeholder="Rechercher un utilisateur..."
              class="form-input"
              @input="applyFilters"
            />
          </div>
          <div>
            <select
              v-model="filters.role"
              class="form-select"
              @change="applyFilters"
            >
              <option value="">Tous les rôles</option>
              <option value="client">Client</option>
              <option value="restaurant">Restaurant</option>
              <option value="driver">Livreur</option>
              <option value="admin">Administrateur</option>
            </select>
          </div>
          <div>
            <select
              v-model="filters.status"
              class="form-select"
              @change="applyFilters"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="blocked">Bloqué</option>
            </select>
          </div>
          <div>
            <button @click="resetFilters" class="btn-secondary w-full">
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>

      <!-- Liste des utilisateurs -->
      <div class="bg-white rounded-lg shadow">
        <div class="overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="bg-gray-50">
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Utilisateur
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Rôle
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date d'inscription
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Statut
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Dernière connexion
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in filteredUsers" :key="user.id">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10">
                      <img
                        :src="user.avatar || '/default-avatar.png'"
                        class="h-10 w-10 rounded-full"
                      />
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">
                        {{ user.name }}
                      </div>
                      <div class="text-sm text-gray-500">
                        {{ user.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <role-badge :role="user.role" />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.createdAt) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <status-badge :status="user.status" />
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDate(user.lastLogin) }}
                </td>
                <td
                  class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"
                >
                  <div class="flex justify-end space-x-2">
                    <button
                      @click="editUser(user)"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      <i class="fas fa-edit"></i>
                    </button>
                    <button
                      @click="toggleUserStatus(user)"
                      :class="
                        user.status === 'active'
                          ? 'text-red-600'
                          : 'text-green-600'
                      "
                    >
                      <i
                        :class="
                          user.status === 'active'
                            ? 'fas fa-ban'
                            : 'fas fa-check'
                        "
                      ></i>
                    </button>
                    <button
                      @click="deleteUser(user.id)"
                      class="text-red-600 hover:text-red-900"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="px-6 py-4 border-t">
          <pagination
            :total="totalUsers"
            :per-page="perPage"
            :current-page="currentPage"
            @page-change="changePage"
          />
        </div>
      </div>
    </main>

    <!-- Modals -->
    <user-modal
      v-model="showAddUserModal"
      :user="editingUser"
      @save="saveUser"
      @close="closeUserModal"
    />

    <!-- Confirmation Modal -->
    <confirmation-modal
      v-model="showConfirmModal"
      :title="confirmModalTitle"
      :message="confirmModalMessage"
      @confirm="handleConfirmAction"
      @cancel="closeConfirmModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAdminStore } from "@/stores/admin";
// import RoleBadge from '@/components/admin/RoleBadge.vue'
// import StatusBadge from '@/components/admin/StatusBadge.vue'
import Pagination from "@/components/common/Pagination.vue";
import UserModal from "@/components/admin/UserModal.vue";
import ConfirmationModal from "@/components/common/ConfirmationModal.vue";

const adminStore = useAdminStore();

// État local
const filters = ref({
  search: "",
  role: "",
  status: "",
});
const showAddUserModal = ref(false);
const showConfirmModal = ref(false);
const editingUser = ref(null);
const confirmModalTitle = ref("");
const confirmModalMessage = ref("");
const confirmAction = ref(null);
const currentPage = ref(1);
const perPage = ref(10);
const totalUsers = ref(0);

// Données filtrées
const filteredUsers = computed(() => {
  return adminStore.users.filter((user) => {
    const matchSearch =
      !filters.value.search ||
      user.name.toLowerCase().includes(filters.value.search.toLowerCase()) ||
      user.email.toLowerCase().includes(filters.value.search.toLowerCase());

    const matchRole = !filters.value.role || user.role === filters.value.role;
    const matchStatus =
      !filters.value.status || user.status === filters.value.status;

    return matchSearch && matchRole && matchStatus;
  });
});

// Méthodes
const formatDate = (date) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const applyFilters = () => {
  currentPage.value = 1;
  loadUsers();
};

const resetFilters = () => {
  filters.value = {
    search: "",
    role: "",
    status: "",
  };
  applyFilters();
};

const editUser = (user) => {
  editingUser.value = { ...user };
  showAddUserModal.value = true;
};

const saveUser = async (userData) => {
  try {
    if (editingUser.value) {
      await adminStore.updateUser(editingUser.value.id, userData);
    } else {
      await adminStore.createUser(userData);
    }
    closeUserModal();
    loadUsers();
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'utilisateur:", error);
  }
};

const toggleUserStatus = (user) => {
  confirmModalTitle.value = `${
    user.status === "active" ? "Bloquer" : "Activer"
  } l'utilisateur`;
  confirmModalMessage.value = `Êtes-vous sûr de vouloir ${
    user.status === "active" ? "bloquer" : "activer"
  } cet utilisateur ?`;
  confirmAction.value = () => updateUserStatus(user);
  showConfirmModal.value = true;
};

const updateUserStatus = async (user) => {
  try {
    const newStatus = user.status === "active" ? "blocked" : "active";
    await adminStore.updateUserStatus(user.id, newStatus);
    loadUsers();
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut:", error);
  }
};

const deleteUser = (userId) => {
  confirmModalTitle.value = "Supprimer l'utilisateur";
  confirmModalMessage.value =
    "Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.";
  confirmAction.value = () => confirmDeleteUser(userId);
  showConfirmModal.value = true;
};

const confirmDeleteUser = async (userId) => {
  try {
    await adminStore.deleteUser(userId);
    loadUsers();
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
  }
};

const closeUserModal = () => {
  showAddUserModal.value = false;
  editingUser.value = null;
};

const closeConfirmModal = () => {
  showConfirmModal.value = false;
  confirmAction.value = null;
};

const handleConfirmAction = () => {
  if (confirmAction.value) {
    confirmAction.value();
  }
  closeConfirmModal();
};

const changePage = (page) => {
  currentPage.value = page;
  loadUsers();
};

const loadUsers = async () => {
  try {
    const result = await adminStore.getUsers({
      page: currentPage.value,
      perPage: perPage.value,
      filters: filters.value,
    });
    totalUsers.value = result.total;
  } catch (error) {
    console.error("Erreur lors du chargement des utilisateurs:", error);
  }
};

onMounted(() => {
  loadUsers();
});
</script>

<style lang="scss" scoped>
.form-input,
.form-select {
  @apply w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.btn-primary {
  @apply bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 
         flex items-center transition-colors duration-200;
}

.btn-secondary {
  @apply bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 
         flex items-center justify-center transition-colors duration-200;
}
</style>
