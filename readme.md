# 🤖 NEOBOT-BYDIKA

> Bot client resmi untuk **Neo Chat** — kirim **Rich Message** kaya Telegram/WhatsApp langsung dari terminal. Gratis, open source, bikinan **dika x dev**.

![version](https://img.shields.io/badge/version-1.0.0-green) ![node](https://img.shields.io/badge/node-%3E%3D16-blue) ![license](https://img.shields.io/badge/license-MIT-yellow)

Bot ini nyambung ke web **Neo Chat** pake **kode pairing 8 digit** — sama kaya WhatsApp Web. Login di web, generate kode, jalankan bot, langsung konek ke akun kamu. **100% gratis.**

---

## ✨ Fitur

- 🔗 **Pairing kode 8 digit** — dari Neo Chat → Profile → Perangkat → Generate Kode
- 🎨 **Rich Message 24 key** — heading, tabel, checkbox, spoiler, tombol, dokumen, audio, dll
- 💬 **Chat pribadi & Grup** — bot bisa balas & kirim ke mana aja
- 🔘 **Button interaktif** — callback & URL button kaya WhatsApp
- 📦 **Kirim dokumen** — PDF/file card kaya WA
- 📢 **Announce grup** — pengumuman rich dengan context bundle
- 🔁 **Auto-reconnect** — koneksi putus? bot nyambung sendiri
- 🖥️ **Terminal REPL** — `status`, `exit`, dan command lain langsung dari terminal

## 📋 Template Rich yang didukung

| Kategori | Key |
|---|---|
| Teks | `h1`–`h6`, `p`, `mix`, inline (`b` `i` `u` `s` `mark` `spoiler` `code` `sub` `sup`) |
| Struktur | `blockquote`, `aside`, `details`, `hr`, `ul`, `ol`, `checkbox`, `table` |
| Media | `img`, `video`, `audio`, `figure`, `collage`, `slideshow`, `mediaSpoiler`, `file` |
| Interaksi | `a`, `buttons`, `buttonsInline`, `contextBundle`, **button list (interactive)**, **carousel produk** |
| Kode & lain | `pre` (syntax highlight), `math`/`mathBlock`, `emoji`, `raw` (rich HTML), `footer` |

### Bonus: pesan interaktif native

```js
// Button list (kaya WhatsApp list message)
sendInteractive(from, {
  kind: "list", title: "Pilih Layanan", text: "Pilih opsi 👇",
  sections: [{ title: "Utama", rows: [
    { id: "topup", icon: "fa-wallet", title: "💰 Topup", description: "Isi saldo" }
  ]}]
})

// Carousel katalog produk (swipe horizontal)
sendCarousel(from, [
  { id: "p1", nama: "Premium Tee", harga: 99000, hargaOld: 149000,
    deskripsi: "Kaos cotton 30s", foto: "https://picsum.photos/400/300" }
])

// Rich HTML custom (raw) — masuk richArray: [{ raw: "<div>...</div>" }]
```

## 🚀 Cara Pakai

### 1. Ambil kode pairing
Buka **Neo Chat** → tap foto profile → **Perangkat & Bot** → **Generate Kode 8 Digit** (contoh: `ABCD-1234`, berlaku 5 menit).

### 2. Jalankan bot

```bash
# install dulu
git clone https://github.com/dikaxdev/neobot-bydika.git
cd neobot-bydika
npm install

# konek pake kode 8 digit
node index.js ABCD-1234
```

Atau pake environment:

```bash
NEO_SERVER=https://domain-neochat-kamu.com NEO_CODE=ABCD-1234 node index.js
```

> 💡 Ganti `NEO_SERVER` dengan domain Neo Chat tempat kamu daftar. Default mengarah ke server resmi.

### 3. Done! 🎉

Bot langsung online. Coba kirim ke bot kamu di Neo Chat:

```
/menu      → menu rich dengan tombol
/promo     → halaman promo (tabel harga + CTA)
/catalog   → katalog carousel produk
/list      → button list (interactive, kaya WA)
/html      → rich HTML custom card
/ping      → cek bot hidup
/grupinfo  → info grup (kirim di grup)
/help      → daftar perintah lengkap
```

Di terminal juga ada REPL: ketik `status` untuk lihat koneksi, `exit` untuk keluar.

## 🛠️ Bikin Command Sendiri

Buka `index.js`, tambah di bagian handler:

```js
if (text === "/halo") {
  return sendRich(from, [
    { h2: "👋 Halo juga!" },
    { p: ["Kamu ketik ", { code: "/halo" }, " — bot balas rich message."] },
    { buttonsInline: [[
      { text: "✨ Keren", callback: "menu", style: "success" }
    ]]}
  ])
}
```

Format rich-nya **sama persis** dengan yang tampil di web Neo Chat — jadi apa yang kamu tulis di JSON, itu yang user lihat.

## ❓ FAQ

**Q: Bayar?**
Gratis 100%. Bot-nya open source, web Neo Chat juga gratis dipake.

**Q: Botnya mati pas internet putus?**
Auto-reconnect. begitu koneksi balik, bot langsung online lagi.

**Q: Kode 8 digit kedaluwarsa?**
Generate lagi dari Profile → Perangkat. Kode cuma berlaku 5 menit demi keamanan.

**Q: Bisa 1 akun banyak bot?**
Bisa! Tiap perangkat/bot dapet kode & sesi sendiri.

## 📄 Lisensi

MIT — bebas dipake, modifikasi, dan distribute. Dibuat dengan ❤️ oleh **dika x dev**.
