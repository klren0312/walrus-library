import { useTranslation } from 'react-i18next'
import './style.less'
import MintCreatorNftBtn from '/@/components/MintCreatorNftBtn'
import { GetCreatorNftApi } from '/@/apis/common.api'
import { useNetworkVariable } from '/@/utils/networkConfig'
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { useEffect, useState, useRef, useCallback } from 'react'
import { CreatorNft, useCreatorStore } from '/@/stores/creator'
import { useGetBooks } from '/@/hooks/useGetBooks'
import { AnimationOnScroll } from 'react-animation-on-scroll'
import { getBlobUrl } from '/@/utils/tools'
import { Avatar, Image, List, message, Tooltip } from 'antd'
import { useNavigate } from 'react-router-dom'
import { GetLatestBookReviewApi } from '/@/apis/book.api'
import { BookReview } from '/@/apis/types/book.type'
import BookReviewModal from '/@/components/BookReviewModal'
import dayjs from 'dayjs'
import Lottie from 'lottie-react'
import donateAnimation from './donate.json'
import { Transaction } from '@mysten/sui/transactions'
import { SUI_DECIMALS } from '/@/utils/constants'
import posterBase64 from './postBase64'
import bookBlockBase64 from './bookBlockBase64'

export default function HomePage() {
  let { t } = useTranslation()
  const [messageApi, contextHolder] = message.useMessage()
  const packageId = useNetworkVariable('packageId')
  const server = useNetworkVariable('server')
  const account = useCurrentAccount()
  const [creator, setCreator] = useState<CreatorNft>()
  const { setCreatorNft } = useCreatorStore()
  const {books, getNextPage} = useGetBooks()
  const navigator = useNavigate()
  const [latestReview, setLatestReview] = useState<BookReview[]>([])
  const [currentReview, setCurrentReview] = useState<BookReview | undefined>(undefined)
  const [openReview, setOpenReview] = useState(false)
  const { mutate } = useSignAndExecuteTransaction()
  const client = useSuiClient()

  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  const handleObserver = useCallback(async (entries: IntersectionObserverEntry[]) => {
    const target = entries[0]
    if (target.isIntersecting) {
      getNextPage() // 调用获取下一页书籍的函数
    }
  }, [getNextPage])

  useEffect(() => {
    const option = {
      root: null,
      rootMargin: '20px',
      threshold: 0
    }
    const observer = new IntersectionObserver(handleObserver, option)
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current)
      }
    }
  }, [handleObserver])

  /**
   * 获取创作者nft
   */
  const getCreator = async () => {
    if (account) {
      const res = await GetCreatorNftApi(packageId, account.address)
      console.log('getCreator', res)
      if (res && res.length > 0 && res[0].asMoveObject?.contents?.json) {
        let creator = res[0].asMoveObject.contents.json as unknown as CreatorNft
        setCreator(creator)
        setCreatorNft(creator)
      }
    }
  }

  /**
   * 获取最新书评
   */
  const getLatestReview = async () => {
    const res = await GetLatestBookReviewApi(packageId)
    if (res && res.length > 0) {
      const reviews = res.map(item => {
        if (item.contents) {
          return (item.contents as { json: BookReview }).json
        }
        return []
      })
      setLatestReview(reviews as BookReview[])
    }
  }

  /**
   * 查看书评
   * @param review 书评
   */
  const seeReview = (review: BookReview) => {
    setCurrentReview(review)
    setOpenReview(true)
  }

  /**
   * 捐赠
   */
  const doDonate = () => {
    console.log('donate')
    if (!account) {
      return
    }
    const txb = new Transaction()
    let method = ''
    const splitCoin = txb.splitCoins(txb.gas, [SUI_DECIMALS])
    // 有创作者nft的捐赠
    if (creator) {
      method = `${packageId}::walrus_library::donate_server_with_creator_nft`
      txb.moveCall({
        target: method,
        arguments: [
          txb.object(server),
          txb.object(creator.id),
          splitCoin,
          txb.object('0x6')
        ]
      })
    } else {
      method = `${packageId}::walrus_library::donate_server`
      txb.moveCall({
        target: method,
        arguments: [
          txb.object(server),
          splitCoin,
          txb.object('0x6')
        ]
      })
    }
    mutate(
      {
        transaction: txb
      },
      {
        onError: (err) => {
          console.log(err.message)
          messageApi.error(t('home.donateError'))
        },
        onSuccess: async (result) => {
          await client.waitForTransaction({ digest: result.digest })
          messageApi.success(t('home.donateSuccess'))
          getCreator()
        }
      }
    )
    
  }

  useEffect(() => {
    getCreator()
  }, [account])

  useEffect(() => {
    // 1分钟拿一次
    getLatestReview()
    const interval = setInterval(() => {
      getLatestReview()
    }, 1 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-full">
      <section className="top-section fixed w-screen h-full">
        <video className="absolute top-0 left-0 w-full h-full object-cover" src={getBlobUrl('9nyheK4phlsnY9biZxbj2X9yS1y6_PZpYbFz2x5tDYQ')} autoPlay loop muted poster={posterBase64}/>
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
          <div className="max-w-7xl h-full m-auto py-5 flex flex-col items-center justify-center">
            <div
              className="w-full h-full bg-white border border-black rounded-lg p-5 overflow-y-auto"
            >
              <div className="grid gap-4" style={{gridTemplateColumns: "repeat(4, minmax(0, 1fr))"}}>
                {
                  books.map((book) => (
                    <div className="flex flex-col items-center gap-1"  key={book.id} onClick={() => navigator('/book/' + book.id)}>
                      <Tooltip color="cyan" placement="bottom" title={book.title}>
                        <Image
                          className="rounded-lg cursor-pointer shadow-lg"
                          width={300}
                          height={400}
                          src={getBlobUrl(book.cover_blob_id)}
                          placeholder={
                            <Image width={300} height={400} src={bookBlockBase64} />
                          }
                          fallback={bookBlockBase64}
                          preview={false}
                        />
                      </Tooltip>
                    </div>
                  ))
                }
              </div>
              <div ref={loadMoreRef} className="h-10"></div>
            </div>
          </div>
        </section>
        {/* review section */}
        <section className="bg-fixed bg-cover bg-center bg-[#98efe4]">
          <div className="max-w-7xl h-full m-auto py-20 flex flex-col items-center justify-center">
            <div className="w-full h-full bg-white border border-black rounded-lg p-5">
              <div className="text-6xl font-bold text-center">
                <div>{t('home.review')}</div>
              </div>
              <List
                className="mt-5"
                itemLayout="horizontal"
                dataSource={latestReview}
                renderItem={(item, index) => (
                  <List.Item className="cursor-pointer" onClick={() => seeReview(item)}>
                    <List.Item.Meta
                      avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                      title={<div>{item.book_title}-{t('bookDetail.reviewTitle')}</div>}
                      description={dayjs(Number(item.timestamp)).format('YYYY-MM-DD HH:mm:ss')}
                    />
                  </List.Item>
                )}
              />
              <BookReviewModal
                open={openReview}
                onCancel={() => setOpenReview(false)}
                bookReview={currentReview}
              />
            </div>
          </div>
        </section>
        {/* upload section */}
        <section className="h-screen overflow-hidden">
          <div className="max-w-7xl h-full m-auto">
            <div className="flex items-center gap-4 justify-center h-full">
              <AnimationOnScroll animateIn="animate__bounceInUp">
                <img onClick={() => window.open('/#/upload', '_blank')} className="upload-icon animate__animated cursor-pointer" src="/images/upload.svg" alt="upload" />
              </AnimationOnScroll>
              <AnimationOnScroll animateIn="animate__bounceInRight">
                <div className="text-6xl font-bold">
                  <div>{t('home.upload')}</div>
                  {
                    !creator ?
                    <MintCreatorNftBtn onMintSuccess={() => {
                      // setTimeout(() => getCreator(), 5000)
                      getCreator()
                    }} /> :
                    <div
                      onClick={() => window.open('/#/upload', '_blank')}
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
      {/* donate section */}
      {
        account &&
        <div onClick={doDonate} className="fixed flex flex-col items-center justify-center right-0 top-1/2 translate-y-1/2 h-16 z-50 cursor-pointer">
          <Lottie className="h-full" animationData={donateAnimation} />
          <div className="mt-2 text-white text-sm">
            {t('home.donate')}
          </div>
          {contextHolder}
        </div>
      }
    </div>
  )
}
