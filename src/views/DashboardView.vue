<template>
  <div class="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-4xl mx-auto">
      
      <!-- Header del Dashboard -->
      <div class="bg-slate-800 rounded-2xl p-5 md:p-8 mb-6 md:mb-8 border border-slate-700 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
        <div class="flex items-center gap-6">
          <img v-if="user?.photoURL" :src="user.photoURL" alt="Foto de perfil" class="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-lime-400" />
          <div v-else class="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-700 flex items-center justify-center border-2 border-lime-400">
            <span class="text-xl md:text-2xl font-bold text-slate-300">{{ user?.displayName?.charAt(0) || 'U' }}</span>
          </div>
          <div class="text-center md:text-left">
            <h1 class="text-2xl md:text-3xl font-bold text-white mb-1">Hola, {{ user?.displayName?.split(' ')[0] || 'Atleta' }}</h1>
            <p class="text-sm md:text-base text-slate-400">Bienvenido a tu panel de entrenamiento.</p>
          </div>
        </div>
        <div class="text-center md:text-right flex flex-col gap-2 items-center md:items-end">
          <div class="inline-block bg-slate-900 px-4 py-2 rounded-lg border border-slate-700">
            <span class="block text-xs text-slate-400 uppercase tracking-wider mb-1">Plan Actual</span>
            <span class="font-bold" :class="userProfile?.activePlanId ? 'text-lime-400' : 'text-slate-500'">
              {{ userProfile?.activePlanName || 'Ninguno' }}
            </span>
          </div>
          <!-- Tarjeta de renovación -->
          <div v-if="renewalInfo" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium"
               :class="renewalInfo.urgent
                 ? 'bg-red-500/10 border-red-500/30 text-red-400'
                 : 'bg-slate-900 border-slate-700 text-slate-400'">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 16h5v5"/></svg>
            <span>{{ renewalInfo.text }}
              <strong v-if="renewalInfo.days !== null" :class="renewalInfo.urgent ? 'text-red-300' : 'text-white'">
                {{ renewalInfo.days }} {{ renewalInfo.days === 1 ? 'día' : 'días' }}
              </strong>
              <strong v-else class="text-white">{{ renewalInfo.formattedDate }}</strong>
            </span>
          </div>

          <!-- Tarjeta de plan en cola -->
          <div v-if="userProfile?.queuedPlan" class="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium bg-blue-500/10 border-blue-500/30 text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Próximo: <strong>{{ userProfile.queuedPlan.name }}</strong> (Inicia al expirar el actual)</span>
          </div>
        </div>
      </div>

      <!-- Alerta de Plan Deprecado -->
      <div v-if="isPlanDeprecated" class="mb-6 md:mb-8 bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 md:p-6 flex items-start gap-4 animate-fade-in">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-amber-500 flex-shrink-0 mt-0.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
        <div>
          <h3 class="text-amber-400 font-bold mb-1">Tu plan actual ya no está disponible en el catálogo</h3>
          <p class="text-slate-300 text-sm mb-3">Seguirás disfrutando de sus beneficios hasta que se agoten tus días vigentes. Te recomendamos seleccionar un plan nuevo ahora; no perderás tus días actuales, el nuevo plan se pondrá en espera y se activará automáticamente cuando el actual finalice.</p>
          <button @click="router.push('/#planes')" class="text-xs font-bold text-slate-900 bg-amber-500 px-4 py-2 rounded-lg hover:bg-amber-400 transition-colors">
            Ver nuevos planes
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <!-- Agendar Citas Form -->
        <div class="bg-slate-800 rounded-2xl p-5 md:p-8 border border-slate-700 h-fit">
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
                    <input type="date" v-model="session.date" @change="handleDateChange(index)" :min="minDate" required class="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-lime-400 transition-colors" />
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
        <div class="bg-slate-800 rounded-2xl p-5 md:p-8 border border-slate-700 h-fit">
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

      <!-- QR y Asistencia -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mt-6 md:mt-8">
        <!-- Mi QR de Acceso -->
        <div class="bg-slate-800 rounded-2xl p-5 md:p-8 border border-slate-700 flex flex-col items-center">
          <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2 self-start">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-lime-400"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
            Mi QR de Acceso
          </h2>
          <div class="bg-white p-4 rounded-xl mb-4 relative cursor-pointer hover:scale-105 transition-transform" @click="isQrEnlarged = true" title="Toca para ampliar">
            <QRCodeVue3 v-if="user" :value="qrValue" :width="180" :height="180" />
            <div class="absolute inset-0 bg-black/5 opacity-0 hover:opacity-100 flex items-center justify-center rounded-xl transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-900 drop-shadow-md"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
            </div>
          </div>
          <button @click="isQrEnlarged = true" class="text-lime-400 text-sm font-bold flex items-center gap-2 hover:text-lime-300 transition-colors mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/></svg>
            Ampliar QR
          </button>
          <p class="text-slate-400 text-sm text-center mt-2">Muestra este QR al ingresar o salir del gimnasio.</p>
          <div class="mt-2 text-xs text-slate-500 text-center flex items-center gap-1 justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Se renueva en {{ qrCountdown }}
          </div>
          <div v-if="activeSession" class="mt-4 w-full bg-lime-400/10 border border-lime-400/30 rounded-xl p-3 text-center">
            <span class="text-lime-400 font-bold text-sm">🟢 Estás dentro del gimnasio</span>
          </div>
          <div v-else class="mt-4 w-full bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-center">
            <span class="text-slate-500 text-sm">⚪ Fuera del gimnasio</span>
          </div>
        </div>

        <!-- Estadísticas de Asistencia -->
        <div class="bg-slate-800 rounded-2xl p-5 md:p-8 border border-slate-700">
          <h2 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-lime-400"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
            Mi Asistencia
          </h2>
          <!-- Stats Cards -->
          <div class="grid grid-cols-3 gap-3 mb-6">
            <div class="bg-slate-900 p-4 rounded-xl border border-slate-700 text-center">
              <div class="text-2xl font-black text-lime-400">{{ daysThisMonth }}</div>
              <div class="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Días este mes</div>
            </div>
            <div class="bg-slate-900 p-4 rounded-xl border border-slate-700 text-center">
              <div class="text-2xl font-black text-lime-400">{{ formatDuration(avgMinutesPerVisit) }}</div>
              <div class="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Promedio</div>
            </div>
            <div class="bg-slate-900 p-4 rounded-xl border border-slate-700 text-center">
              <div class="text-2xl font-black text-lime-400">{{ formatDuration(totalMinutesThisMonth) }}</div>
              <div class="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Total mes</div>
            </div>
          </div>
          <!-- Historial reciente -->
          <h3 class="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Historial Reciente</h3>
          <div v-if="attendanceRecords.length === 0" class="text-slate-500 text-center py-6 bg-slate-900/50 rounded-lg border border-slate-700 border-dashed text-sm">
            Sin registros de asistencia aún.
          </div>
          <div v-else class="flex flex-col gap-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
            <div v-for="record in attendanceRecords.slice(0, 15)" :key="record.id" class="bg-slate-900 p-3 rounded-xl border border-slate-700 flex items-center justify-between text-sm">
              <div>
                <div class="font-semibold text-white">{{ formatDate(record.date) }}</div>
                <div class="text-xs text-slate-400 mt-0.5">
                  {{ formatTime(record.checkIn) }} → {{ record.checkOut ? formatTime(record.checkOut) : '...' }}
                </div>
              </div>
              <div class="text-lime-400 font-bold text-xs bg-lime-400/10 px-2 py-1 rounded">
                {{ record.duration ? formatDuration(record.duration) : '🟢 Activo' }}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Modal QR Ampliado (Pantalla Completa) -->
    <div v-if="isQrEnlarged" class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black" @click="isQrEnlarged = false">
      <div class="flex flex-col items-center w-full px-4" @click.stop>
        <h3 style="color: white; font-size: 1.5rem; font-weight: 900; margin-bottom: 1.5rem;">Pase de Acceso</h3>
        
        <!-- QR grande - ocupa casi todo el ancho de la pantalla -->
        <div class="qr-enlarged-container">
          <QRCodeVue3 v-if="user" :value="qrValue" :width="500" :height="500" />
        </div>
        
        <p style="color: #94a3b8; font-size: 0.875rem; margin-top: 1.5rem; margin-bottom: 0.5rem;">Renovación automática en:</p>
        <p style="color: #a3e635; font-size: 3rem; font-weight: 900; font-family: monospace; margin-bottom: 2rem;">{{ qrCountdown }}</p>
        
        <button @click="isQrEnlarged = false" style="width: 100%; max-width: 400px; padding: 1rem; background: #334155; color: white; border: none; border-radius: 0.75rem; font-weight: 700; font-size: 1.125rem; cursor: pointer;">
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import { useAppointments } from '../composables/useAppointments'
import { useTrainers } from '../composables/useTrainers'
import { useUserProfile, calculateExpirationDate } from '../composables/useUserProfile'
import { useAttendance } from '../composables/useAttendance'
import { usePlans } from '../composables/usePlans'
import { generateQRValue, msUntilNextSlot } from '../utils/dynamicQR'
import QRCodeVue3 from 'qrcode.vue'

