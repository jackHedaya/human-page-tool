import { xPath } from "./xpath"

const prevBackground = new Map<string, string>()

export function setBackground(element: Element, color: string) {
  if (getPrevBackground(element) === `background-color: ${color}`) return

  setPrevBackground(element)

  element.setAttribute("style", `background-color: ${color}`)
}

export function removeBackground(element: Element) {
  if (!getPrevBackground(element)) element.removeAttribute("style")
  else element.setAttribute("style", getPrevBackground(element))

  prevBackground.delete(xPath(element))
}

function setPrevBackground(element: Element) {
  prevBackground.set(xPath(element), element.getAttribute("style"))
}

function getPrevBackground(element: Element) {
  return prevBackground.get(xPath(element))
}
