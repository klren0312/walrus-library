import { useTranslation } from 'react-i18next'
import './style.less'
import { useNavigate } from 'react-router-dom'

export default function HomePage() {
  let { t } = useTranslation() 
  const navigate = useNavigate()
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
        {/* upload section */}
        <section className="h-screen">
          <div className="max-w-7xl h-full m-auto">
            <div className="flex items-center gap-4 justify-center h-full" onClick={() => navigate('/upload')}>
              <img className="upload-icon animate__animated cursor-pointer" src="/images/upload.svg" alt="upload" />
              <div className="text-6xl font-bold">{t('home.upload')}</div>
            </div>
          </div>
        </section>
        <section className="h-screen bg-fixed bg-cover bg-center bg-fuchsia-600 img1">2</section>
        <section className="h-screen text">3</section>
        <section className="h-screen bg-fixed bg-cover bg-center bg-green-500 img2">4</section>
        <section className="h-screen text">5</section>
        <section className="h-screen bg-fixed bg-cover bg-center bg-red-500 img3">6</section>
        <section className="h-screen text">7</section>
      </div>
    </div>
  )
}
