import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { token, user } = useContext(AuthContext);

  if (!token) return <Navigate to="/login" replace />;
  if (role && user && user.role !== role) return <Navigate to="/dashboard" replace />;

  return children;
}
