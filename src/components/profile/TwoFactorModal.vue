<template>
  <modal-base :show="modelValue" @close="$emit('update:modelValue', false)">
    <template #title> Double authentification </template>

    <template #content>
      <div class="space-y-6">
        <!-- État actuel -->
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-medium">État</h3>
            <p class="text-sm text-gray-500">
              La double authentification est actuellement
              {{ enabled ? "activée" : "désactivée" }}
            </p>
          </div>
          <toggle-switch v-model="isEnabled" @change="toggleTwoFactor" />
        </div>

        <!-- Configuration -->
        <div v-if="showSetup" class="space-y-4">
          <div class="text-center">
            <img :src="qrCode" alt="QR Code" class="mx-auto w-48 h-48" />
            <p class="mt-2 text-sm text-gray-500">
              Scannez ce QR code avec votre application d'authentification
            </p>
          </div>

          <div class="text-center">
            <p class="font-medium">Ou entrez ce code manuellement :</p>
            <code
              class="block mt-2 p-2 bg-gray-100 rounded text-lg tracking-wide"
            >
              {{ setupKey }}
            </code>
          </div>

          <div class="form-group">
            <label>Code de vérification</label>
            <input
              v-model="verificationCode"
              type="text"
              class="form-input"
              placeholder="Entrez le code à 6 chiffres"
              maxlength="6"
              pattern="\d{6}"
            />
          </div>

          <div v-if="error" class="text-red-600 text-sm">
            {{ error }}
          </div>
        </div>

        <!-- Codes de secours -->
        <div v-if="enabled" class="space-y-4">
          <div class="flex justify-between items-center">
            <h3 class="font-medium">Codes de secours</h3>
            <button @click="generateBackupCodes" class="btn-secondary text-sm">
              Générer de nouveaux codes
            </button>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="(code, index) in backupCodes"
              :key="index"
              class="p-2 bg-gray-50 rounded text-center font-mono"
            >
              {{ code }}
            </div>
          </div>

          <p class="text-sm text-gray-500">
            Conservez ces codes dans un endroit sûr. Ils vous permettront de
            vous connecter si vous perdez l'accès à votre application
            d'authentification.
          </p>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('update:modelValue', false)"
          class="btn-secondary"
        >
          Fermer
        </button>
        <button
          v-if="showSetup"
          @click="verifyAndEnable"
          class="btn-primary"
          :disabled="!verificationCode || verifying"
        >
          {{ verifying ? "Vérification..." : "Activer" }}
        </button>
      </div>
    </template>
  </modal-base>
</template>

<script setup>
import { ref, computed } from "vue";
import ModalBase from "@/components/common/ModalBase.vue";
import ToggleSwitch from "@/components/common/ToggleSwitch.vue";

const props = defineProps({
  modelValue: Boolean,
  enabled: {
    type: Boolean,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "save"]);

const isEnabled = ref(props.enabled);
const showSetup = ref(false);
const qrCode = ref("");
const setupKey = ref("");
const verificationCode = ref("");
const backupCodes = ref([]);
const error = ref("");
const verifying = ref(false);

const toggleTwoFactor = async () => {
  if (!isEnabled.value) {
    // Initialiser la configuration
    try {
      const response = await fetch("/api/2fa/setup", {
        method: "POST",
      });
      const data = await response.json();
      qrCode.value = data.qrCode;
      setupKey.value = data.setupKey;
      showSetup.value = true;
    } catch (err) {
      error.value =
        "Erreur lors de l'initialisation de la double authentification";
    }
  } else {
    // Désactiver
    try {
      await fetch("/api/2fa/disable", {
        method: "POST",
      });
      isEnabled.value = false;
      showSetup.value = false;
      emit("save", false);
    } catch (err) {
      error.value = "Erreur lors de la désactivation";
      isEnabled.value = true;
    }
  }
};

const verifyAndEnable = async () => {
  try {
    verifying.value = true;
    error.value = "";

    const response = await fetch("/api/2fa/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: verificationCode.value,
      }),
    });

    if (!response.ok) {
      throw new Error("Code invalide");
    }

    const { backupCodes: codes } = await response.json();
    backupCodes.value = codes;
    isEnabled.value = true;
    showSetup.value = false;
    emit("save", true);
  } catch (err) {
    error.value = err.message || "Erreur lors de la vérification";
    isEnabled.value = false;
  } finally {
    verifying.value = false;
  }
};

const generateBackupCodes = async () => {
  try {
    const response = await fetch("/api/2fa/backup-codes", {
      method: "POST",
    });
    const { codes } = await response.json();
    backupCodes.value = codes;
  } catch (err) {
    error.value = "Erreur lors de la génération des codes de secours";
  }
};
</script>

<style lang="scss" scoped>
.form-input {
  @apply w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
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
