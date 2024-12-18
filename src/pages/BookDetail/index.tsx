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
          {
            loading ?
            <Spin /> :
            <div className="relative w-full min-h-[80%] p-5 flex gap-5 border border-black rounded-lg">
              <div onClick={() => navigate('/')} className="absolute right-0 flex items-center cursor-pointer" style={{top: '-1.5rem'}}>
                <RollbackOutlined  />
                <span className="ml-2">{t('bookDetail.goBack')}</span>
              </div>
              <div className="w-1/2 flex flex-col items-center justify-center">
              {
                bookType.includes('pdf') ?
                <>
                  <Document className="h-[43.75rem]" file={getBlobUrl(bookData?.blob_id || '')} onLoadSuccess={onDocumentLoadSuccess}>
                    <Page height={700} pageNumber={pageNumber} />
                  </Document>
                  <Pagination className="mt-5" simple current={pageNumber} total={numPages} pageSize={1} onChange={handlePageChange} showSizeChanger={false} />
                </> :
                <div className="w-full h-[43.75rem]">
                  <ReactReader
                    url={getBlobUrl('4eCkjzqMZs4UxBb6TQU5pfeOG0AV-MCUECWys4Buhgo')}
                    location={pageNumber}
                    epubOptions={{spread: 'none'}}
                    epubInitOptions={{
                      openAs: 'epub',
                    }}
                    locationChanged={(epubcfi: string) => setPageNumber(parseInt(epubcfi))}
                  />
                </div>
              }
              </div>
              <div className="flex flex-col gap-5 w-1/2 text-4xl">
                <div className="text-ellipsis">{t('bookDetail.title')}: {bookData?.title}</div>
                <div className="text-ellipsis">{t('bookDetail.author')}: {bookData?.author}</div>
                <div className="text-ellipsis">{t('bookDetail.description')}: {bookData?.description}</div>
                <div>{t('bookDetail.size')}: {calculateSize(bookData?.size || '0')}</div>
                <div className="flex gap-5 items-center">
                  {
                    downloadLoading ? <Spin /> :
                    <div
                      onClick={doDownload}
                      className="inline-block cursor-pointer text-xl text-black border-4 border-[#98efe4] rounded-md px-6 py-2"
                    >
                      {t('bookDetail.download')}
                    </div>
                  }
                  <div
                    onClick={() => {
                      window.open(`https://suiscan.xyz/testnet/object/${bookData?.id}`, '_blank')
                    }}
                    className="inline-block cursor-pointer text-xl text-black border-4 border-[#98efe4] rounded-md px-6 py-2"
                  >
                    {t('bookDetail.toSuiScan')}
                  </div>
                  {/* 写书评 */}
                  <div
                    onClick={() => setWriteReviewOpen(true)}
                    className="inline-block cursor-pointer text-xl text-black border-4 border-[#98efe4] rounded-md px-6 py-2"
                  >
                    {t('bookDetail.writeReview')}
                  </div>
                </div>
                <BookReviewList bookReview={bookData?.book_review} />
              </div>
            </div>
          }
        </div>
      </div>
      <WriteReview
        bookId={bookData?.id || ''}
        writeReviewOpen={writeReviewOpen}
        setWriteReviewOpen={setWriteReviewOpen}
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
