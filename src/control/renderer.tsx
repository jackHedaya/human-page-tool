import "./index.css"
import { marked } from "marked"
import { Snippet } from "../types/snippet"

const state = {
  snippets: [] as Snippet[],
}

declare const api: {
  receive: (event: string, callback: (data: unknown) => void) => void
  send: (event: string, data: unknown) => void
}

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
)

api.receive("main:rerender", (d) => {
  state.snippets = d as Snippet[]

  render()
})

function render() {
  const root = document.getElementById("markup")!

  console.log("rendering", state.snippets)
  root.innerHTML = marked(
    state.snippets.map((snippet) => snippet.markdown).join("\n")
  )
}
