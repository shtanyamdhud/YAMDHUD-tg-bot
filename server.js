const TelegramBot = require("node-telegram-bot-api");
const express = require("express");
const mongoose = require("mongoose");
const OpenAI = require("openai");

const app = express();

// 🔐 ENV
const TOKEN = process.env.TOKEN;
const ADMIN_ID = process.env.ADMIN_ID;
const MONGO_URL = process.env.MONGO_URL;
const OPENAI_KEY = process.env.OPENAI_KEY;

// 🤖 INIT
const bot = new TelegramBot(TOKEN, { polling: true });
const openai = new OpenAI({ apiKey: OPENAI_KEY });

// 🌐 SERVER
app.get("/", (req, res) => res.send("🔥 PRO AI BOT RUNNING"));
app.listen(process.env.PORT || 3000);

// 🗄 DATABASE
mongoose.connect(MONGO_URL);

const userSchema = new mongoose.Schema({
  chatId: Number
});
const User = mongoose.model("User", userSchema);

// 🧠 AI FUNCTION (REAL CHATGPT)
async function getAIReply(text) {
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: text }]
    });
    return res.choices[0].message.content;
  } catch (err) {
    return "⚠️ AI error aa gaya!";
  }
}

// 🚫 BAD WORD FILTER
const badWords = ["gali", "abuse"];
function isBad(text) {
  return badWords.some(word => text.toLowerCase().includes(word));
}

// 🤖 BOT LOGIC
bot.on("message", async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // 📦 SAVE USER
  await User.updateOne(
    { chatId },
    { chatId },
    { upsert: true }
  );

  // 🚫 FILTER
  if (isBad(text)) {
    return bot.sendMessage(chatId, "🚫 Galat language use mat karo!");
  }

  // 👑 ADMIN COMMANDS
  if (chatId == ADMIN_ID) {

    if (text.startsWith("/broadcast")) {
      const msgText = text.replace("/broadcast ", "");
      const users = await User.find();

      users.forEach(u => {
        bot.sendMessage(u.chatId, `📢 ADMIN:\n${msgText}`);
      });

      return bot.sendMessage(chatId, "✅ Broadcast done");
    }

    if (text === "/users") {
      const count = await User.countDocuments();
      return bot.sendMessage(chatId, `👥 Users: ${count}`);
    }
  }

  // 🚀 BASIC
  if (text === "/start") {
    return bot.sendMessage(chatId, "👋 Welcome! Main AI bot hoon 😎");
  }

  // 🤖 AI REPLY
  const reply = await getAIReply(text);
  bot.sendMessage(chatId, reply);
});
