const TelegramBot = require("node-telegram-bot-api");
const OpenAI = require("openai");
const fs = require("fs");

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 🔐 ADMIN ID
const ADMIN_ID = 123456789; // apni Telegram UID daal

// 🤖 AI REPLY FUNCTION
async function getAIReply(text) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: text }],
  });

  return res.choices[0].message.content;
}

// ===============================
// 🎬 REEL GENERATOR
// ===============================
bot.onText(/\/reel (.+)/, async (msg, match) => {
  const topic = match[1];

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Tum viral Instagram reel script writer ho" },
        { role: "user", content: topic },
      ],
    });

    const reel = res.choices[0].message.content;

    bot.sendMessage(msg.chat.id, "🎬 REEL SCRIPT:\n\n" + reel);
  } catch {
    bot.sendMessage(msg.chat.id, "❌ Reel error");
  }
});

// ===============================
// 🖼 IMAGE GENERATOR
// ===============================
bot.onText(/\/image (.+)/, async (msg, match) => {
  const prompt = match[1];

  try {
    const img = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
    });

    const image_base64 = img.data[0].b64_json;
    const buffer = Buffer.from(image_base64, "base64");

    fs.writeFileSync("image.png", buffer);

    bot.sendPhoto(msg.chat.id, "image.png");
  } catch {
    bot.sendMessage(msg.chat.id, "❌ Image error");
  }
});

// ===============================
// 🔊 VOICE GENERATOR
// ===============================
bot.onText(/\/voice (.+)/, async (msg, match) => {
  const text = match[1];

  try {
    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: text,
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    fs.writeFileSync("voice.mp3", buffer);

    bot.sendAudio(msg.chat.id, "voice.mp3");
  } catch {
    bot.sendMessage(msg.chat.id, "❌ Voice error");
  }
});

// ===============================
// 🧠 SCRIPT GENERATOR
// ===============================
bot.onText(/\/script (.+)/, async (msg, match) => {
  const topic = match[1];

  const reply = await getAIReply("Ek powerful script likh: " + topic);

  bot.sendMessage(msg.chat.id, "🧠 SCRIPT:\n\n" + reply);
});

// ===============================
// 🔐 ADMIN PANEL
// ===============================
bot.onText(/\/admin/, (msg) => {
  if (msg.from.id !== ADMIN_ID) {
    return bot.sendMessage(msg.chat.id, "❌ Not admin");
  }

  bot.sendMessage(msg.chat.id, "👑 ADMIN PANEL:\n\n/restart\n/status");
});

bot.onText(/\/status/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;

  bot.sendMessage(msg.chat.id, "✅ Bot running perfectly 🚀");
});

// ===============================
// 🤖 AUTO AI CHAT
// ===============================
bot.on("message", async (msg) => {
  if (!msg.text) return;

  if (msg.text.startsWith("/")) return;

  try {
    const reply = await getAIReply(msg.text);
    bot.sendMessage(msg.chat.id, reply);
  } catch {
    bot.sendMessage(msg.chat.id, "❌ AI error");
  }
});
