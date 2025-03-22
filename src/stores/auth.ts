import { defineStore } from "pinia";
import { ref } from "vue";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import { auth, db } from "../firebase/config";

export type UserRole = "client" | "restaurant" | "livreur" | "admin";

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  isProfileComplete?: boolean;
}

export interface RestaurantProfile {
  userId: string;
  name: string;
  description: string;
  address: string;
  image: string;
  rating: number;
  isOpen: boolean;
}

export interface DeliveryProfile {
  userId: string;
  isAvailable: boolean;
  currentLocation?: {
    lat: number;
    lng: number;
  };
  rating: number;
  totalDeliveries: number;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<User | null>(null);
  const userProfile = ref<UserProfile | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const init = () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser;
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          userProfile.value = userDoc.data() as UserProfile;
        }
      } else {
        userProfile.value = null;
      }
      loading.value = false;
    });
  };

  const signIn = async (email: string, password: string) => {
    try {
      error.value = null;
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      user.value = userCredential.user;
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      if (userDoc.exists()) {
        userProfile.value = userDoc.data() as UserProfile;
      }
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const signUpClient = async (email: string, password: string) => {
    try {
      error.value = null;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const newUser: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        role: "client",
        isProfileComplete: true,
      };
      await setDoc(doc(db, "users", userCredential.user.uid), newUser);
      user.value = userCredential.user;
      userProfile.value = newUser;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const createRestaurantAccount = async (email: string, password: string) => {
    if (!userProfile.value?.role === "admin") {
      throw new Error("Seul un administrateur peut créer un compte restaurant");
    }
    try {
      error.value = null;
      // Créer le compte utilisateur
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      // Créer le profil utilisateur initial
      const newUser: UserProfile = {
        uid,
        email: userCredential.user.email!,
        role: "restaurant",
        isProfileComplete: false,
      };
      await setDoc(doc(db, "users", uid), newUser);

      // Créer un document restaurant vide
      await setDoc(doc(db, "restaurants", uid), {
        userId: uid,
        isProfileComplete: false,
        createdAt: new Date(),
      });

      // Créer la collection pour les menus du restaurant
      const menuCollectionRef = collection(db, `restaurants/${uid}/menu`);
      await setDoc(doc(menuCollectionRef, "info"), {
        created: new Date(),
        lastUpdated: new Date(),
      });

      return { user: newUser };
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const createDeliveryAccount = async (email: string, password: string) => {
    if (!userProfile.value?.role === "admin") {
      throw new Error("Seul un administrateur peut créer un compte livreur");
    }
    try {
      error.value = null;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;

      const newUser: UserProfile = {
        uid,
        email: userCredential.user.email!,
        role: "livreur",
        isProfileComplete: false,
      };
      await setDoc(doc(db, "users", uid), newUser);

      const deliveryProfile: DeliveryProfile = {
        userId: uid,
        isAvailable: false,
        rating: 0,
        totalDeliveries: 0,
      };
      await setDoc(doc(db, "deliveryProfiles", uid), deliveryProfile);

      return { user: newUser, deliveryProfile };
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const updateRestaurantProfile = async (
    restaurantData: Omit<RestaurantProfile, "userId">
  ) => {
    if (!user.value || !userProfile.value) throw new Error("Non authentifié");
    if (userProfile.value.role !== "restaurant")
      throw new Error("Non autorisé");

    const uid = user.value.uid;
    try {
      // Mettre à jour le profil du restaurant
      await setDoc(
        doc(db, "restaurants", uid),
        {
          userId: uid,
          ...restaurantData,
          isProfileComplete: true,
          updatedAt: new Date(),
        },
        { merge: true }
      );

      // Marquer le profil utilisateur comme complet
      await setDoc(
        doc(db, "users", uid),
        {
          isProfileComplete: true,
        },
        { merge: true }
      );

      userProfile.value.isProfileComplete = true;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      user.value = null;
      userProfile.value = null;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const isAdmin = () => userProfile.value?.role === "admin";
  const isRestaurant = () => userProfile.value?.role === "restaurant";
  const isDelivery = () => userProfile.value?.role === "livreur";
  const isClient = () => userProfile.value?.role === "client";

  return {
    user,
    userProfile,
    loading,
    error,
    init,
    signIn,
    signUpClient,
    createRestaurantAccount,
    createDeliveryAccount,
    updateRestaurantProfile,
    signOut,
    isAdmin,
    isRestaurant,
    isDelivery,
    isClient,
  };
});
