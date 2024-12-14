import { createRoot } from 'react-dom/client'
import Main from './main'
import '@mysten/dapp-kit/dist/index.css'
import './assets/css/basic.less'
import './assets/css/tailwind.css'
import 'animate.css'

const container = document.querySelector('#root')
if (container) {
  const root = createRoot(container)
  root.render(
    <Main />
  )
}

