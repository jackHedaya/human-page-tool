import type { Snippet } from "../types/snippet"

export function sortSnippetsOrder(snippets: Snippet[]): number[] {
  const sorted = snippets.slice().sort((a, b) => {
    const aElement = getElementByXpath(a.xpath) as Element
    const bElement = getElementByXpath(b.xpath) as Element

    if (!aElement || !bElement) {
      return 0
    }

    return documentPositionComparator(aElement, bElement)
  })

  return sorted.map((snippet) => snippets.indexOf(snippet))
}

function getElementByXpath(path: string) {
  return document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue
}

function documentPositionComparator(a: Element, b: Element) {
  if (a === b) {
    return 0
  }

  const position = a.compareDocumentPosition(b)

  if (
    position & Node.DOCUMENT_POSITION_FOLLOWING ||
    position & Node.DOCUMENT_POSITION_CONTAINED_BY
  ) {
    return -1
  } else if (
    position & Node.DOCUMENT_POSITION_PRECEDING ||
    position & Node.DOCUMENT_POSITION_CONTAINS
  ) {
    return 1
  } else {
    return 0
  }
}
