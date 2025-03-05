<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      statusClasses[status] || statusClasses.default,
    ]"
  >
    <i :class="statusIcons[status]" class="mr-1"></i>
    {{ statusLabels[status] || status }}
  </span>
</template>

<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true,
  },
});

const statusClasses = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
  blocked: "bg-red-100 text-red-800",
  processing: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  default: "bg-gray-100 text-gray-800",
};

const statusIcons = {
  active: "fas fa-check",
  inactive: "fas fa-times",
  pending: "fas fa-clock",
  blocked: "fas fa-ban",
  processing: "fas fa-spinner fa-spin",
  completed: "fas fa-check-circle",
  cancelled: "fas fa-times-circle",
  default: "fas fa-circle",
};

const statusLabels = {
  active: "Actif",
  inactive: "Inactif",
  pending: "En attente",
  blocked: "Bloqué",
  processing: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
};
</script>
