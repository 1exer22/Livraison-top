<template>
  <div class="notification-center">
    <!-- Bouton de notification avec badge -->
    <div class="relative">
      <button 
        @click="toggleNotifications"
        class="notification-button"
      >
        <i class="fas fa-bell"></i>
        <span 
          v-if="unreadCount > 0"
          class="notification-badge"
        >
          {{ unreadCount }}
        </span>
      </button>
    </div>

    <!-- Panel de notifications -->
    <div 
      v-if="isOpen"
      class="notification-panel"
    >
      <div class="notification-header">
        <h3 class="text-lg font-medium">Notifications</h3>
        <button 
          v-if="hasUnread"
          @click="markAllAsRead"
          class="text-sm text-primary-600 hover:text-primary-800"
        >
          Tout marquer comme lu
        </button>
      </div>

      <div class="notification-list">
        <template v-if="notifications.length">
          <div 
            v-for="notification in notifications"
            :key="notification.id"
            :class="['notification-item', { unread: !notification.read }]"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon">
              <i :class="getNotificationIcon(notification.type)"></i>
            </div>
            <div class="notification-content">
              <h4 class="notification-title">{{ notification.title }}</h4>
              <p class="notification-body">{{ notification.body }}</p>
              <span class="notification-time">
                {{ formatTime(notification.timestamp) }}
              </span>
            </div>
            <button 
              @click.stop="deleteNotification(notification.id)"
              class="notification-delete"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </template>
        <div v-else class="notification-empty">
          Aucune notification
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user } = useAuth()
const notificationStore = useNotificationStore()

const isOpen = ref(false)

const notifications = computed(() => notificationStore.sortedNotifications)
const unreadCount = computed(() => notificationStore.unreadCount)
const hasUnread = computed(() => notificationStore.hasUnread)

const toggleNotifications = () => {
  isOpen.value = !isOpen.value
}

const handleNotificationClick = async (notification) => {
  // Marquer comme lu
  if (!notification.read) {
    await notificationStore.markAsRead(notification.id)
  }

  // Navigation selon le type
  switch (notification.type) {
    case 'order':
      router.push(`/orders/${notification.data.orderId}`)
      break
    case 'message':
      router.push(`/messages/${notification.data.conversationId}`)
      break
    // Autres types...
  }

  isOpen.value = false
}

const markAllAsRead = async () => {
  await notificationStore.markAllAsRead(user.value.id)
}

const deleteNotification = async (id) => {
  await notificationStore.deleteNotification(id)
}

const getNotificationIcon = (type) => {
  const icons = {
    order: 'fas fa-shopping-bag text-blue-500',
    message: 'fas fa-envelope text-green-500',
    alert: 'fas fa-exclamation-circle text-red-500',
    info: 'fas fa-info-circle text-gray-500'
  }
  return icons[type] || icons.info
}

const formatTime = (timestamp) => {
  const now = new Date()
  const diff = now - timestamp

  if (diff < 60000) { // moins d'une minute
    return 'À l\'instant'
  } else if (diff < 3600000) { // moins d'une heure
    const minutes = Math.floor(diff / 60000)
    return `Il y a ${minutes} min`
  } else if (diff < 86400000) { // moins d'un jour
    const hours = Math.floor(diff / 3600000)
    return `Il y a ${hours}h`
  } else {
    return timestamp.toLocaleDateString()
  }
}

// Gestionnaire de clic extérieur
const handleClickOutside = (event) => {
  if (isOpen.value && !event.target.closest('.notification-center')) {
    isOpen.value = false
  }
}

// Écouteur d'événements de notification
const handleNewNotification = (event) => {
  const notification = event.detail
  notificationStore.addNotification(notification)
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('show-notification', handleNewNotification)
  notificationStore.loadNotifications(user.value.id)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('show-notification', handleNewNotification)
})
</script>

<style lang="scss" scoped>
.notification-button {
  @apply relative p-2 text-gray-600 hover:text-gray-800 transition-colors;
}

.notification-badge {
  @apply absolute -top-1 -right-1 bg-red-500 text-white text-xs
         rounded-full w-5 h-5 flex items-center justify-center;
}

.notification-panel {
  @apply absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg
         border border-gray-200 overflow-hidden z-50;
}

.notification-header {
  @apply flex justify-between items-center p-4 border-b;
}

.notification-list {
  @apply max-h-96 overflow-y-auto;
}

.notification-item {
  @apply flex items-start p-4 hover:bg-gray-50 cursor-pointer border-b;

  &.unread {
    @apply bg-blue-50;
  }
}

.notification-icon {
  @apply flex-shrink-0 mr-3;
  i {
    @apply text-lg;
  }
}

.notification-content {
  @apply flex-grow;
}

.notification-title {
  @apply font-medium;
}

.notification-body {
  @apply text-sm text-gray-600;
}

.notification-time {
  @apply text-xs text-gray-500 block mt-1;
}

.notification-delete {
  @apply text-gray-400 hover:text-red-500 transition-colors;
}

.notification-empty {
  @apply p-4 text-center text-gray-500;
}
</style>
