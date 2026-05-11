import { useRef, useEffect, useState } from 'react';
import Spinner from '../ui/Spinner';
import { useModelSync } from './useModelSync';

export default function ParkingScene({ spots, onSpotClick }) {
  const iframeRef = useRef(null);
  const [ready, setReady] = useState(false);

  // Push spot updates into the iframe on every poll
  useModelSync(iframeRef, spots);

  // Listen for messages from the 3D model
  useEffect(() => {
    function handleMessage(e) {
      if (e.data?.type === 'MODEL_READY') {
        setReady(true);
      }
      if (e.data?.type === 'SPOT_CLICKED') {
        onSpotClick(e.data.label);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSpotClick]);

  return (
    <div className="relative w-full" style={{ height: '60vh', minHeight: 400 }}>
      {/* Loading overlay */}
      {!ready && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--bg)] gap-4">
          <Spinner size="lg" />
          <p className="font-mono text-xs text-[var(--muted)] tracking-widest">
            CHARGEMENT DU MODÈLE 3D…
          </p>
        </div>
      )}

      <iframe
        ref={iframeRef}
        src="/three/parking_model.html"
        title="Vue parking 3D"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          opacity: ready ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
