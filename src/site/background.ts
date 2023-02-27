import { xPath } from "./xpath"

const prevBackground = new Map<string, string>()

export function setBackground(element: Element, color: string) {
  setPrevBackground(element)

  element.setAttribute("style", `background-color: ${color}`)
}

export function removeBackground(element: Element) {
  element.setAttribute("style", getPrevBackground(element))

  prevBackground.delete(xPath(element))
}

function setPrevBackground(element: Element) {
  prevBackground.set(xPath(element), element.getAttribute("style"))
}

function getPrevBackground(element: Element) {
  return prevBackground.get(xPath(element))
}
