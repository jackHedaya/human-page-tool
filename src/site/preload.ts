import { ipcRenderer } from "electron"
import { removeBackground, setBackground } from "./background"
import { TextStore } from "./text-store"
import { xPath } from "./xpath"

console.log(
  '👋 This message is being logged by "preload.ts", included via webpack'
)

const textStore = new TextStore()

document.addEventListener("DOMContentLoaded", () => {
  // remove all links
  document.querySelectorAll("a").forEach((link) => {
    // make the link not clickable
    link.setAttribute("href", "javascript:void(0)")
  })

  document.addEventListener("mouseover", (e) => {
    // get the closest element to the target text
    let textNode: Node = getTextNode(e.pageX, e.pageY)

    if (!textNode) textNode = e.target as Node

    if (textNode.nodeType === Node.TEXT_NODE)
      onMouseMove(textNode.parentElement)
    else onMouseMove(textNode as Element)
  })
})

function onMouseMove(closestElement: Element) {
  // make background red
  if (!closestElement.hasAttribute("data-selected")) {
    setBackground(closestElement, "red")
  }

  // on mouse out, remove the background color
  closestElement.addEventListener("mouseout", onMouseOut)

  // on click, send the text and XSelector to the main process
  closestElement.addEventListener("click", onClick)
}

function onMouseOut(e: MouseEvent) {
  const closestElement = e.target as Element

  if (closestElement.hasAttribute("data-selected")) return

  function recRemoveBackground(element: Element) {
    if (element.hasAttribute("data-selected")) return

    removeBackground(element)

    element.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        // make sure the child element is not selected or is under the mouse
        if (
          !(child as Element).hasAttribute("data-selected") &&
          !child.contains(document.elementFromPoint(e.pageX, e.pageY))
        ) {
          recRemoveBackground(child as Element)
        }
      }
    })
  }

  recRemoveBackground(closestElement)
}

function onClick(e: MouseEvent) {
  const closestElement = e.target as Element

  if (closestElement.hasAttribute("data-selected")) return

  // replace spaces with a single space and multiple newlines with a single newline
  // this is to make the text more readable
  const textElements = getTextElements(closestElement)
  const text = textElements.map((el) => getText(el))

  for (let i = 0; i < text.length; i++) {
    textStore.addSnippet({
      xpath: xPath(textElements[i]),
      text: text[i],
      element: textElements[i],
    })
  }

  const snippets = textStore.getSnippets()

  ipcRenderer.send("site:update", { snippets })

  const setSelectedRec = (element: Element) => {
    element.setAttribute("data-selected", "true")
    element.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        setSelectedRec(child as Element)
      }
    })
  }

  setSelectedRec(closestElement)

  setBackground(closestElement, "green")
}

function getTextElements(element: Element) {
  const textNodes: Element[] = []

  for (const child of element.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      if (child.parentElement.tagName === "SCRIPT") continue
      if (child.parentElement.tagName === "STYLE") continue
      if (child.parentElement.tagName === "NOSCRIPT") continue
      if (child.parentElement.tagName === "META") continue
      if (child.parentElement.tagName === "A") continue

      textNodes.push(child.parentElement)
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      textNodes.push(...getTextElements(child as Element))
    }
  }

  return textNodes
}

function getText(element: Element, exclude?: string) {
  return worker(element).trim()

  function worker(node: ChildNode, text = "") {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.nodeValue
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (!exclude || !(node as Element).matches(exclude)) {
        for (const child of node.childNodes) {
          text = worker(child, text)
        }
      }
    }
    return text.replace(/\n\s*\n/g, "\n")
  }
}

function getTextNode(x: number, y: number) {
  const el = document.elementFromPoint(x, y)

  if (!el) return
  if (!el.childNodes) return el

  const nodes = el.childNodes
  for (let i = 0, n; (n = nodes[i++]); ) {
    if (n.nodeType === 3) {
      const r = document.createRange()
      r.selectNode(n)
      const rects = r.getClientRects()
      for (let j = 0, rect; (rect = rects[j++]); ) {
        if (
          x > rect.left &&
          x < rect.right &&
          y > rect.top &&
          y < rect.bottom
        ) {
          return n
        }
      }
    }
  }
  return el
}
