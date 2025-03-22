<template>
  <div
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
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700"
                >Nom</label
              >
              <input
                type="text"
                id="name"
                v-model="formData.name"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              ></textarea>
            </div>

            <div>
              <label for="price" class="block text-sm font-medium text-gray-700"
                >Prix (€)</label
              >
              <input
                type="number"
                id="price"
                v-model="formData.price"
                step="0.01"
                required
                class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
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
                required
                class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="entrees">Entrées</option>
                <option value="plats">Plats</option>
                <option value="desserts">Desserts</option>
                <option value="boissons">Boissons</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700"
                >Image</label
              >
              <div class="mt-1 flex items-center">
                <div
                  v-if="imagePreview"
                  class="relative w-32 h-32 rounded-lg overflow-hidden"
                >
                  <img
                    :src="imagePreview"
                    class="w-full h-full object-cover"
                    alt="Aperçu"
                  />
                  <button
                    type="button"
                    @click="removeImage"
                    class="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"
                  >
                    <svg
                      class="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <input
                  type="file"
                  ref="fileInput"
                  @change="handleImageChange"
                  accept="image/*"
                  class="hidden"
                  :required="!props.item"
                />
                <button
                  type="button"
                  @click="$refs.fileInput.click()"
                  class="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {{ imagePreview ? "Changer l'image" : "Ajouter une image" }}
                </button>
              </div>
              <p v-if="imageError" class="mt-2 text-sm text-red-600">
                {{ imageError }}
              </p>
            </div>
          </div>

          <div
            class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense"
          >
            <button
              type="submit"
              :disabled="(!selectedImage && !props.item) || loading"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
            >
              {{
                loading
                  ? "Enregistrement..."
                  : props.item
                  ? "Modifier"
                  : "Ajouter"
              }}
            </button>
            <button
              type="button"
              @click="$emit('close')"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
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
import { ref, onMounted } from "vue";
import type { MenuItem } from "../../stores/restaurant";

const props = defineProps<{
  show: boolean;
  item?: MenuItem | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", item: Omit<MenuItem, "id" | "restaurantId">, image?: File): void;
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedImage = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const imageError = ref<string | null>(null);
const loading = ref(false);

const formData = ref({
  name: "",
  description: "",
  price: 0,
  category: "plats",
  available: true,
});

onMounted(() => {
  if (props.item) {
    formData.value = { ...props.item };
    imagePreview.value = props.item.image;
  }
});

const handleImageChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    imageError.value = "Aucune image sélectionnée";
    return;
  }

  if (!file.type.startsWith("image/")) {
    imageError.value = "Le fichier doit être une image";
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    imageError.value = "L'image ne doit pas dépasser 5 Mo";
    return;
  }

  imageError.value = null;
  selectedImage.value = file;
  imagePreview.value = URL.createObjectURL(file);
};

const removeImage = () => {
  selectedImage.value = null;
  imagePreview.value = props.item?.image || null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const handleSubmit = () => {
  emit("save", formData.value, selectedImage.value);
};
</script>
