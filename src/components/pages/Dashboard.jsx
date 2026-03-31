import { useAuth } from "../context/AuthContext";
import {DriverDashboard} from "./DriverDashboard";
import {AdminDashboard} from "./AdminDashboard";
import { Loader2 } from "lucide-react";


export default function Dashboard() {
  const { user, loading } = useAuth();

  // 1. Si on charge encore, on affiche un loader
  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin"/></div>;
  }

  // 2. Si pas connecté du tout, on affiche le Driver Dashboard en mode "Visiteur"
  // (Ou une page d'accueil marketing si vous préférez)
  if (!user) {
    return <DriverDashboard />;
  }

  // 3. Le Switch selon le rôle
  if (user.role === 'admin') {
    return <AdminDashoboeard/>
  } else {
    return <DriverDashboard />;
  }
}