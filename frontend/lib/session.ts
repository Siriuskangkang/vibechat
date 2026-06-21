export async function ensureSession(): Promise<string> {
  let sid = localStorage.getItem("sid");
  if (!sid) {
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || ""}/api/session`, { method: "POST", credentials: "include" });
    const j = await r.json();
    sid = j.data.session_id as string;
    localStorage.setItem("sid", sid);
  }
  return sid;
}
