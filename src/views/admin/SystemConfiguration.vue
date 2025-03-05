<template>
  <div class="system-configuration">
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <h1 class="text-2xl font-bold text-gray-900">Configuration Système</h1>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
      <div class="grid grid-cols-12 gap-6">
        <!-- Menu de navigation -->
        <div class="col-span-3">
          <div class="bg-white rounded-lg shadow">
            <nav class="space-y-1 p-4">
              <button
                v-for="section in configSections"
                :key="section.id"
                @click="currentSection = section.id"
                :class="[
                  'w-full flex items-center px-4 py-2 text-sm rounded-lg',
                  currentSection === section.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50',
                ]"
              >
                <i :class="[section.icon, 'mr-3']"></i>
                {{ section.name }}
              </button>
            </nav>
          </div>
        </div>

        <!-- Contenu de la configuration -->
        <div class="col-span-9">
          <div class="bg-white rounded-lg shadow">
            <!-- Paramètres généraux -->
            <div v-if="currentSection === 'general'" class="p-6">
              <h2 class="text-lg font-medium mb-6">Paramètres généraux</h2>
              <form @submit.prevent="saveGeneralSettings" class="space-y-6">
                <div class="grid grid-cols-2 gap-6">
                  <div class="form-group">
                    <label>Nom de la plateforme</label>
                    <input
                      v-model="generalSettings.platformName"
                      type="text"
                      class="form-input"
                    />
                  </div>
                  <div class="form-group">
                    <label>Contact support</label>
                    <input
                      v-model="generalSettings.supportEmail"
                      type="email"
                      class="form-input"
                    />
                  </div>
                  <div class="form-group">
                    <label>Devise</label>
                    <select
                      v-model="generalSettings.currency"
                      class="form-select"
                    >
                      <option value="EUR">EUR (€)</option>
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Fuseau horaire</label>
                    <select
                      v-model="generalSettings.timezone"
                      class="form-select"
                    >
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label>Logo de la plateforme</label>
                  <div class="flex items-center space-x-4">
                    <img
                      :src="generalSettings.logo"
                      class="h-12 w-12 object-contain"
                    />
                    <input
                      type="file"
                      @change="handleLogoUpload"
                      accept="image/*"
                    />
                  </div>
                </div>

                <button type="submit" class="btn-primary">
                  Enregistrer les modifications
                </button>
              </form>
            </div>

            <!-- Zones de livraison -->
            <div v-if="currentSection === 'delivery'" class="p-6">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-lg font-medium">Zones de livraison</h2>
                <button @click="showAddZoneModal = true" class="btn-primary">
                  <i class="fas fa-plus mr-2"></i>Nouvelle zone
                </button>
              </div>

              <div class="space-y-4">
                <div
                  v-for="zone in deliveryZones"
                  :key="zone.id"
                  class="border rounded-lg p-4"
                >
                  <div class="flex justify-between items-start">
                    <div>
                      <h3 class="font-medium">{{ zone.name }}</h3>
                      <p class="text-sm text-gray-600">
                        {{ zone.description }}
                      </p>
                      <div class="mt-2 flex items-center space-x-4">
                        <span class="text-sm">
                          Frais de livraison:
                          {{ formatPrice(zone.deliveryFee) }}
                        </span>
                        <span class="text-sm">
                          Minimum commande: {{ formatPrice(zone.minimumOrder) }}
                        </span>
                      </div>
                    </div>
                    <div class="flex space-x-2">
                      <button
                        @click="editZone(zone)"
                        class="text-blue-600 hover:text-blue-800"
                      >
                        <i class="fas fa-edit"></i>
                      </button>
                      <button
                        @click="deleteZone(zone.id)"
                        class="text-red-600 hover:text-red-800"
                      >
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Commissions -->
            <div v-if="currentSection === 'commission'" class="p-6">
              <h2 class="text-lg font-medium mb-6">
                Configuration des commissions
              </h2>
              <form @submit.prevent="saveCommissionSettings" class="space-y-6">
                <div class="grid grid-cols-2 gap-6">
                  <div class="form-group">
                    <label>Commission restaurant (%)</label>
                    <input
                      v-model="commissionSettings.restaurantRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      class="form-input"
                    />
                  </div>
                  <div class="form-group">
                    <label>Commission livreur (€ par course)</label>
                    <input
                      v-model="commissionSettings.driverFee"
                      type="number"
                      min="0"
                      step="0.5"
                      class="form-input"
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>Frais de service client (%)</label>
                  <input
                    v-model="commissionSettings.serviceFee"
                    type="number"
                    min="0"
                    max="100"
                    step="0.1"
                    class="form-input"
                  />
                </div>

                <button type="submit" class="btn-primary">
                  Enregistrer les modifications
                </button>
              </form>
            </div>

            <!-- Notifications -->
            <div v-if="currentSection === 'notifications'" class="p-6">
              <h2 class="text-lg font-medium mb-6">
                Configuration des notifications
              </h2>
              <div class="space-y-6">
                <div class="form-group">
                  <h3 class="text-md font-medium mb-4">Configuration SMTP</h3>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="form-group">
                      <label>Serveur SMTP</label>
                      <input
                        v-model="emailSettings.smtpHost"
                        type="text"
                        class="form-input"
                      />
                    </div>
                    <div class="form-group">
                      <label>Port SMTP</label>
                      <input
                        v-model="emailSettings.smtpPort"
                        type="number"
                        class="form-input"
                      />
                    </div>
                    <div class="form-group">
                      <label>Utilisateur SMTP</label>
                      <input
                        v-model="emailSettings.smtpUser"
                        type="text"
                        class="form-input"
                      />
                    </div>
                    <div class="form-group">
                      <label>Mot de passe SMTP</label>
                      <input
                        v-model="emailSettings.smtpPassword"
                        type="password"
                        class="form-input"
                      />
                    </div>
                  </div>
                </div>

                <div class="form-group">
                  <h3 class="text-md font-medium mb-4">Modèles d'emails</h3>
                  <div class="space-y-4">
                    <div
                      v-for="template in emailTemplates"
                      :key="template.id"
                      class="border rounded-lg p-4"
                    >
                      <div class="flex justify-between items-center mb-2">
                        <h4 class="font-medium">{{ template.name }}</h4>
                        <button
                          @click="editTemplate(template)"
                          class="text-blue-600 hover:text-blue-800"
                        >
                          <i class="fas fa-edit"></i>
                        </button>
                      </div>
                      <p class="text-sm text-gray-600">
                        {{ template.description }}
                      </p>
                    </div>
                  </div>
                </div>

                <button @click="saveNotificationSettings" class="btn-primary">
                  Enregistrer les modifications
                </button>
              </div>
            </div>

            <!-- Intégrations -->
            <div v-if="currentSection === 'integrations'" class="p-6">
              <h2 class="text-lg font-medium mb-6">Intégrations</h2>
              <div class="space-y-6">
                <!-- Stripe -->
                <div class="border rounded-lg p-4">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                      <img src="/stripe-logo.png" class="h-8 w-8 mr-3" />
                      <div>
                        <h3 class="font-medium">Stripe</h3>
                        <p class="text-sm text-gray-600">Paiements en ligne</p>
                      </div>
                    </div>
                    <div class="flex items-center">
                      <span
                        :class="[
                          'px-2 py-1 rounded-full text-sm',
                          stripeConnected
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800',
                        ]"
                      >
                        {{ stripeConnected ? "Connecté" : "Non connecté" }}
                      </span>
                    </div>
                  </div>
                  <div class="space-y-4">
                    <div class="form-group">
                      <label>Clé publique</label>
                      <input
                        v-model="stripeSettings.publicKey"
                        type="text"
                        class="form-input"
                      />
                    </div>
                    <div class="form-group">
                      <label>Clé secrète</label>
                      <input
                        v-model="stripeSettings.secretKey"
                        type="password"
                        class="form-input"
                      />
                    </div>
                    <button @click="saveStripeSettings" class="btn-primary">
                      Sauvegarder les paramètres Stripe
                    </button>
                  </div>
                </div>

                <!-- Google Maps -->
                <div class="border rounded-lg p-4">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                      <img src="/google-maps-logo.png" class="h-8 w-8 mr-3" />
                      <div>
                        <h3 class="font-medium">Google Maps</h3>
                        <p class="text-sm text-gray-600">
                          Géolocalisation et calcul d'itinéraires
                        </p>
                      </div>
                    </div>
                    <div class="flex items-center">
                      <span
                        :class="[
                          'px-2 py-1 rounded-full text-sm',
                          mapsConfigured
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800',
                        ]"
                      >
                        {{ mapsConfigured ? "Configuré" : "Non configuré" }}
                      </span>
                    </div>
                  </div>
                  <div class="space-y-4">
                    <div class="form-group">
                      <label>Clé API Google Maps</label>
                      <input
                        v-model="mapsSettings.apiKey"
                        type="text"
                        class="form-input"
                      />
                    </div>
                    <button @click="saveMapsSettings" class="btn-primary">
                      Sauvegarder la configuration Maps
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modals -->
    <delivery-zone-modal
      v-model="showAddZoneModal"
      :zone="editingZone"
      @save="saveDeliveryZone"
    />

    <email-template-modal
      v-if="selectedTemplate"
      v-model="showTemplateModal"
      :template="selectedTemplate"
      @save="saveEmailTemplate"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useAdminStore } from "@/stores/admin";
