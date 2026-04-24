<template>
  <div class="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      
      <!-- Header del Dashboard -->
      <div class="bg-slate-800 rounded-2xl p-8 mb-8 border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="flex items-center gap-6">
          <img v-if="user?.photoURL" :src="user.photoURL" alt="Foto de perfil" class="w-20 h-20 rounded-full border-2 border-lime-400" />
          <div v-else class="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center border-2 border-lime-400">
            <span class="text-2xl font-bold text-slate-300">{{ user?.displayName?.charAt(0) || 'U' }}</span>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-white mb-1">Hola, {{ user?.displayName?.split(' ')[0] || 'Atleta' }}</h1>
            <p class="text-slate-400">Bienvenido a tu panel de entrenamiento.</p>
          </div>
        </div>
        <div class="text-center md:text-right">
          <div class="inline-block bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
            <span class="block text-xs text-slate-400 uppercase tracking-wider mb-1">Plan Actual</span>
            <span class="font-bold" :class="userProfile?.activePlanId ? 'text-lime-400' : 'text-slate-500'">
              {{ userProfile?.activePlanName || 'Ninguno' }}
            </span>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Agendar Citas Form -->
        <div class="bg-slate-800 rounded-2xl p-8 border border-slate-700 h-fit">
          <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-lime-400"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/><path d="M16 18h.01"/></svg>
            Agendar Entrenamiento
          </h2>
          
          <div v-if="loadingProfile" class="text-slate-400 text-center py-8">
            Verificando tu plan...
          </div>
          
          <!-- Bloqueo si no hay plan activo -->
          <div v-else-if="!userProfile?.activePlanId" class="bg-slate-900/50 border border-slate-700 rounded-xl p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-slate-500 mx-auto mb-4"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <h3 class="text-white font-bold mb-2">Se requiere Membresía</h3>
            <p class="text-slate-400 text-sm mb-6">Para agendar sesiones con nuestros entrenadores, primero debes adquirir uno de nuestros planes.</p>
            <router-link to="/#planes" class="inline-block bg-lime-400 text-slate-900 px-6 py-2 rounded-lg font-bold hover:bg-lime-500 transition-colors">
              Ver Planes
            </router-link>
          </div>

          <!-- Formulario si hay plan -->
          <form v-else @submit.prevent="handleSchedule" class="flex flex-col gap-5">
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-3">Elige tu Entrenador</label>
              
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
                <!-- Tarjetas de Entrenadores -->
                <button type="button" 
                        v-for="trainer in trainers" 
                        :key="trainer.id"
                        @click="handleSelectTrainer(trainer.id)"
                        :class="['p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all h-36 relative overflow-hidden', 
                                 selectedTrainer === trainer.id ? 'border-lime-400 bg-slate-800 shadow-[0_0_15px_rgba(202,255,0,0.1)]' : 'border-slate-700 bg-slate-900/50 hover:border-slate-500']">
                  
                  <div class="absolute top-2 right-2 text-lime-400" v-if="selectedTrainer === trainer.id">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>

                  <div class="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden border-2 mb-2"
                       :class="selectedTrainer === trainer.id ? 'border-lime-400' : 'border-slate-600'">
                    <img v-if="trainer.photoUrl" :src="trainer.photoUrl" alt="" class="w-full h-full object-cover"/>
                    <div v-else class="w-full h-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold text-sm">
                      {{ trainer.name.charAt(0) }}
                    </div>
                  </div>
                  <span class="text-xs font-bold text-white line-clamp-1 w-full">{{ trainer.name }}</span>
                  <span class="text-[10px] text-lime-400 mt-1 line-clamp-1 w-full">{{ trainer.specialty }}</span>
                  <span class="text-[10px] font-bold text-slate-400 mt-1">{{ formatPrice(trainer.sessionPrice || 0) }}</span>
                </button>
              </div>
              <p v-if="!selectedTrainer" class="text-xs text-slate-500 mt-1">Debes elegir un entrenador para ver sus horarios.</p>
            </div>

            <!-- Cantidad de Sesiones -->
            <div v-if="selectedTrainer">
              <label class="block text-sm font-medium text-slate-400 mb-2">Cantidad de Sesiones a Agendar</label>
              <input type="number" min="1" max="10" v-model="numSessions" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
            </div>

            <!-- Horarios dinámicos -->
            <div v-if="selectedTrainer" class="space-y-4 max-h-[350px] overflow-y-auto custom-scrollbar pr-2">
              <div v-for="(session, index) in sessionsData" :key="session.id" class="bg-slate-900/80 p-4 rounded-xl border border-slate-700">
                <h4 class="text-lime-400 font-bold mb-3 text-sm">Sesión {{ index + 1 }}</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-xs font-medium text-slate-400 mb-1">Fecha</label>
                    <input type="date" v-model="session.date" @change="handleDateChange(index)" :min="today" required class="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400 transition-colors" />
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-slate-400 mb-1">Hora</label>
                    <div v-if="session.loading" class="text-xs text-lime-400 mb-1">Comprobando...</div>
                    <select v-model="session.time" required :disabled="session.loading || !session.date" class="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <option value="" disabled>{{ !session.date ? 'Elige fecha' : 'Elige hora' }}</option>
                      <option v-for="time in getAvailableTimesForSlot(index)" :key="time" :value="time">{{ time }}</option>
                    </select>
                    <p v-if="session.date && getAvailableTimesForSlot(index).length === 0 && !session.loading" class="text-[10px] text-red-400 mt-1">
                      Sin horarios disponibles este día.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Resumen y Pago -->
            <div v-if="selectedTrainer" class="bg-slate-900 p-5 rounded-xl border-2 border-lime-400/50 flex justify-between items-center mt-2 shadow-[0_0_20px_rgba(202,255,0,0.05)]">
               <span class="text-slate-400 font-bold text-sm">Total a pagar:</span>
               <span class="text-2xl font-black text-lime-400">{{ formatPrice(totalPrice) }}</span>
            </div>

            <button type="submit" :disabled="scheduling || !isFormValid" class="mt-2 w-full bg-lime-400 text-slate-900 py-3 rounded-lg font-bold hover:bg-lime-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(202,255,0,0.2)]">
              {{ scheduling ? 'Agendando...' : 'Confirmar Reservas' }}
            </button>
            <p v-if="error" class="text-red-400 text-sm mt-2">{{ error }}</p>
          </form>
        </div>

        <!-- Próximas Citas -->
        <div class="bg-slate-800 rounded-2xl p-8 border border-slate-700 h-fit">
          <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-lime-400"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Tus Próximas Citas
          </h2>
          
          <div v-if="appointmentsLoading" class="text-slate-400 text-center py-8">
            Cargando citas...
          </div>
          <div v-else-if="futureAppointments.length === 0" class="text-slate-400 text-center py-8 bg-slate-900/50 rounded-lg border border-slate-700 border-dashed">
            No tienes citas agendadas.<br/>¡Reserva tu primer entrenamiento!
          </div>
          <div v-else class="flex flex-col gap-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <div v-for="app in futureAppointments" :key="app.id" class="bg-slate-900 p-4 rounded-xl border border-slate-700 flex flex-col justify-between hover:border-lime-400/50 transition-colors">
              <div class="flex justify-between items-start mb-2">
                <div class="font-semibold text-white">{{ formatDate(app.date) }}</div>
                <div class="bg-slate-800 px-2 py-0.5 rounded text-xs font-medium text-lime-400 border border-lime-400/20">
                  Agendado
                </div>
              </div>
              <div class="flex items-center justify-between text-sm">
                <div class="text-lime-400 flex items-center gap-1 font-medium bg-lime-400/10 px-2 py-1 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  {{ app.time }}
                </div>
                <div class="text-slate-400 flex items-center gap-1 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {{ app.trainerName }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '../composables/useAuth'
