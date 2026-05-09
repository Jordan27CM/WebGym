import { ref, computed } from 'vue'
import { auth, googleProvider } from '../firebase/config'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

const ADMIN_EMAILS = ['apps.lifesync@gmail.com', 'adminirongym@gmail.com']

export function useAuth() {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  // Listen to auth state changes
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
    loading.value = false
  })

  // Computed: ¿es admin?
  const isAdmin = computed(() => {
    return ADMIN_EMAILS.includes(user.value?.email)
  })

  const loginWithGoogle = async () => {
    error.value = null
    try {
      loading.value = true
      // Usamos popup universalmente. Ya que estás en el dominio oficial, 
      // no debería ser bloqueado en móviles (a menos que uses navegación privada extrema)
      const result = await signInWithPopup(auth, googleProvider)
      user.value = result.user
      return result.user
    } catch (err) {
      console.error("Error al iniciar sesión con Google", err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    error.value = null
    try {
      loading.value = true
      await signOut(auth)
      user.value = null
    } catch (err) {
      console.error("Error al cerrar sesión", err)
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    loading,
    error,
    isAdmin,
    loginWithGoogle,
    logout
  }
}

