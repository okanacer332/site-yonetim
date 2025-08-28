import { app, BrowserWindow, shell } from "electron";
import path from "node:path";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
process.env.APP_ROOT = path.join(__dirname, "..");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "renderer");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 1024,
    // Pencere genişliğini biraz daha artıralım
    height: 768,
    // Pencere yüksekliğini artıralım
    autoHideMenuBar: true,
    title: "2000 Evler Sitesi Yönetim",
    // Pencere başlığını burada belirliyoruz
    icon: path.join(process.env.APP_ROOT, "build", "icon.png"),
    // Uygulama ikonu (ileride ekleyeceğiz)
    webPreferences: {
      sandbox: false,
      preload: path.join(__dirname, "../preload/index.js")
    }
  });
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html"));
  }
}
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
export {
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
