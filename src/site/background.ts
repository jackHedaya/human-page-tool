import { xPath } from "./xpath"

const prevBackground = new Map<string, string>()

export function setBackground(element: Element, color: string) {
  setPrevBackground(element)

  const children = element.querySelectorAll("*")

  children.forEach((child) => setPrevBackground(child))

  element.setAttribute("style", `background-color: ${color}`)

  children.forEach((child) => {
    child.setAttribute("style", `background-color: ${color}`)
  })
}

export function removeBackground(element: Element) {
  element.setAttribute("style", getPrevBackground(element))
  prevBackground.delete(xPath(element))

  const children = element.querySelectorAll("*")

  children.forEach((child) => {
    child.setAttribute("style", getPrevBackground(child))

    prevBackground.delete(xPath(child))
  })
}

function setPrevBackground(element: Element) {
  prevBackground.set(xPath(element), element.getAttribute("style"))
}

function getPrevBackground(element: Element) {
  return prevBackground.get(xPath(element))
}
