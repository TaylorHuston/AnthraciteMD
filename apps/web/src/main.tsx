import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { serviceDescriptor } from '@graphitemd/contracts'
import './styles.css'

function App() {
  return <main><p>{serviceDescriptor.name}</p><h1>Your workspace, served from where it lives.</h1><p>The Markdown workbench foundation is ready for its first service-owned workspace.</p></main>
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>)