import { useAppointments } from '../composables/useAppointments'
import { useTrainers } from '../composables/useTrainers'
import { useUserProfile } from '../composables/useUserProfile'

const { user } = useAuth()
const { appointments, loading: appointmentsLoading, error, scheduleMultipleAppointments, fetchUserAppointments } = useAppointments()
const { trainers, fetchTrainers, getBookedTimes } = useTrainers()
const { userProfile, loading: loadingProfile, fetchUserProfile } = useUserProfile()

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(price)
}

const selectedTrainer = ref('')
const numSessions = ref(1)
const sessionsData = ref([{ id: 0, date: '', time: '', availableTimes: [], loading: false }])
const scheduling = ref(false)
const trainerDynamicTimes = ref([])

const selectedTrainerData = computed(() => trainers.value.find(t => t.id === selectedTrainer.value))
const totalPrice = computed(() => (selectedTrainerData.value?.sessionPrice || 0) * numSessions.value)

// El formulario es válido si se seleccionó entrenador y TODOS los slots de sesiones tienen fecha y hora
const isFormValid = computed(() => {
  if (!selectedTrainer.value) return false
  return sessionsData.value.every(s => s.date && s.time)
})

const handleSelectTrainer = (id) => {
  selectedTrainer.value = id
  numSessions.value = 1
  sessionsData.value = [{ id: Date.now(), date: '', time: '', availableTimes: [], loading: false }]
  
  // Generar horario base del entrenador
  const trainerData = trainers.value.find(t => t.id === id)
  if (trainerData && trainerData.startTime && trainerData.endTime) {
    generateDynamicTimes(trainerData.startTime, trainerData.endTime)
  } else {
    generateDynamicTimes('06:00', '22:00')
  }
}

