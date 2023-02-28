// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron"

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld("api", {
  send: (channel: string, data: any) => {
    // whitelist channels
    const validChannels = ["control:next"]
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },

  receive: (channel: string, func: any) => {
    const validChannels = ["main:rerender"]
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` and is a security risk
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  },
})
