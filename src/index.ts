import { app, BrowserView, BrowserWindow } from "electron"
import { ipc } from "./main"
// This allows TypeScript to pick up the magic constants that's auto-generated by Forge's Webpack
// plugin that tells the Electron app where to look for the Webpack-bundled app code (depending on
// whether you're running in development or production).

declare const START_VIEW_WEBPACK_ENTRY: string
declare const START_VIEW_PRELOAD_WEBPACK_ENTRY: string

declare const SITE_VIEW_PRELOAD_WEBPACK_ENTRY: string

declare const CONTROL_VIEW_WEBPACK_ENTRY: string
declare const CONTROL_VIEW_PRELOAD_WEBPACK_ENTRY: string

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit()
}

const WINDOW_WIDTH = 800
const WINDOW_HEIGHT = 600

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    webPreferences: {
      nodeIntegration: true,
    },
  })

  const startView = new BrowserView({
    webPreferences: {
      preload: START_VIEW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
    },
  })

  mainWindow.setBrowserView(startView)

  startView.setBounds({
    x: 0,
    y: 0,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  })

  mainWindow.on("resize", () => {
    startView.setBounds({
      x: 0,
      y: 0,
      width: mainWindow.getBounds().width,
      height: mainWindow.getBounds().height,
    })
  })

  startView.webContents.loadURL(START_VIEW_WEBPACK_ENTRY)

  const siteView = new BrowserView({
    webPreferences: {
      preload: SITE_VIEW_PRELOAD_WEBPACK_ENTRY,
      nodeIntegration: true,
    },
  })

  const textView = new BrowserView({
    webPreferences: {
      preload: CONTROL_VIEW_PRELOAD_WEBPACK_ENTRY,
    },
  })

  textView.webContents.loadURL(CONTROL_VIEW_WEBPACK_ENTRY)

  ipc({ siteView, textView, mainWindow })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow)

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
