import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { message } from 'antd'
import { useNetworkVariable } from '../utils/networkConfig'
import { useTranslation } from 'react-i18next'
import { Transaction } from '@mysten/sui/transactions'
import ConnectBtn from './ConnectBtn'

export default function MintCreatorNftBtn({onMintSuccess}: {onMintSuccess: () => void}) {
  const [messageApi, contextHolder] = message.useMessage()
  const { mutate } = useSignAndExecuteTransaction()
  const packageId = useNetworkVariable('packageId')
  const server = useNetworkVariable('server')
  const { t } = useTranslation()
  const currentAccount = useCurrentAccount()
  const doMint = () => {
    const txb = new Transaction()
    txb.moveCall({
      target: `${packageId}::walrus_library::mint_book_creator_nft`,
      arguments: [
        txb.object(server),
      ]
    })
    mutate(
      {
        transaction: txb
      },
      {
        onSuccess: () => {
          messageApi.success(t('mint.mintCreatorNftSuccess'))
          onMintSuccess()
        },
        onError: (err) => {
          console.log(err.message)
          messageApi.error(err.message)
        }
      }
    )
  }
  return (
    <>
      {
        currentAccount ?
        <div className="inline-block cursor-pointer text-xl text-black border-4 border-[#98efe4] rounded-md px-4 py-2" onClick={doMint}>
          {t('mint.mintCreatorNft')}
        </div> :
        <ConnectBtn />
      }
      {contextHolder}
    </>
  )
}
