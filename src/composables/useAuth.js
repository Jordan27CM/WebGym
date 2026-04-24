import { ref } from 'vue'
import { auth, googleProvider } from '../firebase/config'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

export function useAuth() {
  const user = ref(null)
  const loading = ref(true)
  const error = ref(null)

  // Listen to auth state changes
  onAuthStateChanged(auth, (currentUser) => {
    user.value = currentUser
    loading.value = false
  })

  const loginWithGoogle = async () => {
    error.value = null
    try {
      loading.value = true
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
    loginWithGoogle,
    logout
  }
}
