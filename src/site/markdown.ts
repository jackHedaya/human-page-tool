import Turndown from "turndown"

const turndownService = new Turndown({
  codeBlockStyle: "fenced",
}).addRule("no-link", {
  filter: "a",
  replacement: (content) => content,
})

export function markdownFromElement(element: Element): string | null {
  // check if element is a html element
  if (!(element instanceof HTMLElement)) {
    return null
  }

  return turndownService
    .turndown(element as HTMLElement)
    .replace(/\n\s*\n/g, "\n")
}
