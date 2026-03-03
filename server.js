const TelegramBot = require('node-telegram-bot-api');
const OpenAI = require("openai");

// 🔑 ENV VARIABLES
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 👑 ADMIN ID (apni telegram uid daal)
const ADMIN_ID = 123456789;

// 🤖 AI CHAT FUNCTION
async function getAIReply(text) {
  try {
    const res = await openai.responses.create({
      model: "gpt-5-nano",
      input: text
    });

    return res.output[0].content[0].text;
  } catch (err) {
    return "⚠️ AI error aa gaya";
  }
}

// 🧠 NORMAL MESSAGE REPLY (AI AUTO)
bot.on("message", async (msg) => {
  if (msg.text.startsWith("/")) return;

  const reply = await getAIReply(msg.text);
  bot.sendMessage(msg.chat.id, reply);
});

// 📜 SCRIPT GENERATOR
bot.onText(/\/script (.+)/, async (msg, match) => {
  const topic = match[1];

  const prompt = `Write a viral YouTube/Instagram script in Hindi on topic: ${topic}`;

  const reply = await getAIReply(prompt);

  bot.sendMessage(msg.chat.id, "🎬 Script:\n\n" + reply);
});

// 🖼️ IMAGE GENERATOR
bot.onText(/\/image (.+)/, async (msg, match) => {
  const prompt = match[1];

  try {
    const result = await openai.images.generate({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024"
    });

    const imageUrl = result.data[0].url;

    bot.sendPhoto(msg.chat.id, imageUrl, {
      caption: "🎨 Image Generated"
    });

  } catch (err) {
    bot.sendMessage(msg.chat.id, "⚠️ Image generate nahi hua");
  }
});

// 👑 ADMIN PANEL
bot.onText(/\/admin/, (msg) => {
  if (msg.from.id !== ADMIN_ID) {
    return bot.sendMessage(msg.chat.id, "❌ Tu admin nahi hai");
  }

  bot.sendMessage(msg.chat.id,
    "👑 Admin Panel\n\n" +
    "/broadcast - sabko msg bhej\n" +
    "/stats - user count"
  );
});

// 📢 BROADCAST
let users = new Set();

bot.on("message", (msg) => {
  users.add(msg.chat.id);
});

bot.onText(/\/broadcast (.+)/, (msg, match) => {
  if (msg.from.id !== ADMIN_ID) return;

  const text = match[1];

  users.forEach(id => {
    bot.sendMessage(id, text);
  });

  bot.sendMessage(msg.chat.id, "✅ Broadcast done");
});

// 📊 STATS
bot.onText(/\/stats/, (msg) => {
  if (msg.from.id !== ADMIN_ID) return;

  bot.sendMessage(msg.chat.id, `👥 Total Users: ${users.size}`);
});

// 🚀 START MESSAGE
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id,
    "🤖 Welcome AI Bot\n\n" +
    "Commands:\n" +
    "/script topic\n" +
    "/image prompt\n\n" +
    "Ya seedha message bhej AI reply karega 💬"
  );
});
