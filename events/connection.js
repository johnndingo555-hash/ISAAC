/**
 * events/connection.js
 * --------------------
 * Handles the 'connection.update' event from Baileys.
 *
 * This event fires whenever the bot's connection state to WhatsApp changes,
 * for example:
 *   - 'connecting'  -> the socket is attempting to connect
 *   - 'open'        -> successfully connected and ready to send/receive
 *   - 'close'       -> disconnected (we decide here whether to reconnect)
 *
 * It's also responsible for printing the QR code to the terminal so the
 * user can link their WhatsApp account on first run.
 */

const qrcode = require('qrcode-terminal');
const { DisconnectReason } = require('@whiskeysockets/baileys');
const logger = require('../utils/logger');

/**
 * Registers the connection update listener on the given socket.
 *
 * @param {object} sock - the Baileys socket instance
 * @param {Function} startBot - reference to the bot startup function,
 *                              used to reconnect automatically when needed
 */
function registerConnectionHandler(sock, startBot, wasAlreadyRegistered) {
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    // A new QR code was generated — render it directly in the terminal so
    // the user can scan it with WhatsApp > Linked Devices > Link a Device.
    if (qr) {
      logger.info('Scan the QR code below with WhatsApp to log in:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'connecting') {
      logger.info('Connecting to WhatsApp...');
    }

    if (connection === 'open') {
  logger.info('✅ Connected to WhatsApp successfully!');

  if (wasAlreadyRegistered) {
    const selfJid = sock.user.id;

    sock.sendMessage(selfJid, {
      text: '🤖 *ISAAC-MD has started running*',
    }).catch((err) => logger.error('Failed to send startup message:', err));
  }
}

if (connection === 'close') {
      // lastDisconnect.error contains a Boom error with a statusCode that
      // tells us *why* we got disconnected, which determines whether we
      // should attempt to reconnect automatically.
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const isLoggedOut = statusCode === DisconnectReason.loggedOut;

      if (isLoggedOut) {
        // The user manually logged out / unlinked the device from their
        // phone. Reconnecting won't help here — the auth session is dead,
        // so we just log this and stop. The user needs to delete the auth
        // folder and re-scan the QR code to start a fresh session.
        logger.error(
          '❌ Connection closed: logged out. Delete the auth folder and restart to re-link.'
        );
      } else {
        // Any other disconnect reason (network blip, server restart, etc.)
        // is usually transient, so we attempt to reconnect automatically.
        logger.warn('⚠️ Connection closed unexpectedly. Reconnecting...');
        startBot();
      }
    }
  });
}

module.exports = { registerConnectionHandler };
