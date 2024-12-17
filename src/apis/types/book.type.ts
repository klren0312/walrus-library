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

export interface BookReview {
  id: string
  book_id: string
  author: string
  content_blob_id: string
  timestamp: string
  book_title: string
  book_cover_blob_id: string
}

export interface BookReviewData {
  nodes: {
    name: {
      json: string
    }
    value: {
      json: BookReview
    }
  }[]
  pageInfo: {
    hasNextPage: boolean
    endCursor: string
  }
}
