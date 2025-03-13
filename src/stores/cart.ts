import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { MenuItem } from "./restaurant";

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
}

export const useCartStore = defineStore("cart", () => {
  const items = ref<CartItem[]>([]);
  const restaurantId = ref<string | null>(null);

  const total = computed(() => {
    return items.value.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  });

  const isEmpty = computed(() => items.value.length === 0);

  const addItem = (menuItem: MenuItem) => {
    // Vérifier si on peut ajouter des articles d'un autre restaurant
    if (restaurantId.value && restaurantId.value !== menuItem.restaurantId) {
      throw new Error(
        "Vous ne pouvez commander que depuis un seul restaurant à la fois"
      );
    }

    restaurantId.value = menuItem.restaurantId;

    const existingItem = items.value.find(
      (item) => item.menuItemId === menuItem.id
    );
    if (existingItem) {
      existingItem.quantity++;
    } else {
      items.value.push({
        menuItemId: menuItem.id!,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1,
        restaurantId: menuItem.restaurantId,
      });
    }
  };

  const removeItem = (menuItemId: string) => {
    const index = items.value.findIndex(
      (item) => item.menuItemId === menuItemId
    );
    if (index !== -1) {
      items.value.splice(index, 1);
      if (items.value.length === 0) {
        restaurantId.value = null;
      }
    }
  };

  const updateQuantity = (menuItemId: string, quantity: number) => {
    const item = items.value.find((item) => item.menuItemId === menuItemId);
    if (item) {
      if (quantity <= 0) {
        removeItem(menuItemId);
      } else {
        item.quantity = quantity;
      }
    }
  };

  const clear = () => {
    items.value = [];
    restaurantId.value = null;
  };

  return {
    items,
    restaurantId,
    total,
    isEmpty,
    addItem,
    removeItem,
    updateQuantity,
    clear,
  };
});