const router = useRouter()
const { user } = useAuth()
const { appointments, loading: appointmentsLoading, error, scheduleMultipleAppointments, fetchUserAppointments } = useAppointments()
const { trainers, fetchTrainers, getBookedTimes } = useTrainers()
const { userProfile, loading: loadingProfile, fetchUserProfile, checkAndPromotePlan } = useUserProfile()
const { attendanceRecords, activeSession, daysThisMonth, totalMinutesThisMonth, avgMinutesPerVisit, formatDuration, fetchUserAttendance } = useAttendance()
const { plans, fetchPlans, loading: plansLoading } = usePlans()

// --- PLAN DEPRECADO ---
const isPlanDeprecated = computed(() => {
  if (!userProfile.value?.activePlanId) return false
  if (plansLoading.value || !plans.value) return false 
  return plans.value.length > 0 && !plans.value.find(p => p.id === userProfile.value.activePlanId)
})

// --- RENOVACIÓN DE SUSCRIPCIÓN ---
const renewalInfo = computed(() => {
  if (!userProfile.value?.activePlanId) return null

  // Usar fecha de suscripción explícita, o la de última actualización (para usuarios antiguos)
  const startDateMs = userProfile.value.subscribedAt || userProfile.value.updatedAt || Date.now()
  const expiresAt = calculateExpirationDate(startDateMs, userProfile.value.activePlanPeriod)
  const renewal = new Date(expiresAt)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  renewal.setHours(0, 0, 0, 0)

  const diffMs = renewal - today
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  const formattedDate = renewal.toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  if (diffDays <= 0) {
    return { text: 'Tu suscripción vence hoy', days: 0, urgent: true, formattedDate }
  } else if (diffDays <= 32) {
    return { text: `Tu suscripción se renueva en`, days: diffDays, urgent: diffDays <= 7, formattedDate }
  } else {
    return { text: `Tu suscripción se renueva el`, days: null, urgent: false, formattedDate }
  }
})

