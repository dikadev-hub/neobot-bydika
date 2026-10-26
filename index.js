#!/usr/bin/env node
/* ═══════════════════════════════════════════════════════════
   NEOBOT-BOT.JS — Bot client untuk Neo Chat
   ─────────────────────────────────────────────────────────
   • Pairing pakai kode 8 digit (generate di dashboard → Bot/Perangkat)
   • Jalan di terminal terpisah:  node neobot-bot.js
   • Auto-reply command + kirim rich message 24-key (button, dll)
   • Bisa kirim ke chat pribadi & GRUP

   COMMANDS:
     /menu            → rich menu dengan tombol
     /promo           → halaman promo gabungan
     /ping            → cek bot hidup
     /help            → daftar perintah
     /bc <pesan>      → broadcast ke semua kontak (owner)
     /grupinfo        → info grup (di grup)
     /announce <teks> → pengumuman grup rich (admin)
   ═══════════════════════════════════════════════════════════ */
"use strict"

const io = require("socket.io-client")
const readline = require("readline")

// ═══ KONFIG ═══
const SERVER = process.env.NEO_SERVER || "https://chat.neobot.cc"
const CODE = process.argv[2] || process.env.NEO_CODE || "" // kode pairing 8 digit, mis: ABCD-1234

if (!CODE) {
  console.log("\n╭━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╮")
  console.log("│  🤖 NEOBOT — Bot Client      │")
  console.log("╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯")
  console.log("\nCara pakai:")
  console.log("  1. Buka Neo Chat → Profile → Perangkat/Bot → Generate Kode")
  console.log("  2. Jalankan:  node neobot-bot.js KODE-8DIGIT")
  console.log("     contoh:    node neobot-bot.js ABCD-1234\n")
  process.exit(0)
}

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const log = (...a) => console.log(...a)

/* ── RICH BUILDERS (24 key, sama formatnya dgn chat & grup) ── */
const RICH = {
  menu(name) {
    return [
      { h1: "🤖 " + name },
      { p: ["Halo! Aku bot ", { b: name }, ". Pilih menu di bawah ya 👇"] },
      { hr: true },
      { checkbox: [
        { checked: true, text: "Bot aktif & online 24 jam" },
        { checked: true, text: "Support rich message" },
        { checked: false, text: "Mode development" }
      ]},
      { buttons: [[ { text: "📖 Dokumentasi", url: "https://webkamu.com/docs" } ]]},
      { buttonsInline: [
        [ { text: "🎁 Promo", callback: "promo", style: "success" },
          { text: "ℹ️ Help", callback: "help", style: "primary" } ]
      ]},
      { footer: "NeoBot • Rich Message v3" }
    ]
  },
  promo() {
    return [
      { h1: "🔥 Promo Spesial" },
      { p: "Diskon 50% upgrade ke Pro — sampai Minggu ini!" },
      { blockquote: { text: "Kode: NEOBOT50 — pakai saat topup" } },
      { table: {
        headers: ["Paket", "Normal", "Promo"],
        rows: [["Pro Bulanan", "Rp 49.000", "Rp 24.500"], ["Pro Tahunan", "Rp 399.000", "Rp 199.500"]]
      }},
      { buttonsInline: [[
        { text: "🚀 Upgrade", url: "https://webkamu.com/upgrade", style: "success" },
        { text: "📖 S&K", url: "https://webkamu.com/tos", style: "primary" }
      ]]}
    ]
  },
  help() {
    return [
      { h2: "📖 Daftar Perintah" },
      { ol: ["/menu — menu utama rich", "/promo — halaman promo", "/catalog — katalog carousel", "/list — button list (interactive)", "/html — rich HTML custom", "/ping — cek bot", "/grupinfo — info grup", "/announce <teks> — pengumuman grup"] },
      { aside: { text: "Support rich message 24 key + button list + carousel + raw HTML.", cite: "NeoBot" } }
    ]
  },
  announce(text) {
    return [
      { contextBundle: {
        contextInfo: { icon: "📣", label: "PENGUMUMAN GRUP", sub: "via NeoBot", color: "#d4af37" },
        items: [ { type: "text", text: text } ],
        buttonsInline: [[ { text: "✅ Oke", callback: "ack", style: "success" } ]]
      }}
    ]
  },
  grupinfo(g) {
    return [
      { h2: "👥 " + (g.nama || g.name || "Grup") },
      { ul: [
        "Anggota: " + (g.members ? g.members.length : "?"),
        "Admin: " + (g.admins ? g.admins.length : "?"),
        "Tipe: " + (g.type || "group")
      ]},
      { footer: "NeoBot grup tools" }
    ]
  }
}

