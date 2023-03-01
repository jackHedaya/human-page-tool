// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
import { contextBridge, ipcRenderer } from "electron"
import { Snippet } from "../types/snippet"

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
const validSendChannels = [
  "control:next",
  "control:undo",
  "control:redo",
] as const

const validReceiveChannels = ["main:rerender"] as const

type ChannelDataTypes = {
  "control:next": undefined
  "control:undo": undefined
  "control:redo": undefined
  "main:rerender": Snippet[]
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

  receive: <Channel extends typeof validReceiveChannels[number]>(
    channel: Channel,
    func: (data: ChannelDataTypes[Channel]) => void
  ) => {
    if (validReceiveChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender` and is a security risk

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      ipcRenderer.on(channel, (event, ...args) => func(...args))
    }
  },
}

export type Api = typeof api

contextBridge.exposeInMainWorld("api", api)
