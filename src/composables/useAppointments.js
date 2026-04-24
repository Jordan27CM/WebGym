import { ref } from 'vue'
import { db } from '../firebase/config'
import { ref as dbRef, push, set, onValue, query, orderByChild, equalTo } from 'firebase/database'

export function useAppointments() {
  const appointments = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Agendar nueva cita
  const scheduleAppointment = async (userId, date, time, trainerId, trainerName) => {
    error.value = null
    loading.value = true
    try {
      if (!trainerId) throw new Error("Debe seleccionar un entrenador")

      // Creamos una nueva referencia para el usuario
      const appointmentsListRef = dbRef(db, `appointments/${userId}`)
      const newAppointmentRef = push(appointmentsListRef)
      
      const appointmentData = {
        id: newAppointmentRef.key,
        date: date,
        time: time,
        trainerId: trainerId,
        trainerName: trainerName,
        timestamp: new Date(`${date}T${time}`).getTime(),
        status: 'scheduled',
        createdAt: Date.now()
      }

      await set(newAppointmentRef, appointmentData)

      // Marcamos esa hora como ocupada para el entrenador
      const trainerAppRef = dbRef(db, `trainer_appointments/${trainerId}/${date}/${time}`)
      await set(trainerAppRef, userId)

      return appointmentData
    } catch (err) {
      console.error("Error al agendar la cita:", err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Agendar múltiples citas
  const scheduleMultipleAppointments = async (userId, sessionsArray, trainerId, trainerName) => {
    error.value = null
    loading.value = true
    try {
      if (!trainerId) throw new Error("Debe seleccionar un entrenador")
      
      const promises = sessionsArray.map(async (session) => {
        const appointmentsListRef = dbRef(db, `appointments/${userId}`)
        const newAppointmentRef = push(appointmentsListRef)
        
        const appointmentData = {
          id: newAppointmentRef.key,
          date: session.date,
          time: session.time,
          trainerId: trainerId,
          trainerName: trainerName,
          timestamp: new Date(`${session.date}T${session.time}`).getTime(),
          status: 'scheduled',
          createdAt: Date.now()
        }

        await set(newAppointmentRef, appointmentData)

        const trainerAppRef = dbRef(db, `trainer_appointments/${trainerId}/${session.date}/${session.time}`)
        await set(trainerAppRef, userId)
        
        return appointmentData
      })

      return await Promise.all(promises)
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Escuchar citas del usuario
  const fetchUserAppointments = (userId) => {
    loading.value = true
    const userAppointmentsRef = dbRef(db, `appointments/${userId}`)
    
    // Escuchamos en tiempo real
    onValue(userAppointmentsRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // Convertir el objeto a array y ordenar por timestamp (las más próximas primero)
        const appsArray = Object.keys(data).map(key => ({
          ...data[key]
        }))
        // Ordenar de más reciente a más antigua
        appointments.value = appsArray.sort((a, b) => a.timestamp - b.timestamp)
      } else {
        appointments.value = []
      }
      loading.value = false
    }, (err) => {
      console.error("Error al obtener citas:", err)
      error.value = err.message
      loading.value = false
    })
  }

  return {
    appointments,
    loading,
    error,
    scheduleAppointment,
    scheduleMultipleAppointments,
    fetchUserAppointments
  }
}
