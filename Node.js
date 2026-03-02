const TelegramBot = require('node-telegram-bot-api');

// 👉 Yaha apna token daalo
const token = "PASTE_YOUR_TOKEN_HERE";

const bot = new TelegramBot(token, { polling: true });

// Auto reply
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (text === "/start") {
    bot.sendMessage(chatId, "Hello 👋 Yamdhud Bot me welcome!");
  } else {
    bot.sendMessage(chatId, "Tumne likha: " + text);
  }
});
