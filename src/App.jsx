import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ParkingProvider } from './context/ParkingContext';
import AppRouter from './router/AppRouter';
import { ToastContainer } from './components/ui/Toast';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ParkingProvider>
          <div className="min-h-screen bg-[var(--bg)]">
            <AppRouter />
            <ToastContainer />
          </div>
        </ParkingProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
