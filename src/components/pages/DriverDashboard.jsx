
import { useEffect, useState } from "react";
import api from "../services/api";
import ParkingSpot from "../components/ParkingSpot";
import { Loader2 } from "lucide-react";

export default function DriverDashboard() {
    const [spots, setSpots] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fonction pour charger les places
    const fetchSpots = async () => {
        try {
            const response = await api.get('/spots');
            // On trie les places par ID pour qu'elles ne bougent pas
            const sortedSpots = response.data.sort((a, b) => a.id - b.id);
            setSpots(sortedSpots);
        } catch (error) {
            console.error("Erreur chargement:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpots(); // Premier chargement immédiat

        // MISE À JOUR AUTOMATIQUE (POLLING)
        // Toutes les 3 secondes, on recharge pour voir si une voiture est arrivée
        const interval = setInterval(fetchSpots, 3000);

        // Nettoyage quand on quitte la page
        return () => clearInterval(interval);
    }, []);

    // Fonction temporaire quand on clique (on mettra le paiement ici plus tard)
    const handleSpotClick = (spot) => {
        alert(`Vous avez cliqué sur la place ${spot.label}. Paiement bientôt !`);
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
    );

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Plan du Parking</h2>

            {/* Légende */}
            <div className="flex gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div> Libre</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-orange-100 border border-orange-500 rounded"></div> Réservé</div>
                <div className="flex items-center gap-2"><div className="w-4 h-4 bg-red-100 border border-red-500 rounded"></div> Occupé</div>
            </div>

            {/* La Grille (Responsive) */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {spots.map((spot) => (
                    <ParkingSpot
                        key={spot.id}
                        spot={spot}
                        onClick={handleSpotClick}
                    />
                ))}
            </div>

            {spots.length === 0 && (
                <p className="text-center text-gray-500 mt-10">Aucune place trouvée. Avez-vous lancé les Seeds Laravel ?</p>
            )}
        </div>
    );
}