import './App.css'
import AppRoutes from './routes/AppRoutes'
import {AuthProvider} from "./context/AuthContext.tsx";
import {FavoritesProvider} from "./context/FavoritesContext.tsx";
import ChatWidget from './components/common/ChatWidget'
import SessionTimeoutModal from './components/common/SessionTimeoutModal'

function App() {
  return (
      <AuthProvider>
        <FavoritesProvider>
          <AppRoutes />
          <ChatWidget />
          <SessionTimeoutModal />
        </FavoritesProvider>
      </AuthProvider>
  )
}

export default App
