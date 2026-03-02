const TelegramBot = require('node-telegram-bot-api');

// 🔑 Apna token yaha paste karo
const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text.toLowerCase();

  if (text === "/start") {
    bot.sendMessage(chatId, "🔥 Yamdhud Bot Live ho gaya!");
  } 
  else if (text.includes("hi")) {
    bot.sendMessage(chatId, "Hello bhai 😎");
  } 
  else if (text.includes("help")) {
    bot.sendMessage(chatId, "Kya help chahiye?");
  } 
  else {
    bot.sendMessage(chatId, "Samajh nahi aaya 😅");
  }
});
