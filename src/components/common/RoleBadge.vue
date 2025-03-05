<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      roleClasses[role] || roleClasses.default,
    ]"
  >
    <i :class="roleIcons[role]" class="mr-1"></i>
    {{ roleLabels[role] || role }}
  </span>
</template>

<script setup>
const props = defineProps({
  role: {
    type: String,
    required: true,
  },
});

const roleClasses = {
  admin: "bg-purple-100 text-purple-800",
  restaurant: "bg-blue-100 text-blue-800",
  driver: "bg-green-100 text-green-800",
  client: "bg-gray-100 text-gray-800",
  default: "bg-gray-100 text-gray-800",
};

const roleIcons = {
  admin: "fas fa-shield-alt",
  restaurant: "fas fa-store",
  driver: "fas fa-motorcycle",
  client: "fas fa-user",
  default: "fas fa-user",
};

const roleLabels = {
  admin: "Administrateur",
  restaurant: "Restaurant",
  driver: "Livreur",
  client: "Client",
};
</script>
