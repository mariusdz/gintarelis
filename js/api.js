/**
 * API helpers for loading content.
 */

const CONTENT_URL = "/data/content.json";

export async function loadContent() {
  const res = await fetch(CONTENT_URL, { cache: "no-store" });
  if (!res.ok) throw new Error("Nepavyko užkrauti turinio.");
  return res.json();
}
