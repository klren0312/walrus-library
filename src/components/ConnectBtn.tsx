import { ConnectModal } from '@mysten/dapp-kit'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function ConnectBtn() {
  const { t } = useTranslation()
	const [open, setOpen] = useState(false)
  return (
    <>
      <ConnectModal
        trigger={
          <button className="inline-block cursor-pointer text-xl text-black border-4 border-[#98efe4] rounded-md px-4 py-2">
            {t('connect.connect')}
          </button>
        }
        open={open}
        onOpenChange={(isOpen) => setOpen(isOpen)}
      />
    </>
  )
}
