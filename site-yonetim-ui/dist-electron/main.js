import { app as d, BrowserWindow as b, shell as y } from "electron";
import r from "node:path";
import { fileURLToPath as P } from "node:url";
import { spawn as g } from "node:child_process";
import l from "node:fs";
const k = r.join(d.getPath("desktop"), "site-yonetim-log.txt"), f = l.createWriteStream(k, { flags: "a" });
function o(a) {
  const n = `${(/* @__PURE__ */ new Date()).toISOString()}: ${a}
`;
  console.log(n), f.write(n);
}
o("--- Uygulama Başlatılıyor ---");
const w = P(import.meta.url), h = r.dirname(w);
process.env.APP_ROOT = r.join(h, "..");
const u = process.env.VITE_DEV_SERVER_URL, S = r.join(process.env.APP_ROOT, "renderer");
let p = [];
d.on("quit", () => {
  o("Uygulama kapatılıyor, tüm alt süreçler sonlandırılıyor..."), p.forEach((a) => a.kill()), f.end();
});
async function v() {
  try {
    await R(), await j();
  } catch (e) {
    o(`Başlatma sırasında kritik hata: ${e}`), d.quit();
    return;
  }
  const a = new b({
    width: 1280,
    height: 800,
    autoHideMenuBar: !0,
    title: "ACR Site Yönetim Sistemi",
    icon: r.join(process.env.APP_ROOT, "build", "icon.ico"),
    webPreferences: {
      sandbox: !1,
      preload: r.join(h, "..", "preload", "index.js")
    }
  });
  a.webContents.setWindowOpenHandler((e) => (y.openExternal(e.url), { action: "deny" })), u ? (a.loadURL(u), a.webContents.openDevTools()) : a.loadFile(r.join(S, "index.html")), o("Arayüz penceresi başarıyla yüklendi.");
}
function m(a) {
  const e = r.join(process.resourcesPath, ...a.split("/")), n = r.join(process.env.APP_ROOT, ...a.split("/"));
  return l.existsSync(e) ? e : n;
}
function R() {
  return new Promise((a, e) => {
    const n = r.join(d.getPath("userData"), "db");
    l.existsSync(n) || l.mkdirSync(n, { recursive: !0 });
    const s = m("vendor/mongodb/bin/mongod.exe");
    if (o(`MongoDB başlatılıyor: ${s}`), !l.existsSync(s))
      return e(`MongoDB çalıştırılabilir dosyası bulunamadı: ${s}`);
    const i = g(s, [`--dbpath=${n}`]);
    p.push(i), i.stdout.on("data", (t) => {
      const c = t.toString();
      o(`[MongoDB]: ${c}`), c.includes("Waiting for connections") && (o("MongoDB başarıyla başlatıldı."), a());
    }), i.stderr.on("data", (t) => {
      o(`[MongoDB HATA]: ${t.toString()}`);
    }), i.on("close", (t) => {
      t !== 0 && e(`MongoDB beklenmedik bir şekilde kapandı, kod: ${t}`);
    });
  });
}
function j() {
  return new Promise((a, e) => {
    const n = m("vendor/jre/bin/java.exe"), s = m("vendor/jar/sistemapi.jar");
    if (o(`Java Backend başlatılıyor: ${n} -jar ${s}`), !l.existsSync(n)) return e(`Java çalıştırılabilir dosyası bulunamadı: ${n}`);
    if (!l.existsSync(s)) return e(`sistemapi.jar dosyası bulunamadı: ${s}`);
    const i = g(n, ["-jar", s]);
    p.push(i), i.stdout.on("data", (t) => {
      const c = t.toString();
      o(`[Java Backend]: ${c}`), c.includes("Started SistemapiApplication") && (o("Java Backend başarıyla başlatıldı."), a());
    }), i.stderr.on("data", (t) => {
      o(`[Java Backend HATA]: ${t.toString()}`);
    }), i.on("close", (t) => {
      t !== 0 && e(`Java Backend beklenmedik bir şekilde kapandı, kod: ${t}`);
    });
  });
}
d.on("window-all-closed", () => {
  process.platform !== "darwin" && d.quit();
});
d.whenReady().then(v).catch((a) => o(`whenReady hatası: ${a}`));
