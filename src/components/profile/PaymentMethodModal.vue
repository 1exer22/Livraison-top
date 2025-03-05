<template>
  <modal-base :show="modelValue" @close="$emit('update:modelValue', false)">
    <template #title> Ajouter un moyen de paiement </template>

    <template #content>
      <div class="space-y-6">
        <!-- Type de carte -->
        <div class="form-group">
          <label>Type de carte</label>
          <div class="grid grid-cols-4 gap-4">
            <button
              v-for="type in cardTypes"
              :key="type.id"
              @click="selectedCardType = type.id"
              :class="[
                'p-4 border rounded-lg text-center hover:border-primary-500 transition-colors',
                selectedCardType === type.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-200',
              ]"
            >
              <i :class="type.icon" class="text-2xl"></i>
              <span class="block mt-2 text-sm">{{ type.name }}</span>
            </button>
          </div>
        </div>

        <!-- Formulaire de carte -->
        <div class="space-y-4">
          <div class="form-group">
            <label>Numéro de carte</label>
            <div class="relative">
              <input
                v-model="cardNumber"
                type="text"
                class="form-input pl-10"
                placeholder="1234 5678 9012 3456"
                maxlength="19"
                @input="formatCardNumber"
              />
              <i
                class="fas fa-credit-card absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              ></i>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="form-group">
              <label>Date d'expiration</label>
              <input
                v-model="expiryDate"
                type="text"
                class="form-input"
                placeholder="MM/AA"
                maxlength="5"
                @input="formatExpiryDate"
              />
            </div>
            <div class="form-group">
              <label>Code de sécurité (CVC)</label>
              <div class="relative">
                <input
                  v-model="cvc"
                  type="text"
                  class="form-input"
                  placeholder="123"
                  maxlength="4"
                />
                <i
                  class="fas fa-question-circle absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-help"
                  @mouseenter="showCVCHelp = true"
                  @mouseleave="showCVCHelp = false"
                ></i>
              </div>
              <div
                v-if="showCVCHelp"
                class="absolute mt-1 p-2 bg-gray-800 text-white text-xs rounded shadow-lg"
              >
                Le code CVC est le code de sécurité à 3 ou 4 chiffres au dos de
                votre carte
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Nom sur la carte</label>
            <input
              v-model="cardholderName"
              type="text"
              class="form-input"
              placeholder="JEAN DUPONT"
            />
          </div>
        </div>

        <!-- Options -->
        <div class="flex items-center">
          <input
            v-model="saveCard"
            type="checkbox"
            id="save-card"
            class="form-checkbox"
          />
          <label for="save-card" class="ml-2 text-sm">
            Enregistrer cette carte pour mes prochains achats
          </label>
        </div>

        <div v-if="error" class="text-red-600 text-sm">
          {{ error }}
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('update:modelValue', false)"
          class="btn-secondary"
        >
          Annuler
        </button>
        <button
          @click="addPaymentMethod"
          class="btn-primary"
          :disabled="!isFormValid || processing"
        >
          {{ processing ? "Traitement..." : "Ajouter" }}
        </button>
      </div>
    </template>
  </modal-base>
</template>

<script setup>
import { ref, computed } from "vue";
import ModalBase from "@/components/common/ModalBase.vue";

const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue", "save"]);

// États
const cardTypes = [
  { id: "visa", name: "Visa", icon: "fab fa-cc-visa" },
  { id: "mastercard", name: "Mastercard", icon: "fab fa-cc-mastercard" },
  { id: "amex", name: "American Express", icon: "fab fa-cc-amex" },
  { id: "other", name: "Autre", icon: "fas fa-credit-card" },
];

const selectedCardType = ref("visa");
const cardNumber = ref("");
const expiryDate = ref("");
const cvc = ref("");
const cardholderName = ref("");
const saveCard = ref(true);
const showCVCHelp = ref(false);
const error = ref("");
const processing = ref(false);

// Validations
const isFormValid = computed(() => {
  return (
    cardNumber.value.replace(/\s/g, "").length === 16 &&
    expiryDate.value.length === 5 &&
    cvc.value.length >= 3 &&
    cardholderName.value.length > 0
  );
});

// Formatage
const formatCardNumber = () => {
  let value = cardNumber.value.replace(/\s/g, "");
  if (value.length > 16) {
    value = value.slice(0, 16);
  }
  cardNumber.value = value.replace(/(\d{4})/g, "$1 ").trim();
};

const formatExpiryDate = () => {
  let value = expiryDate.value.replace(/\D/g, "");
  if (value.length >= 2) {
    value = value.slice(0, 2) + "/" + value.slice(2, 4);
  }
  expiryDate.value = value;
};

// Actions
const addPaymentMethod = async () => {
  try {
    processing.value = true;
    error.value = "";

    // Validation de la date d'expiration
    const [month, year] = expiryDate.value.split("/");
    const now = new Date();
    const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);

    if (expiry < now) {
      throw new Error("La carte a expiré");
    }

    const paymentMethod = {
      type: selectedCardType.value,
      number: cardNumber.value.replace(/\s/g, ""),
      expiry: expiryDate.value,
      cvc: cvc.value,
      name: cardholderName.value,
      save: saveCard.value,
    };

    await emit("save", paymentMethod);
    emit("update:modelValue", false);
  } catch (err) {
    error.value = err.message || "Une erreur est survenue";
  } finally {
    processing.value = false;
  }
};
</script>

<style lang="scss" scoped>
.form-group {
  @apply space-y-1;

  label {
    @apply block text-sm font-medium text-gray-700;
  }
}

.form-input {
  @apply w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.form-checkbox {
  @apply h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded;
}

.btn-primary {
  @apply px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
         disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 
         transition-colors duration-200;
}
</style>
