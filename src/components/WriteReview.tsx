import { Button, message, Modal } from 'antd'
import { MdEditor, UploadImgCallBack } from 'md-editor-rt'
import 'md-editor-rt/lib/style.css'
import { useState } from 'react'
import { UploadImageApi, UploadTextApi } from '../apis/common.api'
import { getBlobUrl } from '../utils/tools'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { useTranslation } from 'react-i18next'
import { useNetworkVariable } from '../utils/networkConfig'

interface Props {
  bookId: string
  writeReviewOpen: boolean
  setWriteReviewOpen: (open: boolean) => void
  submitSuccess: () => void
  onCancel: () => void
}
export default function WriteReview({ bookId, writeReviewOpen, setWriteReviewOpen, submitSuccess, onCancel }: Props) {
  const [messageApi, contextHolder] = message.useMessage()
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const account = useCurrentAccount()
  const { mutate } = useSignAndExecuteTransaction()
  const packageId = useNetworkVariable('packageId')
  const [submitLoading, setSubmitLoading] = useState(false)
  
  /**
   * 编辑器上传图片
   * @param files 图片文件
   * @param callBack 回调函数
   */
  const onUploadImg = async (files: Array<File>, callBack: UploadImgCallBack) => {
    const urls: string[] = []
    for (const file of files) {
      const res = await UploadImageApi(file)
      if (res) {
        let blobId = ''
        if (res.alreadyCertified) {
          blobId = res.alreadyCertified.blobId
        } else if (res.newlyCreated) {
          blobId = res.newlyCreated.blobObject.blobId
        }
        if (blobId) {
          urls.push(getBlobUrl(blobId))
        }
      }
    }
    callBack(urls)
  }
  /**
   * 提交书评
   */
  const submitReview = async () => {
    setSubmitLoading(true)
    const txb = new Transaction()
    const res = await UploadTextApi(text)
    if (res) {
      let blobId = ''
      if (res.alreadyCertified) {
        blobId = res.alreadyCertified.blobId
      } else if (res.newlyCreated) {
        blobId = res.newlyCreated.blobObject.blobId
      }
      txb.moveCall({
        target: `${packageId}::walrus_library::create_book_review`,
        arguments: [
          txb.object(bookId),
          txb.object(account?.address || '0x0'),
          txb.pure.string(blobId),
          txb.object('0x6'),
        ]
      })
      mutate(
        {
          transaction: txb
        },
        {
          onSuccess: () => {
            messageApi.success(t('bookDetail.submitSuccess'))
            setSubmitLoading(false)
            setWriteReviewOpen(false)
            submitSuccess()
          },
          onError: (error) => {
            console.log(error)
            messageApi.error(t('bookDetail.submitError'))
            setSubmitLoading(false)
          }
        }
      )
    }
  }
  return (
    <Modal
      width={1000}
      open={writeReviewOpen}
      title={t('bookDetail.writeReview')}
      footer={() => <div className="flex justify-end">
        <Button loading={submitLoading} onClick={submitReview}>{t('bookDetail.submit')}</Button>
      </div>}
      onCancel={onCancel}
    >
      <MdEditor
        value={text}
        onChange={setText}
        onUploadImg={onUploadImg}
      />
      {contextHolder}
    </Modal>
  )
}