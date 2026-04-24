import { ref } from 'vue'
import { db } from '../firebase/config'
import { ref as dbRef, set, onValue } from 'firebase/database'

export function useUserProfile() {
  const userProfile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Asignar o actualizar el plan del usuario
  const updateUserPlan = async (userId, planId, planName) => {
    try {
      loading.value = true
      const userRef = dbRef(db, `users/${userId}`)
      await set(userRef, {
        activePlanId: planId,
        activePlanName: planName,
        updatedAt: Date.now()
      })
    } catch (err) {
      console.error('Error al actualizar el plan:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Escuchar el perfil del usuario en tiempo real
  const fetchUserProfile = (userId) => {
    loading.value = true
    const userRef = dbRef(db, `users/${userId}`)
    
    onValue(userRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        userProfile.value = data
      } else {
        userProfile.value = { activePlanId: null, activePlanName: 'Ninguno' }
      }
      loading.value = false
    }, (err) => {
      console.error(err)
      error.value = err.message
      loading.value = false
    })
  }

  return {
    userProfile,
    loading,
    error,
    updateUserPlan,
    fetchUserProfile
  }
}
