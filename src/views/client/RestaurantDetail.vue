<template>
  <div class="restaurant-detail">
    <div class="hero-section">
      <img :src="restaurant.coverImage" :alt="restaurant.name" class="w-full h-64 object-cover">
      <div class="restaurant-info p-6 bg-white shadow-lg rounded-lg -mt-16 mx-4 relative">
        <h1 class="text-3xl font-bold">{{ restaurant.name }}</h1>
        <div class="flex items-center gap-4 mt-2">
          <span class="rating">★ {{ restaurant.rating }}/5</span>
          <span class="delivery-time">{{ restaurant.deliveryTime }} min</span>
          <span class="delivery-fee">{{ restaurant.deliveryFee }}€</span>
        </div>
      </div>
    </div>

    <div class="menu-section grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
      <div class="md:col-span-2">
        <menu-categories 
          :categories="menuCategories"
          @select-category="selectedCategory = $event"
        />
        <menu-items 
          :items="filteredItems"
          @add-to-cart="addToCart"
        />
      </div>
      
      <div class="md:col-span-1">
        <shopping-cart
          :items="cartItems"
          @update-quantity="updateCartQuantity"
          @remove-item="removeFromCart"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useRestaurantStore } from '@/stores/restaurant'
import MenuCategories from '@/components/client/MenuCategories.vue'
import MenuItems from '@/components/client/MenuItems.vue'
import ShoppingCart from '@/components/client/ShoppingCart.vue'

const route = useRoute()
const cartStore = useCartStore()
const restaurantStore = useRestaurantStore()

const restaurant = ref(null)
const selectedCategory = ref(null)
const menuCategories = ref([])
const menuItems = ref([])

const filteredItems = computed(() => {
  if (!selectedCategory.value) return menuItems.value
  return menuItems.value.filter(item => item.categoryId === selectedCategory.value)
})

const cartItems = computed(() => cartStore.items)

const addToCart = (item) => {
  cartStore.addItem({
    ...item,
    restaurantId: restaurant.value.id
  })
}

const updateCartQuantity = (itemId, quantity) => {
  cartStore.updateItemQuantity(itemId, quantity)
}

const removeFromCart = (itemId) => {
  cartStore.removeItem(itemId)
}

onMounted(async () => {
  const restaurantId = route.params.id
  restaurant.value = await restaurantStore.getRestaurantById(restaurantId)
  menuCategories.value = await restaurantStore.getMenuCategories(restaurantId)
  menuItems.value = await restaurantStore.getMenuItems(restaurantId)
})
</script>
