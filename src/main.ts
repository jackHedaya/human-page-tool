import { BrowserView, ipcMain } from "electron"

ipcMain.on("preload:page-text", (event, { text, xpath }) => {
  console.log(text, xpath)
})

type IpcArgs = {
  textView: BrowserView
  siteView: BrowserView
}

export const ipc: (a: IpcArgs) => void = ({ textView, siteView }) => {
  ipcMain.on("preload:page-text", (event, { text, xpath }) => {
    console.log(text, xpath)
    textView.webContents.send("preload:page-text", { text, xpath })
  })
}
