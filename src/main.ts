import { dialog, BrowserView, ipcMain, BrowserWindow } from "electron"
import { PageStore } from "./PageStore"

type IpcArgs = {
  textView: BrowserView
  siteView: BrowserView
  mainWindow: BrowserWindow
}

let textSnippets: { text: string; xpath: string; tag: string }[] = []

let store: PageStore
const pageIdx = 0

export const ipc: (a: IpcArgs) => void = ({
  textView,
  siteView,
  mainWindow,
}) => {
  ipcMain.on("site:update", (event, { snippets }) => {
    textSnippets = snippets
    console.log(textSnippets)
    textView.webContents.send("update:data", textSnippets)
  })

  ipcMain.on("control:done", (event, { snippets }) => {})

  ipcMain.on("start:open-dialog", async (event) => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    })

    if (result.canceled) {
      return
    }

    const [path] = result.filePaths

    const outPath = path.split("/").slice(0, -1).concat(["extracted"]).join("/")

    store = new PageStore(path, outPath)

    await store.loadDirectory()

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mainWindow.removeBrowserView(mainWindow.getBrowserView()!)

    const page = await store.getPage(pageIdx)

    const htmlToDataUrl = (html: string) => {
      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`
      return dataUrl
    }

    siteView.webContents.loadURL(htmlToDataUrl(page.page))

    mainWindow.addBrowserView(siteView)
    mainWindow.addBrowserView(textView)

    textView.setBounds({
      x: mainWindow.getBounds().width / 2,
      y: 0,
      width: mainWindow.getBounds().width / 2,
      height: mainWindow.getBounds().height,
    })

    siteView.setBounds({
      x: 0,
      y: 0,
      width: mainWindow.getBounds().width / 2,
      height: mainWindow.getBounds().height,
    })
  })
}
