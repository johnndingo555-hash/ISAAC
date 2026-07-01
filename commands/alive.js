/**
 * commands/alive.js
 * -----------------
 * Checks whether the bot is alive.
 * Sends owner's profile picture with status text, and an audio clip.
 *
 * Usage: .alive
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

function downloadBuffer(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadBuffer(res.headers.location).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

module.exports = {
  name: 'alive',
  description: 'Checks if the bot is alive and running.',
  async execute(sock, msg) {
    const jid = msg.key.remoteJid;

    const ownerName = 'ISAAC';
    const ownerNumber = '254754574642';

    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const caption = `
🤖 *I AM ALIVE AND KICKING*
👑 *MY HANDSOME OWNER IS HERE*

⏱ *Uptime:* ${hours}h ${minutes}m ${seconds}s
📱 *Platform:* ${process.platform}
👤 *Owner:* ${ownerName}`.trim();

    // 1. Send owner's profile picture with caption
    try {
      const ownerJid = `${ownerNumber}@s.whatsapp.net`;
      const ppUrl = await sock.profilePictureUrl(ownerJid, 'image');
      const ppBuffer = await downloadBuffer(ppUrl);
      await sock.sendMessage(jid, { image: ppBuffer, caption }, { quoted: msg });
    } catch {
      await sock.sendMessage(jid, { text: caption }, { quoted: msg });
    }

    // 2. Send the audio clip
    const audioPath = path.join(__dirname, '../assets/alive.m4a');

    if (fs.existsSync(audioPath)) {
      await sock.sendMessage(jid, {
        audio: fs.readFileSync(audioPath),
        mimetype: 'audio/mp4',
        ptt: false
      }, { quoted: msg });
    }
  },
};
