import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { startPolling, stopPolling } from '../services/socketService';
import { useAuth } from './AuthContext';
import { toast } from '../components/ui/Toast';

export const ParkingContext = createContext({
  spots: [],
  selectedSpot: null,
  isLoading: false,
  selectSpot: () => {},
  refreshSpots: async () => {},
});

export function ParkingProvider({ children }) {
  const { token } = useAuth();
  const [spots, setSpots]               = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isLoading, setIsLoading]       = useState(false);

  const refreshSpots = useCallback(async () => {
    try {
      const { data } = await api.get('/parking-spots');
      setSpots(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      // Silent fail on poll — don't spam toasts
      console.error('Erreur actualisation places:', err);
    }
  }, []);

  // Start polling only when authenticated
  useEffect(() => {
    if (!token) {
      setSpots([]);
      setSelectedSpot(null);
      return;
    }
    setIsLoading(true);
    refreshSpots().finally(() => setIsLoading(false));
    startPolling(refreshSpots, 3000);
    return () => stopPolling();
  }, [token, refreshSpots]);

  const selectSpot = useCallback((idOrNull) => {
    if (idOrNull === null) { setSelectedSpot(null); return; }
    const found = spots.find(s => s.id === idOrNull || s.label === idOrNull);
    setSelectedSpot(found ?? null);
  }, [spots]);

  return (
    <ParkingContext.Provider value={{ spots, selectedSpot, isLoading, selectSpot, refreshSpots }}>
      {children}
    </ParkingContext.Provider>
  );
}

export const useParking = () => useContext(ParkingContext);
