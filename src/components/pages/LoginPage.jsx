import { useAuth } from "../context/AuthContext";
import { Wallet, LogOut, Car } from "lucide-react";

export default function Navbar() {
  const { user, login, logout, loading } = useAuth();

  return (
    <nav className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo à gauche */}
        <div className="flex items-center gap-2 text-xl font-bold text-blue-600">
          <Car size={28} />
          <span>SmartPark</span>
        </div>

        {/* Bouton de Connexion à droite */}
        <div>
          {user ? (
            // SI CONNECTÉ : Affiche l'adresse + Bouton Logout
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-700">
                 {/* On coupe l'adresse pour faire joli (0x123...456) */}
                 {user.wallet_address.substring(0, 6)}...{user.wallet_address.substring(38)}
              </span>
              <button 
                onClick={logout}
                className="flex items-center gap-2 text-red-500 hover:text-red-700 transition"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            // SINON : Bouton "Connecter Wallet"
            <button
              onClick={login}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Wallet size={20} />
              {loading ? "Connexion..." : "Connecter Wallet"}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}