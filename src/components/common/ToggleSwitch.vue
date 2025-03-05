<template>
  <button
    type="button"
    :class="[
      'relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer',
      'transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
      modelValue ? 'bg-primary-600' : 'bg-gray-200',
    ]"
    @click="toggle"
  >
    <span class="sr-only">{{ label }}</span>
    <span
      :class="[
        'pointer-events-none relative inline-block h-5 w-5 rounded-full bg-white shadow',
        'transform ring-0 transition ease-in-out duration-200',
        modelValue ? 'translate-x-5' : 'translate-x-0',
      ]"
    >
      <span
        :class="[
          'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity',
          modelValue
            ? 'opacity-0 ease-out duration-100'
            : 'opacity-100 ease-in duration-200',
        ]"
        aria-hidden="true"
      >
        <i class="fas fa-times text-gray-400 text-xs"></i>
      </span>
      <span
        :class="[
          'absolute inset-0 h-full w-full flex items-center justify-center transition-opacity',
          modelValue
            ? 'opacity-100 ease-in duration-200'
            : 'opacity-0 ease-out duration-100',
        ]"
        aria-hidden="true"
      >
        <i class="fas fa-check text-primary-600 text-xs"></i>
      </span>
    </span>
  </button>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  label: {
    type: String,
    default: "Toggle",
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

const toggle = () => {
  emit("update:modelValue", !props.modelValue);
  emit("change", !props.modelValue);
};
</script>
