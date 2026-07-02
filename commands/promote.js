/**
 * commands/promote.js
 * -------------------
 * Promotes a mentioned/replied-to member to group admin. Admin-only.
 *
 * Usage: !promote @user
 *    or: reply to the target's message with !promote
 */
module.exports = {
  name: 'promote',
  description: 'Promotes a mentioned member to group admin (admin only).',
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith('@g.us')) {
      await sock.sendMessage(jid, { text: '❌ This command only works in groups.' }, { quoted: msg });
      return;
    }

    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const repliedTo = msg.message?.extendedTextMessage?.contextInfo?.participant;
    const targetJid = mentioned[0] || repliedTo;

    if (!targetJid) {
      await sock.sendMessage(
        jid,
        { text: '❌ Mention the person to promote, or reply to one of their messages with !promote.' },
        { quoted: msg }
      );
      return;
    }

const normalizeJid = (jid) =>
  jid?.split('@')[0].split(':')[0];
const metadata = await sock.groupMetadata(jid);
const senderJid = msg.key.participant || msg.key.remoteJid;
const botJid = sock.user.id;

const isSenderAdmin = metadata.participants.some(
  (p) =>
    normalizeJid(p.id) === normalizeJid(senderJid) &&
    !!p.admin
);

const isBotAdmin = metadata.participants.some(
  (p) =>
    normalizeJid(p.id) === normalizeJid(botJid) &&
    !!p.admin
);
    if (!isSenderAdmin) {
      await sock.sendMessage(jid, { text: '❌ Only group admins can use this command.' }, { quoted: msg });
      return;
    }
    if (!isBotAdmin) {
      await sock.sendMessage(
        jid,
        { text: '❌ I need to be a group admin to promote members.' },
        { quoted: msg }
      );
      return;
    }

    await sock.groupParticipantsUpdate(jid, [targetJid], 'promote');
    await sock.sendMessage(
      jid,
      { text: `⬆️ Promoted @${targetJid.split('@')[0]} to admin.`, mentions: [targetJid] },
      { quoted: msg }
    );
  },
};
