const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  socketData: (data) => ipcRenderer.send('socket-data', data),
  connected: () => ipcRenderer.send('socket-connect', 'connected')
})