const generateDynamicTimes = (start, end) => {
  const startHour = parseInt(start.split(':')[0])
  const endHour = parseInt(end.split(':')[0])
  const times = []
  for (let i = startHour; i <= endHour; i++) {
    times.push(`${i.toString().padStart(2, '0')}:00`)
  }
  trainerDynamicTimes.value = times
}

const today = new Date().toISOString().split('T')[0]

// Escuchar cambios en la cantidad de sesiones para ajustar el formulario dinámicamente
watch(numSessions, (newVal) => {
  const diff = newVal - sessionsData.value.length
  if (diff > 0) {
    for(let i=0; i < diff; i++) {
      sessionsData.value.push({ id: Date.now() + i, date: '', time: '', availableTimes: [], loading: false })
    }
  } else if (diff < 0) {
    sessionsData.value.splice(newVal)
  }
})

// Manejar cambio de fecha en un slot específico
const handleDateChange = async (index) => {
  const session = sessionsData.value[index]
  session.time = ''
  if (!session.date || !selectedTrainer.value) return
  
  session.loading = true
  const bookedInDB = await getBookedTimes(selectedTrainer.value, session.date)
  
  // Filtramos las horas del entrenador quitando las ocupadas en la DB
  session.availableTimes = trainerDynamicTimes.value.filter(t => !bookedInDB.includes(t))
  session.loading = false
}

// Obtener las horas disponibles filtrando también las ya seleccionadas en el propio formulario para la misma fecha
const getAvailableTimesForSlot = (index) => {
  const session = sessionsData.value[index]
  if(!session.availableTimes.length) return []
  
  const selectedTimesOtherSlots = sessionsData.value
    .filter((s, i) => i !== index && s.date === session.date && s.time)
    .map(s => s.time)
    
  return session.availableTimes.filter(t => !selectedTimesOtherSlots.includes(t))
}

// Filtrar solo citas futuras y ordenarlas por timestamp
const futureAppointments = computed(() => {
  const now = Date.now()
  return appointments.value
    .filter(app => app.timestamp > now - (1000 * 60 * 60))
    .sort((a, b) => a.timestamp - b.timestamp)
})

const formatDate = (dateString) => {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  const date = new Date(dateString + 'T12:00:00')
  return date.toLocaleDateString('es-ES', options).replace(/^\w/, (c) => c.toUpperCase())
}

const handleSchedule = async () => {
  if (!isFormValid.value || !user.value) return
  
  scheduling.value = true
  try {
    const tName = selectedTrainerData.value?.name || ''
    await scheduleMultipleAppointments(user.value.uid, sessionsData.value, selectedTrainer.value, tName)
    
    // Reset form tras éxito
    selectedTrainer.value = ''
    numSessions.value = 1
    sessionsData.value = [{ id: 0, date: '', time: '', availableTimes: [], loading: false }]
  } catch (err) {
    console.error(err)
  } finally {
    scheduling.value = false
  }
}

onMounted(() => {
  fetchTrainers()
  if (user.value) {
    fetchUserAppointments(user.value.uid)
    fetchUserProfile(user.value.uid)
  }
})

watch(user, (newUser) => {
  if (newUser) {
    fetchUserAppointments(newUser.uid)
    fetchUserProfile(newUser.uid)
  }
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
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #475569; 
}
</style>
