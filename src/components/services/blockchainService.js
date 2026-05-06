import { ethers } from "ethers";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../contractConfig";

/**
 * Initialise le contrat pour interaction
 */
const getContract = async () => {
    if (!window.ethereum) throw new Error("MetaMask n'est pas installé");

    // Connexion au fournisseur (MetaMask/Ganache)
    const provider = new ethers.BrowserProvider(window.ethereum);
    // Récupération du signataire (l'utilisateur connecté)
    const signer = await provider.getSigner();
    
    // Création de l'instance du contrat
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

/**
 * Appelle la fonction payForSpot du Smart Contract
 */
export const payForSpotOnBlockchain = async (spotId, totalAmountInEth) => {
    try {
        const contract = await getContract();

        // Convertit le montant (Place + Dette éventuelle) en Wei
        const amountInWei = ethers.parseEther(totalAmountInEth.toString());

        // Envoi de la transaction
        const tx = await contract.payForSpot(spotId, { value: amountInWei });
        
        console.log("Transaction envoyée, attente de confirmation...", tx.hash);

        // Attente de la validation sur Ganache
        const receipt = await tx.wait();
        console.log("Transaction confirmée !");

        return receipt.hash; // On retourne le hash pour Laravel
    } catch (error) {
        console.error("Erreur Blockchain:", error);
        throw error;
    }
};