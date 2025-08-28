import { app, BrowserWindow, shell } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// --- HATA DÜZELTMESİ ---
// ES Modüllerinde __dirname değişkeni bulunmadığı için, onu manuel olarak tanımlıyoruz.
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
// --- DÜZELTME SONU ---

// Bu bölüm, projenizin derlenmiş dosyalarının nerede olduğunu tanımlar.
// Bu yapı, projenizin hem geliştirme (dev) hem de üretim (build) modunda
// doğru dosya yollarını bulmasını sağlar.
process.env.APP_ROOT = path.join(__dirname, '..')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'renderer')
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    width: 1024, // Pencere genişliğini biraz daha artıralım
    height: 768, // Pencere yüksekliğini artıralım
    autoHideMenuBar: true,
    title: '2000 Evler Sitesi Yönetim', // Pencere başlığını burada belirliyoruz
    icon: path.join(process.env.APP_ROOT, 'build', 'icon.png'), // Uygulama ikonu (ileride ekleyeceğiz)
    webPreferences: {
      sandbox: false,
      preload: path.join(__dirname, '../preload/index.js'),
    },
  })

  // Renderer-process'e test mesajı gönderme
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  // Dış linklerin varsayılan tarayıcıda açılmasını sağlar
  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Geliştirme modunda Vite sunucusunu, üretim modunda ise derlenmiş dosyayı yükle
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Tüm pencereler kapandığında uygulamayı kapat (macOS hariç)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

// Dock ikonu tıklandığında yeni pencere oluştur (macOS)
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// Uygulama hazır olduğunda pencereyi oluştur
app.whenReady().then(createWindow)
