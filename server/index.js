const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { encrypt, decrypt } = require("./crypto");

const app = express();
const PORT = 4001;
const NS = "admin"; // default namespace

app.use(cors({ origin: "*", methods: ["GET", "POST", "DELETE", "PATCH", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] }));
app.use(express.json());

// --- Data helpers ---
function dataFile(ns) { return path.join(__dirname, `data_${ns}.json`); }
function tcFile(ns) { return path.join(__dirname, `timeclock_${ns}.json`); }

function readData(ns) {
  try {
    const raw = fs.readFileSync(dataFile(ns), "utf8");
    const parsed = JSON.parse(raw);
    if (parsed.encrypted && parsed.cards.length > 0) {
      parsed.cards = parsed.cards.map((c) => JSON.parse(decrypt(c)));
    }
    return parsed;
  } catch { return { cards: [], currentIndex: 0 }; }
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
function writeTC(ns, data) { fs.writeFileSync(tcFile(ns), JSON.stringify(data, null, 2)); }
function todayStr() { return new Date().toISOString().slice(0, 10); }

// --- Card Routes ---
app.get("/api/cards", (req, res) => {
  res.json(readData(NS).cards);
});

app.post("/api/cards", (req, res) => {
  const { cards } = req.body;
  if (!Array.isArray(cards)) return res.status(400).json({ error: "Cards must be an array" });
  const newCards = cards.map((c, i) => ({ ...c, id: i + 1, seen: false }));
  writeData(NS, { cards: newCards, currentIndex: 0 });
  res.json({ cards: newCards });
});

app.delete("/api/cards", (req, res) => {
  writeData(NS, { cards: [], currentIndex: 0 });
  res.json({ success: true });
});

app.delete("/api/cards/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const data = readData(NS);
  data.cards = data.cards.filter((c) => c.id !== id);
  writeData(NS, data);
  res.json({ success: true });
});

app.patch("/api/cards/:id/seen", (req, res) => {
  const id = parseInt(req.params.id);
  const data = readData(NS);
  const card = data.cards.find((c) => c.id === id);
  if (!card) return res.status(404).json({ error: "Card not found" });
  card.seen = req.body.seen !== undefined ? req.body.seen : !card.seen;
  writeData(NS, data);
  res.json({ id: card.id, seen: card.seen });
});

// --- Staff Card Routes ---
app.get("/api/staff/current", (req, res) => {
  const data = readData(NS);
  const next = data.cards.find((c) => !c.seen);
  if (!next) return res.status(404).json({ error: "No more cards" });
  res.json(next);
});

app.post("/api/staff/seen/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const data = readData(NS);
  const card = data.cards.find((c) => c.id === id);
  if (!card) return res.status(404).json({ error: "Card not found" });
  card.seen = true;
  writeData(NS, data);
  res.json({ success: true });
});

// --- Time Clock Routes ---
app.get("/api/timeclock/today", (req, res) => {
  const tc = readTC(NS);
  const today = todayStr();
  const punches = tc.punches.filter((p) => p.date === today);
  const last = punches[punches.length - 1];
  res.json({ punches, status: last ? last.type : "out" });
});

app.post("/api/timeclock/checkin", (req, res) => {
  const tc = readTC(NS);
  const punch = { id: Date.now(), type: "in", timestamp: new Date().toISOString(), date: todayStr() };
  tc.punches.push(punch);
  writeTC(NS, tc);
  res.json(punch);
});

app.post("/api/timeclock/checkout", (req, res) => {
  const tc = readTC(NS);
  const punch = { id: Date.now(), type: "out", timestamp: new Date().toISOString(), date: todayStr() };
  tc.punches.push(punch);
  writeTC(NS, tc);
  res.json(punch);
});

app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://0.0.0.0:${PORT}`));
