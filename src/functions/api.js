const BASE = "http://172.16.1.66:4001/api";

const JSON_HEADERS = { "Content-Type": "application/json" };

export async function apiGetCards() {
  const res = await fetch(`${BASE}/cards`);
  if (!res.ok) throw new Error("Failed to get cards");
  return res.json();
}

export async function apiPublishCards(cards) {
  const res = await fetch(`${BASE}/cards`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ cards }),
  });
  if (!res.ok) throw new Error("Failed to publish");
  return res.json();
}

export async function apiDeleteCard(id) {
  const res = await fetch(`${BASE}/cards/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete");
  return res.json();
}

export async function apiDeleteAllCards() {
  const res = await fetch(`${BASE}/cards`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete all");
  return res.json();
}

export async function apiToggleCardSeen(id, seen) {
  const res = await fetch(`${BASE}/cards/${id}/seen`, {
    method: "PATCH",
    headers: JSON_HEADERS,
    body: JSON.stringify({ seen }),
  });
  if (!res.ok) throw new Error("Failed to update seen status");
  return res.json();
}

export async function apiGetCurrentCard() {
  const res = await fetch(`${BASE}/staff/current`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to get card");
  return res.json();
}

export async function apiMarkSeen(id) {
  const res = await fetch(`${BASE}/staff/seen/${id}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to mark seen");
  return res.json();
}

export async function apiGetTodayPunches() {
  const res = await fetch(`${BASE}/timeclock/today`);
  if (!res.ok) throw new Error("Failed to fetch timeclock");
  return res.json();
}

export async function apiCheckIn() {
  const res = await fetch(`${BASE}/timeclock/checkin`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to check in");
  return res.json();
}

export async function apiCheckOut() {
  const res = await fetch(`${BASE}/timeclock/checkout`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to check out");
  return res.json();
}

