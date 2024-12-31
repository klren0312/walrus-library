import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { pdfjs, Document, Page } from 'react-pdf'
import { ReactReader } from 'react-reader'
import { calculateSize, downloadFile, getBlobUrl } from '/@/utils/tools'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Pagination, Spin } from 'antd'
import { GetBookDetailApi } from '/@/apis/book.api'
import { BookData } from '/@/stores/books'
import { useTranslation } from 'react-i18next'
import WriteReview from '/@/components/WriteReview'
import BookReviewList from '/@/components/BookReviewList'
import { RollbackOutlined } from '@ant-design/icons'
import './style.less'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  '/pdf.worker.min.mjs',
  import.meta.url,
).toString()
export default function BookDetail() {
  const { id } = useParams()
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [bookData, setBookData] = useState<BookData | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [downloadLoading, setDownloadLoading] = useState<boolean>(false)
  const [bookType, setBookType] = useState<string>('')
  const [writeReviewOpen, setWriteReviewOpen] = useState<boolean>(false)
  const { t } = useTranslation()
  const navigate = useNavigate()
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }
  const handlePageChange = (page: number) => {
    setPageNumber(page)
  }

  /**
   * 获取书籍详情
   * @param id 书籍 ID
   */
  const getBookDetail = async (id: string) => {
    setLoading(true)
    const res = await GetBookDetailApi(id)
    if(res) {
      setBookData(res)
      setBookType(res.content_type)
    }
    setLoading(false)
  }

  const doDownload = async () => {
    setDownloadLoading(true)
    await downloadFile(bookData?.blob_id || '', bookData?.title || '', 'application/pdf')
    setDownloadLoading(false)
  }

  useEffect(() => {
    if (id) {
      getBookDetail(id)
    }
  }, [id])
  return (
    <section className="w-full h-full bg-[#e4f0ef]">
      <div className="max-w-7xl h-full m-auto">
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="relative w-full h-[90%] p-5 flex flex-col justify-between gap-5 border border-black rounded-lg">
            <div className="absolute top-0 pt-5 box-border h-full overflow-y-auto" style={{right: "-210px"}}>
              <BookReviewList bookReview={bookData?.book_review} />
            </div>
            {
              loading ?
              <Spin /> :
              <>
                <div onClick={() => navigate('/')} className="absolute right-0 flex items-center cursor-pointer" style={{top: '-1.5rem'}}>
                  <RollbackOutlined  />
                  <span className="ml-2">{t('bookDetail.goBack')}</span>
                </div>
                <div className="flex flex-col">
                  {/* 按钮组 */}
                  <div className="flex gap-5 items-center">
                    {
                      downloadLoading ? <Spin /> :
                      <div
                        onClick={doDownload}
                        className="inline-block cursor-pointer text-xl text-black border-2 border-[#98efe4] rounded-md px-4 py-1"
                        style={{borderWidth: '2px'}}
                      >
                        {t('bookDetail.download')}
                      </div>
                    }
                    <div
                      onClick={() => {
                        window.open(`https://suiscan.xyz/testnet/object/${bookData?.id}`, '_blank')
                      }}
                      className="inline-block cursor-pointer text-xl text-black border-2 border-[#98efe4] rounded-md px-4 py-1"
                      style={{borderWidth: '2px'}}
                    >
                      {t('bookDetail.toSuiScan')}
                    </div>
                    {/* 写书评 */}
                    <div
                      onClick={() => setWriteReviewOpen(true)}
                      className="inline-block cursor-pointer text-xl text-black border-2 border-[#98efe4] rounded-md px-4 py-1"
                      style={{borderWidth: '2px'}}
                    >
                      {t('bookDetail.writeReview')}
                    </div>
                  </div>
                  <div className="flex flex-col justify-between gap-5 mt-5 text-xl">
                    <div className="flex flex-col gap-5">
                      <div className="flex justify-between gap-5">
                        <div className="text-ellipsis">{t('bookDetail.title')}: {bookData?.title}</div>
                        <div className="text-ellipsis">{t('bookDetail.author')}: {bookData?.author}</div>
                        <div>{t('bookDetail.size')}: {calculateSize(bookData?.size || '0')}</div>
                      </div>
                      <div className="the-description">{t('bookDetail.description')}: {bookData?.description}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  {
                    bookType.includes('pdf') ?
                    <>
                      <Document className="h-[37.5rem]" file={getBlobUrl(bookData?.blob_id || '')} onLoadSuccess={onDocumentLoadSuccess}>
                        <Page height={600} pageNumber={pageNumber} />
                      </Document>
                      <Pagination className="mt-2" simple current={pageNumber} total={numPages} pageSize={1} onChange={handlePageChange} showSizeChanger={false} />
                    </> :
                    <div className="w-full h-[37.5rem]">
                      <ReactReader
                        url={getBlobUrl(bookData?.blob_id || '')}
                        location={pageNumber}
                        epubInitOptions={{
                          openAs: 'epub',
                        }}
                        locationChanged={(epubcfi: string) => setPageNumber(parseInt(epubcfi))}
                      />
                    </div>
                  }
                </div>
              </>
            }
          </div>
        </div>
      </div>
      <WriteReview
        bookId={bookData?.id || ''}
        writeReviewOpen={writeReviewOpen}
        setWriteReviewOpen={setWriteReviewOpen}
        onCancel={() => setWriteReviewOpen(false)}
        submitSuccess={
          () => {
            setTimeout(() => {
              id && getBookDetail(id)
            }, 5000)
          }
        }
      />
    </section>
  )
}
