
// check lblan     const interval = setInterval(fetchData, 5000); // Polling lent
// 
import { useEffect, useState } from "react";
import api from "../services/api";
import { Users, Car, DollarSign, RefreshCw } from "lucide-react";

export default function AdminDashboard() {
  const [spots, setSpots] = useState([]);
  const [reservations, setReservations] = useState([]); // Historique global (à créer côté Laravel plus tard)
  
  const fetchData = async () => {
    try {
      const spotsRes = await api.get('/spots');
      setSpots(spotsRes.data);
    } catch (error) {
      console.error("Erreur Admin:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Polling lent
    return () => clearInterval(interval);
  }, []);

  // Calculs simples pour les stats
  const totalIncome = 0.052; // Exemple statique, on le dynamisera plus tard
  const occupiedCount = spots.filter(s => s.status === 'occupied').length;
  const reservedCount = spots.filter(s => s.status === 'reserved').length;

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-800">Dashboard de Gestion</h2>

      {/* Cartes de Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600"><Car size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Taux d'Occupation</p>
            <p className="text-2xl font-bold">{occupiedCount + reservedCount} / {spots.length}</p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600"><DollarSign size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Revenus Totaux (ETH)</p>
            <p className="text-2xl font-bold">{totalIncome} ETH</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-purple-100 p-3 rounded-full text-purple-600"><Users size={24} /></div>
          <div>
            <p className="text-sm text-gray-500">Utilisateurs Actifs</p>
            <p className="text-2xl font-bold">12</p> {/* Statique pour l'instant */}
          </div>
        </div>
      </div>

      {/* Liste des Places (Vue Technique) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700">État du Parc en Temps Réel</h3>
          <button onClick={fetchData} className="text-sm flex items-center gap-1 text-blue-600 hover:underline">
            <RefreshCw size={16} /> Actualiser
          </button>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-sm">
            <tr>
              <th className="p-4">Place</th>
              <th>Status</th>
              <th>Capteur ID</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {spots.map(spot => (
              <tr key={spot.id} className="hover:bg-gray-50">
                <td className="p-4 font-mono font-bold">{spot.label}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                    ${spot.status === 'free' ? 'bg-green-100 text-green-700' : ''}
                    ${spot.status === 'occupied' ? 'bg-red-100 text-red-700' : ''}
                    ${spot.status === 'reserved' ? 'bg-orange-100 text-orange-700' : ''}
                  `}>
                    {spot.status}
                  </span>
                </td>
                <td className="text-gray-400 text-sm">{spot.sensor_id || "N/A"}</td>
                <td>
                   <button className="text-red-500 hover:text-red-700 text-sm font-medium">
                     Forcer Libération
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}