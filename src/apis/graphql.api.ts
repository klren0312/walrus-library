import { SuiGraphQLClient } from '@mysten/sui/graphql'
import { graphql } from '@mysten/sui/graphql/schemas/2024.4'
import { SUI_GRAPHQL_URL } from '../utils/constants'
import { BookData } from '../stores/books'
 
const gqlClient = new SuiGraphQLClient({
	url: SUI_GRAPHQL_URL,
})

/**
 * 获取创作者 NFT
 * @param packageId 包 ID
 * @param address 地址
 * @returns 创作者 NFT
 */
export async function GetCreatorNftApi (packageId: string, address: string) {
  const query = graphql(`
    query {
      objects (
        filter: {
          type: "${packageId}::walrus_library::BookCreatorNft"
          owner: "${address}"
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
 
	return result.data?.objects.nodes;
}

/**
 * 获取书籍
 * @param packageId 包 ID
 * @returns 书籍
 */
export async function GetBooksApi (packageId: string) {
  const query = graphql(`
    query {
      objects (
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