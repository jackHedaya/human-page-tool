import { xPath } from "./xpath"

const prevBackground = new Map<string, string>()

export function setBackground(element: Element, color: string) {
  if (!getPrevBackground(element)) setPrevBackground(element)

  element.setAttribute("style", `background-color: ${color} !important;`)
}

export function removeBackground(element: Element) {
  const prev = getPrevBackground(element)

  if (prev) element.setAttribute("style", prev)
  else element.setAttribute("style", "")

  prevBackground.delete(xPath(element))
}

function setPrevBackground(element: Element) {
  prevBackground.set(xPath(element), element.getAttribute("style") ?? "")
}

function getPrevBackground(element: Element) {
  return prevBackground.get(xPath(element))
}
