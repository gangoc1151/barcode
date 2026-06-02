const BASE = "http://172.16.1.66:4000/api";

function getToken() {
  return localStorage.getItem("cc_token");
}

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${getToken()}`,
  };
}

export async function apiLogin(role, password) {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role, password }),
  });
  if (!res.ok) throw new Error("Invalid credentials");
  return res.json();
}

export async function apiGetCards() {
  const res = await fetch(`${BASE}/cards`, { headers: headers() });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function apiPublishCards(cards) {
  const res = await fetch(`${BASE}/cards`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ cards }),
  });
  if (!res.ok) throw new Error("Failed to publish");
  return res.json();
}

export async function apiDeleteCard(id) {
  const res = await fetch(`${BASE}/cards/${id}`, { method: "DELETE", headers: headers() });
  if (!res.ok) throw new Error("Failed to delete");
  return res.json();
}

export async function apiDeleteAllCards() {
  const res = await fetch(`${BASE}/cards`, { method: "DELETE", headers: headers() });
  if (!res.ok) throw new Error("Failed to delete all");
  return res.json();
}

export async function apiToggleCardSeen(id, seen) {
  const res = await fetch(`${BASE}/cards/${id}/seen`, {
    method: "PATCH",
    headers: headers(),
    body: JSON.stringify({ seen }),
  });
  if (!res.ok) throw new Error("Failed to update seen status");
  return res.json();
}

export async function apiGetCurrentCard() {
  const res = await fetch(`${BASE}/staff/current`, { headers: headers() });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function apiMarkSeen(id) {
  const res = await fetch(`${BASE}/staff/seen/${id}`, {
    method: "POST",
    headers: headers(),
  });
  if (!res.ok) throw new Error("Failed to mark seen");
  return res.json();
}

export async function apiGetTodayPunches() {
  const res = await fetch(`${BASE}/timeclock/today`, { headers: headers() });
  if (!res.ok) throw new Error("Failed to fetch timeclock");
  return res.json();
}

export async function apiCheckIn() {
  const res = await fetch(`${BASE}/timeclock/checkin`, { method: "POST", headers: headers() });
  if (!res.ok) throw new Error("Failed to check in");
  return res.json();
}

export async function apiCheckOut() {
  const res = await fetch(`${BASE}/timeclock/checkout`, { method: "POST", headers: headers() });
  if (!res.ok) throw new Error("Failed to check out");
  return res.json();
}
