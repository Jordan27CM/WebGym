<template>
  <div class="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <div class="bg-slate-800 rounded-2xl p-8 mb-8 border border-slate-700">
        <h1 class="text-3xl font-bold text-white mb-2">Panel de Administración</h1>
        <p class="text-slate-400">Gestiona los entrenadores y los planes de suscripción.</p>
      </div>

      <!-- SECCIÓN ENTRENADORES -->
      <h2 class="text-2xl font-bold text-lime-400 mb-6 border-b border-slate-700 pb-2">Gestión de Entrenadores</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <!-- Formulario para agregar entrenador -->
        <div class="bg-slate-800 rounded-2xl p-8 border border-slate-700 h-fit">
          <h3 class="text-xl font-bold text-white mb-6">Agregar Entrenador</h3>
          
          <form @submit.prevent="handleAddTrainer" class="flex flex-col gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Nombre Completo</label>
              <input type="text" v-model="newTrainer.name" required placeholder="Ej. Carlos Mendoza" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Especialidad</label>
                <input type="text" v-model="newTrainer.specialty" required placeholder="Ej. Hipertrofia y Fuerza" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Precio por Sesión (CLP)</label>
                <input type="number" step="1" v-model="newTrainer.sessionPrice" required placeholder="Ej. 15000" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">URL de Foto (Opcional)</label>
              <input type="url" v-model="newTrainer.photoUrl" placeholder="https://..." class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Hora Inicio Turno</label>
                <input type="time" v-model="newTrainer.startTime" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Hora Fin Turno</label>
                <input type="time" v-model="newTrainer.endTime" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
              </div>
            </div>
            
            <button type="submit" :disabled="loadingTrainer" class="mt-2 w-full bg-lime-400 text-slate-900 py-3 rounded-lg font-bold hover:bg-lime-500 transition-colors disabled:opacity-50">
              {{ loadingTrainer ? 'Guardando...' : 'Guardar Entrenador' }}
            </button>
            <p v-if="successMsgTrainer" class="text-lime-400 text-sm font-medium">{{ successMsgTrainer }}</p>
            <p v-if="errorMsgTrainer" class="text-red-400 text-sm font-medium">{{ errorMsgTrainer }}</p>
          </form>
        </div>

        <!-- Lista de Entrenadores -->
        <div class="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h3 class="text-xl font-bold text-white mb-6">Entrenadores Registrados</h3>
          
          <div v-if="loadingTrainers" class="text-slate-400 text-center py-8">Cargando...</div>
          <div v-else-if="trainers.length === 0" class="text-slate-400 text-center py-8 bg-slate-900/50 rounded-lg border border-slate-700 border-dashed">
            No hay entrenadores registrados.
          </div>
          <div v-else class="flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <div v-for="trainer in trainers" :key="trainer.id" class="bg-slate-900 p-4 rounded-xl border border-slate-700 flex items-center justify-between">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 rounded-full bg-slate-700 flex-shrink-0 overflow-hidden border border-slate-600">
                  <img v-if="trainer.photoUrl" :src="trainer.photoUrl" alt="" class="w-full h-full object-cover"/>
                  <span v-else class="w-full h-full flex items-center justify-center text-slate-400 font-bold">{{ trainer.name.charAt(0) }}</span>
                </div>
                <div>
                  <div class="font-bold text-white">{{ trainer.name }}</div>
                  <div class="text-xs text-lime-400 font-medium mb-1">{{ trainer.specialty }} <span class="text-slate-500 ml-1">| {{ formatPrice(trainer.sessionPrice || 0) }}/sesión</span></div>
                  <div class="text-[10px] text-slate-400 bg-slate-800 inline-block px-2 py-0.5 rounded border border-slate-700">
                    {{ trainer.startTime || '06:00' }} - {{ trainer.endTime || '22:00' }}
                  </div>
                </div>
              </div>
              <button @click="handleDeleteTrainer(trainer.id)" class="text-slate-500 hover:text-red-400 transition-colors" title="Eliminar entrenador">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN PLANES -->
      <h2 class="text-2xl font-bold text-lime-400 mb-6 border-b border-slate-700 pb-2">Gestión de Planes</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Formulario para agregar plan -->
        <div class="bg-slate-800 rounded-2xl p-8 border border-slate-700 h-fit">
          <h3 class="text-xl font-bold text-white mb-6">Agregar Plan</h3>
          
          <form @submit.prevent="handleAddPlan" class="flex flex-col gap-4">
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Nombre del Plan</label>
              <input type="text" v-model="newPlan.name" required placeholder="Ej. Pro" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Precio (CLP)</label>
                <input type="number" step="1" v-model="newPlan.price" required placeholder="Ej. 25000" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Periodo</label>
                <input type="text" v-model="newPlan.period" required placeholder="Ej. mes o año" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Descripción corta</label>
              <input type="text" v-model="newPlan.description" required placeholder="Para los que buscan más" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Características (Separadas por comas)</label>
              <textarea v-model="newPlan.features" required rows="3" placeholder="Acceso 24/7, Casillero, Entrenador personal" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors"></textarea>
            </div>

            <label class="flex items-center gap-3 cursor-pointer mt-2">
              <input type="checkbox" v-model="newPlan.isPopular" class="w-5 h-5 accent-lime-400 bg-slate-900 border-slate-700 rounded" />
              <span class="text-sm font-medium text-slate-300">Marcar como Plan Destacado / Popular</span>
            </label>
            
            <button type="submit" :disabled="loadingPlan" class="mt-4 w-full bg-lime-400 text-slate-900 py-3 rounded-lg font-bold hover:bg-lime-500 transition-colors disabled:opacity-50">
              {{ loadingPlan ? 'Guardando...' : 'Guardar Plan' }}
            </button>
            <p v-if="successMsgPlan" class="text-lime-400 text-sm font-medium">{{ successMsgPlan }}</p>
            <p v-if="errorMsgPlan" class="text-red-400 text-sm font-medium">{{ errorMsgPlan }}</p>
          </form>
        </div>

        <!-- Lista de Planes -->
        <div class="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h3 class="text-xl font-bold text-white mb-6">Planes Registrados</h3>
          
          <div v-if="loadingPlans" class="text-slate-400 text-center py-8">Cargando...</div>
          <div v-else-if="plans.length === 0" class="text-slate-400 text-center py-8 bg-slate-900/50 rounded-lg border border-slate-700 border-dashed">
            No hay planes registrados.
          </div>
          <div v-else class="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <div v-for="plan in plans" :key="plan.id" class="bg-slate-900 p-5 rounded-xl border border-slate-700 relative" :class="{'border-lime-400': plan.isPopular}">
              
              <div v-if="plan.isPopular" class="absolute top-0 right-0 bg-lime-400 text-slate-900 text-[10px] font-bold px-2 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">
                Destacado
              </div>

              <div class="flex justify-between items-start mb-2">
                <div>
                  <h4 class="font-bold text-lg text-white">{{ plan.name }}</h4>
                  <div class="text-2xl font-black text-white mt-1">{{ formatPrice(plan.price) }} <span class="text-sm font-normal text-slate-400">/ {{ plan.period }}</span></div>
                </div>
                <button @click="handleDeletePlan(plan.id)" class="text-slate-500 hover:text-red-400 transition-colors mt-1" title="Eliminar plan">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              </div>
              
              <p class="text-sm text-slate-400 mb-3">{{ plan.description }}</p>
              
              <ul class="text-sm text-slate-300 space-y-1">
                <li v-for="(feat, i) in plan.features" :key="i" class="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-lime-400 flex-shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
                  <span class="line-clamp-1">{{ feat }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTrainers } from '../composables/useTrainers'
