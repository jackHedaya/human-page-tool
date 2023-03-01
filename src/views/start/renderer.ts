import "./index.css"

declare const api: {
  selectDirectory: () => void
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("start")!

  button.addEventListener("click", () => api.selectDirectory())

  const code = document.querySelector("#code code")!

  const space = (n: number) => "&nbsp;".repeat(n)

  // Necessary because Webpack minifies the code
  code.innerHTML = `${space(3)}{\n${space(5)}"url": "https://www.example.com",\n${space(5)}"page": {\n${space(7)}"data": <html>...</html>"\n${space(5)}},\n${space(5)}"title": "Example Page"\n${space(3)}}`
})
