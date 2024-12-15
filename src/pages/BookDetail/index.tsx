import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { pdfjs, Document, Page } from 'react-pdf'
import { calculateSize, downloadFile, getBlobUrl } from '/@/utils/tools'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { Pagination, Spin } from 'antd'
import { GetBookDetailApi } from '/@/apis/graphql.api'
import { BookData } from '/@/stores/books'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log(numPages)
    setNumPages(numPages)
  }
  const handlePageChange = (page: number) => {
    setPageNumber(page)
  }

  const getBookDetail = async (id: string) => {
    setLoading(true)
    const res = await GetBookDetailApi(id)
    if(res) {
      setBookData(res)
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
            <div className="w-full h-5/6 p-5 flex items-center border border-black rounded-lg">
              <div className="w-1/2 flex flex-col items-center justify-center">
                <Document className="h-[43.75rem]" file={getBlobUrl(bookData?.blob_id || '')} onLoadSuccess={onDocumentLoadSuccess}>
                  <Page height={700} pageNumber={pageNumber} />
                </Document>
                <Pagination className="mt-5" simple current={pageNumber} total={numPages} pageSize={1} onChange={handlePageChange} showSizeChanger={false} />
              </div>
              <div className="flex flex-col gap-5 w-1/2 text-4xl">
                <div>书名：{bookData?.title}</div>
                <div>作者：{bookData?.author}</div>
                <div>描述：{bookData?.description}</div>
                <div>大小：{calculateSize(bookData?.size || '0')}</div>
                <div className="w-full h-full flex gap-5 items-center">
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
                </div>
              </div>
            </div>
          }

        </div>
      </div>
    </section>
  )
}
