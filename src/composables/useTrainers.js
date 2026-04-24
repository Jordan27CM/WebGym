import { ref } from 'vue'
import { db } from '../firebase/config'
import { ref as dbRef, push, set, remove, onValue, get } from 'firebase/database'

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
      const trainerRef = dbRef(db, `trainers/${trainerId}`)
      await remove(trainerRef)
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
    deleteTrainer,
    fetchTrainers,
    getBookedTimes
  }
}
