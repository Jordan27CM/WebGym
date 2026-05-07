const { onValueCreated } = require("firebase-functions/v2/database");
const { logger } = require("firebase-functions");
const twilio = require("twilio");
const admin = require("firebase-admin");

admin.initializeApp();

// ============================================================================
// CONFIGURACIÓN DE TWILIO WHATSAPP (A rellenar)
// ============================================================================
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER;
const RECIPIENT_NUMBER = process.env.RECIPIENT_NUMBER;
// ============================================================================

exports.enviarNotificacionReserva = onValueCreated("/reservas/{reservaId}", async (event) => {
  const reservaData = event.data.val();
  if (!reservaData) return;

  logger.info("Nueva reserva detectada:", reservaData);

  const nombreCliente = reservaData.nombreCliente || reservaData.nombre || "Cliente";
  const fechaHora = reservaData.fecha || reservaData.fechaReserva || "Pronto";

  // Inicializamos el cliente de Twilio
  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  try {
    const message = await client.messages.create({
      body: `¡Hola! Tienes una nueva reserva confirmada para ${nombreCliente} el día/hora: ${fechaHora}.`,
      from: TWILIO_WHATSAPP_NUMBER,
      to: RECIPIENT_NUMBER
    });

    logger.info("✅ Mensaje de WhatsApp (Twilio) enviado correctamente. SID:", message.sid);

  } catch (error) {
    logger.error("❌ Error al enviar mensaje por Twilio:", error.message);
  }
});
