import { useTranslation } from 'react-i18next'
import './style.less'
import MintCreatorNftBtn from '/@/components/MintCreatorNftBtn'
import { GetCreatorNftApi } from '/@/apis/common.api'
import { useNetworkVariable } from '/@/utils/networkConfig'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useEffect, useState } from 'react'
import { CreatorNft, useCreatorStore } from '/@/stores/creator'
import { useGetBooks } from '/@/hooks/useGetBooks'
import { AnimationOnScroll } from 'react-animation-on-scroll'
import { getBlobUrl } from '/@/utils/tools'
import { Image } from 'antd'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  let { t } = useTranslation()
  const packageId = useNetworkVariable('packageId')
  const account = useCurrentAccount()
  const [creator, setCreator] = useState<CreatorNft>()
  const { setCreatorNft } = useCreatorStore()
  const books = useGetBooks()
  const navigator = useNavigate()

  const getCreator = async () => {
    if (account) {
      const res = await GetCreatorNftApi(packageId, account.address)
      if (res && res.length > 0 && res[0].asMoveObject?.contents?.json) {
        let creator = res[0].asMoveObject.contents.json as unknown as CreatorNft
        console.log(creator)
        setCreator(creator)
        setCreatorNft(creator)
      }
    }
  }
  useEffect(() => {
    getCreator()
  }, [account])
  return (
    <div className="w-full h-full">
      <section className="top-section fixed w-screen h-full">
        <video className="absolute top-0 left-0 w-full h-full object-cover" src="/videos/bg.mp4" autoPlay loop muted />
        <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
          <img className="animate__animated animate__slideInDown" src="/walrus-library-transparent.svg" alt="Walrus Library" />
          <div className="animate__animated animate__slideInUp text-[#98efe4] text-7xl font-bold ">{t('home.title')}</div>
          <div className="animate__animated animate__slideInUp text-[#98efe4] text-2xl font-bold ">
            {t('home.subtitle')}
          </div>
        </div>
        <div className="scroll-down-btn">
          <i></i>
        </div>
      </section>
      <div className="absolute top-full w-full min-h-screen bg-[#e4f0ef] z-10">
        {/* books section */}
        <section className="h-screen bg-fixed bg-cover bg-center bg-[#98efe4]">
          <div className="max-w-7xl h-full m-auto p-5 flex flex-col items-center justify-center">
            <div className="w-full h-full grid grid-cols-6 gap-4 bg-white border border-black rounded-lg p-5">
              {
                books.map((book, index) => (
                  <div key={index} className="flex flex-col items-center gap-1" onClick={() => navigator('/book/' + book.id)}>
                    <Image
                      className="rounded-lg cursor-pointer"
                      width={150}
                      height={200}
                      src={getBlobUrl(book.cover_blob_id)}
                      fallback="data:image/png;base64,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"
                      preview={false}
                    />
                    <div className="text-xl font-bold">{book.title}</div>
                  </div>
                ))
              }
            </div>
          </div>
        </section>
        {/* upload section */}
        <section className="h-screen">
          <div className="max-w-7xl h-full m-auto">
            <div className="flex items-center gap-4 justify-center h-full">
              <AnimationOnScroll animateIn="animate__bounceInUp">
                <img onClick={() => window.open('/upload', '_blank')} className="upload-icon animate__animated cursor-pointer" src="/images/upload.svg" alt="upload" />
              </AnimationOnScroll>
              <AnimationOnScroll animateIn="animate__bounceInRight">
                <div className="text-6xl font-bold">
                  <div>{t('home.upload')}</div>
                  {
                    !creator ?
                    <MintCreatorNftBtn onMintSuccess={() => {
                      setTimeout(() => getCreator(), 5000)
                    }} /> :
                    <div
                      onClick={() => window.open('/upload', '_blank')}
                      className="inline-block cursor-pointer text-xl text-black border-4 border-[#98efe4] rounded-md px-4 py-2"
                    >
                      {t('home.goToUpload')}
                    </div>
                  }
                </div>
                </AnimationOnScroll>
            </div>
          </div>
        </section>
        {/* 页脚 */}
        <footer className="h-16 bg-black">
          <div className="flex items-center justify-center h-full">
            <div className="text-white">
              {t('home.footer')}
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
