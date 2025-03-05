<template>
  <div class="support-chat">
    <!-- Bouton de chat -->
    <button v-if="!isChatOpen" @click="openChat" class="chat-button">
      <i class="fas fa-comments"></i>
      <span>Besoin d'aide ?</span>
    </button>

    <!-- Fenêtre de chat -->
    <div v-else class="chat-window">
      <!-- En-tête -->
      <div class="chat-header">
        <h3>Support Client</h3>
        <button @click="closeChat" class="close-button">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Messages -->
      <div class="chat-messages" ref="messagesContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="['message', message.sender === 'user' ? 'user' : 'support']"
        >
          <div class="message-content">
            {{ message.content }}
          </div>
          <div class="message-time">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>

      <!-- Formulaire de message -->
      <div class="chat-input">
        <textarea
          v-model="newMessage"
          @keydown.enter.prevent="sendMessage"
          placeholder="Écrivez votre message..."
          rows="2"
          class="message-input"
        ></textarea>
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim()"
          class="send-button"
        >
          <i class="fas fa-paper-plane"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { useSupportStore } from "@/stores/support";
import { useAuth } from "@/composables/useAuth";

const supportStore = useSupportStore();
const { user } = useAuth();

const isChatOpen = ref(false);
const newMessage = ref("");
const messagesContainer = ref(null);

const messages = computed(() => supportStore.sortedMessages);

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

const openChat = async () => {
  try {
    await supportStore.startChat(user.value.id);
    isChatOpen.value = true;
    await scrollToBottom();
  } catch (error) {
    console.error("Erreur d'ouverture du chat:", error);
  }
};

const closeChat = () => {
  isChatOpen.value = false;
  if (supportStore.activeChat) {
    supportStore.unsubscribeFromChat(supportStore.activeChat.id);
  }
};

const sendMessage = async () => {
  if (!newMessage.value.trim()) return;

  try {
    await supportStore.sendMessage({
      content: newMessage.value,
      sender: "user",
    });
    newMessage.value = "";
    await scrollToBottom();
  } catch (error) {
    console.error("Erreur d'envoi du message:", error);
  }
};

onMounted(() => {
  if (supportStore.activeChat) {
    supportStore.subscribeToChatMessages(supportStore.activeChat.id);
  }
});

onUnmounted(() => {
  if (supportStore.activeChat) {
    supportStore.unsubscribeFromChat(supportStore.activeChat.id);
  }
});
</script>

<style lang="scss" scoped>
.support-chat {
  @apply fixed bottom-4 right-4 z-50;
}

.chat-button {
  @apply flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-full
         shadow-lg hover:bg-primary-600 transition-colors duration-200;
}

.chat-window {
  @apply fixed bottom-4 right-4 w-96 bg-white rounded-lg shadow-xl
         flex flex-col overflow-hidden;
  height: 500px;
}

.chat-header {
  @apply flex justify-between items-center p-4 bg-primary-500 text-white;
}

.close-button {
  @apply text-white hover:text-gray-200 transition-colors duration-200;
}

.chat-messages {
  @apply flex-grow p-4 overflow-y-auto space-y-4;
}

.message {
  @apply flex flex-col max-w-[75%];

  &.user {
    @apply ml-auto;
    .message-content {
      @apply bg-primary-500 text-white;
    }
  }

  &.support {
    @apply mr-auto;
    .message-content {
      @apply bg-gray-100;
    }
  }
}

.message-content {
  @apply px-4 py-2 rounded-lg;
}

.message-time {
  @apply text-xs text-gray-500 mt-1;
}

.chat-input {
  @apply p-4 border-t flex gap-2;
}

.message-input {
  @apply flex-grow px-4 py-2 border rounded-lg resize-none
         focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.send-button {
  @apply p-2 bg-primary-500 text-white rounded-lg
         hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed
         transition-colors duration-200;
}
</style>
