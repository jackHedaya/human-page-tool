import "./index.css"
import { marked } from "marked"
import Root from "./root"
import * as ReactDOM from "react-dom/client"
import { createStore } from "state-pool"

const state = {
  snippets: [] as Snippet[],
}

declare const api: {
  receive: (event: string, callback: (data: unknown) => void) => void
  send: (event: string, data: unknown) => void
}

export type Snippet = {
  text: string
  xpath: string
  tag: string
}

console.log(
  '👋 This message is being logged by "renderer.js", included via webpack'
)

api.receive("update:data", (d) => {
  state.snippets = d as Snippet[]

  render()
})

function render() {
  const root = document.getElementById("markup")

  console.log("rendering", state.snippets)

  root.innerHTML = marked(
    state.snippets.map((snippet) => snippet.text).join("\n")
  )
}
