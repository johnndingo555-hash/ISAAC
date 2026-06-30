/*
 * Spotify Downloader Command
 * Searches YouTube for the requested track and streams the audio
 * directly via ytdl-core (no third-party proxy APIs).
 */
const ytdl = require('@distube/ytdl-core');
const yts = require('yt-search');
const config = require('../config/config');

module.exports = {
    name: 'spotify',
    description: 'Download from Spotify (name or link)',
    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;
        const prefix = config.prefix || '.';
        const text = args.join(' ').trim();

        if (!text) {
            return sock.sendMessage(jid, {
                text: `*🎵 Spotify Downloader*\n\nUsage:\n  *${prefix}spotify* _song name_\n  *${prefix}spotify* _<spotify URL>_\n\nExample: *${prefix}spotify* Shape of You Ed Sheeran`,
            }, { quoted: msg });
        }

        try {
            await sock.sendMessage(jid, { react: { text: '🎵', key: msg.key } });

            const results = await yts(text);
            const video = results.videos[0];

            if (!video) {
                return sock.sendMessage(jid, { text: `❌ No results found for: *${text}*` }, { quoted: msg });
            }

            const safeTitle = video.title.replace(/[\/\\:*?"<>|]/g, '').trim();
            const fileName = `${safeTitle}.mp3`;
            const videoUrl = `https://www.youtube.com/watch?v=${video.videoId}`;

            await sock.sendMessage(jid, {
                text: `⬇️ Found: *${video.title}*\n⏱️ ${video.timestamp}\n\nDownloading audio...`,
            }, { quoted: msg });

            // Download audio directly from YouTube into a buffer
            const chunks = [];
            await new Promise((resolve, reject) => {
                const stream = ytdl(videoUrl, { filter: 'audioonly', quality: 'highestaudio' });
                stream.on('data', (chunk) => chunks.push(chunk));
                stream.on('end', resolve);
                stream.on('error', reject);
            });

            const audioBuffer = Buffer.concat(chunks);

            if (audioBuffer.length < 1000) {
                return sock.sendMessage(jid, {
                    text: '❌ Download failed — the audio stream was empty. Please try again later.',
                }, { quoted: msg });
            }

            await sock.sendMessage(jid, {
                audio: audioBuffer,
                mimetype: 'audio/mpeg',
                fileName,
            }, { quoted: msg });

            await sock.sendMessage(jid, { text: `✅ Successfully downloaded: *${safeTitle}*` }, { quoted: msg });
        } catch (err) {
            console.error(err);
            await sock.sendMessage(jid, { text: '❌ An internal error occurred while processing your request.' }, { quoted: msg });
        }
    },
};
