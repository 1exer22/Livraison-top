import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/config';

// Définition des types
export interface ScheduleShift {
  id?: string;
  delivererId: string;  // ID du document du livreur (pas l'userId)
  day: number; // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  startTime: string; // format "HH:MM"
  endTime: string; // format "HH:MM"
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Break {
  id?: string;
  delivererId: string;  // ID du document du livreur (pas l'userId)
  startTime: Timestamp;
  endTime: Timestamp;
  reason: string;
  approved: boolean;
  approvedBy?: string;
  createdAt?: Timestamp;
}

export interface AvailabilityTimeSlot {
  day: number;
  slots: {
    hour: number;
    available: boolean;
  }[];
}

export const useScheduleStore = defineStore('schedules', () => {
  // État
  const shifts = ref<ScheduleShift[]>([]);
  const breaks = ref<Break[]>([]);
  const loading = ref(false);
  const error = ref('');

  // Actions pour les horaires réguliers
  const fetchDelivererSchedule = async (delivererId: string | undefined) => {
    loading.value = true;
    error.value = '';
    try {
      if (!delivererId) {
        console.warn('fetchDelivererSchedule appelé sans ID de livreur');
        return [];
      }
      
      const q = query(
        collection(db, 'schedules'),
        where('delivererId', '==', delivererId)
      );
      const querySnapshot = await getDocs(q);
      const scheduleData: ScheduleShift[] = [];
      
      querySnapshot.forEach((doc) => {
        scheduleData.push({ 
          id: doc.id, 
          ...doc.data() 
        } as ScheduleShift);
      });
      
      shifts.value = scheduleData;
      
      return scheduleData;
    } catch (err: any) {
      console.error('Erreur lors du chargement des horaires:', err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  const addShift = async (shift: Omit<ScheduleShift, 'id' | 'createdAt' | 'updatedAt'>) => {
    loading.value = true;
    error.value = '';
    try {
      const shiftData = {
        ...shift,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'schedules'), shiftData);
      const newShift = { 
        id: docRef.id, 
        ...shift 
      };
      
      shifts.value.push(newShift);
      
      return newShift;
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout d\'un horaire:', err);
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const updateShift = async (shiftId: string, updates: Partial<ScheduleShift>) => {
    loading.value = true;
    error.value = '';
    try {
      const shiftRef = doc(db, 'schedules', shiftId);
      
      await updateDoc(shiftRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Mettre à jour localement
      const index = shifts.value.findIndex(s => s.id === shiftId);
      if (index !== -1) {
        shifts.value[index] = { ...shifts.value[index], ...updates };
      }
      
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la mise à jour d\'un horaire:', err);
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const deleteShift = async (shiftId: string) => {
    loading.value = true;
    error.value = '';
    try {
      await deleteDoc(doc(db, 'schedules', shiftId));
      
      // Supprimer localement
      shifts.value = shifts.value.filter(s => s.id !== shiftId);
      
      return true;
    } catch (err: any) {
      console.error('Erreur lors de la suppression d\'un horaire:', err);
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Actions pour les pauses
  const fetchDelivererBreaks = async (delivererId: string | 'all' | undefined) => {
    loading.value = true;
    error.value = '';
    try {
      let q;
      
      if (!delivererId) {
        console.warn('fetchDelivererBreaks appelé sans ID de livreur');
        return [];
      }
      
      if (delivererId === 'all') {
        q = query(collection(db, 'breaks'));
      } else {
        q = query(
          collection(db, 'breaks'),
          where('delivererId', '==', delivererId)
        );
      }
      
      const querySnapshot = await getDocs(q);
      const breaksData: Break[] = [];
      
      querySnapshot.forEach((doc) => {
        breaksData.push({ 
          id: doc.id, 
          ...doc.data() 
        } as Break);
      });
      
      breaks.value = breaksData;
      
      return breaksData;
    } catch (err: any) {
      console.error('Erreur lors du chargement des pauses:', err);
      error.value = err.message;
      return [];
    } finally {
      loading.value = false;
    }
  };

  const requestBreak = async (delivererId: string, startTime: Timestamp, endTime: Timestamp, reason: string) => {
    loading.value = true;
    error.value = '';
    try {
      const newBreak = {
        delivererId,
        startTime,
        endTime,
        reason,
        approved: false, // Par défaut non approuvé
        createdAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'breaks'), newBreak);
      const addedBreak = { 
        id: docRef.id, 
        ...newBreak
      };
      
      breaks.value.push(addedBreak as Break);
      
      return addedBreak;
    } catch (err: any) {
      console.error('Erreur lors de la demande de pause:', err);
      error.value = err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  const approveBreak = async (breakId: string, adminId: string) => {
    loading.value = true;
    error.value = '';
    try {
      const breakRef = doc(db, 'breaks', breakId);
      
      await updateDoc(breakRef, {
        approved: true,
        approvedBy: adminId
      });
      
      // Mettre à jour localement
      const index = breaks.value.findIndex(b => b.id === breakId);
      if (index !== -1) {
        breaks.value[index] = { 
          ...breaks.value[index], 
          approved: true, 
          approvedBy: adminId 
        };
      }
      
      return true;
    } catch (err: any) {
      console.error('Erreur lors de l\'approbation d\'une pause:', err);
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  const cancelBreak = async (breakId: string) => {
    loading.value = true;
    error.value = '';
    try {
      await deleteDoc(doc(db, 'breaks', breakId));
      
      // Supprimer localement
      breaks.value = breaks.value.filter(b => b.id !== breakId);
      
      return true;
    } catch (err: any) {
      console.error('Erreur lors de l\'annulation d\'une pause:', err);
      error.value = err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  // Getters
  const getWeeklySchedule = computed(() => {
    // Organiser les horaires par jour
    const weekSchedule: Record<number, ScheduleShift[]> = {};
    
    // Initialiser tous les jours de la semaine
    for (let i = 0; i < 7; i++) {
      weekSchedule[i] = [];
    }
    
    // Remplir avec les shifts existants
    shifts.value.forEach(shift => {
      if (weekSchedule[shift.day]) {
        weekSchedule[shift.day].push(shift);
      }
    });
    
    return weekSchedule;
  });

  const getActiveBreaks = computed(() => {
    const now = new Date();
    
    return breaks.value.filter(breakItem => {
      const startTime = breakItem.startTime instanceof Timestamp 
        ? breakItem.startTime.toDate() 
        : new Date(breakItem.startTime);
      
      const endTime = breakItem.endTime instanceof Timestamp 
        ? breakItem.endTime.toDate() 
        : new Date(breakItem.endTime);
      
      return breakItem.approved && startTime <= now && now <= endTime;
    });
  });

  const getPendingBreaks = computed(() => {
    return breaks.value.filter(breakItem => !breakItem.approved);
  });

  // Fonction pour vérifier la disponibilité d'un livreur à un moment donné
  const isDelivererAvailable = (delivererId: string, date: Date): boolean => {
    const day = date.getDay(); // 0 = Dimanche, 1 = Lundi, ...
    const hour = date.getHours();
    const minutes = date.getMinutes();
    
    // 1. Vérifier si le livreur est programmé pour travailler à cette heure
    const dayShifts = shifts.value.filter(
      shift => shift.delivererId === delivererId && 
               shift.day === day && 
               shift.isActive
    );
    
    if (dayShifts.length === 0) {
      return false; // Pas de shift programmé ce jour
    }
    
    // Vérifier si l'heure est dans un des shifts
    const currentTimeStr = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    const inShift = dayShifts.some(shift => {
      return currentTimeStr >= shift.startTime && currentTimeStr <= shift.endTime;
    });
    
    if (!inShift) {
      return false; // Pas dans les horaires de travail
    }
    
    // 2. Vérifier si le livreur est en pause à ce moment
    const inBreak = breaks.value.some(breakItem => {
      if (!breakItem.approved || breakItem.delivererId !== delivererId) {
        return false;
      }
      
      const breakStart = breakItem.startTime instanceof Timestamp 
        ? breakItem.startTime.toDate() 
        : new Date(breakItem.startTime);
      
      const breakEnd = breakItem.endTime instanceof Timestamp 
        ? breakItem.endTime.toDate() 
        : new Date(breakItem.endTime);
      
      return date >= breakStart && date <= breakEnd;
    });
    
    return !inBreak; // Disponible si pas en pause
  };

  return {
    shifts,
    breaks,
    loading,
    error,
    fetchDelivererSchedule,
    addShift,
    updateShift,
    deleteShift,
    fetchDelivererBreaks,
    requestBreak,
    approveBreak,
    cancelBreak,
    getWeeklySchedule,
    getActiveBreaks,
    getPendingBreaks,
    isDelivererAvailable
  };
});
