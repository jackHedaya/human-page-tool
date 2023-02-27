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

  document.addEventListener("mousemove", (e) => {
    // get the element that is being hovered over
    const elements = document.elementsFromPoint(e.clientX, e.clientY)

    const closestElement = elements.find((element) => {
      return element.textContent.length > 0 && element.textContent !== " "
    })

    // make background red
    if (!closestElement.hasAttribute("data-selected")) {
      setBackground(closestElement, "red")
    }

    // on mouse out, remove the background color
    closestElement.addEventListener("mouseout", () => {
      if (closestElement.hasAttribute("data-selected")) {
        return
      }

      removeBackground(closestElement)
    })

    // on click, send the text and XSelector to the main process
    closestElement.addEventListener("click", () => {
      if (closestElement.hasAttribute("data-selected")) return

      const text = getTextExcept(closestElement, "script,style,noscript,meta")
      const xSelector = xPath(closestElement)

      console.log(text, xSelector)

      ipcRenderer.send("preload:page-text", { text, xSelector })

      // set the background color to green
      closestElement.setAttribute("data-selected", "true")
      setBackground(closestElement, "green")
    })
  })
})

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
