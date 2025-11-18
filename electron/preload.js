const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Configuration
  getConfig: () => ipcRenderer.invoke('get-config'),
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),
  getUDPPort: () => ipcRenderer.invoke('get-udp-port'),
  
  // UDP Data
  onUDPData: (callback) => {
    ipcRenderer.on('udp-data', (event, data) => callback(data));
  },
  
  removeUDPListener: () => {
    ipcRenderer.removeAllListeners('udp-data');
  },
  
  // Send UDP Command
  sendUDPCommand: (ip, port, command) => ipcRenderer.invoke('send-udp-command', { ip, port, command }),
  
  // Config file management
  saveConfigFile: (config) => ipcRenderer.invoke('save-config-file', config),
  loadConfigFile: () => ipcRenderer.invoke('load-config-file')
});

