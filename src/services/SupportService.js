import {
  collection,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getFirestore,
} from "firebase/firestore";

class SupportService {
  constructor() {
    this.db = getFirestore();
    this.activeChats = new Map();
  }

  async createTicket(ticketData) {
    try {
      const docRef = await addDoc(collection(this.db, "support_tickets"), {
        ...ticketData,
        status: "open",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Erreur de création du ticket:", error);
      throw error;
    }
  }

  async updateTicket(ticketId, updates) {
    try {
      await updateDoc(doc(this.db, "support_tickets", ticketId), {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Erreur de mise à jour du ticket:", error);
      throw error;
    }
  }

  subscribeToChat(chatId, callback) {
    const q = query(
      collection(this.db, "chat_messages"),
      where("chatId", "==", chatId),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(messages);
    });

    this.activeChats.set(chatId, unsubscribe);
    return unsubscribe;
  }

  unsubscribeFromChat(chatId) {
    const unsubscribe = this.activeChats.get(chatId);
    if (unsubscribe) {
      unsubscribe();
      this.activeChats.delete(chatId);
    }
  }

  async sendMessage(chatId, message) {
    try {
      await addDoc(collection(this.db, "chat_messages"), {
        chatId,
        ...message,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Erreur d'envoi du message:", error);
      throw error;
    }
  }

  async getFAQCategories() {
    try {
      const snapshot = await getDocs(collection(this.db, "faq_categories"));
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Erreur de récupération des catégories FAQ:", error);
      throw error;
    }
  }

  async getFAQArticles(categoryId) {
    try {
      const q = query(
        collection(this.db, "faq_articles"),
        where("categoryId", "==", categoryId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      console.error("Erreur de récupération des articles FAQ:", error);
      throw error;
    }
  }

  async searchKnowledgeBase(query) {
    try {
      const response = await fetch("/api/support/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });
      return await response.json();
    } catch (error) {
      console.error("Erreur de recherche:", error);
      throw error;
    }
  }
}

export const supportService = new SupportService();
