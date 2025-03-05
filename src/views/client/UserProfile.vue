<template>
  <div class="user-profile">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">Mon Profil</h1>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Informations personnelles -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold mb-6">
              Informations personnelles
            </h2>
            <form @submit.prevent="updateProfile" class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label>Prénom</label>
                  <input
                    v-model="form.firstName"
                    type="text"
                    class="form-input"
                  />
                </div>
                <div class="form-group">
                  <label>Nom</label>
                  <input
                    v-model="form.lastName"
                    type="text"
                    class="form-input"
                  />
                </div>
              </div>

              <div class="form-group">
                <label>Email</label>
                <input v-model="form.email" type="email" class="form-input" />
              </div>

              <div class="form-group">
                <label>Téléphone</label>
                <input v-model="form.phone" type="tel" class="form-input" />
              </div>

              <div class="flex justify-end">
                <button type="submit" class="btn-primary" :disabled="updating">
                  <span v-if="updating">
                    <i class="fas fa-spinner fa-spin mr-2"></i>Mise à jour...
                  </span>
                  <span v-else>Enregistrer les modifications</span>
                </button>
              </div>
            </form>
          </div>

          <!-- Adresses de livraison -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-lg font-semibold">Adresses de livraison</h2>
              <button @click="showAddAddressModal = true" class="btn-secondary">
                <i class="fas fa-plus mr-2"></i>Ajouter une adresse
              </button>
            </div>

            <div class="space-y-4">
              <div
                v-for="address in addresses"
                :key="address.id"
                class="flex justify-between items-center p-4 border rounded-lg"
              >
                <div>
                  <h3 class="font-medium">{{ address.label }}</h3>
                  <p class="text-gray-600">{{ address.fullAddress }}</p>
                </div>
                <div class="flex items-center space-x-2">
                  <button
                    v-if="!address.isDefault"
                    @click="setDefaultAddress(address.id)"
                    class="text-primary-600 hover:text-primary-800"
                  >
                    Définir par défaut
                  </button>
                  <button
                    @click="editAddress(address)"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    @click="deleteAddress(address.id)"
                    class="text-red-600 hover:text-red-800"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Préférences -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold mb-6">Préférences</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span>Notifications par email</span>
                <toggle-switch
                  v-model="preferences.emailNotifications"
                  @change="updatePreferences"
                />
              </div>
              <div class="flex items-center justify-between">
                <span>Notifications push</span>
                <toggle-switch
                  v-model="preferences.pushNotifications"
                  @change="updatePreferences"
                />
              </div>
              <div class="flex items-center justify-between">
                <span>Newsletter</span>
                <toggle-switch
                  v-model="preferences.newsletter"
                  @change="updatePreferences"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Photo de profil -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="text-center">
              <div class="relative inline-block">
                <img
                  :src="form.avatar || '/default-avatar.png'"
                  class="w-32 h-32 rounded-full"
                  alt="Profile"
                />
                <button
                  @click="triggerAvatarUpload"
                  class="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700"
                >
                  <i class="fas fa-camera"></i>
                </button>
                <input
                  ref="avatarInput"
                  type="file"
                  accept="image/*"
                  class="hidden"
                  @change="handleAvatarChange"
                />
              </div>
            </div>
          </div>

          <!-- Sécurité -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold mb-4">Sécurité</h2>
            <div class="space-y-3">
              <button
                @click="showChangePasswordModal = true"
                class="btn-outline w-full"
              >
                <i class="fas fa-lock mr-2"></i>Changer le mot de passe
              </button>
              <button
                @click="showTwoFactorModal = true"
                class="btn-outline w-full"
              >
                <i class="fas fa-shield-alt mr-2"></i>Double authentification
              </button>
            </div>
          </div>

          <!-- Moyens de paiement -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-semibold">Moyens de paiement</h2>
              <button
                @click="showAddPaymentModal = true"
                class="text-primary-600 hover:text-primary-800"
              >
                <i class="fas fa-plus"></i>
              </button>
            </div>
            <div class="space-y-3">
              <div
                v-for="card in paymentMethods"
                :key="card.id"
                class="flex items-center justify-between p-3 border rounded-lg"
              >
                <div class="flex items-center">
                  <i :class="getCardIcon(card.brand)" class="text-2xl mr-3"></i>
                  <span>•••• {{ card.last4 }}</span>
                </div>
                <button
                  @click="deletePaymentMethod(card.id)"
                  class="text-red-600 hover:text-red-800"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Suppression du compte -->
          <div class="bg-white rounded-lg shadow-sm p-6">
            <h2 class="text-lg font-semibold text-red-600 mb-4">
              Zone dangereuse
            </h2>
            <button
              @click="showDeleteAccountModal = true"
              class="btn-danger w-full"
            >
              <i class="fas fa-trash-alt mr-2"></i>Supprimer mon compte
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <address-modal
      v-model="showAddAddressModal"
      :address="editingAddress"
      @save="saveAddress"
    />

    <change-password-modal
      v-model="showChangePasswordModal"
      @save="updatePassword"
    />

    <two-factor-modal
      v-model="showTwoFactorModal"
      :enabled="twoFactorEnabled"
      @save="updateTwoFactor"
    />

    <payment-method-modal
      v-model="showAddPaymentModal"
      @save="addPaymentMethod"
    />

    <delete-account-modal
      v-model="showDeleteAccountModal"
      @confirm="deleteAccount"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useUserStore } from "@/stores/user";
