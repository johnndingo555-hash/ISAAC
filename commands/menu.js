/**
 * commands/menu.js
 * ----------------
 * Displays a nicely formatted menu of the bot's features. This is similar
 * to !help, but intended as a more "branded" / decorative presentation
 * you can customize freely (emojis, sections, ASCII borders, etc.).
 *
 * Usage: !menu
 */

const config = require('../config/config');

module.exports = {
  name: 'menu',
  description: 'Displays a formatted menu of bot features.',

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    // WhatsApp supports a small subset of Markdown-like formatting:
    // *bold*, _italic_, ~strikethrough~, and ``` for monospace blocks.
    const menuText = `
╭───────────────────╮
   *${config.botName}*
╰───────────────────╯

📋 *Menu*

🔹 ${config.prefix}ping — Test if the bot is alive
🔹 ${config.prefix}help — List all commands
🔹 ${config.prefix}menu — Show this menu

_Prefix: "${config.prefix}"_
`.trim();

    await sock.sendMessage(jid, { text: menuText }, { quoted: msg });
  },
};
