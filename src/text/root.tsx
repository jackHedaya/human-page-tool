import ReactMarkdown from "react-markdown"
import { Snippet, store } from "./renderer"

export default function Root() {
  const [snippets] = store.useState<Snippet[]>("snippets")

  const text = snippets.map((snippet) => {
    return snippet.text
  })

  const markdown = text.join("\n")
  console.log(snippets)
  return (
    <div className="">
      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  )
}
