<template>
  <div class="faq">
    <div class="max-w-4xl mx-auto">
      <!-- Recherche -->
      <div class="search-box mb-8">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher dans la FAQ..."
          class="search-input"
          @input="handleSearch"
        />
      </div>

      <!-- Catégories -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div
          v-for="category in faqCategories"
          :key="category.id"
          class="category-card"
          @click="selectCategory(category)"
        >
          <i :class="[category.icon, 'category-icon']"></i>
          <h3 class="category-title">{{ category.name }}</h3>
          <p class="category-description">{{ category.description }}</p>
        </div>
      </div>

      <!-- Articles -->
      <div v-if="selectedCategory" class="articles-section">
        <h2 class="section-title">{{ selectedCategory.name }}</h2>
        <div class="space-y-4">
          <div
            v-for="article in categoryArticles"
            :key="article.id"
            class="article-card"
          >
            <button class="article-header" @click="toggleArticle(article.id)">
              <h3 class="article-title">{{ article.title }}</h3>
              <i
                :class="[
                  'fas',
                  expandedArticles.includes(article.id)
                    ? 'fa-chevron-up'
                    : 'fa-chevron-down',
                ]"
              ></i>
            </button>
            <div
              v-if="expandedArticles.includes(article.id)"
              class="article-content"
              v-html="article.content"
            ></div>
          </div>
        </div>
      </div>

      <!-- Résultats de recherche -->
      <div v-if="searchResults.length > 0" class="search-results">
        <h2 class="section-title">Résultats de recherche</h2>
        <div class="space-y-4">
          <div
            v-for="result in searchResults"
            :key="result.id"
            class="result-card"
          >
            <h3 class="result-title">{{ result.title }}</h3>
            <p class="result-excerpt">{{ result.excerpt }}</p>
            <button @click="showFullArticle(result)" class="read-more">
              Lire la suite
            </button>
          </div>
        </div>
      </div>

      <!-- Pas de résultats -->
      <div v-if="searchQuery && searchResults.length === 0" class="no-results">
        <p>Aucun résultat trouvé pour "{{ searchQuery }}"</p>
        <p>Essayez avec d'autres mots-clés ou contactez notre support.</p>
      </div>
    </div>

    <!-- Modal article complet -->
    <modal-base
      v-if="selectedArticle"
      v-model="showArticleModal"
      :title="selectedArticle.title"
    >
      <div v-html="selectedArticle.content"></div>
    </modal-base>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useSupportStore } from "@/stores/support";
import ModalBase from "@/components/common/ModalBase.vue";

const supportStore = useSupportStore();

// États
const searchQuery = ref("");
const selectedCategory = ref(null);
const categoryArticles = ref([]);
const searchResults = ref([]);
const expandedArticles = ref([]);
const selectedArticle = ref(null);
const showArticleModal = ref(false);

// Computed
const faqCategories = computed(() => supportStore.faqCategories);

// Méthodes
const handleSearch = async () => {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  try {
    searchResults.value = await supportStore.searchKnowledgeBase(
      searchQuery.value
    );
  } catch (error) {
    console.error("Erreur de recherche:", error);
  }
};

const selectCategory = async (category) => {
  selectedCategory.value = category;
  try {
    categoryArticles.value = await supportService.getFAQArticles(category.id);
  } catch (error) {
    console.error("Erreur de chargement des articles:", error);
  }
};

const toggleArticle = (articleId) => {
  const index = expandedArticles.value.indexOf(articleId);
  if (index === -1) {
    expandedArticles.value.push(articleId);
  } else {
    expandedArticles.value.splice(index, 1);
  }
};

const showFullArticle = (article) => {
  selectedArticle.value = article;
  showArticleModal.value = true;
};

// Chargement initial
onMounted(async () => {
  await supportStore.loadFAQCategories();
});
</script>

<style lang="scss" scoped>
.search-input {
  @apply w-full px-4 py-3 border rounded-lg shadow-sm
         focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.category-card {
  @apply bg-white p-6 rounded-lg shadow-sm border hover:shadow-md
         cursor-pointer transition-shadow duration-200;
}

.category-icon {
  @apply text-2xl text-primary-500 mb-3;
}

.category-title {
  @apply text-lg font-medium mb-2;
}

.category-description {
  @apply text-sm text-gray-600;
}

.section-title {
  @apply text-2xl font-bold mb-6;
}

.article-card {
  @apply bg-white rounded-lg border overflow-hidden;
}

.article-header {
  @apply w-full flex justify-between items-center p-4 hover:bg-gray-50;
}

.article-title {
  @apply font-medium;
}

.article-content {
  @apply p-4 bg-gray-50 border-t;
}

.result-card {
  @apply bg-white p-4 rounded-lg border;
}

.result-title {
  @apply font-medium mb-2;
}

.result-excerpt {
  @apply text-sm text-gray-600 mb-2;
}

.read-more {
  @apply text-primary-600 hover:text-primary-800 text-sm font-medium;
}

.no-results {
  @apply text-center py-8 text-gray-600;
}
</style>
