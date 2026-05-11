// useWallet.js
import { useAuth } from '../context/AuthContext';

export function useWallet() {
  const { user, token, loading, connectWallet, logout } = useAuth();
  const addr = user?.wallet_address || '';
  const shortAddress = addr
    ? `${addr.slice(0, 6)}…${addr.slice(-4)}`
    : null;

  return { walletAddress: addr, shortAddress, token, loading, connectWallet, logout, user };
}
