# WhatsApp Bot Starter (Baileys + Node.js)

A clean, beginner-friendly starter template for building a WhatsApp bot using
[Baileys](https://github.com/WhiskeySockets/Baileys) — a WebSocket-based
library that connects to WhatsApp Web without needing a headless browser.

This template uses plain **JavaScript** (no TypeScript), and is organized so
you can add new commands without touching any core logic.

---

## ✨ Features

- 🔌 Auto-reconnect on disconnects (except when logged out)
- 📱 QR code login printed directly in the terminal
- 🧩 Auto-loading commands from the `commands/` folder
- 🗂️ Clean folder structure (`commands/`, `events/`, `config/`, `utils/`)
- 🛡️ Error handling at every layer (per-message, per-command, and global)
- 📝 Built-in logger (via `pino`)

### Included commands

| Command | Description                          |
|---------|---------------------------------------|
| `!ping` | Replies with "Pong!" to confirm the bot is alive |
| `!help` | Lists all available commands          |
| `!menu` | Shows a nicely formatted menu         |

---

## 📁 Project Structure

```
whatsapp-bot/
├── commands/             # One file per command — auto-loaded at startup
│   ├── ping.js
│   ├── help.js
│   └── menu.js
├── events/               # Baileys event listeners
│   ├── connection.js     # Handles QR code + connection state
│   └── messages.js       # Parses incoming messages & dispatches commands
├── config/
│   └── config.js         # All configurable settings (prefix, bot name, etc.)
├── utils/
│   ├── logger.js         # Shared pino logger instance
│   └── commandLoader.js  # Scans commands/ and loads them dynamically
├── index.js              # Application entry point
├── package.json
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A WhatsApp account on your phone (used to scan the QR code)

### 2. Installation

```bash
# Clone or copy this project, then install dependencies
npm install
```

### 3. Run the bot

```bash
npm start
```

On first run, a QR code will be printed in your terminal. Open WhatsApp on
your phone:

1. Go to **Settings → Linked Devices**
2. Tap **Link a Device**
3. Scan the QR code shown in your terminal

Once connected, you'll see:

```
✅ Connected to WhatsApp successfully!
```

Your login session is saved in the `auth_info_baileys/` folder, so you won't
need to scan the QR code again on future restarts — unless you log out from
your phone or delete that folder.

### 4. Try it out

Send any of these messages to the number you linked (or to a chat where the
bot is present):

```
!ping
!help
!menu
```

---

## 🧩 Adding a New Command

1. Create a new file inside `commands/`, e.g. `commands/echo.js`
2. Export an object with this shape:

```js
module.exports = {
  name: 'echo',                       // triggered with !echo
  description: 'Repeats back your message.',

  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const text = args.join(' ') || 'You said nothing!';
    await sock.sendMessage(jid, { text }, { quoted: msg });
  },
};
```

3. Restart the bot (`npm start`). That's it — `!echo` is now live, and it
   will automatically appear in `!help`.

No other file needs to be touched. The `commandLoader.js` utility scans the
`commands/` folder at startup and registers anything that exports a valid
`{ name, execute }` shape.

---

## ⚙️ Configuration

All settings live in `config/config.js`:

```js
module.exports = {
  prefix: '!',              // change the command prefix
  botName: 'Baileys Starter Bot',
  authFolder: 'auth_info_baileys',
  logLevel: 'silent',
  debugMessages: true,      // logs every incoming message to the console
};
```

---

## 🛠️ Development

For automatic restarts on file changes during development:

```bash
npm run dev
```

(This uses `nodemon`, included as a dev dependency.)

---

## 🔒 Security Notes

- **Never commit the `auth_info_baileys/` folder** — it contains credentials
  that grant full access to your linked WhatsApp account. It's already
  excluded via `.gitignore`.
- This bot uses an **unofficial** library that connects via the WhatsApp Web
  protocol. Using bots is against WhatsApp's Terms of Service and may result
  in your number being banned — use a secondary/test number, not your
  primary one.

---

## 📚 Learn More

- [Baileys GitHub Repository](https://github.com/WhiskeySockets/Baileys)
- [Pino Logger Docs](https://getpino.io/)

---

## 📄 License

MIT — free to use and modify for personal or commercial projects.
