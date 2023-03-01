import { mkdir, writeFile, readdir, readFile } from "fs/promises"
import path from "path"
import { Snippet } from "../types/snippet"

type Page = {
  page: {
    data: string
  }
  title: string
  url: string
}

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

  public async setOutPath(outPath: string) {
    this.outPath = outPath

    await mkdir(outPath, { recursive: true })
  }

  public snippetsSize(pageIdx: number): number {
    return this.pageSnippets[pageIdx]?.length ?? 0
  }

  public size(): number {
    return this.files.length
  }

  public popSnippets(pageIdx: number): Snippet | null {
    return this.pageSnippets[pageIdx]?.pop() ?? null
  }

  public getSnippets(pageIdx: number): Snippet[] {
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

    for (let i = 0; i < snippets.length; i++) {
      const s = snippets[i]

      if (s.xpath === snippet.xpath) return snippets
      else if (s.xpath.startsWith(snippet.xpath)) snippets.splice(i, 1)
      else if (snippet.xpath.startsWith(s.xpath)) return snippets
    }

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

  public async flushSnippets(pageIdx?: number | string | (number | string)[]) {
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

      await writeFile(path, JSON.stringify(page))

      // Clear from memory
      this.pageSnippets[idx] = []
    }
  }

  public async getPage(idx: number): Promise<Page> {
    const file = await readFile(this.getPathForFile(this.files[idx]), "utf-8")

    const json = JSON.parse(file)

    if (!json.page) throw new Error("Invalid page")

    return json
  }

  public async loadDirectory() {
    this.validatePath()

    this.files = await readdir(this.path!)
  }

  private joinSnippets(snippets: Snippet[]) {
    return snippets.map((snippet) => snippet.markdown).join("\n")
  }

  private getPathForFile(file: string) {
    this.validatePath()

    return path.join(this.path!, file)
  }

  public getOutPathForFile(file: string) {
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
