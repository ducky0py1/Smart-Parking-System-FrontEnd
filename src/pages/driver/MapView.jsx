import { useState, useEffect, useRef } from 'react';
import DashboardIcon from './DashboardIcon';
import { fmtEth, TARIF } from './utils';

// Active reservation countdown card
function ActiveReservationCard({ resv, onEnd, onExtend }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = resv.startTime;
    const tick  = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resv.startTime]);

  const totalSec   = resv.durationMin * 60;
  const remaining  = Math.max(0, totalSec - elapsed);
  const hh         = Math.floor(remaining / 3600);
  const mm         = String(Math.floor((remaining % 3600) / 60)).padStart(2, '0');
  const ss         = String(remaining % 60).padStart(2, '0');
  const timeStr    = hh > 0 ? `${hh}:${mm}:${ss}` : `${mm}:${ss}`;
  const pct        = Math.min(100, (elapsed / totalSec) * 100);
  const accrued    = (resv.price * Math.min(1, elapsed / totalSec)).toFixed(4);

  return (
    <div className="resv-card glass-panel">
      <div className="rc-head">
        <span className="rc-tag"><span className="blip" /> Session active</span>
        <span className="rc-spot">Place {resv.label}</span>
      </div>
      <div className="rc-timer">{timeStr}<span className="unit"> restant</span></div>
      <div className="progress-rail">
        <div className="progress-fill" style={{ width: pct + '%' }} />
      </div>
      <div className="rc-meta">
        <span>Coût accumulé <b>{fmtEth(+accrued)} ETH</b></span>
        <span>Durée <b>{resv.durationMin} min</b></span>
      </div>
      <div className="rc-actions">
        <button className="btn btn-ghost btn-sm" onClick={onExtend}>
          <DashboardIcon name="plus" size={15} /> Prolonger
        </button>
        <button className="btn btn-danger btn-sm" onClick={onEnd}>
          <DashboardIcon name="x" size={15} /> Terminer
        </button>
      </div>
    </div>
  );
}

export default function MapView({ spots, theme, onSelectSpot, activeResv, onEndSession, onExtend }) {
  const stageRef = useRef(null);
  const instRef  = useRef(null);
  const [tip, setTip] = useState({ show: false, x: 0, y: 0, spot: null });

  // Mount the 3D scene once
  useEffect(() => {
    if (!stageRef.current || !window.ParkingMap3D) return;

    const inst = window.ParkingMap3D.create(stageRef.current, {
      spots,
      theme,
      onSpotClick: (spot) => onSelectSpot(spot),
      onSpotHover: (spot, x, y) => setTip({ show: true, x, y, spot }),
      onHoverEnd:  () => setTip((t) => ({ ...t, show: false })),
    });
    instRef.current = inst;
    return () => { inst.destroy(); instRef.current = null; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Push live spot updates to the 3D scene whenever ParkingContext refreshes
  useEffect(() => {
    if (instRef.current) instRef.current.updateSpots(spots);
  }, [spots]);

  // Relay theme changes to the 3D renderer
  useEffect(() => {
    if (instRef.current) instRef.current.setTheme(theme);
  }, [theme]);

  const counts = spots.reduce(
    (a, s) => { a[s.status] = (a[s.status] || 0) + 1; return a; },
    { free: 0, reserved: 0, occupied: 0 }
  );

  return (
    <div className="map-view">
      {/* Three.js canvas container */}
      <div className="map-stage" ref={stageRef} />

      {/* Hover tooltip */}
      {tip.spot && (
        <div
          className={'map-tip' + (tip.show ? ' show' : '')}
          style={{ left: tip.x, top: tip.y }}
        >
          <div className="mt-row">
            <span className="dot-free" />
            <b>Place {tip.spot.label}</b>
          </div>
          <div className="mt-sub">
            {tip.spot.level} · <span className="mt-price">dès {fmtEth(TARIF.day.rate)} ETH/h</span>
          </div>
          <div className="mt-sub" style={{ color: '#7aff3c' }}>
            Cliquez pour réserver →
          </div>
        </div>
      )}

      {/* Overlay panels */}
      <div className="map-overlay">
        <div className="overlay-top">
          {/* Legend */}
          <div className="legend-card glass-panel">
            <h4>Places</h4>
            <div className="lg-row"><span className="dot-free" /> Libre    <span className="ct">{counts.free}</span></div>
            <div className="lg-row"><span className="dot-resv" /> Réservée <span className="ct">{counts.reserved}</span></div>
            <div className="lg-row"><span className="dot-occ"  /> Occupée  <span className="ct">{counts.occupied}</span></div>
          </div>

          {/* Live count */}
          {/* <div className="avail-card glass-panel">
            <div className="bars">
              <span /><span /><span /><span />
            </div>
            <div>
              <div className="av-num">{counts.free}</div>
              <div className="av-lbl">places libres en direct</div>
            </div>
          </div> */}

          {/* Zoom controls */}
          <div style={{ marginLeft: 'auto' }}>
            <div className="map-ctrls">
              <button className="map-ctrl" title="Zoom avant"  onClick={() => instRef.current?.zoomIn()}>
                <DashboardIcon name="plus" size={20} />
              </button>
              <button className="map-ctrl" title="Zoom arrière" onClick={() => instRef.current?.zoomOut()}>
                <DashboardIcon name="minus" size={20} />
              </button>
              <button className="map-ctrl" title="Recentrer"   onClick={() => instRef.current?.recenter()}>
                <DashboardIcon name="crosshair" size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="overlay-bottom">
          {activeResv
            ? (
              <ActiveReservationCard
                resv={activeResv}
                onEnd={onEndSession}
                onExtend={onExtend}
              />
            )
            : (
              <div className="map-hint glass-panel">
                <span className="pin" />
                Faites pivoter, zoomez, puis cliquez une place{' '}
                <b style={{ color: '#7aff3c' }}>libre</b> pour réserver
              </div>
            )}

          <div className="map-hint glass-panel" style={{ fontSize: 12.5 }}>
            <DashboardIcon name="layers" size={15} />
            &nbsp;Niveau 1 · {spots.length} places · maj temps réel
          </div>
        </div>
      </div>
    </div>
  );
}
