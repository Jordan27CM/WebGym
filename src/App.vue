<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 font-sans">
    <header class="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex justify-between items-center">
        <router-link to="/" class="text-lg sm:text-xl font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-lime-400"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
          IronForge
        </router-link>
        
        <nav class="hidden md:flex gap-8 text-sm font-medium">
          <a href="/#instalaciones" class="text-slate-300 hover:text-white transition-colors">Instalaciones</a>
          <a href="/#planes" class="text-slate-300 hover:text-white transition-colors">Planes</a>
          <router-link v-if="isAdmin" to="/admin" class="text-slate-300 hover:text-white transition-colors">Admin</router-link>
          <router-link v-if="user" to="/panel" class="text-lime-400 hover:text-lime-300 transition-colors font-bold">Mi Panel</router-link>
        </nav>
        
        <div class="flex items-center gap-3">
          <template v-if="user">
            <span class="text-sm text-slate-300 hidden sm:inline-block">Hola, {{ user.displayName?.split(' ')[0] }}</span>
            <button @click="handleLogout" class="bg-slate-800 text-white px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-slate-700 transition-colors">
              Salir
            </button>
          </template>
          <template v-else>
            <button @click="handleLogin" :disabled="loading" class="bg-lime-400 text-slate-900 px-4 sm:px-5 py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-lime-500 transition-colors disabled:opacity-50">
              {{ loading ? '...' : 'Ingresar' }}
            </button>
            <span v-if="error" class="absolute top-16 right-4 bg-red-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
              {{ error }}
            </span>
          </template>
          <!-- Hamburguesa móvil -->
          <button @click="mobileMenu = !mobileMenu" class="md:hidden text-slate-300 hover:text-white p-1">
            <svg v-if="!mobileMenu" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>
      </div>
      <!-- Menú móvil desplegable -->
      <div v-if="mobileMenu" class="md:hidden border-t border-slate-800 bg-slate-900/95 backdrop-blur-md">
        <nav class="flex flex-col px-4 py-3 gap-1">
          <a href="/#instalaciones" @click="mobileMenu = false" class="text-slate-300 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-lg transition-colors text-sm font-medium">Instalaciones</a>
          <a href="/#planes" @click="mobileMenu = false" class="text-slate-300 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-lg transition-colors text-sm font-medium">Planes</a>
          <router-link v-if="isAdmin" to="/admin" @click="mobileMenu = false" class="text-slate-300 hover:text-white hover:bg-slate-800 px-4 py-3 rounded-lg transition-colors text-sm font-medium">Admin</router-link>
          <router-link v-if="user" to="/panel" @click="mobileMenu = false" class="text-lime-400 hover:bg-slate-800 px-4 py-3 rounded-lg transition-colors text-sm font-bold">Mi Panel</router-link>
        </nav>
      </div>
    </header>

    <router-view />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from './composables/useAuth'
import { useRouter } from 'vue-router'

const { user, loginWithGoogle, logout, loading, error, isAdmin } = useAuth()
const router = useRouter()
const mobileMenu = ref(false)

const handleLogin = async () => {
  try {
    await loginWithGoogle()
    mobileMenu.value = false
    router.push('/panel')
  } catch (error) {
    console.error(error)
  }
}

const handleLogout = async () => {
  try {
    await logout()
    mobileMenu.value = false
    router.push('/')
  } catch (error) {
    console.error(error)
  }
}
</script>

