// Utilidad para QR dinámico con rotación cada 30 minutos
const SLOT_DURATION_MS = 30 * 60 * 1000 // 30 minutos

export function getCurrentSlot() {
  return Math.floor(Date.now() / SLOT_DURATION_MS)
}

export function generateQRValue(uid) {
  const slot = getCurrentSlot()
  return `${uid}|${slot}`
}

export function parseQRValue(qrText) {
  const parts = qrText.split('|')
  if (parts.length !== 2) return null

  const uid = parts[0]
  const scannedSlot = parseInt(parts[1])
  const currentSlot = getCurrentSlot()

  // Aceptar slot actual o el anterior (tolerancia de ~30 min)
  if (scannedSlot === currentSlot || scannedSlot === currentSlot - 1) {
    return { uid, valid: true }
  }

  return { uid, valid: false }
}

// Milisegundos hasta el próximo cambio de slot
export function msUntilNextSlot() {
  const now = Date.now()
  const nextSlot = (Math.floor(now / SLOT_DURATION_MS) + 1) * SLOT_DURATION_MS
  return nextSlot - now
}
