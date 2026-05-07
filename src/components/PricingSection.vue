<template>
  <section id="planes" class="py-24 bg-slate-900">
    <div class="max-w-6xl mx-auto px-6">
      
      <div class="text-center mb-16">
        <h2 class="text-3xl md:text-4xl font-bold text-white mb-4">Planes de Entrenamiento</h2>
        <p class="text-slate-400 max-w-2xl mx-auto">
          Elige la modalidad que mejor se adapte a tus objetivos. 
          Sin contratos forzosos, cancela cuando quieras.
        </p>
      </div>

      <div v-if="loading" class="text-center py-12 text-slate-400">
        Cargando planes disponibles...
      </div>
      <div v-else-if="plans.length === 0" class="text-center py-12 text-slate-400">
        No hay planes disponibles por el momento.
      </div>
      
      <!-- Contenedor con scroll horizontal -->
      <div v-else class="flex gap-4 overflow-x-auto pb-8 pt-4 snap-x snap-mandatory custom-scrollbar md:justify-center">
        <!-- Tarjeta dinámica de Plan -->
        <div v-for="plan in plans" :key="plan.id" 
             class="relative bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 flex flex-col flex-shrink-0 w-[260px] snap-center group"
             :class="plan.isPopular ? 'border-lime-400 shadow-[0_0_20px_rgba(202,255,0,0.1)]' : 'border-slate-700/50 hover:border-slate-500'">
          
          <div v-if="plan.isPopular" class="absolute -top-3 left-1/2 -translate-x-1/2 bg-lime-400 text-slate-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
            Recomendado
          </div>

          <div class="mb-5 text-center">
            <h3 class="text-lg font-bold text-white mb-1">{{ plan.name }}</h3>
            <p class="text-slate-400 text-xs h-8 line-clamp-2 px-2">{{ plan.description }}</p>
          </div>

          <div class="mb-6 text-center bg-slate-900/50 py-3 rounded-xl border border-slate-700/50">
            <span class="text-3xl font-black text-white">{{ formatPrice(plan.price) }}</span>
            <span class="text-slate-400 text-xs block mt-1">/ {{ plan.period }}</span>
          </div>

          <ul class="space-y-2 mb-6 flex-1">
            <li v-for="(feature, idx) in plan.features" :key="idx" class="flex items-start gap-2 bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-lime-400 flex-shrink-0 mt-0.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span class="text-slate-300 text-xs leading-tight">{{ feature }}</span>
            </li>
          </ul>

          <button @click="handlePurchase(plan)"
                  :class="['w-full py-2.5 rounded-lg text-sm font-bold transition-all mt-auto', 
                         plan.isPopular ? 'bg-lime-400 text-slate-900 hover:bg-lime-500 hover:shadow-[0_0_15px_rgba(202,255,0,0.3)]' : 'bg-slate-700 text-white hover:bg-slate-600']">
            {{ purchasing === plan.id ? 'Procesando...' : 'Comenzar Ahora' }}
          </button>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlans } from '../composables/usePlans'
import { useAuth } from '../composables/useAuth'
import { useUserProfile } from '../composables/useUserProfile'

const router = useRouter()
const { fetchPlans, plans, loading } = usePlans()
const { user, loginWithGoogle } = useAuth()
const { updateUserPlan } = useUserProfile()

const purchasing = ref(null)

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(price)
}

const handlePurchase = async (plan) => {
  purchasing.value = plan.id
  try {
    let currentUser = user.value
    // Si no está logueado, forzar login
    if (!currentUser) {
      await loginWithGoogle()
      // Actualizamos la referencia al usuario tras login exitoso
      currentUser = user.value 
    }
    
    if (currentUser) {
      await updateUserPlan(currentUser.uid, currentUser.displayName || 'Atleta', plan.id, plan.name)
      router.push('/panel')
    }
  } catch (error) {
    console.error("Error en la compra simulada:", error)
    alert("Hubo un problema al procesar tu plan.")
  } finally {
    purchasing.value = null
  }
}

onMounted(() => {
  fetchPlans()
})
</script>

<style scoped>
/* Estilos para el scrollbar horizontal */
.custom-scrollbar::-webkit-scrollbar {
  height: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #0f172a; 
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155; 
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569; 
}
</style>
