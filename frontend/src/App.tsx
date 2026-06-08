import './App.css'
import AppRoutes from './routes/AppRoutes'
import {AuthProvider} from "./context/AuthContext.tsx";

function App() {
  return (
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
  )
}

export default App
