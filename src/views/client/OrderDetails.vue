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
              
              <!-- Carte de suivi en temps réel -->
              <div v-if="order.status === 'delivering' && order.deliveryId" class="mb-8">
                <div class="mb-4 bg-indigo-50 p-4 rounded-lg">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p class="text-sm font-medium text-gray-700">Distance estimée</p>
                      <p class="text-2xl font-bold text-indigo-600">{{ deliveryInfo.distance || "Calcul..." }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-700">Temps estimé</p>
                      <p class="text-2xl font-bold text-indigo-600">{{ deliveryInfo.duration || "Calcul..." }}</p>
                    </div>
                    <div>
                      <p class="text-sm font-medium text-gray-700">Livreur</p>
                      <p class="text-lg font-semibold">{{ getDelivererDisplayName }}</p>
                    </div>
                  </div>
                </div>

                <!-- Carte de livraison -->
                <div class="h-80 mb-4 rounded-lg overflow-hidden shadow-inner">
                  <div id="map" class="h-full w-full"></div>
                </div>

                <!-- Informations du livreur -->
                <div v-if="deliverer" class="bg-gray-50 p-4 rounded-lg">
                  <h3 class="text-md font-medium text-gray-900 mb-2">Informations du livreur</h3>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <p><span class="font-medium">Nom:</span> {{ getDelivererDisplayName }}</p>
                    <p><span class="font-medium">Téléphone:</span> {{ getDelivererPhone }}</p>
                    <p><span class="font-medium">Véhicule:</span> {{ deliverer.vehicleInfo?.type }} {{ deliverer.vehicleInfo?.model }}</p>
                    <p><span class="font-medium">Immatriculation:</span> {{ deliverer.vehicleInfo?.plate }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Timeline détaillée -->
              <div class="relative">
                <div class="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                  <div class="h-full w-0.5 bg-gray-200"></div>
                </div>
                <ul class="relative space-y-8">
                  <li v-for="(event, index) in order.trackingHistory" :key="index" class="relative pl-8">
                    <div 
                      class="absolute left-0 top-1.5 h-5 w-5 rounded-full border-2 border-white ring-1 ring-gray-300"
                      :class="getStatusColorClass(event.status)"
                    ></div>
                    <div class="flex justify-between">
                      <p class="font-medium text-gray-900">{{ getStatusLabel(event.status) }}</p>
                      <p class="text-sm text-gray-500">{{ formatDate(event.timestamp) }}</p>
                    </div>
                    <p v-if="event.note" class="mt-1 text-sm text-gray-500">{{ event.note }}</p>
                  </li>
                  
                  <!-- Étapes futures -->
                  <template v-if="order.status !== 'delivered' && order.status !== 'cancelled'">
                    <li v-for="futureStep in getFutureSteps(order.status)" :key="futureStep.status" class="relative pl-8">
                      <div class="absolute left-0 top-1.5 h-5 w-5 rounded-full border-2 border-white bg-gray-200"></div>
                      <p class="font-medium text-gray-400">{{ futureStep.label }}</p>
                    </li>
                  </template>
                </ul>
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
  import { doc, getDoc, onSnapshot } from 'firebase/firestore';
  import { db } from '../../firebase/config';
  import { format } from 'date-fns';
  import { fr } from 'date-fns/locale';

  // Type pour les statuts de commande
  type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'delivered' | 'cancelled';

  // Interfaces pour les données de livraison
  interface DeliveryInfo {
    distance: string;
    duration: string;
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
    currentPosition?: { lat: number; lng: number };
  }

  // Type pour le livreur avec toutes les propriétés nécessaires
  interface DeliveryProfile {
    id: string;
    userId: string;
    fullName: string;    // Nouveau champ
    name: string;        // Champ existant
    phoneNumber: string; // Nouveau champ
    phone: string;       // Champ existant
    isAvailable: boolean;
    currentLocation: { lat: number; lng: number };
    rating: number;
    totalDeliveries: number;
    currentOrderId?: string;
    vehicleInfo?: {
      type: string;
      model: string;
      color: string;
      plate: string;
    };
  }

  // Déclaration pour étendre Window avec l'API Google Maps
  declare global {
    interface Window {
      google: any;
    }
  }

  // Déclaration des variables
  const route = useRoute();
  const orderId = ref(route.params.id as string);
  const order = ref<any>(null);
  const restaurant = ref<any>(null);
  const deliverer = ref<DeliveryProfile | null>(null);
  const loading = ref(true);
  const error = ref('');
  // Infos de livraison
  const deliveryInfo = ref<DeliveryInfo>({
    distance: '',
    duration: '',
    origin: { lat: 0, lng: 0 },
    destination: { lat: 0, lng: 0 }
  });

  // Méthode pour obtenir le nom complet et le numéro de téléphone du livreur
  const getDelivererDisplayName = computed(() => {
    if (!deliverer.value) return 'En attente...';
    return deliverer.value.fullName || deliverer.value.name;
  });

  const getDelivererPhone = computed(() => {
    if (!deliverer.value) return '';
    return deliverer.value.phoneNumber || deliverer.value.phone;
  });

  // Fonctions d'aide au format
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

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getStatusLabel = (status: OrderStatus): string => {
    const labels: Record<OrderStatus, string> = {
      pending: 'En attente',
      confirmed: 'Acceptée',
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
      confirmed: 'bg-green-100 text-green-800',
      preparing: 'bg-blue-100 text-blue-800',
      ready: 'bg-green-100 text-green-800',
      delivering: 'bg-purple-100 text-purple-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return classes[status as OrderStatus];
  };

  // Fonction pour géocoder une adresse en coordonnées
  const geocodeAddress = async (address: string) => {
    try {
      console.log("Géocodage de l'adresse:", address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`Erreur de géocodage: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const location = data.results[0].geometry.location;
        return { 
          lat: location.lat, 
          lng: location.lng 
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

  // Charger le script Google Maps
  const loadGoogleMapsScript = (): Promise<void> => {
    return new Promise((resolve) => {
      if (window.google) {
        // Google Maps API est déjà chargée
        resolve();
        return;
      }
      
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      document.head.appendChild(script);
    });
  };

  // Fonction de calcul basique de distance quand l'API échoue
  const calculateBasicDistance = async () => {
    // Vérifier si on a les coordonnées nécessaires
    if (!deliverer.value?.currentLocation || !order.value?.customerAddress) {
      console.error("Données manquantes pour le calcul basique");
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
      } else {
        // Géocoder l'adresse
        const coords = await geocodeAddress(order.value.customerAddress);
        
        if (!coords) {
          console.error("Impossible de géocoder l'adresse, calcul impossible");
          return;
        }
        
        lat2 = coords.lat;
        lon2 = coords.lng;
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
      const distanceValue = Math.round(distance * 10) / 10;
      
      // Estimer le temps (en supposant une vitesse moyenne de 30 km/h en ville)
      const durationValue = Math.ceil(distance * 2); // 2 minutes par km en moyenne
      
      // Mettre à jour deliveryInfo
      deliveryInfo.value.distance = `${distanceValue} km`;
      deliveryInfo.value.duration = `${durationValue} min`;
    } catch (error) {
      console.error("Erreur lors du calcul basique:", error);
    }
  };

  // Fonction pour charger les informations du restaurant
  const loadRestaurantInfo = async (restaurantId: string) => {
    try {
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      const restaurantSnap = await getDoc(restaurantRef);
      
      if (restaurantSnap.exists()) {
        restaurant.value = { id: restaurantSnap.id, ...restaurantSnap.data() };
      } else {
        console.error("Restaurant non trouvé");
      }
    } catch (err) {
      console.error('Erreur lors du chargement du restaurant:', err);
    }
  };

  // Fonction pour charger les informations du livreur
  const loadDelivererInfo = async (deliveryId: string) => {
    try {
      const delivererRef = doc(db, 'deliverers', deliveryId);
      const delivererSnap = await getDoc(delivererRef);
      
      if (delivererSnap.exists()) {
        deliverer.value = { id: delivererSnap.id, ...delivererSnap.data() } as DeliveryProfile;
      } else {
        console.error("Livreur non trouvé");
      }
    } catch (err) {
      console.error('Erreur lors du chargement du livreur:', err);
    }
  };

  // Modification de la fonction calculateDeliveryInfo pour mettre à jour l'objet deliveryInfo
  const calculateDeliveryInfo = async () => {
    if (!order.value) return;

    try {
      // Géocoder les adresses
      const restaurantLatLng = await geocodeAddress(restaurant.value.address);
      const destinationLatLng = await geocodeAddress(order.value.customerAddress);

      if (!restaurantLatLng || !destinationLatLng) {
        console.error("Impossible de géocoder les adresses");
        return await calculateBasicDistance();
      }

      // Mettre à jour l'objet deliveryInfo avec les coordonnées
      deliveryInfo.value.origin = restaurantLatLng;
      deliveryInfo.value.destination = destinationLatLng;

      // Si le livreur a une position actuelle, l'utiliser
      if (deliverer.value && deliverer.value.currentLocation) {
        deliveryInfo.value.currentPosition = deliverer.value.currentLocation;
      }

      // Si l'API Google Maps est disponible
      if (window.google && window.google.maps) {
        const service = new window.google.maps.DistanceMatrixService();

        const request = {
          origins: [restaurantLatLng],
          destinations: [destinationLatLng],
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
        };

        service.getDistanceMatrix(request, (response: any, status: string) => {
          if (status === "OK" && response && response.rows && response.rows[0].elements) {
            const result = response.rows[0].elements[0];

            if (result.status === "OK") {
              deliveryInfo.value.distance = result.distance.text;
              deliveryInfo.value.duration = result.duration.text;
              
              console.log("Distance et durée calculées via l'API Google Maps", {
                distance: result.distance.text,
                duration: result.duration.text
              });

              // Initialiser la carte après avoir récupéré les données
              initializeMap();
            } else {
              console.error("Erreur lors du calcul de la distance via l'API:", result.status);
              calculateBasicDistance();
            }
          } else {
            console.error("Erreur lors de l'appel à l'API Distance Matrix:", status);
            calculateBasicDistance();
          }
        });
      } else {
        console.warn("L'API Google Maps n'est pas disponible, calcul basique utilisé");
        calculateBasicDistance();
      }
    } catch (error) {
      console.error("Erreur lors du calcul de la distance:", error);
      calculateBasicDistance();
    }
  };

  // Fonction pour initialiser la carte
  const initializeMap = () => {
    // Vérifier que l'API Google Maps est chargée et qu'on a les coordonnées
    if (
      window.google && 
      window.google.maps && 
      order.value && 
      deliveryInfo.value.origin && 
      deliveryInfo.value.destination
    ) {
      const mapElement = document.getElementById("map");
      if (!mapElement) return;
      
      const map = new window.google.maps.Map(mapElement, {
        center: { lat: 0, lng: 0 },
        zoom: 13,
        mapTypeControl: false,
      });
      
      // Créer les marqueurs pour le restaurant et le client
      const restaurantMarker = new window.google.maps.Marker({
        position: deliveryInfo.value.origin,
        map: map,
        title: restaurant.value?.name || "Restaurant",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        },
      });
      
      const customerMarker = new window.google.maps.Marker({
        position: deliveryInfo.value.destination,
        map: map,
        title: "Client",
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png",
        },
      });
      
      // Si le livreur a une position et qu'il est en livraison, ajouter son marqueur
      if (order.value.status === "delivering" && deliveryInfo.value.currentPosition) {
        const delivererMarker = new window.google.maps.Marker({
          position: deliveryInfo.value.currentPosition,
          map: map,
          title: getDelivererDisplayName.value,
          icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
          },
        });
      }
      
      // Tracer l'itinéraire
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true, // Nous utilisons nos propres marqueurs
      });
      
      directionsService.route(
        {
          origin: deliveryInfo.value.origin,
          destination: deliveryInfo.value.destination,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (response: any, status: string) => {
          if (status === "OK") {
            directionsRenderer.setDirections(response);
            
            // Ajuster la vue pour que tout soit visible
            const bounds = new window.google.maps.LatLngBounds();
            bounds.extend(deliveryInfo.value.origin);
            bounds.extend(deliveryInfo.value.destination);
            if (deliveryInfo.value.currentPosition) {
              bounds.extend(deliveryInfo.value.currentPosition);
            }
            map.fitBounds(bounds);
          } else {
            console.error("Erreur lors du calcul de l'itinéraire:", status);
          }
        }
      );
    }
  };

  // Définition des types d'état de commande
  const getStatusColorClass = (status: string): string => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'preparing':
        return 'bg-purple-500';
      case 'ready':
        return 'bg-indigo-500';
      case 'delivering':
        return 'bg-orange-500';
      case 'delivered':
        return 'bg-green-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Fonction pour obtenir les étapes futures
  const getFutureSteps = (currentStatus: string): { status: string; label: string }[] => {
    const allSteps: { status: string; label: string }[] = [
      { status: 'pending', label: 'Commande reçue' },
      { status: 'confirmed', label: 'Commande confirmée' },
      { status: 'preparing', label: 'Préparation en cours' },
      { status: 'ready', label: 'Prête pour livraison' },
      { status: 'delivering', label: 'En cours de livraison' },
      { status: 'delivered', label: 'Livrée' }
    ];
    
    const currentIndex = allSteps.findIndex(step => step.status === currentStatus);
    if (currentIndex === -1) return [];
    
    return allSteps.slice(currentIndex + 1);
  };

  onMounted(async () => {
    // Charger le script Google Maps
    await loadGoogleMapsScript();

    // Charger les détails de la commande
    try {
      const orderRef = doc(db, "orders", orderId.value);
      const unsubscribe = onSnapshot(orderRef, async (doc) => {
        if (doc.exists()) {
          order.value = { id: doc.id, ...doc.data() };
          
          // Charger les infos du restaurant
          if (order.value.restaurantId) {
            await loadRestaurantInfo(order.value.restaurantId);
          }
          
          // Charger les infos du livreur si assigné
          if (order.value.deliveryId) {
            await loadDelivererInfo(order.value.deliveryId);
          }
          
          // Calculer les infos de livraison
          await calculateDeliveryInfo();
          
          loading.value = false;
        } else {
          error.value = "Commande non trouvée";
          loading.value = false;
        }
      });
      
      // Nettoyer l'abonnement
      onUnmounted(() => {
        unsubscribe();
      });
    } catch (e: any) {
      error.value = e.message;
      loading.value = false;
    }
  });
  </script>