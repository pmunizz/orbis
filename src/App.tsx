import { AppStoreProvider } from './context/AppStoreContext'
import SiteLayout from './components/SiteLayout'
import './App.css'

export default function App() {
  return (
    <AppStoreProvider>
      <SiteLayout />
    </AppStoreProvider>
  )
}
