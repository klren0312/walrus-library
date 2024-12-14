import { create} from 'zustand'

type LocaleState = {
  locale: string
  toggleLocale: () => void
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'zhCN',
  toggleLocale: () =>
    set((state) => ({
      locale: state.locale === 'zhCN' ? 'enUS' : 'zhCN',
    })),
}))
