const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const OpenAI = require("openai");

const app = express();

// 🔐 ENV
const TOKEN = process.env.TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const OPENAI_KEY = process.env.OPENAI_KEY;

const bot = new TelegramBot(TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: OPENAI_KEY });

// 🌐 SERVER
app.get("/", (req, res) => res.send("🔥 BOT RUNNING"));
app.listen(process.env.PORT || 3000);

// ==============================
// 🎬 SCRIPT GENERATOR
// ==============================
bot.onText(/\/script (.+)/, async (msg, match) => {
  const topic = match[1];

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a viral video script writer." },
        { role: "user", content: topic }
      ]
    });

    bot.sendMessage(msg.chat.id, "🎬 SCRIPT:\n\n" + res.choices[0].message.content);
  } catch {
    bot.sendMessage(msg.chat.id, "❌ Script error");
  }
});

// ==============================
// 🖼️ IMAGE GENERATOR
// ==============================
bot.onText(/\/image (.+)/, async (msg, match) => {
  const prompt = match[1];

  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024"
    });

    const imageUrl = response.data[0].url;

    bot.sendPhoto(msg.chat.id, imageUrl, {
      caption: "🎨 Image Generated"
    });

  } catch (err) {
    bot.sendMessage(msg.chat.id, "⚠️ Image generate nahi hua");
  }
});

// ==============================
// 🎤 VOICE GENERATOR
// ==============================
bot.onText(/\/voice (.+)/, async (msg, match) => {
  const text = match[1];

  try {
    const speech = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts",
      voice: "alloy",
      input: text
    });

    const buffer = Buffer.from(await speech.arrayBuffer());
    require("fs").writeFileSync("voice.mp3", buffer);

    bot.sendAudio(msg.chat.id, "voice.mp3");
  } catch {
    bot.sendMessage(msg.chat.id, "❌ Voice error");
  }
});

// ==============================
// 👑 ADMIN PANEL
// ==============================
bot.onText(/\/admin/, (msg) => {
  if (msg.from.id != ADMIN_ID)
    return bot.sendMessage(msg.chat.id, "❌ Not admin");

  bot.sendMessage(msg.chat.id, "👑 ADMIN PANEL ACTIVE");
});

// ==============================
// 🤖 AI AUTO REPLY
// ==============================
async function getAIReply(text) {
  const res = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: text }]
  });

  return res.choices[0].message.content;
}

bot.on("message", async (msg) => {
  if (!msg.text) return;

  // ❌ command ignore
  if (msg.text.startsWith("/")) return;

  try {
    const reply = await getAIReply(msg.text);
    bot.sendMessage(msg.chat.id, reply);
  } catch {
    bot.sendMessage(msg.chat.id, "❌ AI error");
  }
});
