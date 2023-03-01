// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron"

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const validSendChannels = ["finish:quit"] as const

type ChannelDataTypes = {
  "finish:quit": undefined
}

const api = {
  send: <Channel extends typeof validSendChannels[number]>(
    channel: Channel,
    data: ChannelDataTypes[Channel] = undefined
  ) => {
    if (validSendChannels.includes(channel)) {
      ipcRenderer.send(channel, data)
    }
  },
}

export type Api = typeof api

contextBridge.exposeInMainWorld("api", api)