/* ── Socket connect dgn device token (pairing kode 8 digit) ── */
let socket = null
let deviceToken = null
let botName = "NeoBot"

function connect(token) {
  deviceToken = token
  socket = io(SERVER, {
    transports: ["websocket"],
    auth: { token: token },
    reconnection: true,
    reconnectionDelay: 3000
  })

  socket.on("connect", () => log("✅ Bot online —", SERVER))
  socket.on("disconnect", () => log("⚠️  Terputus, reconnecting..."))
  socket.on("connect_error", e => log("❌", e.message))

  /* Pesan pribadi */
  socket.on("message:new", (msg) => handleDM(msg))
  /* Pesan grup */
  socket.on("group:message", (p) => handleGroup(p))
  /* device ready */
  socket.on("device:ready", (d) => log("🔌 Device ready:", d.deviceId))
}

/* ── Pairing via kode 8 digit (HTTP) ── */
async function pair() {
  const res = await fetch(SERVER + "/api/pair/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Origin": SERVER, "User-Agent": "NeoBot/1.0 (+https://github.com/dikadev-hub/neobot-bydika)" },
    body: JSON.stringify({ code: CODE, deviceName: "NeoBot Terminal", platform: "nodejs" })
  })
  const j = await res.json()
  if (!j.ok) { log("❌ Pairing gagal:", j.message || "kode invalid"); process.exit(1) }
  return j.token
}

/* ── Send helpers ── */
function sendRich(toId, richArray, text) {
  socket.emit("message:send", {
    toId: toId,
    text: text || "🤖",
    rich: { richArray: richArray }
  }, res => { if (!res || !res.ok) log("❌ kirim gagal:", res && res.message) })
}
function sendInteractive(toId, interactive, text) {
  socket.emit("message:send", {
    toId: toId,
    text: text || "📋 Pilih salah satu",
    interactive: interactive
  }, res => { if (!res || !res.ok) log("❌ kirim gagal:", res && res.message) })
}
function sendCarousel(toId, items, text) {
  socket.emit("message:send", {
    toId: toId,
    type: "carousel",
    text: text || "🛍️ Katalog",
    carouselItems: items
  }, res => { if (!res || !res.ok) log("❌ kirim gagal:", res && res.message) })
}
function sendGroupRich(groupId, richArray, text) {
  socket.emit("group:send", {
    groupId: groupId,
    text: text || "🤖",
    rich: { richArray: richArray }
  }, res => { if (!res || !res.ok) log("❌ kirim grup gagal:", res && res.message) })
}
function sendText(toId, text) {
  socket.emit("message:send", { toId, text }, res => { if (!res || !res.ok) log("❌", res && res.message) })
}

