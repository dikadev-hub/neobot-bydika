# 📚 EXAMPLE.md — Contoh Template Rich Message

Semua contoh di bawah bisa langsung dipake di bot kamu. Formatnya **flat array** — tiap object = 1 blok.

## 1. Menu Bot dengan Tombol

```js
sendRich(from, [
  { h1: "🤖 BOT KAMU" },
  { p: ["Halo ", { b: "kakak" }, "! Pilih menu 👇"] },
  { hr: true },
  { checkbox: [
    { checked: true,  text: "Bot online 24 jam" },
    { checked: false, text: "Mode premium" }
  ]},
  { buttons: [[ { text: "🌐 Website", url: "https://webkamu.com" } ]]},
  { buttonsInline: [[
    { text: "🎁 Promo", callback: "promo",  style: "success"  },
    { text: "ℹ️ Help",  callback: "help",   style: "primary" }
  ]]},
  { footer: "NeoBot • by dika" }
])
```

## 2. Halaman Promo (Tabel Harga)

```js
[
  { h1: "🔥 PROMO 50%" },
  { blockquote: { text: "Kode: NEOBOT50 — berlaku minggu ini!" } },
  { table: {
      headers: ["Paket", "Normal", "Promo"],
      rows: [
        ["Pro Bulanan", "Rp 49.000", "Rp 24.500"],
        ["Pro Tahunan", "Rp 399.000", "Rp 199.500"]
      ]
  }},
  { details: { summary: "Syarat & Ketentuan", content: "1. Berlaku s/d 31 Des\n2. Tidak bisa digabung promo lain", open: false } },
  { buttonsInline: [[
    { text: "🚀 Upgrade", url: "https://webkamu.com/upgrade", style: "success" }
  ]]}
]
```

## 3. Pesan Gabungan ala WA (contextBundle)

```js
[
  { contextBundle: {
      contextInfo: { icon: "📣", label: "PENGUMUMAN KELAS", sub: "dari: Admin Neo", color: "#f59e0b" },
      items: [
        { type: "text", text: "Besok libur! 🎉" },
        { type: "img",  src: "https://cdn.webkamu.com/a.jpg", caption: "Poster" },
        { type: "file", name: "Jadwal.pdf", size: "1.2 MB", src: "https://cdn.webkamu.com/j.pdf" },
        { type: "audio", src: "https://cdn.webkamu.com/voice.mp3", caption: "Penjelasan suara" },
        { type: "buttons", items: [[{ text: "✅ Hadir", callback: "hadir", style: "success" }]] }
      ]
  }}
]
```

## 4. Dokumen & Media

```js
[
  { file: { name: "Materi-Kelas.pdf", size: "2.4 MB", src: "https://cdn.webkamu.com/m.pdf" } },
  { mediaSpoiler: { src: "https://cdn.webkamu.com/r.jpg", caption: "Pencet buat lihat 👀" } },
  { audio: { src: "https://cdn.webkamu.com/voice.mp3", caption: "Catatan suara" } }
]
```

## 5. Info & Sistem (contextInfo)

```js
[
  { p: "Transfer berhasil!" },
  { aside: { text: "Rp 10.000 dikirim ke @budi", cite: "Neo Chat • Sistem" } },
  { footer: "ID Transaksi: TXN-8f2a1" }
]
```

> 💡 **Tips**: semua key bisa digabung bebas dalam satu array — renderer web yang otomatis ngatur tampilannya.
