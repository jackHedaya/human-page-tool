import "./index.css"

declare const api: {
  selectDirectory: () => void
}

document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("start")!

  button.addEventListener("click", () => api.selectDirectory())
})
