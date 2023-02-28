/* eslint-disable @typescript-eslint/ban-ts-comment */

export function arrestDocument(document: Document) {
  document.querySelectorAll("a").forEach((link) => {
    link.setAttribute("href", "javascript:void(0)")
  })

  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i]
    const rulesToLose = []
    for (let j = 0; j < sheet.cssRules.length; j++) {
      const rule = sheet.cssRules[j]

      if (
        rule &&
        // @ts-ignore
        rule.selectorRule &&
        // @ts-ignore
        (rule.selectorText.indexOf(":hover") >= 0 ||
          // @ts-ignore
          rule.selectorText.indexOf(":active") >= 0 ||
          // @ts-ignore
          rule.selectorText.indexOf(":focus") >= 0)
      ) {
        rulesToLose.push(j)
      }
    }

    // Iterate backwards to prevent pointing to the wrong index while sheet rules get deleted
    for (let k = rulesToLose.length - 1; k >= 0; k--) {
      sheet.deleteRule(rulesToLose[k])
    }
  }
}
