<template>
  <div
    class="not-found min-h-screen flex items-center justify-center bg-gray-100"
  >
    <div class="text-center">
      <h1 class="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <p class="text-xl text-gray-600 mb-8">Page non trouvée</p>
      <router-link
        to="/"
        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
      >
        <i class="fas fa-home mr-2"></i>
        Retour à l'accueil
      </router-link>
    </div>
  </div>
</template>
