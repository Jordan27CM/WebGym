const { onValueCreated } = require("firebase-functions/v2/database");
const { logger } = require("firebase-functions");
const twilio = require("twilio");
const admin = require("firebase-admin");
require("dotenv").config();

admin.initializeApp();

// ============================================================================
// CONFIGURACIÓN DE TWILIO WHATSAPP
// ============================================================================
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
const RECIPIENT_NUMBER = process.env.RECIPIENT_NUMBER;
// ============================================================================

// Escucha en la ruta correcta: /appointments/{userId}/{appointmentId}
exports.enviarNotificacionReserva = onValueCreated(
  "/appointments/{userId}/{appointmentId}",
  async (event) => {
    const reservaData = event.data.val();
    if (!reservaData) return;

    logger.info("Nueva reserva detectada:", JSON.stringify(reservaData));
    logger.info("Variables Twilio cargadas:", {
      sid: TWILIO_ACCOUNT_SID ? "✅ Presente" : "❌ Falta",
      token: TWILIO_AUTH_TOKEN ? "✅ Presente" : "❌ Falta",
      from: TWILIO_WHATSAPP_NUMBER || "❌ Falta",
      to: RECIPIENT_NUMBER || "❌ Falta",
    });

    const trainerName = reservaData.trainerName || "Entrenador";
    const fecha = reservaData.date || "Sin fecha";
    const hora = reservaData.time || "Sin hora";

    // Inicializamos el cliente de Twilio
    const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

    try {
      const message = await client.messages.create({
        body: `🏋️ ¡Nueva reserva en WebGym!\n\n📅 Fecha: ${fecha}\n⏰ Hora: ${hora}\n👤 Entrenador: ${trainerName}\n\nEstado: Confirmada ✅`,
        from: TWILIO_WHATSAPP_NUMBER,
        to: RECIPIENT_NUMBER,
      });

      logger.info("✅ Mensaje de WhatsApp enviado. SID:", message.sid);
    } catch (error) {
      logger.error("❌ Error al enviar mensaje por Twilio:", error.message);
      logger.error("Detalle completo del error:", JSON.stringify(error));
    }
  }
);
