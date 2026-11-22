# BAXDEV RBX — siap deploy Cloudflare Pages

## 1. Firebase (sekali, WAJIB sebelum dipakai)
1. console.firebase.google.com → project **baxdev-rbx** → Realtime Database → **Rules** → paste isi `database.rules.json` → **Publish**.
   (Rules ini sudah ditambah node `credits` dan pesanan tipe credit. Tanpa ini upload dan tool ditolak `credit_unavailable`.)
2. Authentication → Sign-in method: aktifkan **Google** dan **Email/Password**. Akun owner: `baxdev@owner.id` (buat di tab Users).
3. Authentication → Settings → **Authorized domains**: tambahkan `NAMA-PROJECT.pages.dev` (dan domain custom).

## 2. Deploy ke Cloudflare Pages
Dashboard → Workers & Pages → **Create → Pages → Upload assets** → drag zip ini (atau isi foldernya).
`_worker.js` sudah berisi semua API (mode advanced), jadi tidak perlu build dan tidak perlu `wrangler.toml`.
Atau CLI: `npx wrangler pages deploy . --project-name baxdev`

## 3. Cek
- Buka situs → login Google → Pengaturan → isi Roblox API Key + User ID → Cek Koneksi.
- /owner → login → tab pesanan → **Aktifkan** pesanan credit menambah `credits/<robloxId>/granted`.

## Catatan
- Server memeriksa credit: upload audio butuh saldo ≥ 1; tool dan publish hasil tool butuh pernah punya credit. Owner bebas.
- `used` di Firebase hanya bisa naik (anti-curang), jadi refund credit otomatis saat tool gagal dimuat tidak tersimpan di server.
- Audio yang masih diproses Roblox saat tab ditutup diselesaikan server sampai ±30 detik, lalu ditulis ke Firebase `library/<uid>`.
  Setelah itu tab harus dibuka lagi untuk menarik hasilnya (tidak ada antrean permanen di Cloudflare tanpa Queue/Durable Object).
- Convert YouTube memakai API publik; backend sendiri (yt-backend/yt-worker) tidak ikut zip. Isi env `YT_BACKEND_URL` + `YT_BACKEND_SECRET` bila mau.

## Update: SkyBox 360 + login Roblox pakai username
- SkyBox 360 aktif lagi (menu, drawer, popup). Biaya 1 credit per sesi. Upscale dan publish 6 sisi dicek server lewat credit.
- Pengaturan → Roblox: kolom boleh diisi **Username** atau **User ID**. Username diubah jadi User ID lewat `/api/roblox-resolve` saat tombol Simpan ditekan.
