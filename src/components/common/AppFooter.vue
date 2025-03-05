<template>
  <footer class="bg-white border-t">
    <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
        <!-- Logo et description -->
        <div class="col-span-1 md:col-span-2">
          <img class="h-8" src="@/assets/logo.png" alt="Logo" />
          <p class="mt-4 text-gray-500 text-sm">
            Votre plateforme de livraison de repas préférée. Découvrez les
            meilleurs restaurants de votre quartier et faites-vous livrer en
            quelques clics.
          </p>
          <div class="mt-4 flex space-x-6">
            <a href="#" class="text-gray-400 hover:text-gray-500">
              <i class="fab fa-facebook text-xl"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-gray-500">
              <i class="fab fa-twitter text-xl"></i>
            </a>
            <a href="#" class="text-gray-400 hover:text-gray-500">
              <i class="fab fa-instagram text-xl"></i>
            </a>
          </div>
        </div>

        <!-- Navigation -->
        <div>
          <h3
            class="text-sm font-semibold text-gray-400 tracking-wider uppercase"
          >
            Navigation
          </h3>
          <ul class="mt-4 space-y-4">
            <li>
              <router-link
                to="/"
                class="text-base text-gray-500 hover:text-gray-900"
              >
                Accueil
              </router-link>
            </li>
            <li>
              <router-link
                to="/restaurants"
                class="text-base text-gray-500 hover:text-gray-900"
              >
                Restaurants
              </router-link>
            </li>
            <li>
              <router-link
                to="/about"
                class="text-base text-gray-500 hover:text-gray-900"
              >
                À propos
              </router-link>
            </li>
            <li>
              <router-link
                to="/contact"
                class="text-base text-gray-500 hover:text-gray-900"
              >
                Contact
              </router-link>
            </li>
          </ul>
        </div>

        <!-- Liens utiles -->
        <div>
          <h3
            class="text-sm font-semibold text-gray-400 tracking-wider uppercase"
          >
            Liens utiles
          </h3>
          <ul class="mt-4 space-y-4">
            <li>
              <router-link
                to="/faq"
                class="text-base text-gray-500 hover:text-gray-900"
              >
                FAQ
              </router-link>
            </li>
            <li>
              <router-link
                to="/terms"
                class="text-base text-gray-500 hover:text-gray-900"
              >
                Conditions d'utilisation
              </router-link>
            </li>
            <li>
              <router-link
                to="/privacy"
                class="text-base text-gray-500 hover:text-gray-900"
              >
                Politique de confidentialité
              </router-link>
            </li>
            <li>
              <router-link
                to="/careers"
                class="text-base text-gray-500 hover:text-gray-900"
              >
                Carrières
              </router-link>
            </li>
          </ul>
        </div>
      </div>

      <!-- Applications mobiles -->
      <div class="mt-12 border-t border-gray-200 pt-8">
        <div class="flex flex-col md:flex-row justify-between items-center">
          <div class="flex-1">
            <h3
              class="text-sm font-semibold text-gray-400 tracking-wider uppercase"
            >
              Téléchargez notre application
            </h3>
            <div class="mt-4 flex space-x-4">
              <a
                href="#"
                class="flex items-center border rounded-lg px-4 py-2 hover:bg-gray-50"
              >
                <img src="@/assets/app-store.png" alt="App Store" class="h-8" />
              </a>
              <a
                href="#"
                class="flex items-center border rounded-lg px-4 py-2 hover:bg-gray-50"
              >
                <img
                  src="@/assets/play-store.png"
                  alt="Play Store"
                  class="h-8"
                />
              </a>
            </div>
          </div>

          <!-- Newsletter -->
          <div class="mt-8 md:mt-0 flex-1 md:text-right">
            <h3
              class="text-sm font-semibold text-gray-400 tracking-wider uppercase"
            >
              Newsletter
            </h3>
            <form
              @submit.prevent="subscribeNewsletter"
              class="mt-4 sm:flex sm:max-w-md"
            >
              <label for="email-address" class="sr-only">Adresse email</label>
              <input
                v-model="newsletterEmail"
                type="email"
                required
                class="appearance-none min-w-0 w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-4 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:placeholder-gray-400"
                placeholder="Votre email"
              />
              <div class="mt-3 rounded-md sm:mt-0 sm:ml-3 sm:flex-shrink-0">
                <button
                  type="submit"
                  class="w-full bg-primary-600 flex items-center justify-center border border-transparent rounded-md py-2 px-4 text-base font-medium text-white hover:bg-primary-700 focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  S'abonner
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Copyright -->
      <div class="mt-12 border-t border-gray-200 pt-8">
        <p class="text-base text-gray-400 text-center">
          © {{ currentYear }} Food Delivery. Tous droits réservés.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { ref, computed } from "vue";

const newsletterEmail = ref("");
const currentYear = computed(() => new Date().getFullYear());

const subscribeNewsletter = async () => {
  try {
    // Implémenter la logique d'abonnement à la newsletter
    console.log("Newsletter subscription:", newsletterEmail.value);
    newsletterEmail.value = "";
    // Afficher une notification de succès
  } catch (error) {
    console.error("Erreur d'abonnement à la newsletter:", error);
    // Afficher une notification d'erreur
  }
};
</script>
