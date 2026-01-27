import { createContext, useContext, useState, useEffect } from "react";
import { BrowserProvider } from "ethers"; // Nouvelle syntaxe ethers v6
import api from "../services/api";

const AuthContext = createContext({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  loading: false,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("ACCESS_TOKEN"));
  const [loading, setLoading] = useState(false);

  // Fonction de Connexion via MetaMask
  const login = async () => {
    setLoading(true);
    try {
      // 1. Vérifier si MetaMask est installé
      if (!window.ethereum) {
        alert("Veuillez installer MetaMask !");
        setLoading(false);
        return;
      }

      // 2. Demander la connexion à MetaMask
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      console.log("Adresse récupérée :", address);

      // 3. Envoyer l'adresse à Laravel pour obtenir le Token
      const response = await api.post('/auth/wallet', {
        wallet_address: address
      });

      // 4. Sauvegarder les infos reçues de Laravel
      const { token, user } = response.data;
      
      setToken(token);
      setUser(user);
      localStorage.setItem("ACCESS_TOKEN", token); // On garde le token en mémoire

    } catch (error) {
      console.error("Erreur connexion:", error);
      alert("Erreur lors de la connexion. Vérifiez la console.");
    } finally {
      setLoading(false);
    }
  };

  // Fonction de Déconnexion
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("ACCESS_TOKEN");
  };

  // Au chargement de la page, on vérifie si l'utilisateur est déjà connecté
  useEffect(() => {
    if (token) {
        // Optionnel : On pourrait demander à Laravel "Qui suis-je ?" ici
        // Pour l'instant on considère que si le token est là, c'est bon.
        api.get('/user')
           .then(({data}) => setUser(data))
           .catch(() => logout()); // Si le token est invalide, on déconnecte
    }
  }, []); // Se lance une seule fois au démarrage

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);