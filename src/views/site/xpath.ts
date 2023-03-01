export const xPath = function (node: Node, optimized?: boolean): string {
  if (node.nodeType === Node.DOCUMENT_NODE) {
    return "/"
  }

  const steps = []
  let contextNode: Node | null = node as Node | null
  while (contextNode) {
    const step = xPathValue(contextNode, optimized)
    if (!step) {
      break
    } // Error - bail out early.
    steps.push(step)
    if (step.optimized) {
      break
    }
    contextNode = contextNode.parentNode
  }

  steps.reverse()
  const out = (steps.length && steps[0].optimized ? "" : "/") + steps.join("/")

  return out.toLowerCase()
}

const xPathValue = function (node: Node, optimized?: boolean): Step | null {
  let ownValue
  const ownIndex = xPathIndex(node)
  if (ownIndex === -1) {
    return null
  } // Error.

  switch (node.nodeType) {
    case Node.ELEMENT_NODE:
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (optimized && node.getAttribute("id")) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return new Step('//*[@id="' + node.getAttribute("id") + '"]', true)
      }
      ownValue = node.nodeName
      break
    case Node.ATTRIBUTE_NODE:
      ownValue = "@" + node.nodeName
      break
    case Node.TEXT_NODE:
    case Node.CDATA_SECTION_NODE:
      ownValue = "text()"
      break
    case Node.PROCESSING_INSTRUCTION_NODE:
      ownValue = "processing-instruction()"
      break
    case Node.COMMENT_NODE:
      ownValue = "comment()"
      break
    case Node.DOCUMENT_NODE:
      ownValue = ""
      break
    default:
      ownValue = ""
      break
  }

  if (ownIndex > 0) {
    ownValue += "[" + ownIndex + "]"
  }

  return new Step(ownValue, node.nodeType === Node.DOCUMENT_NODE)
}

const xPathIndex = function (node: Node): number {
  /**
   * Returns -1 in case of error, 0 if no siblings matching the same expression,
   * <XPath index among the same expression-matching sibling nodes> otherwise.
   */
  function areNodesSimilar(left: Node, right: Node): boolean {
    if (left === right) {
      return true
    }

    if (
      left.nodeType === Node.ELEMENT_NODE &&
      right.nodeType === Node.ELEMENT_NODE
    ) {
      return left.nodeName === right.nodeName
    }

    if (left.nodeType === right.nodeType) {
      return true
    }

    // XPath treats CDATA as text nodes.
    const leftType =
      left.nodeType === Node.CDATA_SECTION_NODE ? Node.TEXT_NODE : left.nodeType
    const rightType =
      right.nodeType === Node.CDATA_SECTION_NODE
        ? Node.TEXT_NODE
        : right.nodeType
    return leftType === rightType
  }

  const siblings = node.parentNode ? node.parentNode.children : null
  if (!siblings) {
    return 0
  } // Root node - no siblings.
  let hasSameNamedElements
  for (let i = 0; i < siblings.length; ++i) {
    if (areNodesSimilar(node, siblings[i]) && siblings[i] !== node) {
      hasSameNamedElements = true
      break
    }
  }
  if (!hasSameNamedElements) {
    return 0
  }
  let ownIndex = 1 // XPath indices start with 1.
  for (let i = 0; i < siblings.length; ++i) {
    if (areNodesSimilar(node, siblings[i])) {
      if (siblings[i] === node) {
        return ownIndex
      }
      ++ownIndex
    }
  }
  return -1 // An error occurred: |node| not found in parent's children.
}

export class Step {
  value: string
  optimized: boolean
  constructor(value: string, optimized: boolean) {
    this.value = value
    this.optimized = optimized || false
  }

  toString(): string {
    return this.value
  }
}
