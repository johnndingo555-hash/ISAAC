/**
 * commands/vision.js
 * -------------------
 * Analyzes a replied image using Google Gemini Vision.
 * Usage: reply to an image with .vision <question>
 */
const https = require('https');
const { downloadMediaMessage } = require('@whiskeysockets/baileys');

require('dotenv').config();
const GEMINI_KEY = process.env.GEMINI_KEY;

function httpsPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      { hostname, path, method: 'POST', headers: { ...headers, 'Content-Length': Buffer.byteLength(data) } },
      (res) => {
        let raw = '';
        res.on('data', (chunk) => (raw += chunk));
        res.on('end', () => {
          try { resolve(JSON.parse(raw)); }
          catch { resolve({ error: raw }); }
        });
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

module.exports = {
  name: 'vision',
  description: 'Analyze a replied image using Gemini Vision. Usage: reply to an image with .vision your question',
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const ctx = msg.message?.extendedTextMessage?.contextInfo;
    const quoted = ctx?.quotedMessage;

    if (!quoted?.imageMessage) {
      return sock.sendMessage(jid, { text: '❌ Reply to an image with .vision your question' }, { quoted: msg });
    }

    const query = args.join(' ');
    if (!query) {
      return sock.sendMessage(jid, { text: '❌ Ask a question. Usage: reply to an image with .vision your question' }, { quoted: msg });
    }

    await sock.sendMessage(jid, { text: '👁️ Analyzing image...' }, { quoted: msg });

    try {
      const media = await downloadMediaMessage(
        { message: quoted, key: { remoteJid: jid, id: ctx.stanzaId, participant: ctx.participant } },
        'buffer',
        {},
        { logger: console }
      );

      const base64Image = media.toString('base64');

      const res = await httpsPost(
        'generativelanguage.googleapis.com',
        `/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        { 'Content-Type': 'application/json' },
        {
          contents: [{
            parts: [
              { text: query },
              { inline_data: { mime_type: 'image/jpeg', data: base64Image } },
            ],
          }],
        }
      );

      const reply = res?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!reply) throw new Error('No response');

      await sock.sendMessage(jid, { text: `👁️ *Vision AI*\n\n${reply}` }, { quoted: msg });
    } catch (error) {
      await sock.sendMessage(jid, { text: '❌ Vision error: ' + error.message }, { quoted: msg });
    }
  },
};
