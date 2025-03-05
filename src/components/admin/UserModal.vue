<template>
  <modal-base :show="modelValue" @close="$emit('update:modelValue', false)">
    <template #title>
      {{ user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}
    </template>

    <template #content>
      <form @submit.prevent="saveUser" class="space-y-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="form-group">
            <label>Prénom</label>
            <input v-model="formData.firstName" type="text" class="form-input" required>
          </div>
          <div class="form-group">
            <label>Nom</label>
            <input v-model="formData.lastName" type="text" class="form-input" required>
          </div>
        </div>

        <div class="form-group">
          <label>Email</label>
          <input v-model="formData.email" type="email" class="form-input" required>
        </div>

        <div class="form-group">
          <label>Rôle</label>
          <select v-model="formData.role" class="form-select" required>
            <option value="client">Client</option>
            <option value="restaurant">Restaurant</option>
            <option value="driver">Livreur</option>
            <option value="admin">Administrateur</option>
          </select>
        </div>

        <div class="form-group">
          <label>Téléphone</label>
          <input v-model="formData.phone" type="tel" class="form-input">
        </div>

        <div v-if="!user" class="form-group">
          <label>Mot de passe</label>
          <input v-model="formData.password" type="password" class="form-input" required>
        </div>

        <div class="form-group">
          <label>Statut</label>
          <select v-model="formData.status" class="form-select" required>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
            <option value="blocked">Bloqué</option>
          </select>
        </div>

        <!-- Champs spécifiques au rôle -->
        <div v-if="formData.role === 'restaurant'" class="space-y-4">
          <div class="form-group">
            <label>Nom du restaurant</label>
            <input v-model="formData.restaurantName" type="text" class="form-input">
          </div>
          <div class="form-group">
            <label>Type de cuisine</label>
            <input v-model="formData.cuisineType" type="text" class="form-input">
          </div>
        </div>

        <div v-if="formData.role === 'driver'" class="space-y-4">
          <div class="form-group">
            <label>Numéro de permis</label>
            <input v-model="formData.licenseNumber" type="text" class="form-input">
          </div>
          <div class="form-group">
            <label>Type de véhicule</label>
            <select v-model="formData.vehicleType" class="form-select">
              <option value="bike">Vélo</option>
              <option value="scooter">Scooter</option>
              <option value="car">Voiture</option>
            </select>
          </div>
        </div>
      </form>
    </template>

    <template #footer>
      <button @click="$emit('update:modelValue', false)" class="btn-secondary">
        Annuler
      </button>
      <button @click="saveUser" class="btn-primary">
        {{ user ? 'Modifier' : 'Créer' }}
      </button>
    </template>
  </modal-base>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ModalBase from '@/components/common/ModalBase.vue'

const props = defineProps({
  modelValue: Boolean,
  user: Object
})

const emit = defineEmits(['update:modelValue', 'save'])

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: 'client',
  status: 'active',
  password: '',
  restaurantName: '',
  cuisineType: '',
  licenseNumber: '',
  vehicleType: ''
})

const saveUser = () => {
  emit('save', {
    ...formData.value,
    name: `${formData.value.firstName} ${formData.value.lastName}`
  })
}

onMounted(() => {
  if (props.user) {
    const [firstName, ...lastNameParts] = props.user.name.split(' ')
    formData.value = {
      ...props.user,
      firstName,
      lastName: lastNameParts.join(' ')
    }
  }
})
</script>

<style lang="scss" scoped>
.form-group {
  @apply space-y-2;
  
  label {
    @apply block text-sm font-medium text-gray-700;
  }
}

.form-input, .form-select {
  @apply w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent;
}

.btn-primary {
  @apply bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600;
}

.btn-secondary {
  @apply bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300;
}
</style>
