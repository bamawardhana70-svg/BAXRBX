import { requireUser } from "../_lib/auth.js";

// Cloudflare Pages Function — POST /api/roblox-resolve
// Body: { username }  ->  { ok, userId, username, displayName }
// Mengubah username Roblox jadi User ID lewat API publik users.roblox.com (tanpa API key).
// Dipakai form Pengaturan Roblox supaya pengguna boleh mengisi username ATAU User ID.

export async function onRequestPost(context) {
  const { request } = context;
  const denied = await requireUser(request);
  if (denied) return denied;

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, message: "Body permintaan tidak valid." }, 400); }

  const username = String((body && body.username) || "").trim().replace(/^@/, "");
  if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
    return json({ ok: false, message: "Username Roblox tidak valid (3-20 karakter: huruf, angka, garis bawah)." });
  }

  let res;
  try {
    res = await fetch("https://users.roblox.com/v1/usernames/users", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ usernames: [username], excludeBannedUsers: true })
    });
  } catch (err) {
    return json({ ok: false, message: "Gagal menghubungi Roblox: " + (err && err.message ? err.message : "network error") }, 502);
  }
  if (res.status === 429) return json({ ok: false, message: "Roblox membatasi permintaan. Coba lagi sebentar." });
  if (!res.ok) return json({ ok: false, message: `Roblox membalas HTTP ${res.status}. Coba lagi atau isi User ID langsung.` });

  const data = await res.json().catch(() => null);
  const u = data && Array.isArray(data.data) ? data.data[0] : null;
  if (!u || !u.id) return json({ ok: false, message: `Username "${username}" tidak ditemukan di Roblox.` });
  return json({ ok: true, userId: String(u.id), username: u.name || username, displayName: u.displayName || u.name || username });
}

export async function onRequestGet() {
  return json({ ok: false, message: "Gunakan POST." }, 405);
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" }
  });
}
