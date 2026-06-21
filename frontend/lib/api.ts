const BASE = process.env.NEXT_PUBLIC_API_BASE || "";

export async function postJSON<T>(path: string, body: unknown): Promise<T> {
  const r = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    credentials: "include",
  });
  const j = await r.json();
  if (!r.ok || j.code !== 0) throw new Error(j.message || "request failed");
  return j.data as T;
}

export async function getJSON<T>(path: string): Promise<T> {
  const r = await fetch(`${BASE}${path}`, { credentials: "include" });
  const j = await r.json();
  if (!r.ok || j.code !== 0) throw new Error(j.message || "request failed");
  return j.data as T;
}
