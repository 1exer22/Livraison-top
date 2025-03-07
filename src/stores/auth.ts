import { defineStore } from 'pinia';
import { ref } from 'vue';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export type UserRole = 'client' | 'restaurant' | 'livreur' | 'admin';

interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const userProfile = ref<UserProfile | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const init = () => {
    onAuthStateChanged(auth, async (firebaseUser) => {
      user.value = firebaseUser;
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      user.value = userCredential.user;
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        role: 'client'
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      user.value = userCredential.user;
      userProfile.value = newUser;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const createRestaurantAccount = async (email: string, password: string) => {
    if (!userProfile.value?.role === 'admin') {
      throw new Error('Seul un administrateur peut créer un compte restaurant');
    }
    try {
      error.value = null;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        role: 'restaurant'
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      return newUser;
    } catch (e: any) {
      error.value = e.message;
      throw e;
    }
  };

  const createDeliveryAccount = async (email: string, password: string) => {
    if (!userProfile.value?.role === 'admin') {
      throw new Error('Seul un administrateur peut créer un compte livreur');
    }
    try {
      error.value = null;
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser: UserProfile = {
        uid: userCredential.user.uid,
        email: userCredential.user.email!,
        role: 'livreur'
      };
      await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
      return newUser;
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

  const isAdmin = () => userProfile.value?.role === 'admin';
  const isRestaurant = () => userProfile.value?.role === 'restaurant';
  const isDelivery = () => userProfile.value?.role === 'livreur';
  const isClient = () => userProfile.value?.role === 'client';

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
    signOut,
    isAdmin,
    isRestaurant,
    isDelivery,
    isClient
  };
});