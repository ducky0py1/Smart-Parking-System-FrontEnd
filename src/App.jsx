import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts & Pages (You will build these next)
import Navbar from './components/layout/Navbar';
import Login from './pages/Login';
import DriverDashboard from './pages/driver/DriverDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProfileCompletion from './pages/shared/ProfileCompletion';
import LoadingScreen from './components/ui/LoadingScreen';

function App() {
  const { user, token, loading } = useAuth();

  // 1. GLOBAL LOADING STATE
  // While checking MetaMask or fetching user from Laravel
  if (loading) {
    return <LoadingScreen />;
  }

  // 2. AUTHENTICATION CHECK
  // If no token exists, the user must stay on the login page
  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // 3. PROFILE COMPLETION CHECK (Driver Only)
  // If the driver hasn't filled in their name/email, block the dashboard
  const isProfileIncomplete = user && user.role === 'driver' && (!user.first_name || !user.email);
  
  if (isProfileIncomplete) {
    return <ProfileCompletion />;
  }

  // 4. ROLE-BASED ROUTING
  return (
    <div className="app-container">
      <Navbar />
      <main className="content">
        <Routes>
          {user?.role === 'admin' ? (
            // ADMIN ROUTES
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </>
          ) : (
            // DRIVER ROUTES
            <>
              <Route path="/dashboard" element={<DriverDashboard />} />
              {/* You can add /history here later */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;