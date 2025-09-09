import { app, BrowserWindow, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "node:child_process";
import fs from "node:fs";
const logFilePath = path.join(app.getPath("desktop"), "site-yonetim-log.txt");
const logStream = fs.createWriteStream(logFilePath, { flags: "a" });
function log(message) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const logMessage = `${timestamp}: ${message}
`;
  console.log(logMessage);
  logStream.write(logMessage);
}
log("--- Uygulama Başlatılıyor ---");
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
const RENDERER_DIST = path.join(process.env.APP_ROOT, "renderer");
let childProcesses = [];
app.on("quit", () => {
  log("Uygulama kapatılıyor, tüm alt süreçler sonlandırılıyor...");
  childProcesses.forEach((p) => {
    try {
      p.kill();
    } catch (e) {
      log(`Alt süreç kapatılamadı: ${e}`);
    }
  });
  logStream.end();
});
async function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    title: "ACR Site Yönetim Sistemi",
    icon: path.join(process.env.APP_ROOT, "build", "icon.ico"),
    webPreferences: {
      sandbox: false,
      preload: path.join(__dirname, "..", "preload", "index.js")
    }
  });
  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
  log("Arayüz penceresi başarıyla yüklendi.");
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.whenReady().then(createWindow).catch((e) => log(`whenReady hatası: ${e}`));
