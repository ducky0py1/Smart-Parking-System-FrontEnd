import { payForSpotOnBlockchain } from "../services/blockchainService";
import api from "../services/api"; // Votre instance Axios

const handleReservation = async (spot) => {
    try {
        // 1. Récupérer les infos de l'utilisateur (pour la dette)
        const userRes = await api.get('/user');
        const userDebt = parseFloat(userRes.data.debt || 0);
        const spotPrice = parseFloat(spot.price);
        const totalToPay = spotPrice + userDebt;

        if (userDebt > 0) {
            alert(`Vous avez une dette de ${userDebt} ETH suite à un dépassement. Elle sera ajoutée au paiement.`);
        }

        // 2. Lancer le paiement MetaMask
        const txHash = await payForSpotOnBlockchain(spot.id, totalToPay);

        // 3. Envoyer le hash à Laravel pour confirmer la réservation
        await api.post('/reservations', {
            spot_id: spot.id,
            transaction_hash: txHash
        });

        alert("Réservation réussie ! La place est à vous.");
        // Rafraîchir la liste des places ici
    } catch (error) {
        alert("La réservation a échoué. Vérifiez votre solde ou MetaMask.");
    }
};









// import { useAuth } from "../context/AuthContext";
// import {DriverDashboard} from "./DriverDashboard";
// // import {AdminDashboard} from "./AdminDashboard";

// import { Loader2 } from "lucide-react";


// export default function Dashboard() {
//   const { user, loading } = useAuth();

//   // 1. Si on charge encore, on affiche un loader
//   if (loading) {
//     return <div className="flex justify-center p-10"><Loader2 className="animate-spin"/></div>;
//   }

//   // 2. Si pas connecté du tout, on affiche le Driver Dashboard en mode "Visiteur"
//   // (Ou une page d'accueil marketing si vous préférez)
//   if (!user) {
//     return <DriverDashboard />;
//   }

//   // 3. Le Switch selon le rôle
//   if (user.role === 'admin') {
//     return <AdminDashoboeard/>
//   } else {
//     return <DriverDashboard />;
//   }
// }