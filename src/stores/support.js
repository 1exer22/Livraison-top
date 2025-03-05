import { defineStore } from "pinia";
import { supportService } from "@/services/SupportService";

export const useSupportStore = defineStore("support", {
  state: () => ({
    tickets: [],
    activeChat: null,
    chatMessages: [],
    faqCategories: [],
    loading: false,
    error: null,
  }),

  getters: {
    openTickets: (state) => {
      return state.tickets.filter((ticket) => ticket.status === "open");
    },

    sortedMessages: (state) => {
      return [...state.chatMessages].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );
    },
  },

  actions: {
    async createTicket(ticketData) {
      try {
        const ticketId = await supportService.createTicket(ticketData);
        return ticketId;
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async loadTickets(userId) {
      try {
        this.loading = true;
        const q = query(
          collection(getFirestore(), "support_tickets"),
          where("userId", "==", userId),
          orderBy("createdAt", "desc")
        );

        const snapshot = await getDocs(q);
        this.tickets = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async startChat(userId) {
      try {
        const chatRef = await addDoc(
          collection(getFirestore(), "support_chats"),
          {
            userId,
            status: "active",
            startedAt: new Date(),
          }
        );

        this.activeChat = {
          id: chatRef.id,
          userId,
        };

        this.subscribeToChatMessages(chatRef.id);
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    subscribeToChatMessages(chatId) {
      supportService.subscribeToChat(chatId, (messages) => {
        this.chatMessages = messages;
      });
    },

    async sendMessage(message) {
      if (!this.activeChat) return;

      try {
        await supportService.sendMessage(this.activeChat.id, message);
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },

    async loadFAQCategories() {
      try {
        this.loading = true;
        this.faqCategories = await supportService.getFAQCategories();
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async searchKnowledgeBase(query) {
      try {
        return await supportService.searchKnowledgeBase(query);
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    },
  },
});
