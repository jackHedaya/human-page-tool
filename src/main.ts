import { BrowserView, ipcMain } from "electron"

type IpcArgs = {
  textView: BrowserView
  siteView: BrowserView
}

let textSnippets: { text: string; xpath: string }[] = []

export const ipc: (a: IpcArgs) => void = ({ textView, siteView }) => {
  ipcMain.on("site:update", (event, { snippets }) => {
    textSnippets = snippets
    console.log(textSnippets)
    textView.webContents.send("update-snippets", textSnippets)
  })
}
