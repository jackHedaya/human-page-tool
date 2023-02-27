// A store that holds text snippets and their associated xpaths
// Should maintain order of the snippets **in the document**
export class TextStore {
  private textSnippets: {
    text: string
    xpath: string
    element: Element
    tag: string
  }[] = []

  public addSnippet({ text, xpath, element }: AddArgs) {
    // check if the snippet already exists
    if (
      this.textSnippets.some(
        (snippet) => snippet.xpath.startsWith(xpath) && snippet.text === text
      )
    )
      return

    this.textSnippets.push({
      text,
      xpath,
      element,
      tag: element.tagName,
    })
  }

  public getSnippets() {
    return this.textSnippets
      .sort((a, b) => this.documentPositionComparator(a.element, b.element))
      .map(({ text, xpath, tag }) => ({ text, xpath, tag }))
  }

  private documentPositionComparator(a: Element, b: Element) {
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
}

type AddArgs = {
  text: string
  xpath: string
  element: Element
}
