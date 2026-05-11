import { useParking } from '../context/ParkingContext';

export function useSpots() {
  return useParking();
}