/* ── Handlers ── */
function handleDM(msg) {
  if (!msg || !msg.from || msg.type === "rich") return
  const text = (msg.text || "").trim()
  const from = msg.from
  log("📩 DM dari", from.slice(0,8), ":", text)
  if (text === "/menu") return sendRich(from, RICH.menu(botName), "🤖 Menu Utama")
  if (text === "/promo") return sendRich(from, RICH.promo(), "🔥 Promo")
  if (text === "/help") return sendRich(from, RICH.help(), "📖 Help")
  if (text === "/catalog") {
    sendCarousel(from, [
      { id: "p1", nama: "Premium Tee", harga: 99000, hargaOld: 149000, deskripsi: "Kaos cotton combed 30s, distro quality", foto: "https://picsum.photos/400/300?1" },
      { id: "p2", nama: "Hoodie Neo", harga: 199000, hargaOld: 259000, deskripsi: "Hoodie fleece tebal, unisex", foto: "https://picsum.photos/400/300?2" },
      { id: "p3", nama: "Cap Classic", harga: 59000, hargaOld: 79000, deskripsi: "Topi adjustable, embroidery logo", foto: "https://picsum.photos/400/300?3" }
    ], "🛍️ Katalog Produk")
    return
  }
  if (text === "/list") {
    sendInteractive(from, {
      kind: "list",
      title: "Pilih Layanan",
      text: "Pilih salah satu opsi di bawah 👇",
      sections: [
        { title: "Layanan Utama", rows: [
          { id: "topup", icon: "fa-wallet", title: "💰 Topup Saldo", description: "Isi saldo via QRIS" },
          { id: "transfer", icon: "fa-paper-plane", title: "💸 Transfer", description: "Kirim saldo ke teman" },
          { id: "vip", icon: "fa-crown", title: "👑 Upgrade VIP", description: "Fitur eksklusif VIP" }
        ]},
        { title: "Bantuan", rows: [
          { id: "faq", icon: "fa-circle-question", title: "❓ FAQ", description: "Pertanyaan umum" },
          { id: "cs", icon: "fa-headset", title: "🎧 CS Online", description: "Chat admin langsung" }
        ]}
      ]
    }, "📋 Menu List")
    return
  }
  if (text === "/html") {
    sendRich(from, [
      { h2: "🎨 Rich HTML (raw)" },
      { p: "Key " },
      { raw: '<div style="padding:14px;border-radius:12px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;text-align:center"><b style="font-size:1.1em">✨ Custom HTML Card</b><br><small>Bebas styling apa aja — gradient, grid, apapun</small></div>' },
      { raw: '<div style="display:flex;gap:8px;margin-top:8px"><div style="flex:1;padding:10px;border-radius:10px;background:rgba(34,197,94,.12);color:#22c55e;text-align:center"><b>99.9%</b><br><small>Uptime</small></div><div style="flex:1;padding:10px;border-radius:10px;background:rgba(59,130,246,.12);color:#3b82f6;text-align:center"><b>12k+</b><br><small>Pengguna</small></div><div style="flex:1;padding:10px;border-radius:10px;background:rgba(245,158,11,.12);color:#f59e0b;text-align:center"><b>4.9★</b><br><small>Rating</small></div></div>' },
      { footer: "NeoBot • Rich HTML" }
    ], "🎨 Rich HTML")
    return
  }
  if (text === "/ping") return sendText(from, "🏓 Pong! Bot online ✅")
  if (text.startsWith("/")) sendText(from, "❓ Perintah gak dikenal. Ketik /help")
}

let groupCache = {}
function handleGroup(p) {
  if (!p || !p.msg) return
  const msg = p.msg
  const groupId = p.groupId
  const text = (msg.text || "").trim()
  if (msg.type === "rich" || msg.type === "file") return // jangan reply pesan bot sendiri
  log("👥 Grup", groupId.slice(0,8), "—", (msg.fromName||"?"), ":", text)
  if (text === "/menu") return sendGroupRich(groupId, RICH.menu(botName), "🤖 Menu Grup")
  if (text === "/promo") return sendGroupRich(groupId, RICH.promo(), "🔥 Promo")
  if (text === "/grupinfo") {
    socket.emit("group:send", { groupId, text: "__grupinfo__" }, () => {})
    // ambil info via REST
    fetch(SERVER + "/api/groups", { headers: { Cookie: "neo_device=" + deviceToken } })
      .then(r => r.json()).then(d => {
        const g = (d.groups || []).find(x => x.id === groupId)
        if (g) sendGroupRich(groupId, RICH.grupinfo(g), "👥 Info Grup")
      }).catch(() => {})
    return
  }
  if (text.startsWith("/announce ")) {
    const t = text.replace("/announce ", "")
    return sendGroupRich(groupId, RICH.announce(t), "📣 Pengumuman")
  }
  if (text === "/ping") return sendGroupRich(groupId, [{ p: "🏓 Pong! Bot online ✅" }], "🏓")
}

/* ── Terminal REPL ── */
rl.on("line", (line) => {
  const t = line.trim()
  if (!t) return
  if (t === "exit" || t === "quit") { log("👋 Byee"); process.exit(0) }
  if (t === "status") { log("socket:", socket && socket.connected ? "🟢 connected" : "🔴 off"); return }
  log("💡 perintah terminal: status | exit")
})

/* ── MAIN ── */
;(async () => {
  log("🔐 Pairing dgn kode:", CODE)
  try {
    const token = await pair()
    log("✅ Pairing sukses!")
    connect(token)
  } catch (e) {
    log("❌", e.message)
    process.exit(1)
  }
})()
