import { create } from 'zustand'
export interface BookData {
  id: string;
  cover_blob_id: string;
  title: string;
  author: string;
  description: string;
  blob_id: string;
  creator: string;
  size: string;
  content_type: string;
}
export const useBooksStore = create<{
  books: BookData[]
  setBooks: (books: BookData[]) => void
}>((set) => ({
  books: [],
  setBooks: (books) => set({ books }),
}))
