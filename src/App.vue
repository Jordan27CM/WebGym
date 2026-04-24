<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 font-sans">
    <header class="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-6 h-20 flex justify-between items-center">
        <router-link to="/" class="text-xl font-bold flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-lime-400"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
          IronForge
        </router-link>
        
        <nav class="hidden md:flex gap-8 text-sm font-medium">
          <a href="/#instalaciones" class="text-slate-300 hover:text-white transition-colors">Instalaciones</a>
          <a href="/#planes" class="text-slate-300 hover:text-white transition-colors">Planes</a>
          <router-link v-if="user" to="/admin" class="text-slate-300 hover:text-white transition-colors">Admin</router-link>
          <router-link v-if="user" to="/panel" class="text-lime-400 hover:text-lime-300 transition-colors font-bold">Mi Panel</router-link>
        </nav>
        
        <div class="flex items-center gap-4">
          <template v-if="user">
            <span class="text-sm text-slate-300 hidden sm:inline-block">Hola, {{ user.displayName?.split(' ')[0] }}</span>
            <button @click="handleLogout" class="bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-slate-700 transition-colors">
              Salir
            </button>
          </template>
          <template v-else>
            <button @click="handleLogin" :disabled="loading" class="bg-lime-400 text-slate-900 px-5 py-2 rounded-lg font-semibold text-sm hover:bg-lime-500 transition-colors disabled:opacity-50">
              {{ loading ? '...' : 'Ingresar' }}
            </button>
          </template>
        </div>
      </div>
    </header>

    <router-view />
  </div>
</template>

<script setup>
import { useAuth } from './composables/useAuth'
import { useRouter } from 'vue-router'

const { user, loginWithGoogle, logout, loading } = useAuth()
const router = useRouter()

const handleLogin = async () => {
  try {
    await loginWithGoogle()
    router.push('/panel')
  } catch (error) {
    console.error(error)
  }
}

const handleLogout = async () => {
  try {
    await logout()
    router.push('/')
  } catch (error) {
    console.error(error)
  }
}
</script>
