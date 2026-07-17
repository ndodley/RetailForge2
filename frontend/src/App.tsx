import './App.css'
import AppRoutes from './routes/AppRoutes'
import {AuthProvider} from "./context/AuthContext.tsx";
import {FavoritesProvider} from "./context/FavoritesContext.tsx";

function App() {
  return (
      <AuthProvider>
        <FavoritesProvider>
          <AppRoutes />
        </FavoritesProvider>
      </AuthProvider>
  )
}

export default App
