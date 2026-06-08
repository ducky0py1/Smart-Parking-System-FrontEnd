import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import api from '../services/api';
import { toast } from '../components/ui/Toast';

export const AuthContext = createContext({
  user: null,
  token: null,
  loading: false,
  connectWallet: async () => {},
  logout: () => {},
  updateProfile: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('sanctum_token'));
  const [loading, setLoading] = useState(false);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('sanctum_token');
  }, []);

  // Rehydrate session on mount
  useEffect(() => {
    if (!token) return;
    api.get('/user')
      .then(({ data }) => setUser(data))
      .catch(() => logout());
  }, []); // eslint-disable-line

  // Listen for MetaMask account/chain changes
  useEffect(() => {
    if (!window.ethereum) return;
    const handleChange = () => logout();
    window.ethereum.on('accountsChanged', handleChange);
    window.ethereum.on('chainChanged', handleChange);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleChange);
      window.ethereum.removeListener('chainChanged', handleChange);
    };
  }, [logout]);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      toast('Veuillez installer MetaMask pour continuer.', 'error');
      return;
    }
    setLoading(true);
    try {
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();

      const { data } = await api.post('/auth/wallet', { wallet_address: address });
      const { token: newToken, user: newUser } = data;

      localStorage.setItem('sanctum_token', newToken);
      setToken(newToken);
      setUser(newUser);
      toast('Portefeuille connecté avec succès !', 'success');
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Erreur de connexion';
      toast(msg, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (data) => {
    try {
      // Backend: POST /user/update → { message, user }
      const { data: resp } = await api.post('/user/update', data);
      const updated = resp?.user ?? resp;
      setUser(updated);
      return updated;
    } catch (err) {
      const msg = err?.response?.data?.message || 'Erreur lors de la mise à jour';
      toast(msg, 'error');
      throw err;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, connectWallet, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
