import { ipcRenderer } from "electron"
import { removeBackground, setBackground } from "./background"
import { xPath } from "./xpath"

console.log(
  '👋 This message is being logged by "preload.ts", included via webpack'
)

document.addEventListener("DOMContentLoaded", () => {
  // remove all links
  document.querySelectorAll("a").forEach((link) => {
    // make the link not clickable
    link.setAttribute("href", "javascript:void(0)")
  })

  document.addEventListener("mouseover", (e) => {
    // get the closest element to the target text
    const textNode = getTextNode(e.x, e.y)

    onMouseMove(textNode as Element)
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
  console.log(closestElement)
  console.log(closestElement.hasAttribute("data-selected"))
  if (closestElement.hasAttribute("data-selected")) return

  function recRemoveBackground(element: Element) {
    if (element.hasAttribute("data-selected")) return

    removeBackground(element)

    element.childNodes.forEach((child) => {
      if (child.nodeType === Node.ELEMENT_NODE) {
        // make sure the child element is not selected or is under the mouse
        if (
          !(child as Element).hasAttribute("data-selected") &&
          !child.contains(document.elementFromPoint(e.x, e.y))
        ) {
          recRemoveBackground(child as Element)
        }
      }
    })
  }

  recRemoveBackground(closestElement)
}

function onClick(e: Event) {
  const closestElement = e.target as Element

  if (closestElement.hasAttribute("data-selected")) return

  const text = getTextExcept(
    closestElement,
    "script,style,noscript,meta"
  ).replace(/\n\s*\n/g, "\n")

  // replace spaces with a single space and multiple newlines with a single newline
  // this is to make the text more readable

  const xpath = xPath(closestElement)

  console.log(text, xpath)

  ipcRenderer.send("preload:page-text", { text, xpath })

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

function getTextExcept(element: Element, exclude: string) {
  return worker(element).trim()

  function worker(node: ChildNode, text = "") {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.nodeValue
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (!(node as Element).matches(exclude)) {
        for (const child of node.childNodes) {
          text = worker(child, text)
        }
      }
    }
    return text
  }
}

function getTextNode(x: number, y: number) {
  const el = document.elementFromPoint(x, y)
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
