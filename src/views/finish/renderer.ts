import "./index.css"

import { Api } from "./preload"

declare const api: Api

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("finish")!

  button.addEventListener("click", () => api.send("finish:quit"))
})
