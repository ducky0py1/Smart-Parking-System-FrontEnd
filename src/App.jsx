
import { Routes, Route } from 'react-router-dom'; // Import des routes
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import DriverDashboard from './pages/DriverDashboard';

function App(){
    return (
      <AuthProvider>
        <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
          {/* La Navbar sera visible sur toutes les pages */}
          <Navbar />
          
          {/* <main className="p-8 container mx-auto"> */}
           <main className="p-6 container mx-auto max-w-6xl">
          <Routes>
            {/* Route par défaut : Le Dashboard */}
            <Route path="/" element={<DriverDashboard />} />
            
            {/* Plus tard on ajoutera : */}
            {/* <Route path="/history" element={<History />} /> */}
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}export default App;