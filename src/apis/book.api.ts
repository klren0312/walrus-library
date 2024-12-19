import supabase from '../utils/supabase'
import { BookData } from '../stores/books'
import { SuiGraphQLClient } from '@mysten/sui/graphql'
import { graphql } from '@mysten/sui/graphql/schemas/2024.4'
import { SUI_GRAPHQL_URL } from '../utils/constants'
import { BookCreateEvent, BookReviewData, InsertBookData } from './types/book.type'

const gqlClient = new SuiGraphQLClient({
	url: SUI_GRAPHQL_URL,
})

/**
 * 获取书籍
 * @param packageId 包 ID
 * @returns 书籍
 */
export async function GetBooksApi (packageId: string) {
  const query = graphql(`
    query {
      objects (
        last: 8
        filter: {
          type: "${packageId}::walrus_library::Book"
        }
      ) {
        nodes {
          asMoveObject {
            contents {
              json
            }
          }
        }
      }
    }
  `)
  const result = await gqlClient.query({
    query,
  })
  return result.data?.objects.nodes
}

/**
 * 获取书籍详情
 * @param bookId 书籍 ID
 * @returns 书籍详情
 */
export async function GetBookDetailApi (bookId: string): Promise<BookData | null> {
  const query = graphql(`
    query {
      object (
        address: "${bookId}"
      ) {
        asMoveObject {
          contents {
            json
          }
        }
      }
    }
  `)
  const result = await gqlClient.query({
    query,
  })
  const bookData = result.data?.object?.asMoveObject?.contents?.json
  if(bookData) {
    return bookData as BookData
  }
  return null
}

// 查询书籍创建事件获取id
export async function GetBookIdApi (digest: string) {
  const query = graphql(`
    query {
      transactionBlock (
        digest: "${digest}"
      ) {
        effects {
          events {
            nodes {
              contents {
                json
              }
            }
          }
        }
      }
    }
  `)
  const result = await gqlClient.query({
    query,
  })
  const content = result.data?.transactionBlock?.effects?.events?.nodes[0]?.contents as BookCreateEvent
  if (content && content.json) {
    return content.json.book_id
  }
  return null
}

// 获取指定书籍评论
export async function GetBookReviewApi (tableId: string, endCursor: string | null = null): Promise<BookReviewData | null> {
  const query = graphql(`
    query($endCursor: String) {
      owner(address: "${tableId}") {
        dynamicFields(
          first: 10
          after: $endCursor
        ) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            name {
              json
            }
            value {
              ... on MoveValue {
                json
              }
            }
          }
        }
      }
    }
  `)
  const result = await gqlClient.query({
    query,
    variables: { endCursor },
  })
  return {
    nodes: result.data?.owner?.dynamicFields?.nodes,
    pageInfo: result.data?.owner?.dynamicFields?.pageInfo,
  } as BookReviewData
}

// 获取最新的书评（不指定书籍）
export async function GetLatestBookReviewApi (packageId: string) {
  const query = graphql(`
    query {
      events(
        last: 10
        filter: {
          eventType: "${packageId}::walrus_library::CreateBookReviewEvent"
        }
      ) {
        nodes {
          contents {
            json
          }
        }
      }
    }
  `)
  const result = await gqlClient.query({
    query,
  })
  return result.data?.events?.nodes
}

// 录入数据库
export const InsertBookToDatabase = async (address: string, bookData: InsertBookData) => {
  if (!bookData.blob_id && !bookData.book_id) {
    console.log('bookData is not valid')
    return
  }
  // 查询是否存在当前address
  const { data: filterData, error: filterError } = await supabase
    .from('book')
    .select('blob_id')
    .eq('blob_id', bookData.blob_id)

  // 没有数据，就插入
  if (filterError || filterData.length === 0) {
    const { error: insertError } = await supabase
      .from('book')
      .insert([
        { 
          address: address,
          title: bookData.title,
          blob_id: bookData.blob_id,
          book_id: bookData.book_id,
          cover_blob_id: bookData.cover_blob_id,
          author: bookData.author,
          description: bookData.description,
        },
      ])
      .select()
    if (insertError) {
      console.log('insertError', insertError)
    }
  } else {
    console.log('book already exists')
  }
}