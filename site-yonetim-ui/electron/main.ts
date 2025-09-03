import { app, BrowserWindow, shell } from 'electron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, ChildProcess } from 'node:child_process';
import fs from 'node:fs';

// --- KARA KUTU: LOGLAMA SİSTEMİ ---
const logFilePath = path.join(app.getPath('desktop'), 'site-yonetim-log.txt');
const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });
function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp}: ${message}\n`;
  console.log(logMessage); // Geliştirme ortamı için konsola da yaz
  logStream.write(logMessage); // Dosyaya yaz
}
log('--- Uygulama Başlatılıyor ---');


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.APP_ROOT = path.join(__dirname, '..');

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'renderer');

let childProcesses: ChildProcess[] = [];

app.on('quit', () => {
  log('Uygulama kapatılıyor, tüm alt süreçler sonlandırılıyor...');
  childProcesses.forEach(p => p.kill());
  logStream.end();
});


async function createWindow() {
  try {
    await startMongo();
    await startJavaBackend();
  } catch (error) {
    log(`Başlatma sırasında kritik hata: ${error}`);
    app.quit();
    return;
  }
  
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    title: 'ACR Site Yönetim Sistemi',
    icon: path.join(process.env.APP_ROOT, 'build', 'icon.ico'),
    webPreferences: {
      sandbox: false,
      preload: path.join(__dirname, '..', 'preload', 'index.js'),
    },
  });

  win.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'));
  }
  log('Arayüz penceresi başarıyla yüklendi.');
}

function getPath(relativePath: string): string {
  const prodPath = path.join(process.resourcesPath, ...relativePath.split('/'));
  const devPath = path.join(process.env.APP_ROOT, ...relativePath.split('/'));
  return fs.existsSync(prodPath) ? prodPath : devPath;
}

function startMongo(): Promise<void> {
  return new Promise((resolve, reject) => {
    const dbPath = path.join(app.getPath('userData'), 'db');
    if (!fs.existsSync(dbPath)) {
      fs.mkdirSync(dbPath, { recursive: true });
    }
    
    const mongoPath = getPath('vendor/mongodb/bin/mongod.exe');
    log(`MongoDB başlatılıyor: ${mongoPath}`);
    if (!fs.existsSync(mongoPath)) {
        return reject(`MongoDB çalıştırılabilir dosyası bulunamadı: ${mongoPath}`);
    }

    const mongoProcess = spawn(mongoPath, [`--dbpath=${dbPath}`]);
    childProcesses.push(mongoProcess);

    mongoProcess.stdout.on('data', (data) => {
      const message = data.toString();
      log(`[MongoDB]: ${message}`);
      if (message.includes('Waiting for connections')) {
        log('MongoDB başarıyla başlatıldı.');
        resolve();
      }
    });

    mongoProcess.stderr.on('data', (data) => {
      log(`[MongoDB HATA]: ${data.toString()}`);
    });
    
    mongoProcess.on('close', (code) => {
      if (code !== 0) reject(`MongoDB beklenmedik bir şekilde kapandı, kod: ${code}`);
    });
  });
}

function startJavaBackend(): Promise<void> {
  return new Promise((resolve, reject) => {
    const jrePath = getPath('vendor/jre/bin/java.exe');
    const jarPath = getPath('vendor/jar/sistemapi.jar');
    log(`Java Backend başlatılıyor: ${jrePath} -jar ${jarPath}`);
    if (!fs.existsSync(jrePath)) return reject(`Java çalıştırılabilir dosyası bulunamadı: ${jrePath}`);
    if (!fs.existsSync(jarPath)) return reject(`sistemapi.jar dosyası bulunamadı: ${jarPath}`);

    const javaProcess = spawn(jrePath, ['-jar', jarPath]);
    childProcesses.push(javaProcess);

    javaProcess.stdout.on('data', (data) => {
      const message = data.toString();
      log(`[Java Backend]: ${message}`);
      if (message.includes('Started SistemapiApplication')) {
        log('Java Backend başarıyla başlatıldı.');
        resolve();
      }
    });

    javaProcess.stderr.on('data', (data) => {
      log(`[Java Backend HATA]: ${data.toString()}`);
    });
    
    javaProcess.on('close', (code) => {
      if (code !== 0) reject(`Java Backend beklenmedik bir şekilde kapandı, kod: ${code}`);
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.whenReady().then(createWindow).catch(e => log(`whenReady hatası: ${e}`));