export interface ElectronAPI {
  getConfig: () => Promise<any>
  saveConfig: (config: any) => Promise<boolean>
  getUDPPort: () => Promise<number>
  onUDPData: (callback: (data: any) => void) => void
  removeUDPListener: () => void
  sendUDPCommand: (ip: string, port: number, command: any) => Promise<boolean>
  saveConfigFile: (config: any) => Promise<{ success: boolean; canceled?: boolean; filePath?: string; error?: string }>
  loadConfigFile: () => Promise<{ success: boolean; canceled?: boolean; config?: any; filePath?: string; error?: string }>
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

