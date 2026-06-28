/**
 * commands/mute.js
 * ----------------
 * Restricts the group so only admins can send messages ("Group Settings >
 * Send Messages > Only admins" in the WhatsApp UI). Admin-only command.
 *
 * Usage: !mute    (locks the group)
 *        !mute off  unlocks the group again
 */
module.exports = {
  name: 'mute',
  description: 'Restricts the group to admins-only messaging. Use "!mute off" to unmute.',
  /**
   * @param {object} sock
   * @param {object} msg
   * @param {string[]} args
   */
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;

    if (!jid.endsWith('@g.us')) {
      await sock.sendMessage(jid, { text: '❌ This command only works in groups.' }, { quoted: msg });
      return;
    }

    const metadata = await sock.groupMetadata(jid);
    const senderJid = msg.key.participant || msg.key.remoteJid;
    const botJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

    const isSenderAdmin = metadata.participants.some(
      (p) => p.id === senderJid && (p.admin === 'admin' || p.admin === 'superadmin')
    );
    const isBotAdmin = metadata.participants.some(
      (p) => p.id === botJid && (p.admin === 'admin' || p.admin === 'superadmin')
    );

    if (!isSenderAdmin) {
      await sock.sendMessage(jid, { text: '❌ Only group admins can use this command.' }, { quoted: msg });
      return;
    }
    if (!isBotAdmin) {
      await sock.sendMessage(
        jid,
        { text: '❌ I need to be a group admin to change group settings.' },
        { quoted: msg }
      );
      return;
    }

    const turningOff = args[0]?.toLowerCase() === 'off';
    await sock.groupSettingUpdate(jid, turningOff ? 'not_announcement' : 'announcement');

    const replyText = turningOff
      ? '🔓 Group unmuted — everyone can send messages again.'
      : '🔒 Group muted — only admins can send messages now.';
    await sock.sendMessage(jid, { text: replyText }, { quoted: msg });
  },
};
