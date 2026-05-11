import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Home            from '../pages/Home';
import Login           from '../pages/Login';
import DriverDashboard from '../pages/DriverDashboard';
import AdminDashboard  from '../pages/AdminDashboard';
import Profile         from '../pages/Profile';

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/"         element={<Home />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/dashboard" element={
        <ProtectedRoute role="driver">
          <DriverDashboard />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute role="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
    </Routes>
  );
}
