// expose selectDirectory to the renderer process

import { contextBridge, ipcRenderer } from "electron"

contextBridge.exposeInMainWorld("api", {
  selectDirectory: () => {
    ipcRenderer.send("start:open-dialog")
  },
})
