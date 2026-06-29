/**
 * commands/stats.js
 * ----------------
 * Shows detailed bot statistics.
 *
 * Usage: !stats
 */

const os = require('os');

module.exports = {
  name: 'stats',

  description: 'Displays detailed bot statistics.',

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    // Uptime
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    // Memory usage
    const memory = process.memoryUsage();
    const ramUsed = (memory.rss / 1024 / 1024).toFixed(2);

    // System information
    const cpuModel = os.cpus()[0].model;
    const cpuCores = os.cpus().length;
    const totalRam = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
    const freeRam = (os.freemem() / 1024 / 1024 / 1024).toFixed(2);

    // Platform info
    const platform = `${os.type()} ${os.release()}`;
    const nodeVersion = process.version;

    // Current time
    const now = new Date().toLocaleString();

    const text = `
📊 *BOT STATISTICS*

🤖 *Bot:* ISAAC
🟢 *Status:* Online

⏱ *Uptime:* ${hours}h ${minutes}m ${seconds}s
💾 *RAM Used:* ${ramUsed} MB
🧠 *Total RAM:* ${totalRam} GB
📉 *Free RAM:* ${freeRam} GB

🖥 *CPU:* ${cpuModel}
⚙️ *Cores:* ${cpuCores}

🌐 *System:* ${platform}
🟩 *Node.js:* ${nodeVersion}

📅 *Time:* ${now}
`.trim();

    await sock.sendMessage(
      jid,
      { text },
      { quoted: msg }
    );
  },
};
