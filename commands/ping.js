/**
 * commands/ping.js
 * ----------------
 * Simple health-check command. Useful to quickly verify the bot is online
 * and responding to messages.
 *
 * Usage: !ping
 */

module.exports = {
  // The keyword that triggers this command (without the prefix).
  name: 'ping',

  // Short description shown in the !help command.
  description: 'Checks if the bot is online and responsive.',

  /**
   * Executes the command.
   *
   * @param {object} sock - the active Baileys socket connection, used to send messages
   * @param {object} msg - the raw message object received from WhatsApp
   * @param {string[]} args - any words typed after the command (unused here)
   */
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid; // the chat ID to reply to (user or group)
    await sock.sendMessage(jid, { text: 'Pong! 🏓' }, { quoted: msg });
  },
};
