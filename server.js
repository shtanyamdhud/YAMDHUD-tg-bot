require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require('openai');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// ✅ ADMIN ID
const ADMIN_ID = process.env.ADMIN_ID;

// ========================
// 🚀 START COMMAND
// ========================
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, `
🔥 Welcome to AI BOT

Commands:
/ai - AI se baat karo
/image - image banao
/script - script likhwao
/admin - admin panel

Bas message bhejo aur AI reply karega 😎
  `);
});

// ========================
// 🧠 AI CHAT (ALL REPLY)
// ========================
bot.on('message', async (msg) => {
  if (!msg.text) return;

  // commands skip kare
  if (msg.text.startsWith('/')) return;

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: msg.text }],
    });

    bot.sendMessage(msg.chat.id, res.choices[0].message.content);
  } catch (err) {
    bot.sendMessage(msg.chat.id, "⚠️ AI error aaya");
  }
});

// ========================
// 🎨 IMAGE GENERATOR
// ========================
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

// ========================
// 🎬 SCRIPT GENERATOR
// ========================
bot.onText(/\/script (.+)/, async (msg, match) => {
  const topic = match[1];

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "user",
          content: `Ek zabardast video script likh: ${topic}`
        }
      ],
    });

    bot.sendMessage(msg.chat.id, res.choices[0].message.content);
  } catch (err) {
    bot.sendMessage(msg.chat.id, "⚠️ Script nahi bani");
  }
});

// ========================
// 👑 ADMIN PANEL
// ========================
bot.onText(/\/admin/, (msg) => {
  if (msg.from.id.toString() !== ADMIN_ID) {
    return bot.sendMessage(msg.chat.id, "❌ Tu admin nahi hai");
  }

  bot.sendMessage(msg.chat.id, `
👑 ADMIN PANEL

Commands:
/broadcast - sabko msg bhej
/stats - users count
  `);
});

// ========================
// 📢 BROADCAST SYSTEM
// ========================
let users = new Set();

bot.on('message', (msg) => {
  users.add(msg.chat.id);
});

bot.onText(/\/broadcast (.+)/, (msg, match) => {
  if (msg.from.id.toString() !== ADMIN_ID) return;

  const text = match[1];

  users.forEach(id => {
    bot.sendMessage(id, text);
  });

  bot.sendMessage(msg.chat.id, "✅ Broadcast done");
});

// ========================
// 📊 STATS
// ========================
bot.onText(/\/stats/, (msg) => {
  if (msg.from.id.toString() !== ADMIN_ID) return;

  bot.sendMessage(msg.chat.id, `👥 Total Users: ${users.size}`);
});
