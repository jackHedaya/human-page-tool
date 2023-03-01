import { Snippet } from "../types/snippet"
import { PageStore } from "./PageStore"

interface Action {
  undo(): void
  redo(): void
}

export class ActionStack {
  private undoStack: Action[] = []
  private redoStack: Action[] = []

  push(action: Action) {
    this.undoStack.push(action)
    this.redoStack = []
  }

  undo() {
    if (this.undoStack.length === 0) return

    const action = this.undoStack.pop()!

    action.undo()

    this.redoStack.push(action)
  }

  redo() {
    if (this.redoStack.length === 0) return

    const action = this.redoStack.pop()!

    action.redo()

    this.undoStack.push(action)
  }

  clear() {
    this.undoStack = []
    this.redoStack = []
  }
}

export class AddSnippetAction implements Action {
  private readonly store: PageStore
  private readonly pageIdx: number
  private readonly snippet: Snippet

  constructor(store: PageStore, pageIdx: number, snippet: Snippet) {
    this.store = store
    this.pageIdx = pageIdx
    this.snippet = snippet
  }

  undo() {
    this.store.popSnippets(this.pageIdx)
  }

  redo() {
    this.store.addSnippet(this.pageIdx, this.snippet)
  }
}
