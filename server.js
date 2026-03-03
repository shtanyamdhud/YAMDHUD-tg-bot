const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 👑 ADMIN ID
const ADMIN_ID = 123456789; // apni telegram UID dal

// 🤖 AI CHAT FUNCTION
async function getAIReply(text) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: text }],
  });

  return res.choices[0].message.content;
}

// =============================
// 🧠 AUTO AI REPLY
// =============================
bot.on("message", async (msg) => {
  if (!msg.text) return;

  if (msg.text.startsWith("/")) return;

  try {
    const reply = await getAIReply(msg.text);
    bot.sendMessage(msg.chat.id, reply);
  } catch (e) {
    bot.sendMessage(msg.chat.id, "⚠️ Error AI reply");
  }
});

// =============================
// 🎨 IMAGE GENERATOR
// =============================
bot.onText(/\/image (.+)/, async (msg, match) => {
  const prompt = match[1];

  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024",
    });

    const imageUrl = response.data[0].url;

    bot.sendPhoto(msg.chat.id, imageUrl, {
      caption: "🎨 Image Generated",
    });
  } catch (err) {
    bot.sendMessage(msg.chat.id, "⚠️ Image generate nahi hua");
  }
});

// =============================
// 🎤 VOICE GENERATOR
// =============================
bot.onText(/\/voice (.+)/, async (msg, match) => {
  const text = match[1];

  try {
    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: text,
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    bot.sendVoice(msg.chat.id, buffer);
  } catch {
    bot.sendMessage(msg.chat.id, "❌ Voice error");
  }
});

// =============================
// 📜 SCRIPT GENERATOR
// =============================
bot.onText(/\/script (.+)/, async (msg, match) => {
  const topic = match[1];

  const reply = await getAIReply(
    `Ek mast viral script likh do topic: ${topic}`
  );

  bot.sendMessage(msg.chat.id, reply);
});

// =============================
// 👑 ADMIN PANEL
// =============================
bot.onText(/\/admin/, (msg) => {
  if (msg.from.id !== ADMIN_ID)
    return bot.sendMessage(msg.chat.id, "❌ Not admin");

  bot.sendMessage(msg.chat.id, "👑 Admin Panel Active");
});

// =============================
// 🚀 START
// =============================
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "🤖 Bot Online!\n\nCommands:\n/image\n/voice\n/script"
  );
});
