import { useAuth } from '../context/AuthContext';
import { payDebt as payDebtOnChain } from '../services/blockchainService';
import api from '../services/api';
import { toast } from '../components/ui/Toast';

export function useDebt() {
  const { user, updateProfile } = useAuth();
  const debt = parseFloat(user?.debt) || 0;

  async function payDebt() {
    if (debt <= 0) return;
    const txHash = await payDebtOnChain(debt.toFixed(6));
    // Notify backend — refresh user profile
    await api.post('/payments/debt', { transaction_hash: txHash });
    await updateProfile({});  // triggers GET /auth/me refresh
    toast('Dette remboursée avec succès !', 'success');
    return txHash;
  }

  return { debt, payDebt };
}
