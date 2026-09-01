import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return <main className="app-loading"><div><strong>Page not found</strong><p>The page may have moved, or the address may be incorrect.</p><Link className="button button-dark" to="/"><ArrowLeft size={16} /> Back to TestExchange</Link></div></main>
}
