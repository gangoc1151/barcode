// Parse pipe-delimited card string
// Format: card|month|year|cvv|name|address|city|state|zip|country|phone|email
export function parseCard(raw) {
  const p = raw.trim().split("|");
  if (p.length < 4) return null;
  const [card, month, year, cvv] = p;
  const digits = card.replace(/\s/g, "");
  if (!/^\d{13,19}$/.test(digits)) return null;
  if (!/^\d{1,2}$/.test(month) || +month < 1 || +month > 12) return null;
  if (!/^\d{2,4}$/.test(year)) return null;
  if (!/^\d{3,4}$/.test(cvv)) return null;
  return { digits, month: month.padStart(2, "0"), year, cvv };
}

export function maskCard(digits) {
  return "**** **** **** " + digits.slice(-4);
}
