
import { Routes, Route } from 'react-router-dom'; // Import des routes
import { AuthProvider } from './components/context/AuthContext.jsx';
// import Navbar from './components/Navbar.jsx';
import DriverDashboard from './components/pages/DriverDashboard.jsx';
import HomePage from './components/pages/HomePage.jsx';
import LoginPage from './components/pages/LoginPage.jsx';
function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
        {/* La Navbar sera visible sur toutes les pages */}
        {/* <Navbar /> */}

        {/* <main className="p-8 container mx-auto"> */}
        <main className="p-6 container mx-auto max-w-6xl">
          <Routes>
            {/* Route par défaut : Le Dashboard */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<DriverDashboard />} />

            {/* Plus tard: */}
            {/* <Route path="/history" element={<History />} /> */}
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
} export default App;