import { ref } from 'vue'
import { db } from '../firebase/config'
import { ref as dbRef, push, set, remove, onValue, update } from 'firebase/database'

export function usePlans() {
  const plans = ref([])
  const loading = ref(false)

  // Agregar un nuevo plan (Admin)
  const addPlan = async (planData) => {
    try {
      const plansListRef = dbRef(db, 'plans')
      const newPlanRef = push(plansListRef)
      
      const payload = {
        id: newPlanRef.key,
        name: planData.name,
        price: planData.price,
        period: planData.period,
        description: planData.description,
        features: planData.features.split(',').map(f => f.trim()).filter(f => f),
        isPopular: planData.isPopular || false,
        createdAt: Date.now()
      }

      await set(newPlanRef, payload)
      return payload
    } catch (err) {
      throw err
    }
  }

  // Eliminar un plan (Admin)
  const deletePlan = async (planId) => {
    try {
      const planRef = dbRef(db, `plans/${planId}`)
      await remove(planRef)
    } catch (err) {
      throw err
    }
  }

  // Actualizar un plan (Admin)
  const updatePlan = async (planId, planData) => {
    try {
      const planRef = dbRef(db, `plans/${planId}`)
      const payload = {
        name: planData.name,
        price: planData.price,
        period: planData.period,
        description: planData.description,
        features: typeof planData.features === 'string' 
          ? planData.features.split(',').map(f => f.trim()).filter(f => f)
          : planData.features,
        isPopular: planData.isPopular || false,
        updatedAt: Date.now()
      }
      await update(planRef, payload)
      return payload
    } catch (err) {
      throw err
    }
  }

  // Escuchar lista de planes
  const fetchPlans = () => {
    loading.value = true
    const plansRef = dbRef(db, 'plans')
    
    onValue(plansRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        plans.value = Object.keys(data).map(key => ({
          ...data[key]
        }))
        // Ordenar opcionalmente por precio o fecha de creación
        plans.value.sort((a, b) => a.price - b.price)
      } else {
        plans.value = []
      }
      loading.value = false
    }, (err) => {
      console.error(err)
      loading.value = false
    })
  }

  return {
    plans,
    loading,
    addPlan,
    updatePlan,
    deletePlan,
    fetchPlans
  }
}
