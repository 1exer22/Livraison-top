import { defineStore } from "pinia";
import { ref } from "vue";
import { db, storage } from "../firebase/config";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
  onSnapshot,
  getDoc,
  serverTimestamp,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "./auth";
import type { CartItem } from "./cart";

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  image: string;
  userId: string;
  rating: number;
  isOpen: boolean;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface MenuItem {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  imagePath?: string;
  available: boolean;
  restaurantId: string;
}

export type OrderStatus =
  | "pending" // En attente de confirmation du restaurant
  | "accepted" // Commande acceptée, en attente d'un livreur
  | "preparing" // En cours de préparation
  | "ready" // Prête à être livrée
  | "delivering" // En cours de livraison
  | "delivered" // Livrée
  | "cancelled"; // Annulée

export interface TrackingEvent {
  status: OrderStatus;
  timestamp: Date;
  note?: string;
}

export interface Order {
  id?: string;
  items: CartItem[];
  status: OrderStatus;
  total: number;
  createdAt: Date;
  customerId: string;
  restaurantId: string;
  customerName?: string;
  customerAddress?: string;
  deliveryId?: string;
  estimatedDeliveryTime?: Date;
  preparationTime?: number; // en minutes
  deliveryNotes?: string;
  trackingHistory: {
    status: OrderStatus;
    timestamp: Date;
    note?: string;
  }[];
}

export interface DeliveryProfile {
  id: string;
  userId: string;
  name: string;
  isAvailable: boolean;
  currentLocation: {
    lat: number;
    lng: number;
  };
  rating: number;
  totalDeliveries: number;
}

export const useRestaurantStore = defineStore("restaurant", () => {
  const authStore = useAuthStore();
  const menuItems = ref<MenuItem[]>([]);
  const orders = ref<Order[]>([]);
  const restaurants = ref<Restaurant[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const availableDeliverers = ref<DeliveryProfile[]>([]);
  const unsubscribeOrders = ref<(() => void) | null>(null);

  const uploadImage = async (
    file: File
  ): Promise<{ url: string; path: string }> => {
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const path = `menu-items/${authStore.userProfile?.uid}/${fileName}`;
    const imageRef = storageRef(storage, path);

    await uploadBytes(imageRef, file);
    const url = await getDownloadURL(imageRef);

    return { url, path };
  };

  const deleteImage = async (path: string) => {
    if (!path) return;
    const imageRef = storageRef(storage, path);
    try {
      await deleteObject(imageRef);
    } catch (e) {
      console.error("Erreur lors de la suppression de l'image:", e);
    }
  };

  const fetchRestaurants = async () => {
    loading.value = true;
    try {
      const querySnapshot = await getDocs(collection(db, "restaurants"));
      restaurants.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Restaurant[];
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const fetchRestaurantById = async (
    id: string
  ): Promise<Restaurant | null> => {
    try {
      const docRef = doc(db, "restaurants", id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Restaurant;
      }
      return null;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const fetchMenuItemsByRestaurant = async (
    restaurantId: string
  ): Promise<MenuItem[]> => {
    try {
      const q = query(
        collection(db, "menuItems"),
        where("restaurantId", "==", restaurantId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MenuItem[];
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const fetchMenuItems = async () => {
    if (!authStore.userProfile?.uid) return;

    loading.value = true;
    try {
      const q = query(
        collection(db, "menuItems"),
        where("restaurantId", "==", authStore.userProfile.uid)
      );
      const snapshot = await getDocs(q);
      menuItems.value = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as MenuItem[];
    } catch (e: any) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  };

  const addMenuItem = async (
    item: Omit<MenuItem, "id" | "restaurantId">,
    imageFile: File
  ) => {
    if (!authStore.userProfile?.uid) return;

    loading.value = true;
    try {
      const { url: imageUrl, path: imagePath } = await uploadImage(imageFile);
      const newItem = {
        ...item,
        image: imageUrl,
        imagePath,
        restaurantId: authStore.userProfile.uid,
        available: true,
      };
      await addDoc(collection(db, "menuItems"), newItem);
      await fetchMenuItems();
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };

  const updateMenuItem = async (
    id: string,
    updates: Partial<MenuItem>,
    newImageFile?: File
  ) => {
    loading.value = true;
    try {
      const item = menuItems.value.find((item) => item.id === id);
      let imageUpdates = {};

      if (newImageFile) {
        if (item?.imagePath) {
          await deleteImage(item.imagePath);
        }

        const { url: imageUrl, path: imagePath } = await uploadImage(
          newImageFile
        );
        imageUpdates = { image: imageUrl, imagePath };
      }

      await updateDoc(doc(db, "menuItems", id), {
        ...updates,
        ...imageUpdates,
      });
      await fetchMenuItems();
    } catch (e: any) {
      error.value = e.message;
      throw e;
    } finally {
      loading.value = false;
    }
  };
  const startOrdersListener = () => {
    if (!authStore.user) return;

    const q = query(
      collection(db, "orders"),
      where("restaurantId", "==", authStore.user.uid),
      orderBy("createdAt", "desc")
    );

    unsubscribeOrders.value = onSnapshot(q, (snapshot) => {
      orders.value = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt.toDate(),
          estimatedDeliveryTime: data.estimatedDeliveryTime.toDate(),
          trackingHistory: data.trackingHistory.map((event: any) => ({
            ...event,
            timestamp:
              event.timestamp instanceof Timestamp
                ? event.timestamp.toDate()
                : new Date(event.timestamp),
          })),
        } as Order;
      });
    });
  };

  const stopOrdersListener = () => {
    if (unsubscribeOrders.value) {
      unsubscribeOrders.value();
      unsubscribeOrders.value = null;
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    note?: string
  ) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      const orderDoc = await getDoc(orderRef);

      if (!orderDoc.exists()) {
        throw new Error("Commande non trouvée");
      }

      const orderData = orderDoc.data();
      const trackingEvent: TrackingEvent = {
        status: newStatus,
        timestamp: new Date(),
        note,
      };

      const trackingHistory = [
        ...(orderData.trackingHistory || []),
        trackingEvent,
      ];

      await updateDoc(orderRef, {
        status: newStatus,
        trackingHistory: trackingHistory.map((event) => ({
          ...event,
          timestamp: event.timestamp,
        })),
      });
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const createOrder = async (
    orderData: Omit<Order, "id" | "status" | "createdAt" | "trackingHistory">
  ) => {
    try {
      const initialTrackingEvent: TrackingEvent = {
        status: "pending",
        timestamp: new Date(),
        note: "Commande créée",
      };

      const newOrder = {
        ...orderData,
        status: "pending" as const,
        createdAt: serverTimestamp(),
        trackingHistory: [initialTrackingEvent],
      };

      await addDoc(collection(db, "orders"), newOrder);
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const assignDeliverer = async (orderId: string, deliveryId: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        deliveryId,
        status: "delivering" as OrderStatus,
      });
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const fetchAvailableDeliverers = async () => {
    try {
      const q = query(
        collection(db, "deliveryProfiles"),
        where("isAvailable", "==", true)
      );
      const querySnapshot = await getDocs(q);
      availableDeliverers.value = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as DeliveryProfile)
      );
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  return {
    menuItems,
    orders,
    restaurants,
    availableDeliverers,
    loading,
    error,
    fetchMenuItems,
    fetchRestaurants,
    fetchRestaurantById,
    fetchMenuItemsByRestaurant,
    addMenuItem,
    updateMenuItem,
    startOrdersListener,
    stopOrdersListener,
    updateOrderStatus,
    assignDeliverer,
    fetchAvailableDeliverers,
    createOrder,
  };
});
