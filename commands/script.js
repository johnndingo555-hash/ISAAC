const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'script',
  description: 'Shows the GitHub repository.',

  async execute(sock, msg) {
    const jid = msg.key.remoteJid;

    const caption = `
╭━━〔 📜 ISAAC SCRIPT 〕━━⬣

👑 Owner: kingplayboi
🤖 Bot: ISAAC BOT

🔗 GitHub:
https://github.com/kingplayboi/ISAAC

⭐ Please star and fork the repository!

╰━━━━━━━━━━━━━━⬣
`.trim();

await sock.sendMessage(
  jid,
  { text: caption },
  { quoted: msg }
);
