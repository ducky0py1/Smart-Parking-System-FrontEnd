import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import DriverDashboard from './pages/driver/DriverDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProfileCompletion from './pages/shared/ProfileCompletion';
import LoadingScreen from './components/ui/LoadingScreen';

function App() {
  const { user, token, loading } = useAuth();

  // 1. GLOBAL LOADING STATE
  if (loading) {
    return <LoadingScreen />;
  }

  // 2. PUBLIC ROUTES — accessible without a wallet connection
  if (!token) {
    return (
      <Routes>
        <Route path="/"      element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="*"      element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // 3. PROFILE COMPLETION CHECK (Driver Only)
  const isProfileIncomplete = user && user.role === 'driver' && (!user.first_name || !user.email);
  if (isProfileIncomplete) {
    return <ProfileCompletion />;
  }

  // 4. ROLE-BASED ROUTING (authenticated)
  return (
    <div className="app-container">
      <Navbar />
      <main className="content">
        <Routes>
          {user?.role === 'admin' ? (
            <>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*"      element={<Navigate to="/admin" replace />} />
            </>
          ) : (
            <>
              <Route path="/dashboard" element={<DriverDashboard />} />
              <Route path="*"          element={<Navigate to="/dashboard" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

export default App;
