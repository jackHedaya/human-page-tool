import "./index.css"

import { Api } from "./preload"

declare const api: Api

document.addEventListener("DOMContentLoaded", () => {
  const button1 = document.getElementById("finish")!

  button1.addEventListener("click", () => api.send("finish:quit"))

  const button2 = document.getElementById("finder")!

  button2.addEventListener("click", () => api.send("finish:finder"))
})
