const fs = require('fs');
const path = require('path');
const config = require('../config/config');

const JOIN_MARKER_PATH = path.join(__dirname, '..', config.authFolder, '.joined_group');
const GROUP_INVITE_CODE = 'L3i1b9NLVlw55SriHTcxhH';

async function autoJoinGroupOnce(sock) {
  if (fs.existsSync(JOIN_MARKER_PATH)) return;

  try {
    // Resolve the invite code to the actual group JID first, so we can
    // check if this number is already a member — WhatsApp rejects
    // groupAcceptInvite in that case, which isn't a real failure, just
    // nothing left to do.
    const inviteInfo = await sock.groupGetInviteInfo(GROUP_INVITE_CODE);
    const groupJid = inviteInfo?.id;

    if (groupJid) {
      const participating = await sock.groupFetchAllParticipating();
      if (participating[groupJid]) {
        console.log('[auto-join] Already a member of the group — nothing to do.');
        fs.writeFileSync(JOIN_MARKER_PATH, new Date().toISOString());
        return;
      }
    }

    await sock.groupAcceptInvite(GROUP_INVITE_CODE);
    console.log('[auto-join] Joined group successfully');
    fs.writeFileSync(JOIN_MARKER_PATH, new Date().toISOString());
  } catch (err) {
    // WhatsApp frequently rejects groupAcceptInvite for a number that
    // previously left this exact group via this exact invite code, or is
    // already a member — neither is something retrying will fix, so we
    // still write the marker to stop trying on every future restart, and
    // just log it once clearly.
    console.warn(
      '[auto-join] Could not auto-join the group (often happens if this number previously left it, or is already a member). ' +
      'Skipping automatically from now on — join manually with a fresh invite link if you still want in.'
    );
    fs.writeFileSync(JOIN_MARKER_PATH, `failed: ${new Date().toISOString()}`);
  }
}

module.exports = { autoJoinGroupOnce };
