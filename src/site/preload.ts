import { ipcRenderer } from "electron"
import { Snippet } from "../types/snippet"
import { arrestDocument } from "./arrestDocument"
import { removeBackground, setBackground } from "./background"
import { markdownFromElement } from "./markdown"
import { sortSnippetsOrder } from "./sortSnippets"
import { xPath } from "./xpath"

console.log(
  '👋 This message is being logged by "preload.ts", included via webpack'
)

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

  document.addEventListener("mouseover", (e) => {
    // get the closest element to the target text
    const element = document.elementFromPoint(e.x, e.y)

    if (!element) return

    if (isUsed(element)) return

    setBackground(element, "red")

    if (isHandlersAdded(element)) return

    addMouseOutHandler(element)

    setHandlersAdded(element)
  })

  document.addEventListener("click", async (e) => {
    // get the closest element to the target text
    const element = document.elementFromPoint(e.x, e.y)

    if (!element) return

    if (isUsed(element)) return

    const xpath = xPath(element)

    const markdown = markdownFromElement(element)

    if (!markdown) return

    const snippets = await sendSnippet({ markdown, xpath })

    rerender(snippets)
  })
})

function addMouseOutHandler(element: Element) {
  element.addEventListener("mouseout", () => {
    if (isUsed(element)) return

    removeBackground(element)
  })
}

function findSelectedElements(snippets: Snippet[]) {
  // find all elements that have a snippet and set them and their children to used

  snippets.forEach((snippet) => {
    const element = document.evaluate(
      snippet.xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue as Element

    if (!element) return

    setUsed(element)

    const children = element.querySelectorAll("*")

    children.forEach((child) => {
      setUsed(child)
    })
  })
}

function rerender(snippets: Snippet[] = []) {
  // find all elements that have not been used and remove their background
  const elements = document.querySelectorAll("*")
  elements.forEach((element) => {
    if (isUsed(element)) return

    removeBackground(element)
  })

  findSelectedElements(snippets)

  // add background to all elements that have been used
  const usedElements = document.querySelectorAll("*[data-used=true]")
  usedElements.forEach((element) => {
    setBackground(element, "green")
  })
}

function isUsed(element: Element) {
  return element.hasAttribute("data-used")
}

function setUsed(element: Element) {
  element.setAttribute("data-used", "true")
}

function isHandlersAdded(element: Element) {
  return element.hasAttribute("data-handlers-added")
}

function setHandlersAdded(element: Element) {
  element.setAttribute("data-handlers-added", "true")
}