import { usePlans } from '../composables/usePlans'

// Utilidad para CLP
const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(price)
}

// --- ENTRENADORES ---
const { addTrainer, deleteTrainer, fetchTrainers, trainers, loading: loadingTrainers } = useTrainers()

const newTrainer = ref({
  name: '',
  specialty: '',
  photoUrl: '',
  startTime: '08:00',
  endTime: '18:00',
  sessionPrice: ''
})

const loadingTrainer = ref(false)
const successMsgTrainer = ref('')
const errorMsgTrainer = ref('')

const handleAddTrainer = async () => {
  loadingTrainer.value = true
  successMsgTrainer.value = ''
  errorMsgTrainer.value = ''
  try {
    await addTrainer(newTrainer.value)
    successMsgTrainer.value = 'Guardado exitosamente.'
    newTrainer.value = { name: '', specialty: '', photoUrl: '', startTime: '08:00', endTime: '18:00', sessionPrice: '' }
  } catch (error) {
    errorMsgTrainer.value = 'Ocurrió un error.'
  } finally {
    loadingTrainer.value = false
  }
}

const handleDeleteTrainer = async (id) => {
  if(confirm('¿Seguro que deseas eliminar este entrenador?')) {
    await deleteTrainer(id)
  }
}

// --- PLANES ---
const { addPlan, deletePlan, fetchPlans, plans, loading: loadingPlans } = usePlans()

const newPlan = ref({
  name: '',
  price: '',
  period: 'mes',
  description: '',
  features: '',
  isPopular: false
})

const loadingPlan = ref(false)
const successMsgPlan = ref('')
const errorMsgPlan = ref('')

const handleAddPlan = async () => {
  loadingPlan.value = true
  successMsgPlan.value = ''
  errorMsgPlan.value = ''
  try {
    await addPlan(newPlan.value)
    successMsgPlan.value = 'Plan guardado exitosamente.'
    newPlan.value = { name: '', price: '', period: 'mes', description: '', features: '', isPopular: false }
  } catch (error) {
    errorMsgPlan.value = 'Ocurrió un error.'
  } finally {
    loadingPlan.value = false
  }
}

const handleDeletePlan = async (id) => {
  if(confirm('¿Seguro que deseas eliminar este plan?')) {
    await deletePlan(id)
  }
}

onMounted(() => {
  fetchTrainers()
  fetchPlans()
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #0f172a; 
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #334155; 
  border-radius: 4px;
}
</style>
