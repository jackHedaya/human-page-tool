import type { ForgeConfig } from "@electron-forge/shared-types"
import { MakerSquirrel } from "@electron-forge/maker-squirrel"
import { MakerZIP } from "@electron-forge/maker-zip"
import { MakerDeb } from "@electron-forge/maker-deb"
import { MakerRpm } from "@electron-forge/maker-rpm"
import { WebpackPlugin } from "@electron-forge/plugin-webpack"

import { mainConfig } from "./webpack.main.config"
import { rendererConfig } from "./webpack.renderer.config"
import path from "path"

const BASE_PATH = "./src/views"

const getPath = (name: string, file: string) => {
  return './' + path.join(BASE_PATH, name, file)
}

const config: ForgeConfig = {
  packagerConfig: {},
  rebuildConfig: {},
  makers: [
    new MakerSquirrel({}),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({}),
  ],
  plugins: [
    new WebpackPlugin({
      mainConfig,
      renderer: {
        config: rendererConfig,
        entryPoints: [
          {
            html: getPath("start", "index.html"),
            js: getPath("start", "renderer.ts"),
            name: "start_view",
            preload: {
              js: getPath("start", "preload.ts"),
            },
          },
          {
            html: getPath("finish", "index.html"),
            js: getPath("finish", "renderer.ts"),
            name: "finish_view",
            preload: {
              js: getPath("finish", "preload.ts"),
            },
          },
          {
            html: getPath("control", "index.html"),
            js: getPath("control", "renderer.ts"),
            name: "control_view",
            preload: {
              js: getPath("control", "preload.ts"),
            },
          },
          {
            name: "site_view",
            preload: {
              js: getPath("site", "preload.ts"),
            },
          },
        ],
      },
    }),
  ],
}

export default config
