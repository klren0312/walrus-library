import { useEffect } from 'react'
import { GetCreatorNftApi } from '../apis/graphql.api'
import { useNetworkVariable } from '../utils/networkConfig'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { CreatorNft, useCreatorStore } from '../stores/creator'
// 获取创作者 NFT
export const useGetCreator = () => {
  const packageId = useNetworkVariable('packageId')
  const account = useCurrentAccount()
  const { creatorNft, setCreatorNft } = useCreatorStore()
  const getCreator = async () => {
    if (account) {
      const res = await GetCreatorNftApi(packageId, account.address)
      if (res && res.length > 0 && res[0].asMoveObject?.contents?.json) {
        let creatorData = res[0].asMoveObject.contents.json as unknown as CreatorNft
        setCreatorNft(creatorData)
      }
    }
  }
  useEffect(() => {
    getCreator()
  }, [account, packageId])

  return creatorNft
}