import { dialog, BrowserView, ipcMain, BrowserWindow } from "electron"
import { file } from "tmp-promise"
import { writeFile } from "fs/promises"
import { PageStore } from "./state/PageStore"
import { ActionStack, AddSnippetAction } from "./state/ActionStack"
import { readFileSync } from "fs"

type IpcArgs = {
  textView: BrowserView
  siteView: BrowserView
  finishView: BrowserView
  mainWindow: BrowserWindow
}

const store: PageStore = new PageStore()

const actionStack = new ActionStack()

let configPath: string,
  pageIdx = 0

export const ipc: (a: IpcArgs) => void = ({
  textView,
  siteView,
  mainWindow,
  finishView,
}) => {
  ipcMain.handle("site:add-snippet", (event, { snippet }) => {
    actionStack.push(new AddSnippetAction(store, pageIdx, snippet))

    return store.addSnippet(pageIdx, snippet)
  })

  ipcMain.handle("site:sort-snippets", (event, { order }) => {
    return store.sortSnippets(pageIdx, order)
  })

  ipcMain.handle("site:rerender-control", async () => {
    textView.webContents.send("main:rerender", store.getSnippets(pageIdx))
  })

  ipcMain.on("control:undo", () => {
    actionStack.undo()
    textView.webContents.send("main:rerender", store.getSnippets(pageIdx))
  })

  ipcMain.on("control:redo", () => {
    actionStack.redo()
    textView.webContents.send("main:rerender", store.getSnippets(pageIdx))
  })

  ipcMain.on("control:next", async (event) => {
    await store.flushSnippets(pageIdx)

    pageIdx++

    await writeFile(configPath, pageIdx.toString())

    if (pageIdx >= store.size()) {
      ipcMain.emit("main:finish", null)
      return
    }

    ipcMain.emit("main:load-site", null, { idx: pageIdx })

    actionStack.clear()
  })

  ipcMain.on("main:load-site", async (event, { idx }) => {
    const page = await store.getPage(idx)

    const { path: sitePath, cleanup } = await loadHtml(page.page.data)

    siteView.webContents.loadURL(sitePath)
    textView.webContents.send("main:rerender", store.getSnippets(pageIdx))

    siteView.webContents.on("destroyed", () => {
      cleanup()
    })
  })

  ipcMain.on("main:finish", async (event) => {
    await store.flushSnippets(pageIdx)

    mainWindow.removeBrowserView(siteView)
    mainWindow.removeBrowserView(textView)

    mainWindow.addBrowserView(finishView)

    finishView.setBounds({
      x: 0,
      y: 0,
      width: mainWindow.getBounds().width,
      height: mainWindow.getBounds().height,
    })
  })

  ipcMain.on("start:start", async (event) => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory"],
    })

    if (result.canceled) {
      return
    }

    const [path] = result.filePaths

    const outPath = path.split("/").slice(0, -1).concat(["extracted"]).join("/")

    store.setPath(path)
    await store.setOutPath(outPath)

    await store.loadDirectory()

    configPath = store.getOutPathForFile("human-page-tool")

    try {
      pageIdx = parseInt(readFileSync(configPath, "utf-8"))

      if (pageIdx >= store.size()) pageIdx = 0
    } catch (e) {
      /* empty */
    }

    mainWindow.removeBrowserView(mainWindow.getBrowserView()!)

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

    ipcMain.emit("main:load-site", null, { idx: pageIdx })
  })

  ipcMain.on("finish:quit", async (event) => {
    mainWindow.close()
  })
}

const loadHtml = async (page: string) => {
  const { path, cleanup } = await file({ postfix: ".mhtml" })

  await writeFile(path, page)

  return { path: `file://${path}`, cleanup }
}
