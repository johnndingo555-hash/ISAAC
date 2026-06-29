/**
 * commands/ping.js
 * ----------------
 * Advanced bot health-check command.
 *
 * Usage: !ping
 */

const os = require('os');

module.exports = {
  name: 'ping',

  description: 'Shows bot status, speed, uptime, memory usage, and system information.',

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    // Start timer
    const start = process.hrtime.bigint();

    // Uptime
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    // Memory usage (MB)
    const ram = process.memoryUsage().rss / 1024 / 1024;

    // Node.js version
    const nodeVersion = process.version;

    // Operating system
    const platform = `${os.type()} ${os.release()}`;

    // Current date & time
    const now = new Date().toLocaleString();

    // Total chats known by the bot
    const totalChats = Object.keys(sock.chats || {}).length;

    // End timer
    const end = process.hrtime.bigint();
    const speed = Number(end - start) / 1e6;

    const text = `
🏓 *PONG!*

⚡ *Speed:* ${speed.toFixed(2)} ms
⏱ *Uptime:* ${hours}h ${minutes}m ${seconds}s
💾 *RAM:* ${ram.toFixed(2)} MB
👥 *Chats:* ${totalChats}
🖥 *Node:* ${nodeVersion}
🌐 *System:* ${platform}
📅 *Time:* ${now}
🟢 *Status:* Online
`.trim();

    await sock.sendMessage(
      jid,
      { text },
      { quoted: msg }
    );
  },
};
