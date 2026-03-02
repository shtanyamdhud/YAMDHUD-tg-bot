const express = require("express");
const TelegramBot = require("node-telegram-bot-api");

const app = express();

// 👉 PORT (Render ke liye important)
const PORT = process.env.PORT || 3000;

// 👉 Bot Token (Environment variable se aayega)
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// 👉 Simple route (Render ko batane ke liye server alive hai)
app.get("/", (req, res) => {
  res.send("Bot is running 🚀");
});

// 👉 Bot reply system
bot.on("message", (msg) => {
  bot.sendMessage(msg.chat.id, "Hello bhai 😎 Bot chal raha hai!");
});

// 👉 Server start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

bot.on("message", (msg) => {
    const text = msg.text.toLowerCase();

    if (text === "hi" || text === "hello") {
        bot.sendMessage(msg.chat.id, "👋 Hello bhai!");
    } 
    else if (text.includes("kaise ho")) {
        bot.sendMessage(msg.chat.id, "😎 Mast hu bhai!");
    }
    else if (!text.startsWith("/")) {
        bot.sendMessage(msg.chat.id, "🤖 Samajh nahi aaya!");
    }
});
