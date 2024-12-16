export interface BookCreateEvent {
  json: {
    book_id: string
    title: string
    author: string
    description: string
    blob_id: string
    creator: string
    size: string
    content_type: string
  }
}

export interface InsertBookData {
  book_id: string
  title: string
  author: string
  description: string
  blob_id: string
  creator: string
  cover_blob_id: string
}