// import DeliveryZoneModal from '@/components/admin/DeliveryZoneModal.vue'
// import EmailTemplateModal from '@/components/admin/EmailTemplateModal.vue'

const adminStore = useAdminStore();
const currentSection = ref("general");

// Configuration sections
const configSections = [
  { id: "general", name: "Paramètres généraux", icon: "fas fa-cog" },
  { id: "delivery", name: "Zones de livraison", icon: "fas fa-map-marker-alt" },
  { id: "commission", name: "Commissions", icon: "fas fa-percentage" },
  { id: "notifications", name: "Notifications", icon: "fas fa-bell" },
  { id: "integrations", name: "Intégrations", icon: "fas fa-plug" },
];

// États
const generalSettings = ref({
  platformName: "",
  supportEmail: "",
  currency: "EUR",
  timezone: "Europe/Paris",
  logo: "",
});

const deliveryZones = ref([]);
const showAddZoneModal = ref(false);
const editingZone = ref(null);

const commissionSettings = ref({
  restaurantRate: 0,
  driverFee: 0,
  serviceFee: 0,
});

const emailSettings = ref({
  smtpHost: "",
  smtpPort: 587,
  smtpUser: "",
  smtpPassword: "",
});

const emailTemplates = ref([]);
const showTemplateModal = ref(false);
const selectedTemplate = ref(null);

