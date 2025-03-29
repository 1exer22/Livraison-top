import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  updateDoc,
  doc,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { vapidKeys } from '../firebase/vapidConfig';
import { useAuthStore } from './auth';

// Types
export type NotificationType = 
  | 'new_assignment'    // Nouvelle commande assignée
  | 'status_update'     // Mise à jour du statut (disponible/indisponible)
  | 'order_status'      // Mise à jour du statut de commande
  | 'reassignment'      // Réassignation de commande
  | 'payment'           // Notification de paiement
  | 'system';           // Notification système

export type Notification = {
  id?: string;
  userId: string;       // ID de l'utilisateur concerné
  title: string;        // Titre de la notification
  message: string;      // Message détaillé
  read: boolean;        // Si la notification a été lue
  createdAt: any;       // Date de création
  type: NotificationType; // Type de notification
  data?: any;           // Données supplémentaires (comme les IDs de commande)
}

export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([]);
  const unreadCount = ref(0);
  const loading = ref(false);
  const error = ref('');
  
  // Unsubscribe handler
  let unsubscribeNotifications: (() => void) | null = null;
  
  // Initialiser les notifications pour un utilisateur
  const initNotifications = (userId: string) => {
    loading.value = true;
    
    if (unsubscribeNotifications) {
      unsubscribeNotifications();
    }
    
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
      loading.value = false;
      notifications.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      // Mettre à jour le compteur de non lus
      unreadCount.value = notifications.value.filter(n => !n.read).length;
      
      // Demander la permission pour les notifications si pas encore accordée
      requestNotificationPermission();
    }, (err) => {
      loading.value = false;
      error.value = "Erreur lors du chargement des notifications";
      console.error(err);
    });
  };
  
  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        read: true
      });
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la notification:", err);
    }
  };
  
  // Marquer toutes les notifications comme lues
  const markAllAsRead = async (userId: string) => {
    try {
      const promises = notifications.value
        .filter(n => !n.read)
        .map(n => {
          if (n.id) {
            const notificationRef = doc(db, 'notifications', n.id);
            return updateDoc(notificationRef, { read: true });
          }
          return Promise.resolve();
        });
      
      await Promise.all(promises);
    } catch (err) {
      console.error("Erreur lors de la mise à jour des notifications:", err);
    }
  };
  
  // Envoyer une notification à un utilisateur
  const sendNotification = async (userId: string, notificationData: {
    title: string;
    message: string;
    type: NotificationType;
    data?: any;
  }) => {
    try {
      const notification: Omit<Notification, 'id'> = {
        userId,
        title: notificationData.title,
        message: notificationData.message,
        read: false,
        createdAt: serverTimestamp(),
        type: notificationData.type,
        data: notificationData.data || null
      };
      
      await addDoc(collection(db, 'notifications'), notification);
      
      // Envoyer également une notification push si possible
      sendWebPushNotification(notificationData.title, notificationData.message);
    } catch (err) {
      console.error("Erreur lors de l'envoi de la notification:", err);
    }
  };
  
  // Gérer les notifications push du navigateur
  const requestNotificationPermission = async () => {
    try {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        console.warn('Ce navigateur ne prend pas en charge les notifications web push');
        return;
      }
      
      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted') {
          console.log('Permission accordée pour les notifications');
          
          // Enregistrer le service worker
          const registration = await navigator.serviceWorker.register('/service-worker.js');
          console.log('Service worker enregistré');
          
          // Enregistrer le push manager avec la clé publique VAPID
          try {
            const subscription = await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidKeys.publicKey)
            });
            
            console.log('Push subscription créé:', subscription);
            
            // Ici, vous pourriez envoyer la subscription au serveur
            // pour l'enregistrer dans la base de données
            await saveSubscription(subscription);
          } catch (err) {
            console.error('Erreur lors de la souscription aux notifications push:', err);
          }
        }
      }
    } catch (err) {
      console.error("Erreur lors de la demande de permission:", err);
    }
  };
  
  // Envoyer une notification web push
  const sendWebPushNotification = async (title: string, message: string, data?: any) => {
    try {
      if (!('Notification' in window)) {
        return;
      }
      
      if (Notification.permission === 'granted') {
        const options = {
          body: message,
          icon: '/logo.png', // Chemin vers l'icône de notification
          badge: '/badge.png', // Petit badge pour les notifications mobiles
          vibrate: [200, 100, 200],
          data
        };
        
        // Utiliser le service worker pour envoyer la notification
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          await navigator.serviceWorker.ready;
          await navigator.serviceWorker.controller.postMessage({
            type: 'SHOW_NOTIFICATION',
            title,
            options
          });
        } else {
          // Fallback si le service worker n'est pas disponible
          new Notification(title, options);
        }
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi de la notification push:", err);
    }
  };
  
  // Sauvegarder la souscription aux notifications dans Firestore
  const saveSubscription = async (subscription: PushSubscription) => {
    try {
      // Vérifier s'il y a un utilisateur connecté
      const auth = useAuthStore();
      if (!auth.user?.uid) {
        console.warn('Aucun utilisateur connecté pour sauvegarder la souscription');
        return;
      }
      
      const userId = auth.user.uid;
      
      // Convertir la souscription en JSON
      const subscriptionJSON = subscription.toJSON();
      
      // Sauvegarder dans Firestore
      const q = query(
        collection(db, 'pushSubscriptions'),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        // Créer une nouvelle entrée
        await addDoc(collection(db, 'pushSubscriptions'), {
          userId,
          subscription: subscriptionJSON,
          createdAt: serverTimestamp()
        });
      } else {
        // Mettre à jour l'entrée existante
        const docRef = doc(db, 'pushSubscriptions', querySnapshot.docs[0].id);
        await updateDoc(docRef, {
          subscription: subscriptionJSON,
          updatedAt: serverTimestamp()
        });
      }
      
      console.log('Souscription sauvegardée avec succès');
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de la souscription:', err);
    }
  };
  
  // Utilitaire pour convertir la clé VAPID en Uint8Array
  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  // Nettoyer à la déconnexion
  const cleanup = () => {
    if (unsubscribeNotifications) {
      unsubscribeNotifications();
      unsubscribeNotifications = null;
    }
    
    notifications.value = [];
    unreadCount.value = 0;
  };
  
  return {
    notifications,
    unreadCount,
    loading,
    error,
    initNotifications,
    markAsRead,
    markAllAsRead,
    sendNotification,
    requestNotificationPermission,
    cleanup
  };
});
