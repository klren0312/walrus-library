import { createRoot } from 'react-dom/client'
import { Main } from './main'
import { BrowserRouter as Router } from 'react-router-dom'

const container = document.querySelector('#root')
if (container) {
  const root = createRoot(container)
  root.render(
    <Router>
      <Main />
    </Router>
  )
}

