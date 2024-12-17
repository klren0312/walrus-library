import { UploadWalrusResponse } from './types/common.type'
import request from '/@/utils/request'
import mime from 'mime'
import { WALRUS_AGGREGATOR, WALRUS_PUBLISHER_TESTNET } from '/@/utils/constants'
import { SuiGraphQLClient } from '@mysten/sui/graphql'
import { graphql } from '@mysten/sui/graphql/schemas/2024.4'
import { SUI_GRAPHQL_URL } from '../utils/constants'
 
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

// 上传图片
export async function UploadImageApi (file: File): Promise<UploadWalrusResponse | null> {
  const buffer = await file.arrayBuffer()
  const binary = new Uint8Array(buffer)
  return request({
    method: 'PUT',
    url: WALRUS_PUBLISHER_TESTNET,
    data: binary,
    headers: {
      'Content-Type': mime.getType(file.name)
    },
    transformRequest: [(data) => data]
  }).then(res => {
    if (res.status === 200) {
      return res.data
    } else {
      console.error(res)
      return null
    }
  })
}

// 上传文本
export async function UploadTextApi (text: string): Promise<UploadWalrusResponse | null> {
  return request({
    method: 'PUT',
    url: WALRUS_PUBLISHER_TESTNET,
    data: text,
  }).then(res => {
    if (res.status === 200) {
      return res.data
    } else {
      console.error(res)
      return null
    }
  })
}

// 下载读取文本
export async function DownloadTextApi (blobId: string): Promise<string | null> {
  const res = await request({
    method: 'GET',
    url: `${WALRUS_AGGREGATOR[0]}${blobId}`,
    responseType: 'text',
  })
  if (res.status === 200) {
    return res.data
  } else {
    console.error(res)
    return null
  }
}
