import { WALRUS_AGGREGATOR } from './constants'

/**
 * 获取 blob 的 url
 * @param blobId blobId
 * @returns blob 的 url
 */
export const getBlobUrl = (blobId: string) => {
  return `${WALRUS_AGGREGATOR[0]}${blobId}`
}

/**
 * 计算大小
 * @param size 大小为byte
 * @returns 大小
 */
export const calculateSize = (size: string) => {
  const sizeNumber = Number(size)
  if (isNaN(sizeNumber)) {
    return '0B'
  }
  if (sizeNumber < 1024) {
    return `${sizeNumber}B`
  } else if (sizeNumber < 1024 * 1024) {
    return `${(sizeNumber / 1024).toFixed(2)}KB`
  } else if (sizeNumber < 1024 * 1024 * 1024) {
    return `${(sizeNumber / 1024 / 1024).toFixed(2)}MB`
  } else {
    return `${(sizeNumber / 1024 / 1024 / 1024).toFixed(2)}GB`
  }
}

/**
 * 下载文件
 * @param blobId blobId
 */
export const downloadFile = (blobId: string, title: string, type: string) => {
  const link = document.createElement('a')
  link.style.display = 'none'
  // 创建 Blob 对象
  return fetch(`${WALRUS_AGGREGATOR[0]}${blobId}`)
    .then(response => response.blob())
    .then(blob => {
      const url = URL.createObjectURL(blob)
      // 设置下载地址
      link.setAttribute('href', url)
      // 设置文件名
      link.setAttribute('download', `${title}.${type.split('/')[1]}`)
      link.setAttribute('target', '_blank')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      // 释放 URL 对象
      URL.revokeObjectURL(url)
    })
    .catch(error => console.error('下载文件失败:', error))
}
