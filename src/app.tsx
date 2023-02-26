import * as ReactDOM from "react-dom/client"
import Root from "./app/root"

function render() {
  const root = ReactDOM.createRoot(document.getElementById("root"))

  root.render(<Root />)
}

render()
