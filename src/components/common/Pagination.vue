<template>
  <div class="pagination flex items-center justify-between">
    <div class="flex items-center">
      <p class="text-sm text-gray-700">
        Affichage de
        <span class="font-medium">{{ startItem }}</span>
        à
        <span class="font-medium">{{ endItem }}</span>
        sur
        <span class="font-medium">{{ total }}</span>
        résultats
      </p>
    </div>

    <div class="flex items-center space-x-2">
      <!-- Bouton précédent -->
      <button
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
        class="pagination-button"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === 1 }"
      >
        <i class="fas fa-chevron-left"></i>
      </button>

      <!-- Numéros de page -->
      <div class="flex space-x-2">
        <template v-for="page in displayedPages" :key="page">
          <button
            v-if="page !== '...'"
            @click="changePage(page)"
            class="pagination-button"
            :class="{ 'bg-primary-50 text-primary-600': currentPage === page }"
          >
            {{ page }}
          </button>
          <span v-else class="px-2">...</span>
        </template>
      </div>

      <!-- Bouton suivant -->
      <button
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
        class="pagination-button"
        :class="{ 'opacity-50 cursor-not-allowed': currentPage === totalPages }"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  total: {
    type: Number,
    required: true,
  },
  perPage: {
    type: Number,
    required: true,
  },
  currentPage: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["page-change"]);

const totalPages = computed(() => Math.ceil(props.total / props.perPage));

const startItem = computed(() => {
  return (props.currentPage - 1) * props.perPage + 1;
});

const endItem = computed(() => {
  return Math.min(props.currentPage * props.perPage, props.total);
});

const displayedPages = computed(() => {
  const pages = [];
  const maxDisplayed = 5;

  if (totalPages.value <= maxDisplayed) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1);

    if (props.currentPage > 3) {
      pages.push("...");
    }

    for (
      let i = Math.max(2, props.currentPage - 1);
      i <= Math.min(props.currentPage + 1, totalPages.value - 1);
      i++
    ) {
      pages.push(i);
    }

    if (props.currentPage < totalPages.value - 2) {
      pages.push("...");
    }

    pages.push(totalPages.value);
  }

  return pages;
});

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    emit("page-change", page);
  }
};
</script>

<style lang="scss" scoped>
.pagination-button {
  @apply px-3 py-1 rounded-md text-sm font-medium text-gray-700 
         hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500;
}
</style>
