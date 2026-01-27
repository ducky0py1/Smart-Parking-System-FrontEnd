import { Car, Lock, CircleDollarSign} from "lucide-react";

export default function ParkingSpot({ spot, onClick}){
    //defining style depends on status
    const getStyle =()=>{
        switch(spot.status){
            case 'free':
                return "bg-green-100 border-green-500 text-green-700 hover:bg-green-200 cursor-pointer hover:scale-105";
            case 'occupied':
                return "bg-red-100 border-red-500 text-red-700 opacity-80 cursor-not-allowed";
            case 'reserved':
                return "bg-orange-100 border-orange-500 text-orange-700 opacity-90 cursor-not-allowed";
        default:
            return "bg-gray-200";
        }
    };

    return (
        <div 
        onClick={()=> spot.status === 'free' && onClick(spot)}
        className="{`
        ${getStyle()}
        border-2 rounded-xl p-4 flex flex-col items-center justify-center h-32 transition-all duration-200 shadow-sm relative
        `}"
        >
            {/* Label (A-01) */}
            <span className="font-bold text-lg mb-2">{spot.label}</span>

            {/* Icône changeante */}
            {spot.status === 'free' && <CircleDollarSign size={32} />}
            {spot.status === 'occupied' && <Car size={32} />}
            {spot.status === 'reserved' && <Lock size={32} />}

            {/* Texte du statut */}
            <span className="text-xs uppercase font-semibold mt-2 tracking-wide">
                {spot.status === 'free' ? 'Libre' : spot.status}
            </span>
            
            {/* Prix (affiché seulement si libre) */}
            {spot.status === 'free' && (
                <span className="absolute top-2 right-2 text-xs font-mono bg-white px-1 rounded border border-green-200">
                {Number(spot.price).toFixed(4)} ETH
                </span>
            )}
        </div>
    );

}