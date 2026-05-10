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
      
      <!-- Contenedor flex con wrap -->
      <div v-else class="flex flex-wrap justify-center gap-6 pb-8 pt-4">
        <!-- Tarjeta dinámica de Plan -->
        <div v-for="plan in plans" :key="plan.id" 
             class="relative bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1 flex flex-col w-full max-w-[280px] group"
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

      <!-- Modal Simulación de Pago -->
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div class="bg-slate-800 rounded-2xl p-8 max-w-sm w-full text-center border border-slate-700 shadow-2xl">
          <div v-if="paymentStatus === 'processing'" class="flex flex-col items-center">
            <svg class="animate-spin h-12 w-12 text-lime-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <h3 class="text-xl font-bold text-white mb-2">Simulación de Pago</h3>
            <p class="text-slate-400 text-sm">Procesando tu suscripción de forma segura...</p>
          </div>
          <div v-else-if="paymentStatus === 'approved'" class="flex flex-col items-center">
            <div class="w-16 h-16 bg-lime-400 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(202,255,0,0.4)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">¡Pago Aprobado!</h3>
            <p class="text-slate-400 text-sm">Suscripción activada con éxito.</p>
          </div>
          <div v-else-if="paymentStatus === 'queued'" class="flex flex-col items-center">
            <div class="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(96,165,250,0.4)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <h3 class="text-xl font-bold text-white mb-2">¡Plan en Cola!</h3>
            <p class="text-slate-400 text-sm mt-2 leading-relaxed">Podrás seguir usando tu plan actual hasta la fecha de renovación. El nuevo plan se activará automáticamente al finalizar el actual.</p>
          </div>
        </div>
      </div>

      <!-- Modal Confirmación de Cambio de Plan -->
      <div v-if="showConfirmModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <div class="bg-slate-800 rounded-2xl p-6 md:p-8 max-w-md w-full text-center border border-slate-700 shadow-2xl relative">
          <div class="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <h3 class="text-xl font-bold text-white mb-3">Cambio de Plan</h3>
          <p class="text-slate-300 mb-6 text-sm">
            Ya tienes el siguiente plan: <span class="font-bold text-lime-400">{{ userProfile?.activePlanName }}</span>.<br><br>
            ¿Estás seguro que quieres cambiar a <span class="font-bold text-white">{{ pendingPlan?.name }}</span>?
          </p>
          <div class="flex gap-3 mt-4">
            <button @click="cancelChangePlan" class="flex-1 py-3 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-colors">
              Cancelar
            </button>
            <button @click="confirmChangePlan" class="flex-1 py-3 bg-lime-400 text-slate-900 rounded-xl font-bold hover:bg-lime-500 transition-colors shadow-[0_0_15px_rgba(202,255,0,0.2)]">
              Confirmar
            </button>
          </div>
        </div>
      </div>

    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { usePlans } from '../composables/usePlans'
import { useAuth } from '../composables/useAuth'
import { useUserProfile } from '../composables/useUserProfile'

const router = useRouter()
const { fetchPlans, plans, loading } = usePlans()
const { user, loginWithGoogle } = useAuth()
const { updateUserPlan, fetchUserProfile, userProfile } = useUserProfile()

watch(user, (newVal) => {
  if (newVal) {
    fetchUserProfile(newVal.uid)
  }
}, { immediate: true })

const purchasing = ref(null)
const showModal = ref(false)
const paymentStatus = ref('processing')

const showConfirmModal = ref(false)
const pendingPlan = ref(null)

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(price)
}

const handlePurchase = async (plan) => {
  try {
    let currentUser = user.value
    // Si no está logueado, forzar login
    if (!currentUser) {
      await loginWithGoogle()
      // Actualizamos la referencia al usuario tras login exitoso
      currentUser = user.value 
    }
    
    if (currentUser) {
      // Verificar si ya tiene un plan activo
      if (userProfile.value && userProfile.value.activePlanId && userProfile.value.activePlanName !== 'Ninguno') {
        pendingPlan.value = plan
        showConfirmModal.value = true
        return
      }
      
      await processPayment(plan, currentUser, false)
    }
  } catch (error) {
    console.error("Error al iniciar la compra:", error)
    alert("Hubo un problema al procesar tu solicitud.")
  }
}

const confirmChangePlan = async () => {
  showConfirmModal.value = false
  if (pendingPlan.value && user.value) {
    await processPayment(pendingPlan.value, user.value, true)
  }
  pendingPlan.value = null
}

const cancelChangePlan = () => {
  showConfirmModal.value = false
  pendingPlan.value = null
}

const processPayment = async (plan, currentUser, isQueued) => {
  purchasing.value = plan.id
  try {
    showModal.value = true
    paymentStatus.value = 'processing'
    
    await new Promise(resolve => setTimeout(resolve, 5000))
    
    if (isQueued) {
      paymentStatus.value = 'queued'
      await new Promise(resolve => setTimeout(resolve, 4500))
    } else {
      paymentStatus.value = 'approved'
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    
    showModal.value = false
    await updateUserPlan(currentUser.uid, currentUser.displayName || 'Atleta', plan.id, plan.name, plan.period)
    router.push('/panel')
  } catch (error) {
    console.error("Error en la compra simulada:", error)
    alert("Hubo un problema al procesar tu plan.")
    showModal.value = false
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
