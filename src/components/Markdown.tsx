import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Rendu markdown (GFM : tables, listes de tâches…) stylé via la classe .md
// (cf. src/index.css). Pas de dangerouslySetInnerHTML → sûr pour du contenu éditable.
// `components` permet de surcharger le rendu (ex. cases à cocher interactives).
export function Markdown({ children, components }: { children: string; components?: Components }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{children}</ReactMarkdown>
    </div>
  )
}
