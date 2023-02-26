import { ipcRenderer } from "electron"
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

    // get the closest element to the text
    // for example
    // <div>
    //   <p>text</p>
    // </div>
    // the closest element to the text is the <p> tag
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
      const text = closestElement.textContent.trim()
      const xSelector = xPath(closestElement)

      console.log(text, xSelector)

      ipcRenderer.send("preload:page-text", { text, xSelector })

      // set the background color to green
      closestElement.setAttribute("data-selected", "true")
      setBackground(closestElement, "green")
    })
  })
})

const prevBackground = new Map<string, string>()

function setPrevBackground(element: Element) {
  prevBackground.set(xPath(element), element.getAttribute("style"))
}

function getPrevBackground(element: Element) {
  return prevBackground.get(xPath(element))
}

function setBackground(element: Element, color: string) {
  setPrevBackground(element)
  const children = element.querySelectorAll("*")

  children.forEach((child) => setPrevBackground(child))

  element.setAttribute("style", `background-color: ${color}`)

  children.forEach((child) => {
    child.setAttribute("style", `background-color: ${color}`)
  })
}

function removeBackground(element: Element) {
  element.setAttribute("style", getPrevBackground(element))
  console.log("remove background", element, getPrevBackground(element))
  const children = element.querySelectorAll("*")

  children.forEach((child) => {
    child.setAttribute("style", getPrevBackground(child))
  })
}
