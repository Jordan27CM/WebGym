import { ref, computed } from 'vue'
import { db } from '../firebase/config'
import { ref as dbRef, push, set, update, onValue, query, orderByChild, get } from 'firebase/database'

export function useAttendance() {
  const attendanceRecords = ref([])
  const activeSession = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Registrar entrada (check-in)
  const checkIn = async (userId, userName = '') => {
    try {
      loading.value = true
      const now = Date.now()
      const today = new Date().toISOString().split('T')[0]

      const attendanceListRef = dbRef(db, `attendance/${userId}`)
      const newRef = push(attendanceListRef)

      const record = {
        id: newRef.key,
        checkIn: now,
        checkOut: null,
        date: today,
        duration: null,
        userName: userName
      }

      await set(newRef, record)
      return record
    } catch (err) {
      console.error('Error al registrar entrada:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Registrar salida (check-out)
  const checkOut = async (userId, attendanceId, checkInTime) => {
    try {
      loading.value = true
      const now = Date.now()
      const durationMs = now - checkInTime
      // Mínimo 1 minuto para evitar que duration=0 sea tratado como falsy
      const durationMinutes = Math.max(1, Math.round(durationMs / 60000))

      const recordRef = dbRef(db, `attendance/${userId}/${attendanceId}`)
      await update(recordRef, {
        checkOut: now,
        duration: durationMinutes
      })

      return { checkOut: now, duration: durationMinutes }
    } catch (err) {
      console.error('Error al registrar salida:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Buscar sesión activa (entrada sin salida) de un usuario
  const findActiveSession = async (userId) => {
    try {
      const attendanceRef = dbRef(db, `attendance/${userId}`)
      const snapshot = await get(attendanceRef)

      if (!snapshot.exists()) return null

      const data = snapshot.val()
      // Buscar registro sin checkOut (sesión abierta). En Firebase los null no se guardan, quedan como undefined.
      for (const key in data) {
        if (!data[key].checkOut) {
          return { ...data[key], id: key }
        }
      }
      return null
    } catch (err) {
      console.error('Error buscando sesión activa:', err)
      return null
    }
  }

  // Escuchar historial de asistencia del usuario en tiempo real
  const fetchUserAttendance = (userId) => {
    loading.value = true
    const attendanceRef = dbRef(db, `attendance/${userId}`)

    onValue(attendanceRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        const records = Object.keys(data).map(key => ({
          ...data[key],
          id: key
        }))
        // Ordenar por checkIn más reciente primero
        attendanceRecords.value = records.sort((a, b) => b.checkIn - a.checkIn)

        // Detectar sesión activa
        activeSession.value = records.find(r => !r.checkOut) || null
      } else {
        attendanceRecords.value = []
        activeSession.value = null
      }
      loading.value = false
    }, (err) => {
      console.error('Error al obtener asistencia:', err)
      error.value = err.message
      loading.value = false
    })
  }

  // Obtener registros de asistencia de TODOS los usuarios para una fecha específica (Admin)
  const fetchAllAttendanceForDate = async (date) => {
    try {
      const attendanceRef = dbRef(db, 'attendance')
      const snapshot = await get(attendanceRef)

      if (!snapshot.exists()) return []

      const allData = snapshot.val()
      const records = []

      for (const userId in allData) {
        for (const recordId in allData[userId]) {
          const record = allData[userId][recordId]
          if (record.date === date) {
            records.push({
              ...record,
              id: recordId,
              userId: userId
            })
          }
        }
      }

      return records.sort((a, b) => b.checkIn - a.checkIn)
    } catch (err) {
      console.error('Error al obtener asistencia general:', err)
      return []
    }
  }

  // ===== ESTADÍSTICAS CALCULADAS =====

  // Registros del mes actual
  const currentMonthRecords = computed(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    return attendanceRecords.value.filter(r => {
      const d = new Date(r.checkIn)
      return d.getFullYear() === year && d.getMonth() === month
    })
  })

  // Días únicos asistidos este mes
  const daysThisMonth = computed(() => {
    const uniqueDays = new Set(currentMonthRecords.value.map(r => r.date))
    return uniqueDays.size
  })

  // Tiempo total en minutos este mes (solo sesiones cerradas)
  const totalMinutesThisMonth = computed(() => {
    return currentMonthRecords.value
      .filter(r => r.duration != null) // Solo registros con duración (!=null cubre el 0)
      .reduce((sum, r) => sum + r.duration, 0)
  })

  // Tiempo promedio por visita en minutos
  const avgMinutesPerVisit = computed(() => {
    const closed = currentMonthRecords.value.filter(r => r.duration != null)
    if (closed.length === 0) return 0
    const total = closed.reduce((sum, r) => sum + r.duration, 0)
    return Math.round(total / closed.length)
  })

  // Formatear minutos a horas y minutos
  const formatDuration = (minutes) => {
    if (minutes === null || minutes === undefined) return '—'
    const h = Math.floor(minutes / 60)
    const m = minutes % 60
    if (h === 0) return `${m} min`
    return `${h}h ${m}m`
  }

  return {
    attendanceRecords,
    activeSession,
    loading,
    error,
    checkIn,
    checkOut,
    findActiveSession,
    fetchUserAttendance,
    fetchAllAttendanceForDate,
    currentMonthRecords,
    daysThisMonth,
    totalMinutesThisMonth,
    avgMinutesPerVisit,
    formatDuration
  }
}
