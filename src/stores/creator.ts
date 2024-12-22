import { create } from 'zustand'

export interface CreatorNft {
  id: string
  name: string
  image_url: string
  description: string
  book_number: string
  index: string
}
type CreatorState = {
  creatorNft: CreatorNft
  setCreatorNft: (creatorNft: CreatorNft) => void
}

export const useCreatorStore = create<CreatorState>((set) => ({
  creatorNft: {
    id: '',
    name: '',
    image_url: '',
    description: '',
    book_number: '',
    index: '',
  },
  setCreatorNft: (creatorNft) => set({ creatorNft }),
}))
