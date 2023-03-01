import "./index.css"
import { marked } from "marked"
import type { Snippet } from "@/types/snippet"
import type { Api } from "./preload"

declare const api: Api

const state = {
  snippets: [] as Snippet[],
}

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
)

api.receive("main:rerender", (d) => {
  state.snippets = d

  render()
})

function render() {
  const root = document.getElementById("markup")!
  root.innerHTML = ""

  for (const snippet of state.snippets) {
    const el = document.createElement("div")
    el.innerHTML = marked(snippet.markdown)
    root.appendChild(el)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("undo")!.addEventListener("click", () => {
    api.send("control:undo")
  })

  document.getElementById("redo")!.addEventListener("click", () => {
    api.send("control:redo")
  })

  document.getElementById("next")!.addEventListener("click", () => {
    api.send("control:next")
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "z" && e.ctrlKey) {
      api.send("control:undo")
    } else if (e.key === "y" && e.ctrlKey) {
      api.send("control:redo")
    } else if (e.key === "ArrowRight") {
      api.send("control:next")
    }
  })
})
