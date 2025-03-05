<template>
  <modal-base :show="modelValue" @close="$emit('update:modelValue', false)">
    <template #title> Changer le mot de passe </template>

    <template #content>
      <form @submit.prevent="changePassword" class="space-y-4">
        <div class="form-group">
          <label>Mot de passe actuel</label>
          <div class="relative">
            <input
              v-model="form.currentPassword"
              :type="showCurrentPassword ? 'text' : 'password'"
              class="form-input pr-10"
              required
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 px-3"
              @click="showCurrentPassword = !showCurrentPassword"
            >
              <i
                :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
              ></i>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Nouveau mot de passe</label>
          <div class="relative">
            <input
              v-model="form.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              class="form-input pr-10"
              required
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 px-3"
              @click="showNewPassword = !showNewPassword"
            >
              <i
                :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
              ></i>
            </button>
          </div>
          <password-strength-meter :password="form.newPassword" />
        </div>

        <div class="form-group">
          <label>Confirmer le nouveau mot de passe</label>
          <div class="relative">
            <input
              v-model="form.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-input pr-10"
              required
            />
            <button
              type="button"
              class="absolute inset-y-0 right-0 px-3"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              <i
                :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
              ></i>
            </button>
          </div>
        </div>

        <!-- Messages d'erreur -->
        <div v-if="error" class="text-red-600 text-sm">
          {{ error }}
        </div>

        <!-- Critères de sécurité -->
        <div class="text-sm text-gray-500">
          <p class="font-medium mb-2">Le mot de passe doit contenir :</p>
          <ul class="space-y-1">
            <li
              v-for="(met, criterion) in passwordCriteria"
              :key="criterion"
              :class="met ? 'text-green-600' : 'text-gray-500'"
            >
              <i
                :class="met ? 'fas fa-check' : 'fas fa-times'"
                class="mr-2"
              ></i>
              {{ getCriterionLabel(criterion) }}
            </li>
          </ul>
        </div>
      </form>
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
          @click="changePassword"
          class="btn-primary"
          :disabled="!isFormValid || changing"
        >
          {{ changing ? "Modification..." : "Changer le mot de passe" }}
        </button>
      </div>
    </template>
  </modal-base>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import ModalBase from "@/components/common/ModalBase.vue";
// import PasswordStrengthMeter from "@/components/common/PasswordStrengthMeter.vue";

const props = defineProps({
  modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue", "save"]);

const form = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);
const changing = ref(false);
const error = ref("");

const passwordCriteria = computed(() => ({
  length: form.newPassword.length >= 8,
  uppercase: /[A-Z]/.test(form.newPassword),
  lowercase: /[a-z]/.test(form.newPassword),
  number: /[0-9]/.test(form.newPassword),
  special: /[!@#$%^&*]/.test(form.newPassword),
}));

const isFormValid = computed(() => {
  return (
    form.currentPassword &&
    form.newPassword &&
    form.confirmPassword &&
    form.newPassword === form.confirmPassword &&
    Object.values(passwordCriteria.value).every(Boolean)
  );
});

const getCriterionLabel = (criterion) => {
  const labels = {
    length: "Au moins 8 caractères",
    uppercase: "Au moins une majuscule",
    lowercase: "Au moins une minuscule",
    number: "Au moins un chiffre",
    special: "Au moins un caractère spécial (!@#$%^&*)",
  };
  return labels[criterion];
};

const changePassword = async () => {
  if (!isFormValid.value) return;

  try {
    changing.value = true;
    error.value = "";

    if (form.newPassword !== form.confirmPassword) {
      error.value = "Les mots de passe ne correspondent pas";
      return;
    }

    await emit("save", {
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    });

    emit("update:modelValue", false);
  } catch (err) {
    error.value = err.message || "Une erreur est survenue";
  } finally {
    changing.value = false;
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

.btn-primary {
  @apply px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 
         disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200;
}

.btn-secondary {
  @apply px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 
         transition-colors duration-200;
}
</style>
