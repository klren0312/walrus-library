import { Button, Modal, Spin } from 'antd'
import Markdown from 'react-markdown'
import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'
import { DownloadTextApi } from '../apis/common.api'
import { BookReview } from '../apis/types/book.type'
import { Link } from 'react-router-dom'

interface Props {
  open: boolean
  onCancel: () => void
  bookReview: BookReview | undefined
}
export default function BookReviewModal({ open, onCancel, bookReview }: Props) {
  const { t } = useTranslation()
  const [markdown, setMarkdown] = useState('')
  const [reviewLoading, setReviewLoading] = useState(false)

  const seeReview = async (contentBlobId: string) => {
    setMarkdown('')
    setReviewLoading(true)
    const res = await DownloadTextApi(contentBlobId)
    setMarkdown(res || '')
    setReviewLoading(false)
  }
  useEffect(() => {
    if (bookReview) {
      seeReview(bookReview.content_blob_id)
    }
  }, [bookReview])
  return (
    <Modal
      width={1000}
      open={open}
      onCancel={onCancel}
      title={`${t('bookDetail.reviewTitle')} - ${bookReview?.book_title}`}
      footer={null}
    >
      <Button type="link" block>
        <Link to={`/book/${bookReview?.book_id}`}>{t('bookDetail.toBook')}《{bookReview?.book_title}》</Link>
      </Button>
      <Spin spinning={reviewLoading}>
        <Markdown className='prose max-w-full min-h-96'>{markdown}</Markdown>
      </Spin>
    </Modal>
  )
}