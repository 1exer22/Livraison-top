<template>
  <div class="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full mx-auto space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Configuration de votre profil livreur
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Remplissez ces informations pour commencer à livrer
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Nom complet
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
            <label for="phone" class="block text-sm font-medium text-gray-700">
              Numéro de téléphone
            </label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              required
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              for="vehicleType"
              class="block text-sm font-medium text-gray-700"
            >
              Type de véhicule
            </label>
            <select
              id="vehicleType"
              v-model="formData.vehicleType"
              required
              class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="bike">Vélo</option>
              <option value="scooter">Scooter</option>
              <option value="car">Voiture</option>
            </select>
          </div>

          <div>
            <label
              for="vehicleNumber"
              class="block text-sm font-medium text-gray-700"
            >
              Numéro d'immatriculation
            </label>
            <input
              id="vehicleNumber"
              v-model="formData.vehicleNumber"
              type="text"
              :required="formData.vehicleType !== 'bike'"
              class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700"
              >Documents</label
            >
            <div
              class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
            >
              <div class="space-y-1 text-center">
                <svg
                  class="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <div class="flex text-sm text-gray-600">
                  <label
                    for="documents"
                    class="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Télécharger un fichier</span>
                    <input
                      id="documents"
                      type="file"
                      ref="fileInput"
                      @change="handleDocumentChange"
                      accept=".pdf,.jpg,.jpeg,.png"
                      class="sr-only"
                      required
                    />
                  </label>
                  <p class="pl-1">ou glisser-déposer</p>
                </div>
                <p class="text-xs text-gray-500">PDF, PNG, JPG jusqu'à 10MB</p>
              </div>
            </div>
            <p v-if="selectedDocument" class="mt-2 text-sm text-gray-500">
              Document sélectionné: {{ selectedDocument.name }}
            </p>
            <p v-if="documentError" class="mt-2 text-sm text-red-600">
              {{ documentError }}
            </p>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
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
import { storage, db } from "../../firebase/config";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { doc, setDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

const router = useRouter();
const authStore = useAuthStore();

const loading = ref(false);
const error = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const selectedDocument = ref<File | null>(null);
const documentError = ref<string | null>(null);

const formData = ref({
  name: "",
  phone: "",
  vehicleType: "scooter",
  vehicleNumber: "",
  isAvailable: false,
  rating: 0,
  totalDeliveries: 0,
});

const handleDocumentChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file) {
    documentError.value = "Aucun document sélectionné";
    return;
  }

  if (!["application/pdf", "image/jpeg", "image/png"].includes(file.type)) {
    documentError.value = "Format de fichier non supporté";
    return;
  }

  if (file.size > 10 * 1024 * 1024) {
    documentError.value = "Le fichier ne doit pas dépasser 10 Mo";
    return;
  }

  documentError.value = null;
  selectedDocument.value = file;
};

const uploadDocument = async (file: File): Promise<string> => {
  const fileExtension = file.name.split(".").pop();
  const fileName = `${uuidv4()}.${fileExtension}`;
  const path = `deliverers/${authStore.user?.uid}/documents/${fileName}`;
  const documentRef = storageRef(storage, path);

  await uploadBytes(documentRef, file);
  return await getDownloadURL(documentRef);
};

const handleSubmit = async () => {
  if (!selectedDocument.value) {
    documentError.value = "Veuillez sélectionner un document";
    return;
  }

  loading.value = true;
  error.value = "";

  try {
    if (!authStore.user) throw new Error("Non authentifié");

    const documentUrl = await uploadDocument(selectedDocument.value);

    // Créer le profil du livreur
    await setDoc(doc(db, "deliveryProfiles", authStore.user.uid), {
      ...formData.value,
      userId: authStore.user.uid,
      documentUrl,
      currentLocation: null,
      createdAt: new Date(),
    });

    // Mettre à jour le profil utilisateur
    if (authStore.userProfile) {
      const updatedProfile = {
        ...authStore.userProfile,
        isProfileComplete: true,
      };
      await setDoc(doc(db, "users", authStore.user.uid), updatedProfile);
      authStore.userProfile = updatedProfile;
    }

    router.push("/delivery");
  } catch (e: any) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};
</script>