const isQrEnlarged = ref(false)

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  return new Date(timestamp).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

// --- QR DINÁMICO ---
const qrValue = ref('')
const qrCountdown = ref('')
let qrTimer = null
let countdownTimer = null

const refreshQR = () => {
  if (user.value) qrValue.value = generateQRValue(user.value.uid)
}

const updateCountdown = () => {
  const ms = msUntilNextSlot()
  const mins = Math.floor(ms / 60000)
  const secs = Math.floor((ms % 60000) / 1000)
  qrCountdown.value = `${mins}:${secs.toString().padStart(2, '0')}`
}

const startQRTimers = () => {
  refreshQR()
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1000)
  // Programar refresh al próximo cambio de slot
  const scheduleNext = () => {
    qrTimer = setTimeout(() => {
      refreshQR()
      scheduleNext()
    }, msUntilNextSlot())
  }
  scheduleNext()
}

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

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
const minDate = tomorrow.toISOString().split('T')[0]

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

onMounted(async () => {
  fetchTrainers()
  fetchPlans()
  if (user.value) {
    await checkAndPromotePlan(user.value.uid)
    fetchUserAppointments(user.value.uid)
    fetchUserProfile(user.value.uid)
    fetchUserAttendance(user.value.uid)
    startQRTimers()
  }
})

watch(user, async (newUser) => {
  if (newUser) {
    await checkAndPromotePlan(newUser.uid)
    fetchUserAppointments(newUser.uid)
    fetchUserProfile(newUser.uid)
    fetchUserAttendance(newUser.uid)
    startQRTimers()
  }
})

onBeforeUnmount(() => {
  if (qrTimer) clearTimeout(qrTimer)
  if (countdownTimer) clearInterval(countdownTimer)
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

/* QR ampliado - escala al 85% del ancho de pantalla */
.qr-enlarged-container {
  background: white;
  padding: 16px;
  border-radius: 1rem;
  width: 85vw;
  max-width: 420px;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}
.qr-enlarged-container :deep(canvas),
.qr-enlarged-container :deep(svg),
.qr-enlarged-container :deep(img) {
  width: 100% !important;
  height: 100% !important;
}
</style>
