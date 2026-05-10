import { ref } from 'vue'
import { db } from '../firebase/config'
import { ref as dbRef, push, set, remove, onValue, get, update } from 'firebase/database'

export function useTrainers() {
  const trainers = ref([])
  const loading = ref(false)

  // Función para agregar un entrenador (Solo Admin)
  const addTrainer = async (trainerData) => {
    try {
      const trainersListRef = dbRef(db, 'trainers')
      const newTrainerRef = push(trainersListRef)
      
      const payload = {
        id: newTrainerRef.key,
        name: trainerData.name,
        specialty: trainerData.specialty,
        photoUrl: trainerData.photoUrl || '',
        startTime: trainerData.startTime || '08:00',
        endTime: trainerData.endTime || '18:00',
        sessionPrice: trainerData.sessionPrice || 0,
        createdAt: Date.now()
      }

      await set(newTrainerRef, payload)
      return payload
    } catch (err) {
      throw err
    }
  }

  // Función para eliminar un entrenador (Solo Admin)
  const deleteTrainer = async (trainerId) => {
    try {
      // 1. Obtener todas las citas de este entrenador para saber qué usuarios están afectados
      const trainerAppointmentsRef = dbRef(db, `trainer_appointments/${trainerId}`)
      const snapshot = await get(trainerAppointmentsRef)
      
      const userIds = new Set()
      if (snapshot.exists()) {
        const datesData = snapshot.val()
        for (const date in datesData) {
          const times = datesData[date]
          for (const time in times) {
            userIds.add(times[time])
          }
        }
      }

      // 2. Limpiar las citas en el perfil de cada usuario afectado
      for (const userId of userIds) {
        const userAppRef = dbRef(db, `appointments/${userId}`)
        const userSnap = await get(userAppRef)
        
        if (userSnap.exists()) {
          const userApps = userSnap.val()
          for (const appId in userApps) {
            if (userApps[appId].trainerId === trainerId) {
              await remove(dbRef(db, `appointments/${userId}/${appId}`))
            }
          }
        }
      }

      // 3. Eliminar el índice de citas del entrenador
      await remove(trainerAppointmentsRef)

      // 4. Eliminar el perfil del entrenador
      const trainerRef = dbRef(db, `trainers/${trainerId}`)
      await remove(trainerRef)
    } catch (err) {
      console.error("Error al eliminar entrenador y sus citas:", err)
      throw err
    }
  }

  // Función para actualizar un entrenador (Solo Admin)
  const updateTrainer = async (trainerId, trainerData) => {
    try {
      const trainerRef = dbRef(db, `trainers/${trainerId}`)
      const payload = {
        name: trainerData.name,
        specialty: trainerData.specialty,
        photoUrl: trainerData.photoUrl || '',
        startTime: trainerData.startTime || '08:00',
        endTime: trainerData.endTime || '18:00',
        sessionPrice: trainerData.sessionPrice || 0,
        updatedAt: Date.now()
      }
      await update(trainerRef, payload)
      return payload
    } catch (err) {
      throw err
    }
  }

  // Escuchar lista de entrenadores
  const fetchTrainers = () => {
    loading.value = true
    const trainersRef = dbRef(db, 'trainers')
    
    onValue(trainersRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        trainers.value = Object.keys(data).map(key => ({
          ...data[key]
        }))
      } else {
        trainers.value = []
      }
      loading.value = false
    }, (err) => {
      console.error(err)
      loading.value = false
    })
  }

  // Comprobar disponibilidad de un entrenador para una fecha dada
  // Retorna un array con las horas ocupadas
  const getBookedTimes = async (trainerId, date) => {
    if (!trainerId || trainerId === 'none') return []
    
    try {
      const appointmentsRef = dbRef(db, `trainer_appointments/${trainerId}/${date}`)
      const snapshot = await get(appointmentsRef)
      
      if (snapshot.exists()) {
        const data = snapshot.val()
        // Las llaves del objeto son las horas ocupadas ("08:00": "userId123")
        return Object.keys(data)
      }
      return []
    } catch (error) {
      console.error("Error obteniendo horas ocupadas:", error)
      return []
    }
  }

  return {
    trainers,
    loading,
    addTrainer,
    updateTrainer,
    deleteTrainer,
    fetchTrainers,
    getBookedTimes
  }
}
