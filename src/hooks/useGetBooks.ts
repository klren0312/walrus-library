import { useEffect, useState } from 'react'
import { GetBooksApi } from '/@/apis/book.api'
import { useNetworkVariable } from '/@/utils/networkConfig'
import { BookData, useBooksStore } from '/@/stores/books'
export const useGetBooks = () => {
  const { books, setBooks } = useBooksStore()
  const packageId = useNetworkVariable('packageId')
  const [endCursor, setEndCursor] = useState<string | null>(null)
  const getBooks = async (endCursor: string | null = null) => {
    const res = await GetBooksApi(packageId, endCursor)
    if (res && res.nodes.length > 0) {
      if (endCursor) {
        // 分页添加到数组尾部
        const afterBooks = res.nodes.map(item => item.asMoveObject?.contents?.json as BookData)
        setBooks([...books, ...afterBooks])
      } else {
        const books = res.nodes.map(item => item.asMoveObject?.contents?.json as BookData)
        setBooks(books)
      }
      if (res.pageInfo.hasNextPage) {
        setEndCursor(res.pageInfo.endCursor)
        return true
      }
    }
    return false
  }
  useEffect(() => {
    getBooks()
  }, [packageId])
  // 提供分页方法
  const getNextPage = async () => {
    if (!endCursor) {
      return false
    }
    const hasNextPage = await getBooks(endCursor)
    return hasNextPage
  }
  return { books, getNextPage }
}
