<template>
    <div class="min-h-screen bg-gray-100">
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div class="flex items-center">
            <router-link
              to="/orders"
              class="mr-4 text-indigo-600 hover:text-indigo-700"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </router-link>
            <h1 class="text-3xl font-bold text-gray-900">
              Détails de la commande #{{ orderId?.slice(-6).toUpperCase() }}
            </h1>
          </div>
        </div>
      </header>
  
      <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div v-if="loading" class="text-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Chargement des détails...</p>
        </div>
  
        <div v-else-if="error" class="bg-red-50 p-4 rounded-md">
          <p class="text-red-700">{{ error }}</p>
        </div>
  
        <div v-else-if="order" class="space-y-6">
          <!-- Statut de la commande -->
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="p-6">
              <div class="flex justify-between items-center">
                <div>
                  <h2 class="text-lg font-medium text-gray-900">État de la commande</h2>
                  <p class="mt-1 text-sm text-gray-500">
                    Commandé le {{ formatDate(order.createdAt) }}
                  </p>
                </div>
                <span
                  :class="[
                    'px-3 py-1 text-sm font-semibold rounded-full',
                    getStatusClass(order.status),
                  ]"
                >
                  {{ getStatusLabel(order.status) }}
                </span>
              </div>
            </div>
          </div>
  
          <!-- Timeline de livraison -->
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Suivi de la commande</h2>
              
              <!-- Informations de livraison en temps réel -->
              <div v-if="order.status === 'delivering'" class="mb-8 bg-indigo-50 p-4 rounded-lg">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- Temps estimé -->
                  <div class="flex items-center">
                    <div class="rounded-full bg-indigo-100 p-2 mr-3">
                      <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500">Temps estimé</p>
                      <p class="text-lg font-semibold text-gray-900">{{ estimatedTime || '...' }} min</p>
                    </div>
                  </div>

                  <!-- Distance restante -->
                  <div class="flex items-center">
                    <div class="rounded-full bg-indigo-100 p-2 mr-3">
                      <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500">Distance restante</p>
                      <p class="text-lg font-semibold text-gray-900">{{ remainingDistance || '...' }} km</p>
                    </div>
                  </div>

                  <!-- Informations du livreur -->
                  <div class="flex items-center">
                    <div class="rounded-full bg-indigo-100 p-2 mr-3">
                      <svg class="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-500">Votre livreur</p>
                      <p class="text-lg font-semibold text-gray-900">{{ deliverer?.name || 'En attente...' }}</p>
                      <p v-if="deliverer?.phone" class="text-sm text-gray-500">{{ deliverer.phone}}</p>
                    </div>
                  </div>
                </div>

                <!-- Message si le livreur n'est pas encore assigné -->
                <p v-if="!deliverer" class="mt-4 text-sm text-center text-indigo-600">
                  Un livreur sera bientôt assigné à votre commande...
                </p>
              </div>

              <div class="relative">
                <div class="absolute top-0 left-4 h-full w-0.5 bg-gray-200"></div>
                <div class="space-y-8">
                  <div
                    v-for="(event, index) in order.trackingHistory"
                    :key="index"
                    class="relative flex items-start"
                  >
                    <div
                      :class="[
                        'absolute left-0 mt-1 w-8 h-8 rounded-full flex items-center justify-center',
                        event.status === order.status
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-200 text-gray-400',
                      ]"
                    >
                      <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </div>
                    <div class="ml-12">
                      <p class="text-sm font-medium text-gray-900">
                        {{ getStatusLabel(event.status) }}
                      </p>
                      <p class="mt-1 text-sm text-gray-500">
                        {{ formatDate(event.timestamp) }}
                        <span v-if="event.note" class="ml-2">- {{ event.note }}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Détails de la commande -->
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-6">Articles commandés</h2>
              <div class="flow-root">
                <ul class="-my-6 divide-y divide-gray-200">
                  <li v-for="item in order.items" :key="item.menuItemId" class="py-6">
                    <div class="flex">
                      <div class="flex-1 ml-4">
                        <div class="flex items-center justify-between">
                          <div>
                            <h3 class="text-sm font-medium text-gray-900">
                              {{ item.name }}
                            </h3>
                            <p class="mt-1 text-sm text-gray-500">
                              Quantité: {{ item.quantity }}
                            </p>
                          </div>
                          <p class="text-sm font-medium text-gray-900">
                            {{ formatPrice(item.price * item.quantity) }}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
              <div class="border-t border-gray-200 mt-6 pt-6">
                <div class="flex justify-between text-base font-medium text-gray-900">
                  <p>Total</p>
                  <p>{{ formatPrice(order.total) }}</p>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Informations du restaurant -->
          <div class="bg-white shadow rounded-lg overflow-hidden">
            <div class="p-6">
              <h2 class="text-lg font-medium text-gray-900 mb-4">Restaurant</h2>
              <div class="text-sm text-gray-500">
                <p class="font-medium text-gray-900">{{ restaurant?.name }}</p>
                <p>{{ restaurant?.address }}</p>
                <p v-if="restaurant?.phone" class="mt-2">
                  <span class="font-medium">Téléphone : </span>{{ restaurant.phone }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted, onUnmounted, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { db } from '../../firebase/config';
  import { doc, onSnapshot } from 'firebase/firestore';
  import { format } from 'date-fns';
  import { fr } from 'date-fns/locale';
  import type { Order, OrderStatus, DeliveryProfile } from '../../stores/restaurant';
  import { useRestaurantStore } from '../../stores/restaurant';

  const route = useRoute();
  const restaurantStore = useRestaurantStore();
  const orderId = route.params.id as string;
  const order = ref<Order | null>(null);
  const restaurant = ref<any>(null);
  const deliverer = ref<DeliveryProfile | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);
  const estimatedTime = ref<number | null>(null);
  const remainingDistance = ref<number | null>(null);
  let unsubscribe: (() => void) | null = null;

  // Fonction pour charger les informations du restaurant
  const loadRestaurantInfo = async (restaurantId: string) => {
    try {
      const restaurantData = await restaurantStore.fetchRestaurantById(restaurantId);
      if (restaurantData) {
        restaurant.value = restaurantData;
      }
    } catch (err) {
      console.error('Erreur lors du chargement du restaurant:', err);
    }
  };

  // Fonction pour effectuer une requête de géocodage
  const geocodeAddress = async (address) => {
    try {
      console.log("Géocodage de l'adresse:", address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur de géocodage: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Résultat du géocodage:", data);
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        console.log(`Coordonnées trouvées: ${location.lat}, ${location.lng}`);
        return {
          latitude: location.lat,
          longitude: location.lng
        };
      } else {
        console.error(`Géocodage échoué: ${data.status}`, data);
        return null;
      }
    } catch (error) {
      console.error('Erreur lors du géocodage:', error);
      return null;
    }
  };

  // Fonction pour calculer la distance et le temps
  const calculateDeliveryInfo = async () => {
    if (!deliverer.value?.currentLocation || !order.value?.customerAddress) {
      console.error("Données manquantes: position du livreur ou adresse client");
      return;
    }
    
    try {
      console.log("Calcul de la distance avec Routes API...");
      
      // Obtenir les coordonnées de la destination par géocodage
      console.log("Adresse client:", order.value.customerAddress);
      const destinationLatLng = await geocodeAddress(order.value.customerAddress);
      
      if (!destinationLatLng) {
        throw new Error(`Impossible de géocoder l'adresse client: ${order.value.customerAddress}`);
      }
      
      // Coordonnées d'origine (livreur)
      const originLatLng = {
        latitude: deliverer.value.currentLocation.lat,
        longitude: deliverer.value.currentLocation.lng
      };
      console.log("Coordonnées du livreur:", originLatLng);
      
      // Préparer les paramètres pour la requête à la Routes API
      const requestBody = {
        origin: {
          location: {
            latLng: originLatLng
          }
        },
        destination: {
          location: {
            latLng: destinationLatLng
          }
        },
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: false,
        routeModifiers: {
          avoidTolls: false,
          avoidHighways: false,
          avoidFerries: false
        },
        languageCode: "fr-FR",
        units: "METRIC"
      };
      
      console.log("Requête Routes API:", requestBody);
      
      // Appeler l'API Routes via fetch
      const response = await fetch(
        'https://routes.googleapis.com/directions/v2:computeRoutes', 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
            'X-Goog-FieldMask': 'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline'
          },
          body: JSON.stringify(requestBody)
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur de la Routes API:', response.status, errorText);
        throw new Error(`Erreur de la Routes API: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Résultat Routes API:", result);
      
      if (result.routes && result.routes.length > 0) {
        // Calculer la distance en km
        const distanceInMeters = result.routes[0].distanceMeters || 0;
        remainingDistance.value = Math.round((distanceInMeters / 1000) * 10) / 10;
        
        // Calculer le temps en minutes
        const durationStr = result.routes[0].duration || "0s";
        const durationSeconds = parseInt(durationStr.replace('s', ''));
        estimatedTime.value = Math.ceil(durationSeconds / 60);
        
        console.log(`Routes API - Distance: ${remainingDistance.value} km, Temps: ${estimatedTime.value} min`);
      }
    } catch (err) {
      console.error('Erreur lors du calcul de l\'itinéraire:', err);
      
      // Calculer une estimation approximative basée sur la distance à vol d'oiseau
      console.log("Tentative de calcul de distance basique");
      calculateBasicDistance();
    }
  };
  
  // Fonction pour calculer une distance basique à vol d'oiseau en cas d'échec de l'API
  const calculateBasicDistance = async () => {
    // Vérifier si on a les coordonnées nécessaires
    if (!deliverer.value?.currentLocation || !order.value?.customerAddress) {
      console.error("Données manquantes pour le calcul basique");
      remainingDistance.value = null;
      estimatedTime.value = null;
      return;
    }
    
    try {
      const R = 6371; // Rayon de la Terre en km
      const lat1 = deliverer.value.currentLocation.lat;
      const lon1 = deliverer.value.currentLocation.lng;
      
      // Tenter de géocoder l'adresse client si nous n'avons pas ses coordonnées
      let lat2, lon2;
      
      if (order.value.lat && order.value.lng) {
        // Utiliser les coordonnées existantes
        lat2 = order.value.lat;
        lon2 = order.value.lng;
        console.log("Utilisation des coordonnées existantes du client:", lat2, lon2);
      } else {
        // Géocoder l'adresse
        console.log("Géocodage de l'adresse pour le calcul basique:", order.value.customerAddress);
        const coords = await geocodeAddress(order.value.customerAddress);
        
        if (!coords) {
          console.error("Impossible de géocoder l'adresse, calcul impossible");
          remainingDistance.value = null;
          estimatedTime.value = null;
          return;
        }
        
        lat2 = coords.latitude;
        lon2 = coords.longitude;
        console.log("Coordonnées obtenues par géocodage:", lat2, lon2);
      }
      
      // Calcul de la distance à vol d'oiseau (formule haversine)
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLon = (lon2 - lon1) * Math.PI / 180;
      
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
               Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
               Math.sin(dLon/2) * Math.sin(dLon/2);
      
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * c;
      
      // Arrondir à 1 décimale
      remainingDistance.value = Math.round(distance * 10) / 10;
      
      // Estimer le temps (en supposant une vitesse moyenne de 30 km/h en ville)
      estimatedTime.value = Math.ceil(distance * 2); // 2 minutes par km en moyenne
      
      console.log(`Estimation basique - Distance: ${remainingDistance.value} km, Temps: ${estimatedTime.value} min`);
    } catch (error) {
      console.error("Erreur lors du calcul basique:", error);
      remainingDistance.value = null;
      estimatedTime.value = null;
    }
  };

  // Fonction pour charger les informations du livreur
  const loadDelivererInfo = async (deliveryId: string) => {
    try {
      const delivererData = await restaurantStore.fetchDelivererById(deliveryId);
      if (delivererData) {
        deliverer.value = delivererData;
        // Calculer la distance et le temps dès que les informations du livreur sont chargées
        await calculateDeliveryInfo();
      }
    } catch (err) {
      console.error('Erreur lors du chargement du livreur:', err);
    }
  };

  const getStatusLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
      pending: 'En attente',
      accepted: 'Acceptée',
      preparing: 'En préparation',
      ready: 'Prêt',
      delivering: 'En livraison',
      delivered: 'Livré',
      cancelled: 'Annulé',
    };
    return labels[status] || status;
  };

  const getStatusClass = (status: OrderStatus): string => {
    const classes: Record<OrderStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-green-100 text-green-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      delivering: 'bg-purple-100 text-purple-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return classes[status];
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const formatDate = (date: any): string => {
    if (!date) return 'Date inconnue';
    
    if (date?.toDate instanceof Function) {
      return format(date.toDate(), 'dd/MM/yyyy HH:mm', { locale: fr });
    }
    
    if (date instanceof Date) {
      return format(date, 'dd/MM/yyyy HH:mm', { locale: fr });
    }
    
    if (typeof date === 'number') {
      return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
    }
    
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: fr });
    } catch (error) {
      console.error('Erreur de formatage de la date:', error);
      return 'Date invalide';
    }
  };

  // Charger le script Google Maps
  const loadGoogleMapsScript = () => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    return new Promise((resolve) => {
      script.onload = resolve;
    });
  };

  onMounted(async () => {
    // Charger le script Google Maps
    await loadGoogleMapsScript();

    if (!orderId) {
      error.value = 'ID de commande manquant';
      loading.value = false;
      return;
    }

    const orderRef = doc(db, 'orders', orderId);
    unsubscribe = onSnapshot(
      orderRef,
      async (doc) => {
        if (doc.exists()) {
          const orderData = { id: doc.id, ...doc.data() } as Order;
          order.value = orderData;
          
          // Charger les informations du restaurant
          if (orderData.restaurantId) {
            await loadRestaurantInfo(orderData.restaurantId);
          }
          
          // Charger les informations du livreur si disponible
          if (orderData.deliveryId) {
            await loadDelivererInfo(orderData.deliveryId);
          } else {
            deliverer.value = null;
            estimatedTime.value = null;
            remainingDistance.value = null;
          }
        } else {
          error.value = 'Commande non trouvée';
        }
        loading.value = false;
      },
      (err) => {
        console.error('Erreur lors du chargement de la commande:', err);
        error.value = 'Erreur lors du chargement de la commande';
        loading.value = false;
      }
    );
  });

  onUnmounted(() => {
    if (unsubscribe) {
      unsubscribe();
    }
  });
  </script>