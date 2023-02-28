import fs from "fs/promises"
import path from "path"
import { Snippet } from "../types/snippet"

export class PageStore {
  private files: string[] = []

  private path: string
  private outPath: string

  private pageSnippets: Snippet[][] = []

  constructor(inPath?: string, outPath?: string) {
    this.path = inPath
    this.outPath = outPath
  }

  setPath(inPath: string) {
    this.path = inPath
  }

  setOutPath(outPath: string) {
    this.outPath = outPath
  }

  /**
   *
   * @param pageIdx
   * @param snippet
   * @returns The snippets in the page
   */
  addSnippet(pageIdx: number, snippet: Snippet): Snippet[] {
    const snippets = this.pageSnippets[pageIdx]

    snippets.push(snippet)

    return snippets
  }

  /**
   * Sorts the snippets in a page by the order of the indices. Necessary because
   * sorting must be done in the document order, which is in MainWorld.
   * @param pageIdx
   * @param order
   */
  sortSnippets(pageIdx: number, order: number[]) {
    const snippets = this.pageSnippets[pageIdx]

    const sorted = order.map((idx) => snippets[idx])

    this.pageSnippets[pageIdx] = sorted

    return sorted
  }

  async syncSnippets(pageIdx?: number | string | (number | string)[]) {
    const pageIdxs: number[] = []

    // Invalid type will be handled by the next for loop
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (Array.isArray(pageIdx)) pageIdxs.push(...(pageIdx as any))

    for (const idx of pageIdxs) {
      if (typeof idx === "string") {
        pageIdxs.push(this.files.indexOf(idx))
      } else {
        pageIdxs.push(idx)
      }
    }

    for (const idx of pageIdxs) {
      const page = await this.getPage(idx)
      const path = this.getOutPathForFile(this.files[idx])

      const snippets = this.pageSnippets[idx]

      page.content = {
        snippets,
        content: this.joinSnippets(snippets),
      }

      await fs.writeFile(path, JSON.stringify(page))

      // Clear from memory
      this.pageSnippets[idx] = []
    }
  }

  async getPage(idx: number) {
    const file = await fs.readFile(
      this.getPathForFile(this.files[idx]),
      "utf-8"
    )

    const json = JSON.parse(file)

    if (!json.page) throw new Error("Invalid page")

    return json
  }

  async loadDirectory() {
    this.files = await fs.readdir(this.path)
  }

  private joinSnippets(snippets: Snippet[]) {
    return snippets.map((snippet) => snippet.text).join("\n")
  }

  private getPathForFile(file: string) {
    return path.join(this.path, file)
  }

  private getOutPathForFile(file: string) {
    return path.join(this.outPath, file)
  }
}
