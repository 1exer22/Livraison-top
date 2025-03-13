<template>
  <div v-if="show" class="fixed inset-0 z-10 overflow-y-auto">
    <div
      class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        @click="close"
      ></div>

      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
      >
        <form @submit.prevent="handleSubmit">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">
              Ajouter un plat
            </h3>

            <div class="space-y-4">
              <div>
                <label
                  for="name"
                  class="block text-sm font-medium text-gray-700"
                  >Nom du plat</label
                >
                <input
                  type="text"
                  id="name"
                  v-model="formData.name"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label
                  for="description"
                  class="block text-sm font-medium text-gray-700"
                  >Description</label
                >
                <textarea
                  id="description"
                  v-model="formData.description"
                  rows="3"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                ></textarea>
              </div>

              <div>
                <label
                  for="price"
                  class="block text-sm font-medium text-gray-700"
                  >Prix</label
                >
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div
                    class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                  >
                    <span class="text-gray-500 sm:text-sm">€</span>
                  </div>
                  <input
                    type="number"
                    id="price"
                    v-model="formData.price"
                    min="0"
                    step="0.01"
                    class="block w-full pl-7 pr-12 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  for="category"
                  class="block text-sm font-medium text-gray-700"
                  >Catégorie</label
                >
                <select
                  id="category"
                  v-model="formData.category"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="entrée">Entrée</option>
                  <option value="plat">Plat principal</option>
                  <option value="dessert">Dessert</option>
                  <option value="boisson">Boisson</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700"
                  >Image</label
                >
                <div
                  class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                >
                  <div class="space-y-1 text-center">
                    <div v-if="imagePreview" class="mb-4">
                      <img
                        :src="imagePreview"
                        alt="Preview"
                        class="mx-auto h-32 w-32 object-cover rounded-lg"
                      />
                    </div>
                    <div class="flex text-sm text-gray-600">
                      <label
                        for="image-upload"
                        class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        <span>Télécharger une image</span>
                        <input
                          id="image-upload"
                          type="file"
                          @change="handleImageChange"
                          accept="image/*"
                          class="sr-only"
                          required
                        />
                      </label>
                    </div>
                    <p class="text-xs text-gray-500">PNG, JPG jusqu'à 10MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              :disabled="loading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              {{ loading ? "Ajout en cours..." : "Ajouter" }}
            </button>
            <button
              type="button"
              @click="close"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRestaurantStore } from "../../stores/restaurant";

const props = defineProps<{
  show: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "added"): void;
}>();

const restaurantStore = useRestaurantStore();
const loading = ref(false);
const imagePreview = ref<string | null>(null);
const selectedImage = ref<File | null>(null);

const formData = ref({
  name: "",
  description: "",
  price: 0,
  category: "plat",
});

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) {
    selectedImage.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const close = () => {
  emit("close");
  // Réinitialiser le formulaire
  formData.value = {
    name: "",
    description: "",
    price: 0,
    category: "plat",
  };
  imagePreview.value = null;
  selectedImage.value = null;
};

const handleSubmit = async () => {
  if (!selectedImage.value) return;

  loading.value = true;
  try {
    await restaurantStore.addMenuItem(
      {
        name: formData.value.name,
        description: formData.value.description,
        price: formData.value.price,
        category: formData.value.category,
        image: "",
        available: true,
      },
      selectedImage.value
    );

    emit("added");
    close();
  } catch (error) {
    console.error("Erreur lors de l'ajout du plat:", error);
  } finally {
    loading.value = false;
  }
};
</script>
