import { useContext } from 'react'
import { AppStoreContext } from '../context/storeContext'

export function useAppStore() {
  const store = useContext(AppStoreContext)
  if (!store) throw new Error('O contexto da aplicação não foi inicializado.')
  return store
}
