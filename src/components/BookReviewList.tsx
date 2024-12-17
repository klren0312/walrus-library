import { useTranslation } from 'react-i18next'
import { BookReview, BookReviewData } from '/@/apis/types/book.type'
import dayjs from 'dayjs'
import { useEffect, useState } from 'react'
import { Button } from 'antd'
import { GetBookReviewApi } from '../apis/book.api'
import BookReviewModal from './BookReviewModal'

interface BookReviewListProps {
  bookReview: { id: string; size: string } | undefined
}

export default function BookReviewList ({ bookReview }: BookReviewListProps) {
  const { t } = useTranslation()
  const [openReview, setOpenReview] = useState(false)
  const [currentReview, setCurrentReview] = useState<BookReview | undefined>(undefined)
  const [bookReviewData, setBookReviewData] = useState<BookReviewData | undefined>(undefined)
  const [loadMoreLoading, setLoadMoreLoading] = useState(false)
  /**
   * 获取书评
   * @param bookReview 书评
   */
  const getBookReview = async (bookReview: { id: string; size: string } | undefined, endCursor: string | null = null) => {
    if(bookReview) {
      const res = await GetBookReviewApi(bookReview.id, endCursor)
      if (res) {
        if (res.nodes.length > 0) {
          const arr = [...(bookReviewData?.nodes || []), ...res.nodes]
          // 根据时间排序
          arr.sort((a, b) => Number(b.value.json.timestamp) - Number(a.value.json.timestamp))
          setBookReviewData({
            pageInfo: res.pageInfo,
            nodes: arr
          })
        }
      }
    }
  }
  const seeReview = async (bookReview: BookReview) => {
    setCurrentReview(bookReview)
    setOpenReview(true)
  }
  const loadMoreReview = () => {
    if (bookReviewData && bookReviewData.pageInfo.hasNextPage) {
      setLoadMoreLoading(true)
      getBookReview(bookReview, bookReviewData.pageInfo.endCursor)
      setLoadMoreLoading(false)
    }
  }
  useEffect(() => {
    if(bookReview) {
      getBookReview(bookReview)
    }
  }, [bookReview])
  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-y-auto">
      {
        bookReviewData && bookReviewData.nodes.map((node, index) => (
          <div
            className="flex justify-between items-center gap-2 cursor-pointer"
            onClick={() => seeReview(node.value.json)}
            key={node.value.json.id}
          >
            <div className="text-lg font-bold">{t('bookDetail.reviewTitle')} {index + 1}</div>
            <div className="text-sm text-gray-500">{dayjs(Number(node.value.json.timestamp)).format('YYYY-MM-DD HH:mm:ss')}</div>
          </div>
        ))
      }
      {
        bookReviewData && bookReviewData.pageInfo.hasNextPage && (
          <div className="flex justify-center items-center">
            <Button onClick={loadMoreReview} loading={loadMoreLoading}>加载更多</Button>
          </div>
        )
      }
      <BookReviewModal
        open={openReview}
        onCancel={() => setOpenReview(false)}
        bookReview={currentReview}
      />
    </div>
  )
}
