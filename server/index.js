const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { encrypt, decrypt } = require("./crypto");

const app = express();
const PORT = 4000;
const TOKEN_FILE = path.join(__dirname, "tokens.json");

// Accounts: { password, role, namespace }
// role = "admin" or "staff", namespace = "admin" or "admin1"
const ACCOUNTS = {
  admin:  { password: "admin123",  role: "admin", namespace: "admin"  },
  admin1: { password: "admin1123", role: "admin", namespace: "admin1" },
  admin2: { password: "admin2123", role: "admin", namespace: "admin2" },
  staff:  { password: "staff123",  role: "staff", namespace: "admin"  },
  staff1: { password: "staff1123", role: "staff", namespace: "admin1" },
  staff2: { password: "staff2123", role: "staff", namespace: "admin2" },
};

// Persist tokens: token -> { role, namespace }
function loadTokens() {
  try { return new Map(Object.entries(JSON.parse(fs.readFileSync(TOKEN_FILE, "utf8")))); }
  catch { return new Map(); }
}
function saveTokens(map) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(Object.fromEntries(map)));
}
const tokens = loadTokens();

app.use(cors({ origin: "*", methods: ["GET", "POST", "DELETE", "PATCH", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());

// --- Data helpers (per namespace) ---
function dataFile(ns) {
  return path.join(__dirname, `data_${ns}.json`);
}
function tcFile(ns) {
  return path.join(__dirname, `timeclock_${ns}.json`);
}

function readData(ns) {
  const raw = fs.readFileSync(dataFile(ns), "utf8");
  const parsed = JSON.parse(raw);
  if (parsed.encrypted && parsed.cards.length > 0) {
    parsed.cards = parsed.cards.map((c) => JSON.parse(decrypt(c)));
  }
  return parsed;
}
function writeData(ns, data) {
  fs.writeFileSync(dataFile(ns), JSON.stringify({
    encrypted: true,
    currentIndex: data.currentIndex,
    cards: data.cards.map((c) => encrypt(JSON.stringify(c))),
  }, null, 2));
}

function readTC(ns) {
  try { return JSON.parse(fs.readFileSync(tcFile(ns), "utf8")); }
  catch { return { punches: [] }; }
}
function writeTC(ns, data) {
  fs.writeFileSync(tcFile(ns), JSON.stringify(data, null, 2));
}
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// --- Middleware ---
function authMiddleware(req, res, next) {
  const token = (req.headers.authorization || "").replace("Bearer ", "");
  const info = tokens.get(token);
  if (!info) return res.status(401).json({ error: "Unauthorized" });
  req.role = info.role;
  req.namespace = info.namespace;
  next();
}
function requireRole(role) {
  return (req, res, next) => {
    if (req.role !== role) return res.status(403).json({ error: "Forbidden" });
    next();
  };
}

// --- Auth ---
app.post("/api/login", (req, res) => {
  const { role: username, password } = req.body;
  const account = ACCOUNTS[username];
  if (!account || account.password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = crypto.randomBytes(32).toString("hex");
  tokens.set(token, { role: account.role, namespace: account.namespace });
  saveTokens(tokens);
  res.json({ token, role: account.role });
});

// --- Card Routes ---
app.get("/api/cards", authMiddleware, requireRole("admin"), (req, res) => {
  res.json(readData(req.namespace).cards);
});

app.post("/api/cards", authMiddleware, requireRole("admin"), (req, res) => {
  const { cards } = req.body;
  if (!Array.isArray(cards)) return res.status(400).json({ error: "Cards must be an array" });
  const newCards = cards.map((c, i) => ({ ...c, id: i + 1, seen: false }));
  writeData(req.namespace, { cards: newCards, currentIndex: 0 });
  res.json({ cards: newCards });
});

app.delete("/api/cards", authMiddleware, requireRole("admin"), (req, res) => {
  writeData(req.namespace, { cards: [], currentIndex: 0 });
  res.json({ success: true });
});

app.delete("/api/cards/:id", authMiddleware, requireRole("admin"), (req, res) => {
  const id = parseInt(req.params.id);
  const data = readData(req.namespace);
  data.cards = data.cards.filter((c) => c.id !== id);
  writeData(req.namespace, data);
  res.json({ success: true });
});

app.patch("/api/cards/:id/seen", authMiddleware, requireRole("admin"), (req, res) => {
  const id = parseInt(req.params.id);
  const data = readData(req.namespace);
  const card = data.cards.find((c) => c.id === id);
  if (!card) return res.status(404).json({ error: "Card not found" });
  card.seen = req.body.seen !== undefined ? req.body.seen : !card.seen;
  writeData(req.namespace, data);
  res.json({ id: card.id, seen: card.seen });
});

// --- Staff Card Routes ---
app.get("/api/staff/current", authMiddleware, requireRole("staff"), (req, res) => {
  const data = readData(req.namespace);
  const next = data.cards.find((c) => !c.seen);
  if (!next) return res.status(404).json({ error: "No more cards" });
  res.json(next);
});

app.post("/api/staff/seen/:id", authMiddleware, requireRole("staff"), (req, res) => {
  const id = parseInt(req.params.id);
  const data = readData(req.namespace);
  const card = data.cards.find((c) => c.id === id);
  if (!card) return res.status(404).json({ error: "Card not found" });
  card.seen = true;
  writeData(req.namespace, data);
  res.json({ success: true });
});

// --- Time Clock Routes ---
app.get("/api/timeclock/today", authMiddleware, requireRole("staff"), (req, res) => {
  const tc = readTC(req.namespace);
  const today = todayStr();
  const punches = tc.punches.filter((p) => p.date === today);
  const last = punches[punches.length - 1];
  res.json({ punches, status: last ? last.type : "out" });
});

app.post("/api/timeclock/checkin", authMiddleware, requireRole("staff"), (req, res) => {
  const tc = readTC(req.namespace);
  const punch = { id: Date.now(), type: "in", timestamp: new Date().toISOString(), date: todayStr() };
  tc.punches.push(punch);
  writeTC(req.namespace, tc);
  res.json(punch);
});

app.post("/api/timeclock/checkout", authMiddleware, requireRole("staff"), (req, res) => {
  const tc = readTC(req.namespace);
  const punch = { id: Date.now(), type: "out", timestamp: new Date().toISOString(), date: todayStr() };
  tc.punches.push(punch);
  writeTC(req.namespace, tc);
  res.json(punch);
});

app.get("/api/timeclock/all", authMiddleware, requireRole("admin"), (req, res) => {
  res.json(readTC(req.namespace).punches);
});

app.delete("/api/timeclock", authMiddleware, requireRole("admin"), (req, res) => {
  writeTC(req.namespace, { punches: [] });
  res.json({ success: true });
});

app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://0.0.0.0:${PORT}`));
