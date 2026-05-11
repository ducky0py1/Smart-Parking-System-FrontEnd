import { useAuth } from '../context/AuthContext';
import { useParking } from '../context/ParkingContext';
import { payForSpot } from '../services/blockchainService';
import api from '../services/api';

export function useReservation() {
  const { user } = useAuth();
  const { refreshSpots } = useParking();

  /**
   * Full reservation flow: blockchain payment → API save → refresh
   * @param {Object} spot - The parking spot object
   * @param {string} endTime - ISO datetime string
   * @returns {string} Transaction hash
   */
  async function reserve(spot, endTime) {
    const spotPrice = parseFloat(spot.price) || 0;
    const debt      = parseFloat(user?.debt) || 0;
    const total     = (spotPrice + debt).toFixed(6);

    // 1. Pay on blockchain
    const txHash = await payForSpot(spot.id, total);

    // 2. Save to backend
    await api.post('/reservations', {
      spot_id: spot.id,
      end_time: endTime,
      transaction_hash: txHash,
    });

    // 3. Refresh spots list
    await refreshSpots();

    return txHash;
  }

  return { reserve };
}
