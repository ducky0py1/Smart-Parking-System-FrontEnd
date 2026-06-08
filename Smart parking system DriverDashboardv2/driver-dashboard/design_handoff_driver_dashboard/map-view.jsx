// ============================================================
//  ParkChain Dashboard — Map view (3D stage + overlay panels)
//  Uses global Icon, ParkingMap3D, window.SP.
// ============================================================
const { useState: mvUseState, useEffect: mvUseEffect, useRef: mvUseRef } = React;

/* ---- Active reservation card with live timer --------------------------- */
function ActiveReservationCard({ resv, onEnd, onExtend }) {
  const [elapsed, setElapsed] = mvUseState(0);
  mvUseEffect(() => {
    const start = resv.startTime;
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [resv.startTime]);

  const totalSec = resv.durationMin * 60;
  const remaining = Math.max(0, totalSec - elapsed);
  const hh = Math.floor(remaining / 3600);
  const mm = String(Math.floor((remaining % 3600) / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const timeStr = hh > 0 ? hh + ":" + mm + ":" + ss : mm + ":" + ss;
  const pct = Math.min(100, (elapsed / totalSec) * 100);
  const accrued = (resv.price * Math.min(1, elapsed / totalSec)).toFixed(4);

  return (
    <div className="resv-card glass-panel">
      <div className="rc-head">
        <span className="rc-tag"><span className="blip"></span> Session active</span>
        <span className="rc-spot">Place {resv.label}</span>
      </div>
      <div className="rc-timer">{timeStr}<span className="unit"> restant</span></div>
      <div className="progress-rail"><div className="progress-fill" style={{ width: pct + "%" }}></div></div>
      <div className="rc-meta">
        <span>Coût accumulé <b>{window.SP.fmtEth(+accrued)} ETH</b></span>
        <span>Durée <b>{resv.durationMin} min</b></span>
      </div>
      <div className="rc-actions">
        <button className="btn btn-ghost btn-sm" onClick={onExtend}><Icon name="plus" size={15} /> Prolonger</button>
        <button className="btn btn-danger btn-sm" onClick={onEnd}><Icon name="x" size={15} /> Terminer</button>
      </div>
    </div>
  );
}

function MapView({ spots, theme, onSelectSpot, activeResv, onEndSession, onExtend, tweaks }) {
  const stageRef = mvUseRef(null);
  const instRef = mvUseRef(null);
  const [tip, setTip] = mvUseState({ show: false, x: 0, y: 0, spot: null });

  // mount once
  mvUseEffect(() => {
    if (!stageRef.current || !window.ParkingMap3D) return;
    const inst = window.ParkingMap3D.create(stageRef.current, {
      spots: window.SP.getSpots(),
      theme,
      onSpotClick: (spot) => onSelectSpot(spot),
      onSpotHover: (spot, x, y) => setTip({ show: true, x, y, spot }),
      onHoverEnd: () => setTip((t) => ({ ...t, show: false })),
    });
    instRef.current = inst;
    return () => { inst.destroy(); instRef.current = null; };
  }, []);

  // push spot updates
  mvUseEffect(() => { if (instRef.current) instRef.current.updateSpots(spots); }, [spots]);
  // theme
  mvUseEffect(() => { if (instRef.current) instRef.current.setTheme(theme); }, [theme]);

  const counts = spots.reduce((a, s) => { a[s.status]++; return a; }, { free: 0, reserved: 0, occupied: 0 });

  return (
    <div className="map-view">
      <div className="map-stage" ref={stageRef}></div>

      {/* hover tooltip */}
      {tip.spot && (
        <div className={"map-tip" + (tip.show ? " show" : "")} style={{ left: tip.x, top: tip.y }}>
          <div className="mt-row"><span className="dot-free"></span><b>Place {tip.spot.label}</b></div>
          <div className="mt-sub">{tip.spot.level} · <span className="mt-price">dès {window.SP.fmtEth(window.SP.TARIF.day.rate)} ETH/h</span></div>
          <div className="mt-sub" style={{ color: "var(--neon-green)" }}>Cliquez pour réserver →</div>
        </div>
      )}

      {/* overlay UI */}
      <div className="map-overlay">
        <div className="overlay-top">
          <div className="legend-card glass-panel">
            <h4>Légende</h4>
            <div className="lg-row"><span className="dot-free"></span> Libre <span className="ct">{counts.free}</span></div>
            <div className="lg-row"><span className="dot-resv"></span> Réservée <span className="ct">{counts.reserved}</span></div>
            <div className="lg-row"><span className="dot-occ"></span> Occupée <span className="ct">{counts.occupied}</span></div>
          </div>

          <div className="avail-card glass-panel">
            <div className="bars"><span></span><span></span><span></span><span></span></div>
            <div>
              <div className="av-num">{counts.free}</div>
              <div className="av-lbl">places libres en direct</div>
            </div>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <div className="map-ctrls">
              <button className="map-ctrl" title="Zoom avant" onClick={() => instRef.current && instRef.current.zoomIn()}><Icon name="plus" size={20} /></button>
              <button className="map-ctrl" title="Zoom arrière" onClick={() => instRef.current && instRef.current.zoomOut()}><Icon name="minus" size={20} /></button>
              <button className="map-ctrl" title="Recentrer" onClick={() => instRef.current && instRef.current.recenter()}><Icon name="crosshair" size={20} /></button>
            </div>
          </div>
        </div>

        <div className="overlay-bottom">
          {activeResv
            ? <ActiveReservationCard resv={activeResv} onEnd={onEndSession} onExtend={onExtend} />
            : <div className="map-hint glass-panel"><span className="pin"></span> Faites pivoter, zoomez, puis cliquez une place <b style={{ color: "var(--neon-green)" }}>libre</b> pour réserver</div>}
          <div className="map-hint glass-panel" style={{ fontSize: 12.5 }}>
            <Icon name="layers" size={15} /> Niveau 1 · {spots.length} places · maj temps réel
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MapView, ActiveReservationCard });
