import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Rendu markdown (GFM : tables, listes de tâches…) stylé via la classe .md
// (cf. src/index.css). Pas de dangerouslySetInnerHTML → sûr pour du contenu éditable.
export function Markdown({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  )
}
