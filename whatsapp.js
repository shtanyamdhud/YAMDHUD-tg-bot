const { default: makeWASocket } = require("@whiskeysockets/baileys");

async function startWhatsApp() {
  const sock = makeWASocket();

  sock.ev.on("messages.upsert", async (m) => {
    const msg = m.messages[0];

    if (!msg.message) return;

    const text = msg.message.conversation;

    if (text) {
      await sock.sendMessage(msg.key.remoteJid, {
        text: "🤖 AI Reply: " + text
      });
    }
  });
}

startWhatsApp();
