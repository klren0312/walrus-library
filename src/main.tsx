import { Route, HashRouter as Router, Routes } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import enUS from 'antd/es/locale/en_US'
import zhCN from 'antd/es/locale/zh_CN'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit'
import { networkConfig } from './utils/networkConfig'
import { useLocaleStore } from './stores/locale'
import i18n from './i18n/i18n'
import { useEffect } from 'react'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import HomePage from './pages/HomePage'
import UploadPage from './pages/UploadPage'
import BookDetail from './pages/BookDetail'

const queryClient = new QueryClient()
export default function Main() {
  const { locale } = useLocaleStore()
  i18n.changeLanguage(locale)
  useEffect(() => {
    i18n.changeLanguage(locale)
    dayjs.locale(locale === 'zhCN' ? 'zh-cn' : 'en')
  }, [locale])
  return (
    <Router>
      <ConfigProvider
        locale={locale === 'zhCN' ? zhCN : enUS}
        theme={{
          token: {
            colorPrimary: '#98efe4'
          }
        }}
      >
        <QueryClientProvider client={queryClient}>
          <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
            <WalletProvider
              autoConnect
              stashedWallet={{
                name: 'WalrusLibrary'
              }}
            >
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/book/:id" element={<BookDetail />} />
              </Routes>
            </WalletProvider>
          </SuiClientProvider>
        </QueryClientProvider>
      </ConfigProvider>
    </Router>
  );
}