import AddressModal from "@/components/profile/AddressModal.vue";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal.vue";
import TwoFactorModal from "@/components/profile/TwoFactorModal.vue";
import PaymentMethodModal from "@/components/profile/PaymentMethodModal.vue";
// import DeleteAccountModal from "@/components/profile/DeleteAccountModal.vue";
import ToggleSwitch from "@/components/common/ToggleSwitch.vue";

const authStore = useAuthStore();
const userStore = useUserStore();

// États
const form = reactive({
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  avatar: "",
});

const addresses = ref([]);
const paymentMethods = ref([]);
const preferences = ref({
  emailNotifications: true,
  pushNotifications: true,
  newsletter: false,
});

const updating = ref(false);
const twoFactorEnabled = ref(false);

// Modals
const showAddAddressModal = ref(false);
const showChangePasswordModal = ref(false);
const showTwoFactorModal = ref(false);
const showAddPaymentModal = ref(false);
const showDeleteAccountModal = ref(false);

// Refs
const avatarInput = ref(null);
const editingAddress = ref(null);

// Méthodes
const updateProfile = async () => {
  try {
    updating.value = true;
    await userStore.updateProfile(form);
    // Afficher notification de succès
  } catch (error) {
    console.error("Erreur de mise à jour du profil:", error);
  } finally {
    updating.value = false;
  }
};

const triggerAvatarUpload = () => {
  avatarInput.value.click();
};

const handleAvatarChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    try {
      const avatarUrl = await userStore.uploadAvatar(file);
      form.avatar = avatarUrl;
    } catch (error) {
      console.error("Erreur de téléchargement de l'avatar:", error);
    }
  }
};

const setDefaultAddress = async (addressId) => {
  try {
    await userStore.setDefaultAddress(addressId);
    loadAddresses();
  } catch (error) {
    console.error(
      "Erreur lors de la définition de l'adresse par défaut:",
      error
    );
  }
};

const editAddress = (address) => {
  editingAddress.value = { ...address };
  showAddAddressModal.value = true;
};

const saveAddress = async (addressData) => {
  try {
    if (editingAddress.value) {
      await userStore.updateAddress(editingAddress.value.id, addressData);
    } else {
      await userStore.addAddress(addressData);
    }
    showAddAddressModal.value = false;
    editingAddress.value = null;
    loadAddresses();
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de l'adresse:", error);
  }
};

const deleteAddress = async (addressId) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette adresse ?")) {
    try {
      await userStore.deleteAddress(addressId);
      loadAddresses();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'adresse:", error);
    }
  }
};

const updatePreferences = async () => {
  try {
    await userStore.updatePreferences(preferences.value);
  } catch (error) {
    console.error("Erreur lors de la mise à jour des préférences:", error);
  }
};

const getCardIcon = (brand) => {
  const icons = {
    visa: "fab fa-cc-visa",
    mastercard: "fab fa-cc-mastercard",
    amex: "fab fa-cc-amex",
  };
  return icons[brand] || "fas fa-credit-card";
};

const deletePaymentMethod = async (methodId) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce moyen de paiement ?")) {
    try {
      await userStore.deletePaymentMethod(methodId);
      loadPaymentMethods();
    } catch (error) {
      console.error(
        "Erreur lors de la suppression du moyen de paiement:",
        error
      );
    }
  }
};

const deleteAccount = async () => {
  try {
    await authStore.deleteAccount();
    // Rediriger vers la page d'accueil
  } catch (error) {
    console.error("Erreur lors de la suppression du compte:", error);
  }
};

// Chargement des données
const loadUserData = async () => {
  try {
    const userData = await userStore.getUserProfile();
    Object.assign(form, userData);
  } catch (error) {
    console.error("Erreur de chargement du profil:", error);
  }
};

const loadAddresses = async () => {
  try {
    addresses.value = await userStore.getAddresses();
  } catch (error) {
    console.error("Erreur de chargement des adresses:", error);
  }
};

const loadPaymentMethods = async () => {
  try {
    paymentMethods.value = await userStore.getPaymentMethods();
  } catch (error) {
    console.error("Erreur de chargement des moyens de paiement:", error);
  }
};

onMounted(() => {
  loadUserData();
  loadAddresses();
  loadPaymentMethods();
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

.btn-outline {
  @apply px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 
         transition-colors duration-200 text-left;
}

.btn-danger {
  @apply px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 
         transition-colors duration-200;
}
</style>
