<template>
  <div class="min-h-screen bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <div class="bg-slate-800 rounded-2xl p-5 md:p-8 mb-6 md:mb-8 border border-slate-700">
        <h1 class="text-2xl md:text-3xl font-bold text-white mb-2">Panel de Administración</h1>
        <p class="text-sm md:text-base text-slate-400">Gestiona los entrenadores y los planes de suscripción.</p>
      </div>

      <!-- SECCIÓN ASISTENCIA -->
      <h2 class="text-xl md:text-2xl font-bold text-lime-400 mb-6 border-b border-slate-700 pb-2">Control de Asistencia</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-12">
        <!-- Escáner QR -->
        <div class="bg-slate-800 rounded-2xl p-5 md:p-8 border border-slate-700">
          <h3 class="text-lg md:text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-lime-400"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/><path d="M7 12h10"/></svg>
            Escáner de Asistencia
          </h3>
          <div v-if="!scannerActive" class="text-center">
            <button @click="startScanner" class="bg-lime-400 text-slate-900 px-6 py-3 rounded-lg font-bold hover:bg-lime-500 transition-colors w-full">Activar Cámara</button>
          </div>
          <div v-else>
            <div id="qr-reader" class="rounded-xl overflow-hidden mb-4"></div>
            <button @click="stopScanner" class="w-full bg-slate-700 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-600 transition-colors text-sm">Detener Cámara</button>
          </div>
          <!-- Feedback -->
          <div v-if="scanLoading" class="mt-4 text-slate-400 text-center text-sm">Procesando...</div>
        </div>

        <!-- Registro del Día -->
        <div class="bg-slate-800 rounded-2xl p-5 md:p-8 border border-slate-700">
          <h3 class="text-lg md:text-xl font-bold text-white mb-6 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-lime-400"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"/></svg>
            Registro de Hoy
          </h3>
          <div class="bg-slate-900 px-4 py-2 rounded-lg border border-slate-700 mb-4 text-center">
            <span class="text-lime-400 font-bold">{{ todayRecords.length }}</span>
            <span class="text-slate-400 text-sm ml-2">registros hoy</span>
          </div>
          <div v-if="todayRecords.length === 0" class="text-slate-500 text-center py-6 bg-slate-900/50 rounded-lg border border-slate-700 border-dashed text-sm">Sin registros hoy.</div>
          <div v-else class="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            <div v-for="rec in todayRecords" :key="rec.id" class="bg-slate-900 p-3 rounded-xl border border-slate-700 flex items-center justify-between text-sm">
              <div>
                <div class="font-semibold text-white">{{ rec.userName || rec.userId }}</div>
                <div class="text-xs text-slate-400 mt-0.5">{{ formatTimestamp(rec.checkIn) }} → {{ rec.checkOut ? formatTimestamp(rec.checkOut) : '...' }}</div>
              </div>
              <div class="text-xs font-bold px-2 py-1 rounded" :class="rec.checkOut ? 'bg-blue-400/10 text-blue-400' : 'bg-lime-400/10 text-lime-400'">{{ rec.checkOut ? (rec.duration + ' min') : '🟢 Dentro' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL DE AVISO QR -->
      <div v-if="scanFeedbackModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-800 border-2 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] transform transition-all"
             :class="scanFeedbackType === 'in' ? 'border-lime-400 shadow-lime-400/20' : scanFeedbackType === 'out' ? 'border-blue-400 shadow-blue-400/20' : 'border-red-400 shadow-red-400/20'">
          
          <div class="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6"
               :class="scanFeedbackType === 'in' ? 'bg-lime-400/20 text-lime-400' : scanFeedbackType === 'out' ? 'bg-blue-400/20 text-blue-400' : 'bg-red-400/20 text-red-400'">
            <!-- Icono Entrada -->
            <svg v-if="scanFeedbackType === 'in'" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            <!-- Icono Salida -->
            <svg v-else-if="scanFeedbackType === 'out'" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            <!-- Icono Error -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
          </div>
          
          <h2 class="text-3xl font-black text-white mb-2 uppercase tracking-wide">
            {{ scanFeedbackType === 'in' ? '¡Entrada!' : scanFeedbackType === 'out' ? '¡Salida!' : 'Error' }}
          </h2>
          
          <p class="text-lg text-slate-300 font-medium mb-8">
            {{ scanFeedbackMessage }}
          </p>
          
          <button @click="closeScanModal" class="w-full py-4 rounded-xl font-bold transition-colors text-lg"
                  :class="scanFeedbackType === 'in' ? 'bg-lime-400 hover:bg-lime-500 text-slate-900' : scanFeedbackType === 'out' ? 'bg-blue-400 hover:bg-blue-500 text-slate-900' : 'bg-red-500 hover:bg-red-600 text-white'">
            Continuar
          </button>
        </div>
      </div>

      <!-- SECCIÓN ENTRENADORES -->
      <h2 class="text-xl md:text-2xl font-bold text-lime-400 mb-6 border-b border-slate-700 pb-2 mt-10 md:mt-12">Gestión de Entrenadores</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-10 md:mb-12">
        <!-- Formulario para agregar entrenador -->
        <div class="bg-slate-800 rounded-2xl p-5 md:p-8 border border-slate-700 h-fit">
          <h3 class="text-lg md:text-xl font-bold text-white mb-6">Agregar Entrenador</h3>
          
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
        <div class="bg-slate-800 rounded-2xl p-5 md:p-8 border border-slate-700">
          <h3 class="text-lg md:text-xl font-bold text-white mb-6">Entrenadores Registrados</h3>
          
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
              <div class="flex items-center gap-2">
                <button @click="openEditTrainerModal(trainer)" class="text-slate-500 hover:text-blue-400 transition-colors" title="Editar entrenador">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </button>
                <button @click="handleDeleteTrainer(trainer.id)" class="text-slate-500 hover:text-red-400 transition-colors" title="Eliminar entrenador">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN PLANES -->
      <h2 class="text-xl md:text-2xl font-bold text-lime-400 mb-6 border-b border-slate-700 pb-2 mt-8 md:mt-12">Gestión de Planes</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
        <!-- Formulario para agregar plan -->
        <div class="bg-slate-800 rounded-2xl p-5 md:p-8 border border-slate-700 h-fit">
          <h3 class="text-lg md:text-xl font-bold text-white mb-6">Agregar Plan</h3>
          
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
                <select v-model="newPlan.period" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors">
                  <option value="mes">Mensual</option>
                  <option value="año">Anual</option>
                  <option value="semana">Semanal</option>
                </select>
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
        <div class="bg-slate-800 rounded-2xl p-5 md:p-8 border border-slate-700">
          <h3 class="text-lg md:text-xl font-bold text-white mb-6">Planes Registrados</h3>
          
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
                <div class="flex items-center gap-2 mt-1">
                  <button @click="openEditPlanModal(plan)" class="text-slate-500 hover:text-blue-400 transition-colors" title="Editar plan">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  </button>
                  <button @click="handleDeletePlan(plan.id)" class="text-slate-500 hover:text-red-400 transition-colors" title="Eliminar plan">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                  </button>
                </div>
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
      <!-- MODAL DE EDICIÓN DE ENTRENADOR -->
      <div v-if="isEditingTrainer" class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
          <button @click="closeEditTrainerModal" class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <h3 class="text-xl font-bold text-white mb-6">Editar Entrenador</h3>
          
          <form @submit.prevent="handleUpdateTrainer" class="flex flex-col gap-4 text-left">
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Nombre</label>
              <input type="text" v-model="editTrainerData.name" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Especialidad</label>
              <input type="text" v-model="editTrainerData.specialty" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">URL de la Foto</label>
              <input type="url" v-model="editTrainerData.photoUrl" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Precio por Sesión (CLP)</label>
              <input type="number" step="1" v-model="editTrainerData.sessionPrice" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Hora Inicio Turno</label>
                <input type="time" v-model="editTrainerData.startTime" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Hora Fin Turno</label>
                <input type="time" v-model="editTrainerData.endTime" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
              </div>
            </div>
            
            <button type="submit" :disabled="loadingEditTrainer" class="mt-4 w-full bg-lime-400 text-slate-900 py-3 rounded-lg font-bold hover:bg-lime-500 transition-colors disabled:opacity-50">
              {{ loadingEditTrainer ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
            <p v-if="successMsgEditTrainer" class="text-lime-400 text-sm font-medium mt-1">{{ successMsgEditTrainer }}</p>
            <p v-if="errorMsgEditTrainer" class="text-red-400 text-sm font-medium mt-1">{{ errorMsgEditTrainer }}</p>
          </form>
        </div>
      </div>

      <!-- MODAL DE EDICIÓN DE PLAN -->
      <div v-if="isEditingPlan" class="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        <div class="bg-slate-800 border border-slate-700 rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
          <button @click="closeEditPlanModal" class="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <h3 class="text-xl font-bold text-white mb-6">Editar Plan</h3>
          
          <form @submit.prevent="handleUpdatePlan" class="flex flex-col gap-4 text-left">
            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Nombre del Plan</label>
              <input type="text" v-model="editPlanData.name" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Precio (CLP)</label>
                <input type="number" step="1" v-model="editPlanData.price" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
              </div>
              <div>
                <label class="block text-sm font-medium text-slate-400 mb-1">Periodo</label>
                <select v-model="editPlanData.period" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors">
                  <option value="mes">Mensual</option>
                  <option value="año">Anual</option>
                  <option value="semana">Semanal</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Descripción corta</label>
              <input type="text" v-model="editPlanData.description" required class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors" />
            </div>

            <div>
              <label class="block text-sm font-medium text-slate-400 mb-1">Características (Separadas por comas)</label>
              <textarea v-model="editPlanData.features" required rows="3" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-lime-400 transition-colors"></textarea>
            </div>

            <label class="flex items-center gap-3 cursor-pointer mt-2">
              <input type="checkbox" v-model="editPlanData.isPopular" class="w-5 h-5 accent-lime-400 bg-slate-900 border-slate-700 rounded" />
              <span class="text-sm font-medium text-slate-300">Marcar como Plan Destacado / Popular</span>
            </label>
            
            <button type="submit" :disabled="loadingEditPlan" class="mt-4 w-full bg-lime-400 text-slate-900 py-3 rounded-lg font-bold hover:bg-lime-500 transition-colors disabled:opacity-50">
              {{ loadingEditPlan ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
            <p v-if="successMsgEditPlan" class="text-lime-400 text-sm font-medium mt-1">{{ successMsgEditPlan }}</p>
            <p v-if="errorMsgEditPlan" class="text-red-400 text-sm font-medium mt-1">{{ errorMsgEditPlan }}</p>
          </form>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useTrainers } from '../composables/useTrainers'
import { usePlans } from '../composables/usePlans'
import { useAttendance } from '../composables/useAttendance'
import { parseQRValue } from '../utils/dynamicQR'
import { db } from '../firebase/config'
import { ref as dbRef, get } from 'firebase/database'

const formatPrice = (price) => {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(price)
}

const formatTimestamp = (ts) => {
  if (!ts) return ''
  return new Date(ts).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })
}

// --- ENTRENADORES ---
const { addTrainer, updateTrainer, deleteTrainer, fetchTrainers, trainers, loading: loadingTrainers } = useTrainers()
const newTrainer = ref({ name: '', specialty: '', photoUrl: '', startTime: '08:00', endTime: '18:00', sessionPrice: '' })
const loadingTrainer = ref(false)
const successMsgTrainer = ref('')
const errorMsgTrainer = ref('')

const isEditingTrainer = ref(false)
const currentEditTrainerId = ref(null)
const editTrainerData = ref({ name: '', specialty: '', photoUrl: '', startTime: '08:00', endTime: '18:00', sessionPrice: 0 })
const loadingEditTrainer = ref(false)
const errorMsgEditTrainer = ref('')
const successMsgEditTrainer = ref('')

const handleAddTrainer = async () => {
  loadingTrainer.value = true; successMsgTrainer.value = ''; errorMsgTrainer.value = ''
  try {
    await addTrainer(newTrainer.value)
    successMsgTrainer.value = 'Guardado exitosamente.'
    newTrainer.value = { name: '', specialty: '', photoUrl: '', startTime: '08:00', endTime: '18:00', sessionPrice: '' }
  } catch (error) { errorMsgTrainer.value = 'Ocurrió un error.' }
  finally { loadingTrainer.value = false }
}

const handleDeleteTrainer = async (id) => {
  if (confirm('¿Seguro que deseas eliminar este entrenador?')) await deleteTrainer(id)
}

const openEditTrainerModal = (trainer) => {
  isEditingTrainer.value = true
  currentEditTrainerId.value = trainer.id
  editTrainerData.value = {
    name: trainer.name,
    specialty: trainer.specialty,
    photoUrl: trainer.photoUrl || '',
    startTime: trainer.startTime || '08:00',
    endTime: trainer.endTime || '18:00',
    sessionPrice: trainer.sessionPrice || 0
  }
  errorMsgEditTrainer.value = ''
  successMsgEditTrainer.value = ''
}

const closeEditTrainerModal = () => {
  isEditingTrainer.value = false
}

const handleUpdateTrainer = async () => {
  loadingEditTrainer.value = true
  errorMsgEditTrainer.value = ''
  successMsgEditTrainer.value = ''
  try {
    await updateTrainer(currentEditTrainerId.value, editTrainerData.value)
    successMsgEditTrainer.value = 'Entrenador actualizado exitosamente.'
    setTimeout(() => {
      isEditingTrainer.value = false
    }, 1500)
  } catch (error) {
    errorMsgEditTrainer.value = 'Error al actualizar: ' + error.message
  } finally {
    loadingEditTrainer.value = false
  }
}

// --- PLANES ---
const { addPlan, updatePlan, deletePlan, fetchPlans, plans, loading: loadingPlans } = usePlans()
const newPlan = ref({ name: '', price: '', period: 'mes', description: '', features: '', isPopular: false })
const loadingPlan = ref(false)
const successMsgPlan = ref('')
const errorMsgPlan = ref('')

const isEditingPlan = ref(false)
const currentEditPlanId = ref(null)
const editPlanData = ref({ name: '', price: 0, period: 'mes', description: '', features: '', isPopular: false })
const loadingEditPlan = ref(false)
const errorMsgEditPlan = ref('')
const successMsgEditPlan = ref('')

const handleAddPlan = async () => {
  loadingPlan.value = true; successMsgPlan.value = ''; errorMsgPlan.value = ''
  try {
    await addPlan(newPlan.value)
    successMsgPlan.value = 'Plan guardado exitosamente.'
    newPlan.value = { name: '', price: '', period: 'mes', description: '', features: '', isPopular: false }
  } catch (error) { errorMsgPlan.value = 'Ocurrió un error al guardar.' }
  finally { loadingPlan.value = false }
}

const handleDeletePlan = async (id) => {
  if (confirm('¿Seguro que deseas eliminar este plan?')) await deletePlan(id)
}

const openEditPlanModal = (plan) => {
  isEditingPlan.value = true
  currentEditPlanId.value = plan.id
  editPlanData.value = {
    name: plan.name,
    price: plan.price,
    period: plan.period,
    description: plan.description,
    features: Array.isArray(plan.features) ? plan.features.join(', ') : '',
    isPopular: plan.isPopular || false
  }
  errorMsgEditPlan.value = ''
  successMsgEditPlan.value = ''
}

const closeEditPlanModal = () => {
  isEditingPlan.value = false
}

const handleUpdatePlan = async () => {
  loadingEditPlan.value = true
  errorMsgEditPlan.value = ''
  successMsgEditPlan.value = ''
  try {
    await updatePlan(currentEditPlanId.value, editPlanData.value)
    successMsgEditPlan.value = 'Plan actualizado exitosamente.'
    setTimeout(() => {
      isEditingPlan.value = false
    }, 1500)
  } catch (error) {
    errorMsgEditPlan.value = 'Error al actualizar: ' + error.message
  } finally {
    loadingEditPlan.value = false
  }
}

// --- ASISTENCIA ---
const { checkIn, checkOut, findActiveSession, fetchAllAttendanceForDate, formatDuration } = useAttendance()
const scannerActive = ref(false)
const scanFeedbackModal = ref(false)
const scanFeedbackMessage = ref('')
const scanFeedbackType = ref('')
const scanLoading = ref(false)
const todayRecords = ref([])
let html5QrCode = null
let scanCooldown = false
let modalTimeout = null

const loadTodayRecords = async () => {
  const today = new Date().toISOString().split('T')[0]
  todayRecords.value = await fetchAllAttendanceForDate(today)
}

const getUserName = async (userId) => {
  try {
    const userRef = dbRef(db, `users/${userId}`)
    const snap = await get(userRef)
    if (snap.exists()) return snap.val().displayName || snap.val().activePlanName || userId.slice(0, 8)
    return userId.slice(0, 8)
  } catch { return userId.slice(0, 8) }
}

const closeScanModal = () => {
  scanFeedbackModal.value = false
  if (modalTimeout) clearTimeout(modalTimeout)
  // Pequeño retardo extra para no escanear accidentalmente al instante de cerrar
  setTimeout(() => { scanCooldown = false }, 500)
}

const handleScanSuccess = async (decodedText) => {
  if (scanCooldown || scanLoading.value || scanFeedbackModal.value) return
  scanCooldown = true
  scanLoading.value = true

  try {
    const parsed = parseQRValue(decodedText.trim())

    if (!parsed) {
      scanFeedbackMessage.value = 'Formato de código no reconocido.'
      scanFeedbackType.value = 'error'
      scanFeedbackModal.value = true
      return
    }

    if (!parsed.valid) {
      scanFeedbackMessage.value = 'Código expirado. Pídele al usuario que actualice su QR.'
      scanFeedbackType.value = 'error'
      scanFeedbackModal.value = true
      return
    }

    const userId = parsed.uid
    const userName = await getUserName(userId)
    const active = await findActiveSession(userId)

    if (active) {
      await checkOut(userId, active.id, active.checkIn)
      const dur = Math.round((Date.now() - active.checkIn) / 60000)
      scanFeedbackMessage.value = `${userName} estuvo entrenando por ${dur} minutos.`
      scanFeedbackType.value = 'out'
    } else {
      await checkIn(userId, userName)
      scanFeedbackMessage.value = `Bienvenido, ${userName}.`
      scanFeedbackType.value = 'in'
    }
    
    scanFeedbackModal.value = true
    await loadTodayRecords()
    
    // Auto cerrar el modal después de 4 segundos
    if (modalTimeout) clearTimeout(modalTimeout)
    modalTimeout = setTimeout(() => {
      if (scanFeedbackModal.value) closeScanModal()
    }, 4000)

  } catch (err) {
    scanFeedbackMessage.value = `Hubo un error de conexión: ${err.message}`
    scanFeedbackType.value = 'error'
    scanFeedbackModal.value = true
  } finally {
    scanLoading.value = false
  }
}

const startScanner = async () => {
  scannerActive.value = true
  const { Html5Qrcode } = await import('html5-qrcode')
  await new Promise(r => setTimeout(r, 100))
  html5QrCode = new Html5Qrcode('qr-reader')
  try {
    await html5QrCode.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      handleScanSuccess,
      () => {}
    )
  } catch (err) {
    scanFeedback.value = '❌ No se pudo acceder a la cámara.'
    scanFeedbackType.value = 'error'
    scannerActive.value = false
  }
}

const stopScanner = async () => {
  if (html5QrCode) {
    try { await html5QrCode.stop() } catch {}
    html5QrCode = null
  }
  scannerActive.value = false
}

onMounted(() => {
  fetchTrainers()
  fetchPlans()
  loadTodayRecords()
})

onBeforeUnmount(() => { stopScanner() })
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
