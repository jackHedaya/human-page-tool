import fs from "fs/promises"
import path from "path"
import { Snippet } from "../types/snippet"

export class PageStore {
  private files: string[] = []

  private path: string | undefined
  private outPath: string | undefined

  private pageSnippets: Snippet[][] = []

  constructor(inPath?: string, outPath?: string) {
    this.path = inPath
    this.outPath = outPath
  }

  public setPath(inPath: string) {
    this.path = inPath
  }

  public setOutPath(outPath: string) {
    this.outPath = outPath
  }

  public async getSnippets(pageIdx: number): Promise<Snippet[]> {
    const snippets = this.pageSnippets[pageIdx]

    if (!snippets) return []

    return snippets
  }

  /**
   *
   * @param pageIdx
   * @param snippet
   * @returns The snippets in the page
   */
  public addSnippet(pageIdx: number, snippet: Snippet): Snippet[] {
    if (!this.pageSnippets[pageIdx]) this.pageSnippets[pageIdx] = []

    const snippets = this.pageSnippets[pageIdx]
    console.log(snippets, "addSnippet", snippet)
    for (let i = 0; i < snippets.length; i++) {
      const s = snippets[i]

      if (s.xpath === snippet.xpath) return snippets
      else if (s.xpath.startsWith(snippet.xpath)) snippets.splice(i, 1)
      else if (snippet.xpath.startsWith(s.xpath)) return snippets
    }

    console.log("adding", snippet)
    snippets.push(snippet)

    return snippets
  }

  /**
   * Sorts the snippets in a page by the order of the indices. Necessary because
   * sorting must be done in the document order, which is in MainWorld.
   * @param pageIdx
   * @param order
   */
  public sortSnippets(pageIdx: number, order: number[]) {
    const snippets = this.pageSnippets[pageIdx]

    if (!snippets) return []

    const sorted = order.map((idx) => snippets[idx])

    this.pageSnippets[pageIdx] = sorted

    return sorted
  }

  public async syncSnippets(pageIdx?: number | string | (number | string)[]) {
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

  public async getPage(idx: number) {
    const file = await fs.readFile(
      this.getPathForFile(this.files[idx]),
      "utf-8"
    )

    const json = JSON.parse(file)

    if (!json.page) throw new Error("Invalid page")

    return json
  }

  public async loadDirectory() {
    this.validatePath()

    this.files = await fs.readdir(this.path!)
  }

  private joinSnippets(snippets: Snippet[]) {
    return snippets.map((snippet) => snippet.markdown).join("\n")
  }

  private getPathForFile(file: string) {
    this.validatePath()

    return path.join(this.path!, file)
  }

  private getOutPathForFile(file: string) {
    this.validateOutPath()

    return path.join(this.outPath!, file)
  }

  private validatePath() {
    if (!this.path) throw new Error("Path not set")
  }

  private validateOutPath() {
    if (!this.outPath) throw new Error("Out path not set")
  }
}
