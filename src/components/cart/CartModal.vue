<template>
  <div
    v-if="show"
    class="fixed z-10 inset-0 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="$emit('close')"
      ></div>

      <div
        class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6"
      >
        <div class="sm:flex sm:items-start">
          <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
            <h3
              class="text-lg leading-6 font-medium text-gray-900"
              id="modal-title"
            >
              Votre panier
            </h3>

            <div class="mt-4">
              <div v-if="cartStore.isEmpty" class="text-center py-8">
                <p class="text-gray-500">Votre panier est vide</p>
              </div>
              <div v-else>
                <div class="space-y-4">
                  <div
                    v-for="item in cartStore.items"
                    :key="item.menuItemId"
                    class="flex items-center justify-between"
                  >
                    <div>
                      <h4 class="text-sm font-medium text-gray-900">
                        {{ item.name }}
                      </h4>
                      <p class="text-sm text-gray-500">
                        {{ formatPrice(item.price) }}
                      </p>
                    </div>
                    <div class="flex items-center space-x-2">
                      <button
                        @click="
                          cartStore.updateQuantity(
                            item.menuItemId,
                            item.quantity - 1
                          )
                        "
                        class="p-1 rounded-full hover:bg-gray-100"
                      >
                        <svg
                          class="h-4 w-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M20 12H4"
                          />
                        </svg>
                      </button>
                      <span class="text-gray-900 w-8 text-center">{{
                        item.quantity
                      }}</span>
                      <button
                        @click="
                          cartStore.updateQuantity(
                            item.menuItemId,
                            item.quantity + 1
                          )
                        "
                        class="p-1 rounded-full hover:bg-gray-100"
                      >
                        <svg
                          class="h-4 w-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                <div class="mt-6 border-t border-gray-200 pt-4">
                  <div
                    class="flex justify-between text-base font-medium text-gray-900"
                  >
                    <p>Total</p>
                    <p>{{ formatPrice(cartStore.total) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            :disabled="cartStore.isEmpty || loading"
            @click="handleOrder"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
          >
            {{ loading ? "Commande en cours..." : "Commander" }}
          </button>
          <button
            type="button"
            @click="$emit('close')"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useCartStore } from "../../stores/cart";
import { useRestaurantStore } from "../../stores/restaurant";
import { useAuthStore } from "../../stores/auth";
import { useRouter } from "vue-router";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const router = useRouter();
const cartStore = useCartStore();
const restaurantStore = useRestaurantStore();
const authStore = useAuthStore();

const loading = ref(false);

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const handleOrder = async () => {
  if (!authStore.user) {
    router.push("/login");
    return;
  }

  loading.value = true;
  try {
    await restaurantStore.createOrder({
      items: cartStore.items,
      total: cartStore.total,
      restaurantId: cartStore.restaurantId!,
      customerId: authStore.user.uid,
    });
    cartStore.clear();
    emit("close");
    // Rediriger vers la page de confirmation ou historique des commandes
  } catch (error) {
    console.error("Erreur lors de la création de la commande:", error);
  } finally {
    loading.value = false;
  }
};
</script>
