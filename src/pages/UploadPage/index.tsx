import { Form, Input, Button, Flex, Upload, message } from 'antd'
import { InboxOutlined, UploadOutlined } from '@ant-design/icons'
import './style.less'
import { useTranslation } from 'react-i18next'
import { UploadImageApi } from '/@/apis/common.api'
import { useState } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { useNetworkVariable } from '/@/utils/networkConfig'
import { useGetCreator } from '/@/hooks/useGetCreator'
import { GetBookIdApi, InsertBookToDatabase } from '/@/apis/book.api'

const { Dragger } = Upload
const { TextArea } = Input

interface FormValues {
  coverUrl: string
  title: string
  author: string
  description: string
  file: string
  fileSize: number
  fileType: string
}

export default function UploadPage() {
  const creator = useGetCreator()
  const [messageApi, contextHolder] = message.useMessage()
  const { mutate } = useSignAndExecuteTransaction()
  const packageId = useNetworkVariable('packageId')
  const server = useNetworkVariable('server')
  const { t } = useTranslation()
  const [form] = Form.useForm()
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const account = useCurrentAccount()
  /**
   * 自定义上传逻辑
   */
  const customUploadCover = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options
    setUploading(true)
    const res = await UploadImageApi(file)
    if (res) {
      onProgress(100)
      let blobId = ''
      if (res.alreadyCertified) {
        blobId = res.alreadyCertified.blobId
      } else if (res.newlyCreated) {
        blobId = res.newlyCreated.blobObject.blobId
      }
      onSuccess([file])
      form.setFieldValue('coverUrl', blobId)
      setImageUrl(URL.createObjectURL(file))
    } else {
      onError('上传失败')
    }
    setUploading(false)
  }
  /**
   * 自定义上传逻辑
   */
  const customUploadFile = async (options: any) => {
    const { file, onSuccess, onError, onProgress } = options
    const res = await UploadImageApi(file)
    console.log(file.type)
    if (res) {
      onProgress(100)
      let blobId = ''
      if (res.alreadyCertified) {
        blobId = res.alreadyCertified.blobId
      } else if (res.newlyCreated) {
        blobId = res.newlyCreated.blobObject.blobId
      }
      onSuccess([file])
      form.setFieldValue('file', blobId)
      form.setFieldValue('fileSize', file.size)
      form.setFieldValue('fileType', file.type)
    } else {
      onError('上传失败')
    }
  }
  /**
   * 提交表单
   * @param value 表单数据
   */
  const handleSubmit = (value: FormValues) => {
    if (!creator) {
      return
    }
    const txb = new Transaction()
    txb.moveCall({
      target: `${packageId}::walrus_library::create_book`,
      arguments: [
        txb.object(server),
        txb.object(creator.id),
        txb.pure.string(value.coverUrl),
        txb.pure.string(value.title),
        txb.pure.string(value.author),
        txb.pure.string(value.description),
        txb.pure.string(value.file),
        txb.pure.u64(value.fileSize),
        txb.pure.string(value.fileType)
      ]
    })
    mutate(
      {
        transaction: txb
      },
      {
        onError: (err) => {
          console.log(err.message)
          messageApi.error(err.message)
        },
        onSuccess: async (result) => {
          form.resetFields()
          setImageUrl('')
          messageApi.success(t('upload.successTip'))
          const bookId = await GetBookIdApi(result.digest)
          if (bookId) {
            InsertBookToDatabase(account?.address || '', {
              book_id: bookId,
              title: value.title,
              author: value.author,
              description: value.description,
              blob_id: value.file,
              creator: account?.address || '',
              cover_blob_id: value.coverUrl
            })
          }
        },
      }
    )
  }

  return (
    <section className="upload-section w-full h-full">
      {contextHolder}
      <div className="relative max-w-7xl h-full m-auto">
        <div className="absolute top-4 left-0 right-0 m-auto flex justify-center items-center">
          <ConnectButton className="reset-connect-button" connectText={t('upload.connectBtn')}></ConnectButton>
        </div>
        <div className="upload-block h-full flex justify-center items-center">
          <Form
            className="w-[50rem] h-[37.5rem] p-4 flex flex-col justify-center items-center bg-white bg-opacity-90 rounded-md shadow-md"
            form={form}
            onFinish={handleSubmit}
          >
            <Flex className="w-full" justify="center" align="center">
              <Form.Item name="coverUrl">
                <Dragger
                  className="inline-block w-[18.75rem] h-[25rem]"
                  maxCount={1}
                  multiple={false}
                  customRequest={customUploadCover}
                  showUploadList={false}
                  accept="image/png, image/jpeg, image/jpg"
                >
                  {uploading ? (
                    <p className="ant-upload-drag-icon">加载中...</p>
                  ) : imageUrl ? (
                    <img src={imageUrl} alt="preview" className="w-[16.75rem] h-[22rem] object-cover" />
                  ) : (
                    <>
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                      </p>
                      <p className="ant-upload-text">{t('upload.uploadTip')}</p>
                    </>
                  )}
                </Dragger>
              </Form.Item>
              <Flex className="w-[25rem] p-8" vertical align="flex-start" justify="space-between">
                <Form.Item className="w-full" label={t('upload.title')} name="title">
                  <Input />
                </Form.Item>
                <Form.Item className="w-full" label={t('upload.author')} name="author">
                  <Input />
                </Form.Item>
                <Form.Item className="w-full" label={t('upload.description')} name="description">
                  <TextArea rows={4} />
                </Form.Item>
                <Form.Item
                  className="w-full"
                  label={t('upload.file')}
                  name="file"
                >
                  <Upload customRequest={customUploadFile} multiple={false} maxCount={1} accept="application/pdf, application/epub+zip">
                    <Button icon={<UploadOutlined />}>{t('upload.uploadBtn')}</Button>
                  </Upload>
                </Form.Item>
                {/* 文件大小 自动填入 隐藏显示 */}
                <Form.Item className="w-full" label={t('upload.fileSize')} name="fileSize" hidden>
                  <Input />
                </Form.Item>
                {/* 文件类型 自动填入 隐藏显示 */}
                <Form.Item className="w-full" label={t('upload.fileType')} name="fileType" hidden>
                  <Input />
                </Form.Item>
              </Flex>
            </Flex>
            <Button type="primary" className="w-2/3" onClick={() => form.submit()}>
              {t('upload.submitBtn')}
            </Button>
          </Form>
        </div>
      </div>
    </section>
  )
}
