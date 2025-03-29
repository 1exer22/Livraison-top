<template>
  <div class="min-h-screen bg-gray-100">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-900">Gestion des Livreurs</h1>
        <div class="flex items-center space-x-4">
          <router-link
            to="/admin/dashboard"
            class="text-sm font-medium text-indigo-600 hover:text-indigo-500 mr-4"
          >
            Tableau de bord
          </router-link>
          <router-link
            to="/admin/delivery-scheduling"
            class="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Planification
          </router-link>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="mb-6 bg-white shadow rounded-lg p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-medium text-gray-900">Liste des livreurs</h2>
          <div class="flex gap-2">
            <select 
              v-model="availabilityFilter" 
              class="px-4 py-2 border rounded-md text-sm"
            >
              <option value="all">Tous</option>
              <option value="available">Disponibles</option>
              <option value="unavailable">Indisponibles</option>
              <option value="onDelivery">En livraison</option>
            </select>
            <button
              @click="refreshDeliverers"
              class="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
          </div>
        </div>
        
        <div v-if="loading" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Chargement des livreurs...</p>
        </div>
        
        <div v-else-if="error" class="bg-red-50 p-4 rounded-md text-red-600">
          {{ error }}
        </div>
        
        <div v-else-if="filteredDeliverers.length === 0" class="text-center py-8 text-gray-500">
          Aucun livreur trouvé avec les filtres sélectionnés.
        </div>
        
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Véhicule</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Livraisons</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails de la commande</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="deliverer in filteredDeliverers" :key="deliverer.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                      {{ getInitials(deliverer.name) }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ deliverer.name }}</div>
                      <div class="text-sm text-gray-500">{{ deliverer.phone }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ deliverer.phone }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ deliverer.vehicleInfo?.vehicleType || deliverer.vehicleType || 'Non spécifié' }} 
                  {{ deliverer.vehicleInfo?.licensePlate || deliverer.vehicleNumber ? `- ${deliverer.vehicleInfo?.licensePlate || deliverer.vehicleNumber}` : '' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  <span class="font-semibold">{{ deliverer.totalDeliveries || 0 }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span 
                    class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="getStatusClass(deliverer)"
                  >
                    {{ getStatusLabel(deliverer) }}
                  </span>
                </td>
                <!-- <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <template v-if="deliverer.currentOrderId">
                    <router-link 
                      :to="`/orders/${deliverer.currentOrderId}`"
                      class="text-indigo-600 hover:text-indigo-900"
                    >
                      #{{ deliverer.currentOrderId.slice(-6).toUpperCase() }}
                    </router-link>
                  </template>
                  <template v-else>-</template>
                </td> -->
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span v-if="getDelivererCurrentOrder(deliverer)" class="text-blue-600 font-medium">
                    {{ getOrderDetails(getDelivererCurrentOrder(deliverer)!) }}
                    <button 
                      @click="openOrderDetailsModal(getDelivererCurrentOrder(deliverer)!)" 
                      class="ml-2 text-indigo-600 hover:text-indigo-900 underline"
                    >
                      Voir détails
                    </button>
                  </span>
                  <span v-else>-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-2">
                    <button 
                      @click="toggleAvailability(deliverer)"
                      class="text-indigo-600 hover:text-indigo-900"
                      :disabled="!!getDelivererCurrentOrder(deliverer)"
                      :class="{ 'opacity-50 cursor-not-allowed': !!getDelivererCurrentOrder(deliverer) }"
                    >
                      {{ deliverer.isAvailable ? 'Marquer indisponible' : 'Marquer disponible' }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Commandes en attente d'assignation -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-medium text-gray-900 mb-6">Commandes en attente d'assignation</h2>
        
        <div v-if="loadingOrders" class="text-center py-8">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Chargement des commandes...</p>
        </div>
        
        <div v-else-if="errorOrders" class="bg-red-50 p-4 rounded-md text-red-600">
          {{ errorOrders }}
        </div>
        
        <div v-else-if="pendingOrders.length === 0" class="text-center py-8 text-gray-500">
          Aucune commande en attente d'assignation.
        </div>
        
        <div v-else class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <div 
            v-for="order in pendingOrders" 
            :key="order.id"
            class="border rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="text-lg font-medium text-gray-900">
                  Commande #{{ order.id.slice(-6).toUpperCase() }}
                </h3>
                <p class="text-sm text-gray-500">{{ formatDate(order.createdAt) }}</p>
              </div>
              <span 
                class="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800"
              >
                En attente
              </span>
            </div>
            
            <div class="mb-3">
              <p class="text-sm text-gray-700"><span class="font-medium">Client:</span> {{ order.customerName }}</p>
              <p class="text-sm text-gray-700"><span class="font-medium">Adresse:</span> {{ order.customerAddress }}</p>
              <p class="text-sm text-gray-700"><span class="font-medium">Restaurant:</span> {{ getRestaurantName(order.restaurantId) }}</p>
              <p class="text-sm text-gray-700"><span class="font-medium">Total:</span> {{ formatPrice(order.total) }}</p>
              <p class="text-sm text-gray-700"><span class="font-medium">Éléments:</span> {{ formatOrderItems(order.items) }}</p>
            </div>
            
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Assigner un livreur:</label>
              <div class="flex space-x-2">
                <select 
                  v-model="orderAssignments[order.id]" 
                  class="flex-grow px-3 py-2 border rounded-md text-sm"
                >
                  <option value="" disabled>Sélectionner un livreur</option>
                  <option 
                    v-for="deliverer in availableDeliverers" 
                    :key="deliverer.id" 
                    :value="deliverer.id"
                  >
                    {{ deliverer.name }}
                  </option>
                </select>
                <button
                  @click="assignDeliverer(order.id)"
                  class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                  :disabled="!orderAssignments[order.id]"
                  :class="{ 'opacity-50 cursor-not-allowed': !orderAssignments[order.id] }"
                >
                  Assigner
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>

  <!-- Modal de détails de commande -->
  <div v-if="selectedOrder" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg overflow-hidden shadow-xl max-w-2xl w-full mx-4">
      <div class="px-6 py-4 bg-indigo-600">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium text-white">
            Détails de la commande #{{ selectedOrder.id.slice(-6).toUpperCase() }}
          </h3>
          <button @click="selectedOrder = null" class="text-white hover:text-gray-200">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
        <div class="mb-4">
          <h4 class="text-gray-700 font-medium mb-2">Informations générales</h4>
          <div class="bg-gray-50 rounded p-3">
            <p><span class="font-medium">Client:</span> {{ selectedOrder.customerName }}</p>
            <p><span class="font-medium">Adresse:</span> {{ selectedOrder.customerAddress }}</p>
            <p><span class="font-medium">Restaurant:</span> {{ getRestaurantName(selectedOrder.restaurantId) }}</p>
            <p><span class="font-medium">Statut:</span> {{ formatStatus(selectedOrder.status) }}</p>
            <p><span class="font-medium">Date:</span> {{ formatDate(selectedOrder.createdAt) }}</p>
            <p><span class="font-medium">Total:</span> {{ formatPrice(selectedOrder.total) }}</p>
          </div>
        </div>
        
        <div>
          <h4 class="text-gray-700 font-medium mb-2">Détails de la commande</h4>
          <div class="bg-gray-50 rounded p-3">
            <div v-if="selectedOrder.items && selectedOrder.items.length > 0">
              <div class="overflow-hidden rounded border border-gray-200">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-100">
                    <tr>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Prix unitaire</th>
                      <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="item in selectedOrder.items" :key="item.menuItemId" class="hover:bg-gray-50">
                      <td class="px-4 py-2 whitespace-nowrap">{{ item.name }}</td>
                      <td class="px-4 py-2 whitespace-nowrap">{{ item.quantity }}</td>
                      <td class="px-4 py-2 whitespace-nowrap">{{ formatPrice(item.price) }}</td>
                      <td class="px-4 py-2 whitespace-nowrap">{{ formatPrice(item.price * item.quantity) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div v-else class="text-gray-500 italic">
              Aucun détail disponible pour cette commande
            </div>
          </div>
        </div>
      </div>
      
      <div class="px-6 py-3 bg-gray-50 text-right">
        <button 
          @click="selectedOrder = null"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Fermer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { collection, query, where, onSnapshot, doc, updateDoc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Types
type DeliveryProfile = {
  id: string;
  userId: string;
  name: string; 
  phone: string;
  isAvailable: boolean;
  currentOrderId?: string;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  vehicleInfo?: {
    vehicleType: string;
    licensePlate?: string;
  };
  vehicleType?: string;
  vehicleNumber?: string;
  totalDeliveries?: number;
};

type MenuItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
};

type Order = {
  id: string;
  status: string;
  customerName: string;
  customerAddress: string;
  restaurantId: string;
  restaurantName: string;
  total: number;
  createdAt: any;
  deliveryId?: string; // ID du livreur assigné à cette commande
  items?: MenuItem[]; // Liste des items de la commande
};

// State
const loading = ref(true);
const loadingOrders = ref(true);
const error = ref<string | null>(null);
const errorOrders = ref<string | null>(null);
const deliverers = ref<DeliveryProfile[]>([]);
const pendingOrders = ref<Order[]>([]);
const orderAssignments = ref<Record<string, string>>({});
const restaurantNames = ref<{[key: string]: string}>({});
const activeOrders = ref<Order[]>([]);
const selectedOrder = ref<Order | null>(null);
const availabilityFilter = ref('all');

// Unsubscribe handlers
let unsubscribeDeliverers: (() => void) | null = null;
let unsubscribeOrders: (() => void) | null = null;
let unsubscribeActiveOrders: (() => void) | null = null;

// Computed properties
const filteredDeliverers = computed(() => {
  if (availabilityFilter.value === 'all') {
    return deliverers.value;
  } else if (availabilityFilter.value === 'available') {
    return deliverers.value.filter(d => d.isAvailable);
  } else if (availabilityFilter.value === 'unavailable') {
    return deliverers.value.filter(d => !d.isAvailable && !d.currentOrderId);
  } else if (availabilityFilter.value === 'onDelivery') {
    return deliverers.value.filter(d => !!d.currentOrderId);
  }
  return deliverers.value;
});

const availableDeliverers = computed(() => {
  // Un livreur est disponible s'il est marqué comme disponible 
  // ET s'il n'est pas déjà assigné à une commande active
  return deliverers.value.filter(d => {
    // Vérifier si le livreur est marqué comme disponible
    const isMarkedAvailable = d.isAvailable;
    
    // Vérifier si le livreur est assigné à une commande active
    const hasActiveOrder = getDelivererCurrentOrder(d) !== null;
    
    // Retourner uniquement les livreurs disponibles et non assignés
    return isMarkedAvailable && !hasActiveOrder;
  });
});

const getStatusClass = (deliverer: DeliveryProfile): string => {
  if (getDelivererCurrentOrder(deliverer)) {
    return 'bg-yellow-100 text-yellow-800'; // En cours de livraison
  } else if (deliverer.isAvailable) {
    return 'bg-green-100 text-green-800'; // Disponible
  } else {
    return 'bg-gray-100 text-gray-800'; // Indisponible
  }
};

const getStatusLabel = (deliverer: DeliveryProfile): string => {
  if (getDelivererCurrentOrder(deliverer)) {
    return 'En livraison';
  } else if (deliverer.isAvailable) {
    return 'Disponible';
  } else {
    return 'Indisponible';
  }
};

// Methods
const getInitials = (name: string): string => {
  if (!name) return '';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const formatDate = (timestamp: any): string => {
  if (!timestamp) {
    return '-';
  }
  
  let date;
  if (timestamp?.toDate) {
    date = timestamp.toDate();
  } else if (timestamp?.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else {
    date = new Date(timestamp);
  }
  
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
};

const refreshDeliverers = () => {
  loading.value = true;
  // Les données seront rafraîchies automatiquement grâce à onSnapshot
  
  // Recharger également les noms des restaurants
  pendingOrders.value.forEach(order => {
    if (order.restaurantId) {
      loadRestaurantName(order.restaurantId);
    }
  });
  
  // Simuler un délai pour l'indicateur de chargement
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

const loadRestaurantName = async (restaurantId: string) => {
  if (!restaurantId) return;
  
  try {
    const restaurantDoc = await getDoc(doc(db, 'restaurants', restaurantId));
    if (restaurantDoc.exists()) {
      restaurantNames.value[restaurantId] = restaurantDoc.data().name || 'Restaurant';
    }
  } catch (err) {
    console.error(`Erreur lors du chargement du restaurant ${restaurantId}:`, err);
  }
};

const getRestaurantName = (restaurantId: string): string => {
  if (restaurantId && restaurantNames.value[restaurantId]) {
    return restaurantNames.value[restaurantId];
  }
  
  // Si le nom n'est pas encore chargé, démarrer le chargement
  loadRestaurantName(restaurantId);
  return 'Chargement...';
};

const getOrderDetails = (order: Order): string => {
  const orderId = order.id.slice(-6).toUpperCase();
  const restaurantName = getRestaurantName(order.restaurantId);
  return `Commande #${orderId} - ${restaurantName} - ${formatPrice(order.total)}`;
};

const formatOrderItems = (items: MenuItem[] | undefined): string => {
  if (!items || items.length === 0) {
    return "Aucun élément";
  }
  
  return items.map(item => `${item.quantity}x ${item.name}`).join(', ');
};

const toggleAvailability = async (deliverer: DeliveryProfile) => {
  try {
    // Vérifie si le livreur est actuellement en service selon son planning
    const isOnSchedule = await checkDelivererOnSchedule(deliverer.id);
    
    if (!deliverer.isAvailable && !isOnSchedule) {
      error.value = "Le livreur ne peut pas être marqué disponible en dehors de ses horaires planifiés";
      return;
    }
    
    const delivererRef = doc(db, 'deliveryProfiles', deliverer.id);
    await updateDoc(delivererRef, {
      isAvailable: !deliverer.isAvailable,
    });
  } catch (err) {
    console.error("Erreur lors de la mise à jour du statut:", err);
    error.value = "Impossible de modifier le statut du livreur";
  }
};

// Vérifie si le livreur est actuellement en service selon son planning
const checkDelivererOnSchedule = async (delivererId: string): Promise<boolean> => {
  try {
    // Récupérer les horaires du livreur
    const scheduleQuery = query(
      collection(db, 'schedules'),
      where('delivererId', '==', delivererId)
    );
    const scheduleDocs = await getDocs(scheduleQuery);
    
    if (scheduleDocs.empty) {
      // Si aucun horaire n'est défini, on considère que le livreur est toujours disponible
      return true;
    }
    
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeString = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    // Vérifier si le livreur est planifié pour travailler maintenant
    let isScheduled = false;
    
    scheduleDocs.forEach((doc) => {
      const shift = doc.data() as any;
      
      if (shift.day === currentDay && shift.isActive) {
        const startTime = shift.startTime;
        const endTime = shift.endTime;
        
        // Vérifier si l'heure actuelle est dans la plage horaire de ce shift
        if (currentTimeString >= startTime && currentTimeString <= endTime) {
          isScheduled = true;
        }
      }
    });
    
    return isScheduled;
  } catch (err) {
    console.error("Erreur lors de la vérification du planning:", err);
    // En cas d'erreur, on autorise par défaut
    return true;
  }
};

const assignDeliverer = async (orderId: string) => {
  const delivererId = orderAssignments.value[orderId];
  if (!delivererId) return;
  
  try {
    // Récupérer les informations du livreur
    const selectedDeliverer = deliverers.value.find(d => d.id === delivererId);
    if (!selectedDeliverer) {
      console.error("Livreur introuvable");
      return;
    }
    
    // Mise à jour de la commande avec l'ID du document du livreur (et non l'userId)
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      deliveryId: delivererId,
      status: 'in_delivery'
    });
    
    delete orderAssignments.value[orderId];
  } catch (err) {
    console.error("Erreur lors de l'assignation:", err);
    error.value = "Impossible d'assigner le livreur";
  }
};

const reassignDelivery = async (orderId: string, delivererId: string) => {
  try {
    // Trouver le profil de livreur correspondant
    const deliverer = deliverers.value.find(d => d.id === delivererId);
    if (!deliverer) {
      console.error("Livreur introuvable");
      return;
    }
    
    // Mettre à jour la commande pour enlever l'ID du livreur
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      deliveryId: null
    });
  } catch (err) {
    console.error("Erreur lors de la réassignation:", err);
    error.value = "Impossible de réassigner cette commande";
  };
}

const getDelivererCurrentOrder = (deliverer: DeliveryProfile): Order | null => {
  // Vérifier toutes les commandes actives où le livreur est assigné
  // Comparer avec deliverer.userId et non deliverer.id
  return activeOrders.value.find(order => order.deliveryId === deliverer.id) || null;
};

const openOrderDetailsModal = (order: Order) => {
  selectedOrder.value = order;
};

const formatStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    'pending': 'En attente',
    'accepted': 'Acceptée',
    'preparing': 'En préparation',
    'ready': 'Prête pour livraison',
    'in_delivery': 'En livraison',
    'delivering': 'En cours de livraison',
    'delivered': 'Livré',
    'cancelled': 'Annulée',
  };
  return statusMap[status] || 'Statut inconnu';
};

// Lifecycle hooks
onMounted(() => {
  // Récupérer les livreurs
  const deliverersQuery = query(collection(db, 'deliveryProfiles'));
  unsubscribeDeliverers = onSnapshot(deliverersQuery, (snapshot) => {
    loading.value = false;
    deliverers.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as DeliveryProfile[];
  }, (err) => {
    loading.value = false;
    error.value = "Erreur lors du chargement des livreurs";
    console.error(err);
  });
  
  // Récupérer les commandes en attente
  const ordersQuery = query(
    collection(db, 'orders'),
    where('status', '==', 'ready')
  );
  
  unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
    loadingOrders.value = false;
    pendingOrders.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
    
    // Initialiser les assignations
    const newAssignments: Record<string, string> = {};
    pendingOrders.value.forEach(order => {
      newAssignments[order.id] = '';
      
      // Charger les noms des restaurants pour les commandes
      if (order.restaurantId && !restaurantNames.value[order.restaurantId]) {
        loadRestaurantName(order.restaurantId);
      }
    });
    orderAssignments.value = newAssignments;
  }, (err) => {
    loadingOrders.value = false;
    errorOrders.value = "Erreur lors du chargement des commandes";
    console.error(err);
  });

  // Récupérer les commandes actives (où un livreur peut être assigné)
  // Élargir la requête pour inclure tous les statuts où un livreur peut être assigné
  // Inclure "delivering" également qui semble être utilisé dans la base
  const activeOrdersQuery = query(
    collection(db, 'orders'),
    where('status', 'in', ['accepted', 'preparing', 'ready', 'in_delivery', 'delivering'])
  );
  
  unsubscribeActiveOrders = onSnapshot(activeOrdersQuery, (snapshot) => {
    activeOrders.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  }, (err) => {
    console.error("Erreur lors du chargement des commandes actives:", err);
  });
});

onBeforeUnmount(() => {
  // Nettoyer les listeners
  if (unsubscribeDeliverers) unsubscribeDeliverers();
  if (unsubscribeOrders) unsubscribeOrders();
  if (unsubscribeActiveOrders) unsubscribeActiveOrders();
});
</script>
