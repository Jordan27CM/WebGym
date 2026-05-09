import { ref } from 'vue'
import { db } from '../firebase/config'
import { ref as dbRef, update, onValue, get } from 'firebase/database'

export function calculateExpirationDate(startDateMs, period) {
  if (!startDateMs) return Date.now()
  const renewal = new Date(startDateMs)
  const p = (period || 'mes').toLowerCase()
  if (p.includes('año') || p.includes('anual') || p.includes('year')) {
    renewal.setFullYear(renewal.getFullYear() + 1)
  } else if (p.includes('semana')) {
    renewal.setDate(renewal.getDate() + 7)
  } else {
    renewal.setMonth(renewal.getMonth() + 1)
  }
  return renewal.getTime()
}

export function useUserProfile() {
  const userProfile = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Revisar si el plan expiró y promover el plan encolado si existe
  const checkAndPromotePlan = async (userId) => {
    try {
      const userRef = dbRef(db, `users/${userId}`)
      const snap = await get(userRef)
      const userData = snap.val() || {}

      if (userData.activePlanId) {
        const startMs = userData.subscribedAt || userData.updatedAt || Date.now()
        const expiresAt = calculateExpirationDate(startMs, userData.activePlanPeriod)

        if (Date.now() >= expiresAt) {
          if (userData.queuedPlan) {
            await update(userRef, {
              activePlanId: userData.queuedPlan.id,
              activePlanName: userData.queuedPlan.name,
              activePlanPeriod: userData.queuedPlan.period,
              subscribedAt: expiresAt, // El nuevo plan inicia justo donde terminó el anterior
              queuedPlan: null,
              updatedAt: Date.now()
            })
            return true // Hubo promoción
          } else {
            // El plan actual expiró y no hay plan en cola
            await update(userRef, {
              activePlanId: null,
              activePlanName: 'Ninguno',
              activePlanPeriod: null,
              subscribedAt: null,
              updatedAt: Date.now()
            })
            return true
          }
        }
      }
      return false
    } catch (err) {
      console.error('Error al promover plan:', err)
      return false
    }
  }

  // Asignar o encolar el plan del usuario
  const updateUserPlan = async (userId, userName, planId, planName, planPeriod = null) => {
    try {
      loading.value = true
      const userRef = dbRef(db, `users/${userId}`)
      
      const snap = await get(userRef)
      const userData = snap.val() || {}
      
      const now = Date.now()
      let hasActivePlan = false

      if (userData.activePlanId) {
        const startMs = userData.subscribedAt || userData.updatedAt || now
        const expiresAt = calculateExpirationDate(startMs, userData.activePlanPeriod)
        if (expiresAt > now) {
          hasActivePlan = true
        }
      }

      if (hasActivePlan) {
        // Si tiene plan activo vigente, se guarda en cola
        await update(userRef, {
          displayName: userName,
          queuedPlan: {
            id: planId,
            name: planName,
            period: planPeriod
          },
          updatedAt: now
        })
      } else {
        // Si no tiene plan o ya expiró, lo activamos inmediatamente
        await update(userRef, {
          displayName: userName,
          activePlanId: planId,
          activePlanName: planName,
          activePlanPeriod: planPeriod,
          subscribedAt: now,
          queuedPlan: null,
          updatedAt: now
        })
      }
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
    fetchUserProfile,
    checkAndPromotePlan
  }
}
