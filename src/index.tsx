import { createRoot } from 'react-dom/client'
import { Main } from './main'
import { BrowserRouter as Router } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

const container = document.querySelector('#root')
if (container) {
  const root = createRoot(container)
  root.render(
    <Router>
      <ConfigProvider locale={zhCN}>
        <Main />
      </ConfigProvider>
    </Router>
  )
}

