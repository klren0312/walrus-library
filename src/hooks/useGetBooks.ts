import { useEffect } from 'react'
import { GetBooksApi } from '/@/apis/book.api'
import { useNetworkVariable } from '/@/utils/networkConfig'
import { BookData, useBooksStore } from '/@/stores/books'
export const useGetBooks = () => {
  const { books, setBooks } = useBooksStore()
  const packageId = useNetworkVariable('packageId')
  const getBooks = async () => {
    const res = await GetBooksApi(packageId)
    if (res && res.length > 0) {
      const books = res.map(item => item.asMoveObject?.contents?.json as BookData)
      setBooks(books)
    }
  }
  useEffect(() => {
    getBooks()
    const intervalId = setInterval(() => {
      getBooks()
    }, 10000)
    
    return () => clearInterval(intervalId)
  }, [packageId])
  return books
}