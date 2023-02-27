import fs from "fs/promises"
import path from "path"

type Snippet = {
  text: string
  tag: string
  xpath: string
}

export class PageStore {
  private files: string[] = []

  private path: string
  private outPath: string

  constructor(inPath: string, outPath: string) {
    this.path = inPath
    this.outPath = outPath
  }

  async saveSnippets(pageIdx: number | string, snippets: Snippet[]) {
    if (typeof pageIdx === "string")
      pageIdx = this.files.findIndex((file) => file === pageIdx)

    const page = await this.getPage(pageIdx)
    const path = this.getOutPathForFile(this.files[pageIdx])

    page.content = {
      snippets,
      content: this.joinSnippets(snippets),
    }

    await fs.writeFile(path, JSON.stringify(page))
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
