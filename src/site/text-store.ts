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
    const dedup: number[] = []

    this.textSnippets.forEach((snippet, idx) => {
      if (snippet.xpath.startsWith(xpath)) dedup.push(idx)

      if (xpath.startsWith(snippet.xpath)) dedup.push(idx)
    })

    for (const idx of dedup) {
      this.textSnippets.splice(idx, 1)
    }

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
