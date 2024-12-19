import { createRoot } from 'react-dom/client'
import Main from './main'
import '@mysten/dapp-kit/dist/index.css'
import 'animate.css'
import './assets/css/tailwind.css'
import './assets/css/basic.less'

const container = document.querySelector('#root')
if (container) {
  const root = createRoot(container)
  root.render(
    <Main />
  )
}

