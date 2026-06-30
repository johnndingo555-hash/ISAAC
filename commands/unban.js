/**
 * commands/unban.js
 * -------------------
 * Removes a user from the ban list. Owner-only.
 * Usage:
 *   .unban @user        (mention)
 *   .unban (as a reply to the target's message)
 */
const config = require('../config/config');
const { unbanUser, isBanned } = require('../utils/banList');

module.exports = {
    name: 'unban',
    description: 'Unbans a user, restoring their access to bot commands (owner only).',
    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const senderNumber = senderJid.split('@')[0].split(':')[0];

        if (senderNumber !== config.ownerNumber) {
            return sock.sendMessage(jid, { text: '❌ Only the bot owner can use this command.' }, { quoted: msg });
        }

        const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        const repliedTo = msg.message?.extendedTextMessage?.contextInfo?.participant;
        const target = mentioned || repliedTo;

        if (!target) {
            return sock.sendMessage(jid, {
                text: '❌ Mention a user or reply to their message.\n\nUsage: *.unban @user* or reply to their message with *.unban*',
            }, { quoted: msg });
        }

        if (!isBanned(target)) {
            return sock.sendMessage(jid, { text: `ℹ️ @${target.split('@')[0]} is not banned.`, mentions: [target] }, { quoted: msg });
        }

        unbanUser(target);

        await sock.sendMessage(jid, {
            text: `✅ @${target.split('@')[0]} has been unbanned.`,
            mentions: [target],
        }, { quoted: msg });
    },
};
