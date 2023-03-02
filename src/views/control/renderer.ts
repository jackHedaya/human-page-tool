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

  const modal = document.getElementById("modal")!
  modal.style.display = "none"

  const modalTextarea = document.getElementById(
    "modal-textarea"
  ) as HTMLTextAreaElement

  document.getElementById("open-modal")!.addEventListener("click", () => {
    modal.style.display = "block"

    modalTextarea.focus()
  })

  document.getElementById("modal-close")!.addEventListener("click", () => {
    console.log("close")
    modal.style.display = "none"
  })

  const submitModal = async () => {
    state.snippets = await api.addSnippet({
      markdown: modalTextarea.value,
      xpath: "",
    })

    modal.style.display = "none"
    modalTextarea.value = ""

    render()
  }

  document.getElementById("modal-send")!.addEventListener("click", async () => {
    await submitModal()
  })

  modalTextarea.addEventListener("keydown", async (e) => {
    if (e.key === "Escape") {
      modal.style.display = "none"
    }

    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
    if (e.key === "Enter" && (isMac ? e.metaKey : e.ctrlKey)) {
      await submitModal()
    }
  })
})
