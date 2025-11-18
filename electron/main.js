const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const dgram = require('dgram');
const fs = require('fs');

let mainWindow;
let udpServer;
const PORT = 8888;

// Créer le serveur UDP
function createUDPServer() {
  udpServer = dgram.createSocket('udp4');

  udpServer.on('message', (msg, rinfo) => {
    try {
      // Format attendu: JSON avec esp32Id, streamId, timestamp, data (ou value)
      const data = JSON.parse(msg.toString());
      
      // Normaliser le format: accepter "data" ou "value"
      if (data.value !== undefined && data.data === undefined) {
        data.data = data.value;
      }
      
      // Si pas d'esp32Id, utiliser l'IP source comme identifiant temporaire
      if (!data.esp32Id && rinfo.address) {
        data.esp32Id = `ip-${rinfo.address.replace(/\./g, '-')}`;
      }
      
      // Envoyer les données au renderer via IPC
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('udp-data', {
          ...data,
          sourceIP: rinfo.address,
          sourcePort: rinfo.port
        });
      }
    } catch (error) {
      console.error('Erreur parsing UDP:', error, 'Message:', msg.toString());
    }
  });

  udpServer.on('error', (err) => {
    console.error('Erreur serveur UDP:', err);
  });

  udpServer.bind(PORT, () => {
    console.log(`Serveur UDP démarré sur le port ${PORT}`);
  });
}

// Chemin du fichier de configuration
const configPath = path.join(app.getPath('userData'), 'config.json');

// Charger la configuration
function loadConfig() {
  try {
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    }
  } catch (error) {
    console.error('Erreur chargement config:', error);
  }
  return { esp32s: [], streams: [] };
}

// Sauvegarder la configuration
function saveConfig(config) {
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Erreur sauvegarde config:', error);
  }
}

// IPC Handlers - Enregistrer avant la création de la fenêtre
console.log('Enregistrement des handlers IPC...');

ipcMain.handle('get-config', () => {
  return loadConfig();
});

ipcMain.handle('save-config', (event, config) => {
  saveConfig(config);
  return true;
});

ipcMain.handle('get-udp-port', () => {
  return PORT;
});

// Envoyer une commande UDP
ipcMain.handle('send-udp-command', (event, { ip, port, command }) => {
  console.log('Handler send-udp-command appelé:', { ip, port, command });
  return new Promise((resolve, reject) => {
    try {
      const client = dgram.createSocket('udp4');
      const message = Buffer.from(JSON.stringify(command));
      
      client.send(message, port || PORT, ip, (err) => {
        client.close();
        if (err) {
          console.error('Erreur envoi UDP:', err);
          reject(err);
        } else {
          console.log('Commande UDP envoyée avec succès');
          resolve(true);
        }
      });
    } catch (error) {
      console.error('Erreur création socket UDP:', error);
      reject(error);
    }
  });
});

// Sauvegarder la configuration dans un fichier
ipcMain.handle('save-config-file', async (event, config) => {
  try {
    const window = BrowserWindow.fromWebContents(event.sender)
    const { canceled, filePath } = await dialog.showSaveDialog(window || mainWindow, {
      title: 'Sauvegarder la configuration',
      defaultPath: 'esp32-config.json',
      filters: [
        { name: 'JSON', extensions: ['json'] },
        { name: 'Tous les fichiers', extensions: ['*'] }
      ]
    });

    if (canceled || !filePath) {
      return { success: false, canceled: true };
    }

    fs.writeFileSync(filePath, JSON.stringify(config, null, 2));
    return { success: true, filePath };
  } catch (error) {
    console.error('Erreur sauvegarde fichier:', error);
    return { success: false, error: error.message };
  }
});

// Charger une configuration depuis un fichier
ipcMain.handle('load-config-file', async (event) => {
  try {
    const window = BrowserWindow.fromWebContents(event.sender)
    const { canceled, filePaths } = await dialog.showOpenDialog(window || mainWindow, {
      title: 'Charger une configuration',
      filters: [
        { name: 'JSON', extensions: ['json'] },
        { name: 'Tous les fichiers', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (canceled || !filePaths || filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    const filePath = filePaths[0];
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const config = JSON.parse(fileContent);
    
    return { success: true, config, filePath };
  } catch (error) {
    console.error('Erreur chargement fichier:', error);
    return { success: false, error: error.message };
  }
});

console.log('Tous les handlers IPC sont enregistrés');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();
  createUDPServer();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (udpServer) {
    udpServer.close();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

