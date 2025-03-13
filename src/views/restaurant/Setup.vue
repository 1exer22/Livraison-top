<template>
  <div class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full mx-auto space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Configuration de votre restaurant
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Remplissez ces informations pour commencer à utiliser la plateforme
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Nom du restaurant
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              for="description"
              class="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              v-model="formData.description"
              rows="3"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>
          </div>

          <div>
            <label
              for="address"
              class="block text-sm font-medium text-gray-700"
            >
              Adresse
            </label>
            <input
              id="address"
              v-model="formData.address"
              type="text"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Image du restaurant</label
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
                required
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

        <div>
          <button
            type="submit"
            :disabled="loading || !selectedImage"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {{ loading ? "Enregistrement..." : "Enregistrer" }}
          </button>
        </div>

        <div v-if="error" class="text-red-600 text-center text-sm">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../../stores/auth";
import { storage } from "../../firebase/config";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { v4 as uuidv4 } from "uuid";
import type { RestaurantProfile } from "../../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const selectedImage = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const imageError = ref<string | null>(null);

const formData = ref<Omit<RestaurantProfile, "userId" | "image">>({
  name: "",
  description: "",
  address: "",
  rating: 0,
  isOpen: true,
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
  imagePreview.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const uploadImage = async (file: File): Promise<string> => {
  const fileExtension = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const path = `restaurants/${authStore.user?.uid}/${fileName}`;
  const imageRef = storageRef(storage, path);

  await uploadBytes(imageRef, file);
  return await getDownloadURL(imageRef);
};

const handleSubmit = async () => {
  if (!selectedImage.value) {
    imageError.value = "Veuillez sélectionner une image";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    const imageUrl = await uploadImage(selectedImage.value);
    await authStore.updateRestaurantProfile({
      ...formData.value,
      image: imageUrl,
    });
    router.push("/restaurant");
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};
</script>
