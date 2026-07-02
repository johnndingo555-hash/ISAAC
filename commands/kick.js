module.exports = {
  name: "kick",
  description: "Kick a member from a group",

  execute: async (sock, msg) => {
    try {
      const jid = msg.key.remoteJid;

      if (!jid.endsWith("@g.us")) {
        return await sock.sendMessage(
          jid,
          { text: "❌ This command only works in groups." },
          { quoted: msg }
        );
      }

      const metadata = await sock.groupMetadata(jid);
      const participants = metadata.participants || [];

      const normalizeJid = (id) =>
        id?.split("@")[0]?.split(":")[0];

      const senderJid =
        msg.key.participant ||
        msg.participant ||
        msg.key.remoteJid;

      const sender = normalizeJid(senderJid);

      const isSenderAdmin = participants.some(
        (p) =>
          normalizeJid(p.id) === sender &&
          (p.admin === "admin" || p.admin === "superadmin")
      );

      if (!isSenderAdmin) {
        return await sock.sendMessage(
          jid,
          { text: "❌ Only group admins can use this command." },
          { quoted: msg }
        );
      }

      const quoted =
        msg.message?.extendedTextMessage?.contextInfo?.participant;

      if (!quoted) {
        return await sock.sendMessage(
          jid,
          { text: "❌ Reply to a user's message to kick them." },
          { quoted: msg }
        );
      }

      const target = normalizeJid(quoted);

      if (target === sender) {
        return await sock.sendMessage(
          jid,
          { text: "❌ You cannot kick yourself." },
          { quoted: msg }
        );
      }

      const targetParticipant = participants.find(
        (p) => normalizeJid(p.id) === target
      );

      if (!targetParticipant) {
        return await sock.sendMessage(
          jid,
          { text: "❌ User not found in this group." },
          { quoted: msg }
        );
      }

      if (
        targetParticipant.admin === "admin" ||
        targetParticipant.admin === "superadmin"
      ) {
        return await sock.sendMessage(
          jid,
          { text: "❌ I cannot remove another admin." },
          { quoted: msg }
        );
      }

      try {
        await sock.groupParticipantsUpdate(
          jid,
          [quoted],
          "remove"
        );

        await sock.sendMessage(
          jid,
          { text: "✅ User removed successfully." },
          { quoted: msg }
        );
      } catch (err) {
        console.error("[kick remove error]", err);

        await sock.sendMessage(
          jid,
          {
            text:
              "❌ Failed to remove user. Make sure I am a group admin."
          },
          { quoted: msg }
        );
      }
    } catch (err) {
      console.error("[kick command error]", err);

      await sock.sendMessage(
        msg.key.remoteJid,
        {
          text: `❌ Error: ${err.message}`
        },
        { quoted: msg }
      );
    }
  },
};
