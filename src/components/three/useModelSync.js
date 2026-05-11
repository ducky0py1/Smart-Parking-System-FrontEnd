import { useEffect } from 'react';

/**
 * Pushes spot status updates into the 3D parking model iframe via postMessage.
 * Called every time spots[] changes (driven by the polling cycle).
 */
export function useModelSync(iframeRef, spots) {
  useEffect(() => {
    if (!spots?.length) return;
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'UPDATE_SPOTS', spots },
      '*'
    );
  }, [spots, iframeRef]);
}
