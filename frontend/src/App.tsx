import './App.css'
import AppRoutes from './routes/AppRoutes'
import {AuthProvider} from "./context/AuthContext.tsx";
import {FavoritesProvider} from "./context/FavoritesContext.tsx";
import ChatWidget from './components/common/ChatWidget'

function App() {
  return (
      <AuthProvider>
        <FavoritesProvider>
          <AppRoutes />
          <ChatWidget />
        </FavoritesProvider>
      </AuthProvider>
  )
}

export default App
