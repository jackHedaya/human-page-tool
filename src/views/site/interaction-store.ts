const DATA_USED = "data-used" as const
const DATA_HANDLERS_ADDED = "data-handlers-added" as const
const DATA_HIGHLIGHTED = "data-highlighted" as const

export const isUsed = getter(DATA_USED)

export const setUsed = setter(DATA_USED)

export const removeUsed = remover(DATA_USED)

export const isHighlighted = getter(DATA_HIGHLIGHTED)

export const setHighlighted = setter(DATA_HIGHLIGHTED)

export const removeHighlighted = remover(DATA_HIGHLIGHTED)

export const isHandlersAdded = getter(DATA_HANDLERS_ADDED)

export const setHandlersAdded = setter(DATA_HANDLERS_ADDED)

function setter(key: string) {
  return (element: Element) =>
    getElementAndChildren(element).forEach((e) => e.setAttribute(key, "true"))
}

function getter(key: string) {
  return (element: Element) => element.getAttribute(key)
}

function remover(key: string) {
  return (element: Element) =>
    getElementAndChildren(element).forEach((e) => e.removeAttribute(key))
}

function getElementAndChildren(element: Element) {
  return [element, ...element.querySelectorAll("*")]
}
