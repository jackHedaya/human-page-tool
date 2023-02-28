import { dialog, BrowserView, ipcMain, BrowserWindow } from "electron"
import { file } from "tmp-promise"
import { writeFile } from "fs/promises"
import { PageStore } from "./state/PageStore"

type IpcArgs = {
  textView: BrowserView
  siteView: BrowserView
  mainWindow: BrowserWindow
}

const store: PageStore = new PageStore()

let pageIdx = 0

export const ipc: (a: IpcArgs) => void = ({
  textView,
  siteView,
  mainWindow,
}) => {
  ipcMain.handle("site:add-snippet", (event, { snippet }) => {
    return store.addSnippet(pageIdx, snippet)
  })

  ipcMain.handle("site:sort-snippets", (event, { order }) => {
    return store.sortSnippets(pageIdx, order)
  })

  ipcMain.on("control:next", async (event) => {
    await store.syncSnippets(pageIdx)

    pageIdx++

    ipcMain.emit("main:load-site", { idx: pageIdx })
  })

  ipcMain.on("main:load-site", async (event, { idx }) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    mainWindow.removeBrowserView(mainWindow.getBrowserView()!)

    const page = await store.getPage(idx)

    const { path: sitePath, cleanup } = await loadHtml(page.page.data)

    siteView.webContents.loadURL(sitePath)

    siteView.webContents.on("destroyed", () => {
      cleanup()
    })

    mainWindow.addBrowserView(siteView)
    mainWindow.addBrowserView(textView)

    siteView.webContents.openDevTools({ mode: "detach" })
    textView.webContents.openDevTools({ mode: "detach" })

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

  ipcMain.on("start:open-dialog", async (event) => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    })

    if (result.canceled) {
      return
    }

    const [path] = result.filePaths

    const outPath = path.split("/").slice(0, -1).concat(["extracted"]).join("/")

    store.setPath(path)
    store.setOutPath(outPath)

    await store.loadDirectory()

    ipcMain.emit("main:load-site", { idx: pageIdx })
  })
}

const loadHtml = async (page: string) => {
  const { path, cleanup } = await file({ postfix: ".mhtml" })

  await writeFile(path, page)

  return { path: `file://${path}`, cleanup }
}
