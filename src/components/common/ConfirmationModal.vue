<template>
  <modal-base :show="modelValue" @close="$emit('update:modelValue', false)">
    <template #title>
      <div class="flex items-center">
        <div
          :class="[
            'rounded-full p-2 mr-3',
            type === 'danger' ? 'bg-red-100' : 'bg-yellow-100',
          ]"
        >
          <i
            :class="[
              'text-xl',
              type === 'danger'
                ? 'fas fa-exclamation-triangle text-red-600'
                : 'fas fa-question text-yellow-600',
            ]"
          ></i>
        </div>
        <h3 class="text-lg font-medium">{{ title }}</h3>
      </div>
    </template>

    <template #content>
      <p class="text-gray-600">{{ message }}</p>
    </template>

    <template #footer>
      <div class="flex justify-end space-x-3">
        <button
          @click="$emit('update:modelValue', false)"
          class="btn-secondary"
        >
          {{ cancelText }}
        </button>
        <button
          @click="confirm"
          :class="[
            'btn-primary',
            type === 'danger'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-primary-600 hover:bg-primary-700',
          ]"
        >
          {{ confirmText }}
        </button>
      </div>
    </template>
  </modal-base>
</template>

<script setup>
import ModalBase from "./ModalBase.vue";

defineProps({
  modelValue: Boolean,
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: "warning",
    validator: (value) => ["warning", "danger"].includes(value),
  },
  confirmText: {
    type: String,
    default: "Confirmer",
  },
  cancelText: {
    type: String,
    default: "Annuler",
  },
});

const emit = defineEmits(["update:modelValue", "confirm", "cancel"]);

const confirm = () => {
  emit("confirm");
  emit("update:modelValue", false);
};
</script>

<style lang="scss" scoped>
.btn-primary {
  @apply px-4 py-2 text-white rounded-lg transition-colors duration-200;
}

.btn-secondary {
  @apply px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg 
         hover:bg-gray-50 transition-colors duration-200;
}
</style>
