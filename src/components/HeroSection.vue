<template>
  <section class="relative min-h-[90vh] flex items-center justify-center border-b border-slate-800 overflow-hidden">
    <!-- Imagen de fondo con gradiente -->
    <div class="absolute inset-0 z-0 pointer-events-none">
      <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2000&auto=format&fit=crop" alt="Gym Background" class="w-full h-full object-cover opacity-20" />
      <div class="absolute inset-0 bg-gradient-to-b from-slate-900/40 via-slate-900/80 to-slate-900"></div>
    </div>

    <div class="relative z-20 text-center px-4 max-w-3xl mx-auto mt-20">

      <!-- ESTADO: Usuario logueado -->
      <div v-if="user" class="flex flex-col items-center gap-6 animate-fade-in">
        <!-- Avatar con anillo animado -->
        <div class="relative">
          <div class="absolute inset-0 rounded-full bg-lime-400 blur-md opacity-40 animate-pulse"></div>
          <img
            :src="user.photoURL || 'https://ui-avatars.com/api/?name=' + user.displayName"
            :alt="user.displayName"
            class="relative w-24 h-24 rounded-full border-4 border-lime-400 object-cover shadow-xl"
          />
        </div>

        <!-- Saludo y plan -->
        <div>
          <p class="text-slate-400 text-base mb-1 uppercase tracking-widest text-xs">Bienvenido de vuelta</p>
          <h1 class="text-4xl md:text-5xl font-bold text-white mb-3">
            {{ firstName }} <span class="text-lime-400">💪</span>
          </h1>
          <div class="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-sm">
            <span class="w-2 h-2 bg-lime-400 rounded-full animate-pulse"></span>
            <span class="text-slate-300">
              Plan activo:
              <span class="text-white font-semibold ml-1">{{ userProfile?.activePlanName || 'Sin plan' }}</span>
            </span>
          </div>
        </div>

        <!-- Botones -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            @click="router.push('/panel')"
            class="px-8 py-3 bg-lime-400 text-slate-900 font-semibold rounded-lg hover:bg-lime-500 transition-all hover:shadow-[0_0_20px_rgba(163,230,53,0.4)] hover:scale-105"
          >
            Ir a mi Panel →
          </button>
          <button
            @click="scrollToPlans"
            class="px-8 py-3 bg-transparent border border-slate-700 text-slate-300 font-semibold rounded-lg hover:border-slate-500 hover:text-white transition-colors"
          >
            Ver Planes
          </button>
        </div>
      </div>

      <!-- ESTADO: Sin sesión -->
      <div v-else class="animate-fade-in">
        <h1 class="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-tight">
          Forja tu <span class="text-lime-400">Mejor Versión</span>
        </h1>
        <p class="text-lg md:text-xl text-slate-400 mb-10 max-w-xl mx-auto">
          El gimnasio donde la disciplina se encuentra con la tecnología. Reserva tu espacio y entrena sin límites.
        </p>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            @click="handleComenzar"
            :disabled="loading"
            class="px-8 py-3 bg-lime-400 text-slate-900 font-semibold rounded-lg hover:bg-lime-500 transition-all hover:shadow-[0_0_20px_rgba(163,230,53,0.4)] hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {{ loading ? 'Cargando...' : 'Comenzar Ahora' }}
          </button>
          <button
            @click="scrollToPlans"
            class="px-8 py-3 bg-transparent border border-slate-700 text-slate-300 font-semibold rounded-lg hover:border-slate-500 hover:text-white transition-colors"
          >
            Ver Planes
          </button>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useUserProfile } from '../composables/useUserProfile'

const router = useRouter()
const { user, loginWithGoogle } = useAuth()
const { userProfile, fetchUserProfile } = useUserProfile()
const loading = ref(false)

// Solo el primer nombre
const firstName = computed(() => {
  return user.value?.displayName?.split(' ')[0] || 'Atleta'
})

// Cargar plan cuando haya usuario
watch(user, (newUser) => {
  if (newUser) fetchUserProfile(newUser.uid)
}, { immediate: true })

const handleComenzar = async () => {
  if (user.value) {
    router.push('/panel')
    return
  }
  try {
    loading.value = true
    await loginWithGoogle()
    router.push('/panel')
  } catch (e) {
    console.error('Error al iniciar sesión:', e)
  } finally {
    loading.value = false
  }
}

const scrollToPlans = () => {
  const section = document.getElementById('planes')
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
