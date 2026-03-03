const express = require("express");
const session = require("express-session");

const app = express();

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: "secret123",
  resave: false,
  saveUninitialized: true
}));

// fake user (baad me DB laga sakte)
const USER = {
  username: "admin",
  password: "1234"
};

// 🔐 LOGIN PAGE
app.get("/", (req, res) => {
  res.send(`
    <h2>🔐 Login Panel</h2>
    <form method="POST" action="/login">
      <input name="username" placeholder="Username"/><br><br>
      <input name="password" type="password" placeholder="Password"/><br><br>
      <button>Login</button>
    </form>
  `);
});

// 🔐 LOGIN LOGIC
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    return res.redirect("/dashboard");
  }

  res.send("❌ Wrong login");
});

// 🌐 DASHBOARD
app.get("/dashboard", (req, res) => {
  if (!req.session.user) return res.redirect("/");

  res.send(`
    <h2>🔥 Dashboard</h2>
    <p>Welcome ${req.session.user}</p>

    <ul>
      <li>🤖 Bot Status: Running</li>
      <li>🎮 Game: Active</li>
      <li>📞 WhatsApp: Connected</li>
    </ul>

    <a href="/logout">Logout</a>
  `);
});

// 🔓 LOGOUT
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// SERVER
app.listen(5000, () => {
  console.log("🌐 Panel running on http://localhost:5000");
});