const stripeSettings = ref({
  publicKey: "",
  secretKey: "",
});

const mapsSettings = ref({
  apiKey: "",
});

// Computed
const stripeConnected = computed(() => {
  return stripeSettings.value.publicKey && stripeSettings.value.secretKey;
});

const mapsConfigured = computed(() => {
  return mapsSettings.value.apiKey;
});

// Méthodes
const formatPrice = (price) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: generalSettings.value.currency,
  }).format(price);
};

const handleLogoUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Simuler le téléchargement du logo
    const reader = new FileReader();
    reader.onload = (e) => {
      generalSettings.value.logo = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const saveGeneralSettings = async () => {
  try {
    await adminStore.updateGeneralSettings(generalSettings.value);
    // Afficher notification de succès
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des paramètres:", error);
  }
};

const saveDeliveryZone = async (zoneData) => {
  try {
    if (editingZone.value) {
      await adminStore.updateDeliveryZone(editingZone.value.id, zoneData);
    } else {
      await adminStore.createDeliveryZone(zoneData);
    }
    showAddZoneModal.value = false;
    editingZone.value = null;
    loadDeliveryZones();
  } catch (error) {
    console.error("Erreur lors de la sauvegarde de la zone:", error);
  }
};

const editZone = (zone) => {
  editingZone.value = { ...zone };
  showAddZoneModal.value = true;
};

const deleteZone = async (zoneId) => {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette zone ?")) {
    try {
      await adminStore.deleteDeliveryZone(zoneId);
      loadDeliveryZones();
    } catch (error) {
      console.error("Erreur lors de la suppression de la zone:", error);
    }
  }
};

const saveCommissionSettings = async () => {
  try {
    await adminStore.updateCommissionSettings(commissionSettings.value);
    // Afficher notification de succès
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des commissions:", error);
  }
};

const editTemplate = (template) => {
  selectedTemplate.value = { ...template };
  showTemplateModal.value = true;
};

const saveEmailTemplate = async (templateData) => {
  try {
    await adminStore.updateEmailTemplate(templateData.id, templateData);
    showTemplateModal.value = false;
    selectedTemplate.value = null;
    loadEmailTemplates();
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du template:", error);
  }
};

const saveNotificationSettings = async () => {
  try {
    await adminStore.updateEmailSettings(emailSettings.value);
    // Afficher notification de succès
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des paramètres email:", error);
  }
};

const saveStripeSettings = async () => {
  try {
    await adminStore.updateStripeSettings(stripeSettings.value);
    // Afficher notification de succès
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des paramètres Stripe:", error);
  }
};

const saveMapsSettings = async () => {
  try {
    await adminStore.updateMapsSettings(mapsSettings.value);
    // Afficher notification de succès
  } catch (error) {
    console.error("Erreur lors de la sauvegarde des paramètres Maps:", error);
  }
};

// Chargement initial
const loadDeliveryZones = async () => {
  try {
    deliveryZones.value = await adminStore.getDeliveryZones();
  } catch (error) {
    console.error("Erreur lors du chargement des zones:", error);
  }
};

const loadEmailTemplates = async () => {
  try {
    emailTemplates.value = await adminStore.getEmailTemplates();
  } catch (error) {
    console.error("Erreur lors du chargement des templates:", error);
  }
};

const loadSettings = async () => {
  try {
    const settings = await adminStore.getAllSettings();
    generalSettings.value = settings.general;
    commissionSettings.value = settings.commission;
    emailSettings.value = settings.email;
    stripeSettings.value = settings.stripe;
    mapsSettings.value = settings.maps;
  } catch (error) {
    console.error("Erreur lors du chargement des paramètres:", error);
  }
};

onMounted(() => {
  loadSettings();
  loadDeliveryZones();
  loadEmailTemplates();
});
</script>

<style lang="scss" scoped>
.form-group {
  @apply space-y-2;

  label {
    @apply block text-sm font-medium text-gray-700;
  }
}

.form-input,
.form-select {
  @apply w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.btn-primary {
  @apply bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 
         flex items-center justify-center transition-colors duration-200;
}
</style>
