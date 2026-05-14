import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ParkingProvider } from './context/ParkingContext';
import { ThemeProvider } from './context/ThemeContext';
import AppRouter from './router/AppRouter';
import { ToastContainer } from './components/ui/Toast';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ParkingProvider>
            <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
              <AppRouter />
              <ToastContainer />
            </div>
          </ParkingProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
