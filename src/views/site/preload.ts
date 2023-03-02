import { ipcRenderer } from "electron"
import type { Snippet } from "@/types/snippet"
import { arrestDocument } from "./arrestDocument"
import { markdownFromElement } from "./markdown"
import { sortSnippetsOrder } from "./sortSnippets"
import { xPath } from "./xpath"
import {
  isUsed,
  setHighlighted,
  isHandlersAdded,
  setHandlersAdded,
  removeUsed,
  setUsed,
  removeHighlighted,
} from "./interaction-store"

console.log(
  '👋 This message is being logged by "preload.ts", included via webpack'
)

ipcRenderer.on("main:rerender", (event, snippets: Snippet[]) => {
  console.log("rerender", snippets)
  rerender(snippets)
})

async function sendSnippet({
  markdown,
  xpath,
}: {
  markdown: string
  xpath: string
}): Promise<Snippet[]> {
  const snippets: Snippet[] = await ipcRenderer.invoke("site:add-snippet", {
    snippet: {
      markdown,
      xpath,
    },
  })

  const sortOrder = sortSnippetsOrder(snippets)

  const sorted = ipcRenderer.invoke("site:sort-snippets", {
    order: sortOrder,
  })

  await ipcRenderer.invoke("site:rerender-control")

  return sorted
}

document.addEventListener("DOMContentLoaded", () => {
  arrestDocument(document)

  // add style that any element that has been used will have a green background
  const style = document.createElement("style")
  style.innerHTML = `
    *[data-used=true] {
      background: green !important;
    }

    *[data-highlighted=true] {
      background: red !important;
    }
  }`

  document.head.appendChild(style)

  document.addEventListener("mouseover", (e) => {
    // get the closest element to the target text
    const element = document.elementFromPoint(e.x, e.y)

    if (!element) return

    if (isUsed(element)) return

    setHighlighted(element)

    if (isHandlersAdded(element)) return

    addMouseOutHandler(element)

    setHandlersAdded(element)
  })

  document.addEventListener("click", async (e) => {
    // get the closest element to the target text
    const element = document.elementFromPoint(e.x, e.y)
    console.log(element?.textContent)
    if (!element) return

    if (isUsed(element)) return

    const xpath = xPath(element)

    const markdown = markdownFromElement(element)

    if (!markdown) return

    const snippets = await sendSnippet({ markdown, xpath })

    removeHighlighted(element)

    rerender(snippets)
  })
})

function addMouseOutHandler(element: Element) {
  element.addEventListener("mouseout", () => {
    removeHighlighted(element)
  })
}

function rerender(snippets: Snippet[] = []) {
  document
    .querySelectorAll("*[data-used=true]")
    .forEach((element) => removeUsed(element))

  const selectedElements = findSelectedElements(snippets)

  selectedElements.forEach((element) => setUsed(element))
}

function findSelectedElements(snippets: Snippet[]) {
  return snippets
    .filter((s) => s.xpath !== "")
    .map(
      (snippet) =>
        document.evaluate(
          snippet.xpath,
          document,
          null,
          XPathResult.FIRST_ORDERED_NODE_TYPE,
          null
        ).singleNodeValue as Element
    )
}
