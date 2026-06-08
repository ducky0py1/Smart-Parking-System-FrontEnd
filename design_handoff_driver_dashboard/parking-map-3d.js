// ============================================================
//  ParkChain — Interactive 3D Parking Map  (eco-realistic edition)
//  Adapted from the uploaded "ParkSmart 3D" scene; wired to live
//  ParkChain data + the ParkChain neon status palette.
//  Three.js r128 + THREE.OrbitControls (damped → smooth zoom).
//
//  window.ParkingMap3D.create(container, opts) -> instance
//   opts: { spots, theme, onSpotClick, onSpotHover, onHoverEnd }
//   instance: updateSpots, setTheme, zoomIn, zoomOut, recenter,
//             focusSpot, resize, destroy
//
//  Spot status → colour (ParkChain):
//    free → orange  ·  reserved → purple  ·  occupied → pink
//  NOTE FOR CLAUDE CODE: feed useParking().spots into updateSpots().
// ============================================================
(function () {
  // ParkChain neon status palette (CSS for labels/legend parity)
  const STATUS_CSS = { free: "#ff9a3c", reserved: "#a85cff", occupied: "#ff4f9a" };
  // deeper, more saturated tones for the 3D pads (survive ACES tone-mapping
  // without clipping to cream the way bright warm colours do)
  const STATUS_HEX = { free: 0xe86a0c, reserved: 0x7d2fe0, occupied: 0xe01f6e };

  // ─── Lot geometry (matches the uploaded layout) ───────
  const SPOT_W = 2.5, SPOT_D = 5.0, LANE_W = 5.5;
  const SPOTS_PER_ROW = 8, GAP = 0.15;
  const ROW_W = SPOTS_PER_ROW * (SPOT_W + GAP);
  const START_X = -ROW_W / 2 + SPOT_W / 2;
  const ROW_Z = [LANE_W / 2 + SPOT_D / 2, -LANE_W / 2 - SPOT_D / 2]; // A, B

  function create(container, opts = {}) {
    const onSpotClick = opts.onSpotClick || function () {};
    const onSpotHover = opts.onSpotHover || function () {};
    const onHoverEnd = opts.onHoverEnd || function () {};
    let theme = opts.theme || "dark";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ─── Renderer ───────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0d1f0e);
    scene.fog = new THREE.FogExp2(0x0d1f0e, 0.014);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.92;
    container.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 300);
    const HOME_POS = new THREE.Vector3(0, 26, 31);
    camera.position.copy(HOME_POS);

    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.zoomSpeed = 0.85;
    controls.rotateSpeed = 0.75;
    controls.minDistance = 10;
    controls.maxDistance = 60;
    controls.maxPolarAngle = Math.PI / 2.12;
    controls.target.set(0, 0, 0);
    controls.update();

    // ─── Lighting ───────────────────────────────────────
    const ambient = new THREE.AmbientLight(0xd0f0d0, 0.55);
    const hemi = new THREE.HemisphereLight(0x88ccff, 0x226622, 0.5);
    scene.add(ambient, hemi);

    const sun = new THREE.DirectionalLight(0xfff5cc, 1.35);
    sun.position.set(-18, 30, 14); sun.castShadow = true;
    sun.shadow.mapSize.width = sun.shadow.mapSize.height = 2048;
    Object.assign(sun.shadow.camera, { near: 0.5, far: 110, left: -32, right: 32, top: 26, bottom: -26 });
    sun.shadow.bias = -0.0004;
    scene.add(sun);

    const rim = new THREE.DirectionalLight(0x4488ff, 0.18);
    rim.position.set(16, 10, -12); scene.add(rim);

    const lampLights = []; // dimmed in day theme

    // ─── Procedural textures ────────────────────────────
    function grassTex() {
      const c = document.createElement("canvas"); c.width = c.height = 512;
      const x = c.getContext("2d");
      x.fillStyle = "#2a5c2a"; x.fillRect(0, 0, 512, 512);
      const shades = ["#1e5020", "#2e7030", "#3a8838", "#224e22", "#48944a", "#1a4418", "#5aaa5a"];
      for (let i = 0; i < 9000; i++) {
        x.strokeStyle = shades[i % shades.length]; x.lineWidth = Math.random() * 1.8 + 0.4;
        const px = Math.random() * 512, py = Math.random() * 512;
        x.beginPath(); x.moveTo(px, py); x.lineTo(px + (Math.random() - 0.5) * 7, py - Math.random() * 14); x.stroke();
      }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(7, 7); return t;
    }
    function asphaltTex(tint = "#1c2030") {
      const c = document.createElement("canvas"); c.width = c.height = 512;
      const x = c.getContext("2d");
      x.fillStyle = tint; x.fillRect(0, 0, 512, 512);
      for (let i = 0; i < 14000; i++) {
        const g = Math.floor(Math.random() * 38 + 18); x.fillStyle = `rgb(${g},${g},${g + 4})`;
        x.beginPath(); x.arc(Math.random() * 512, Math.random() * 512, Math.random() * 1.8 + 0.3, 0, Math.PI * 2); x.fill();
      }
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return t;
    }
    function roadTex() {
      const c = document.createElement("canvas"); c.width = 512; c.height = 1024;
      const x = c.getContext("2d");
      x.fillStyle = "#14182a"; x.fillRect(0, 0, 512, 1024);
      for (let i = 0; i < 10000; i++) {
        const g = Math.floor(Math.random() * 28 + 12); x.fillStyle = `rgb(${g},${g},${g})`;
        x.beginPath(); x.arc(Math.random() * 512, Math.random() * 1024, Math.random() * 1.5 + 0.3, 0, Math.PI * 2); x.fill();
      }
      x.setLineDash([55, 35]); x.strokeStyle = "rgba(255,210,50,.7)"; x.lineWidth = 5;
      x.beginPath(); x.moveTo(256, 0); x.lineTo(256, 1024); x.stroke();
      x.setLineDash([]); x.strokeStyle = "rgba(255,255,255,.5)"; x.lineWidth = 2.5;
      x.beginPath(); x.moveTo(30, 0); x.lineTo(30, 1024); x.stroke();
      x.beginPath(); x.moveTo(482, 0); x.lineTo(482, 1024); x.stroke();
      const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1, 2.5); return t;
    }
    const GT = grassTex(), AT = asphaltTex(), RT = roadTex();

    // ─── Ground layers ──────────────────────────────────
    const grass = new THREE.Mesh(new THREE.PlaneGeometry(90, 90),
      new THREE.MeshStandardMaterial({ map: GT, color: 0x3a7a3a, roughness: 0.96 }));
    grass.rotation.x = -Math.PI / 2; grass.receiveShadow = true; scene.add(grass);

    const lot = new THREE.Mesh(new THREE.PlaneGeometry(40, 32),
      new THREE.MeshStandardMaterial({ map: AT, color: 0x20263a, roughness: 0.9, metalness: 0.03 }));
    lot.rotation.x = -Math.PI / 2; lot.position.y = 0.01; lot.receiveShadow = true; scene.add(lot);

    const lane = new THREE.Mesh(new THREE.PlaneGeometry(ROW_W + 0.4, LANE_W),
      new THREE.MeshStandardMaterial({ map: RT, color: 0x18202e, roughness: 0.86, metalness: 0.05 }));
    lane.rotation.x = -Math.PI / 2; lane.position.y = 0.018; lane.receiveShadow = true; scene.add(lane);

    // ─── Curbs & grass strips ───────────────────────────
    const CURB = new THREE.MeshStandardMaterial({ color: 0x7a8a98, roughness: 0.85, metalness: 0.12 });
    function curb(x, z, w, d, h = 0.15) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), CURB);
      m.position.set(x, h / 2, z); m.castShadow = true; m.receiveShadow = true; scene.add(m);
    }
    curb(0, 15.5, 42, 0.65); curb(0, -15.5, 42, 0.65);
    curb(19.8, 0, 0.65, 30); curb(-19.8, 0, 0.65, 30);
    curb(0, LANE_W / 2 + 0.1, ROW_W + 0.6, 0.18, 0.09);
    curb(0, -LANE_W / 2 - 0.1, ROW_W + 0.6, 0.18, 0.09);
    function grassStrip(x, z, w, d) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, d),
        new THREE.MeshStandardMaterial({ map: GT, color: 0x3a8a3a, roughness: 0.95 }));
      m.position.set(x, 0.07, z); m.receiveShadow = true; scene.add(m);
    }
    grassStrip(0, 12, 42, 5.5); grassStrip(0, -12, 42, 5.5);
    grassStrip(17.5, 0, 3.5, 24); grassStrip(-17.5, 0, 3.5, 24);

    // ─── Spot helpers ───────────────────────────────────
    function meshAt(parent, geo, mat, x, y, z, shadow) {
      const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
      if (shadow) { m.castShadow = true; m.receiveShadow = true; }
      parent.add(m); return m;
    }
    function spotColor(s) { return s.selected ? 0xffc21f : STATUS_HEX[s.status]; }
    function emissiveFor(s) {
      if (s.selected) return 0.55;
      if (s.hover) return 0.62;
      return s.status === "occupied" ? 0.22 : s.status === "reserved" ? 0.32 : 0.4;
    }
    function makeSpotMesh(s) {
      const col = spotColor(s);
      const m = new THREE.Mesh(new THREE.BoxGeometry(SPOT_W - 0.12, 0.065, SPOT_D - 0.12),
        new THREE.MeshStandardMaterial({ color: col, roughness: 0.6, metalness: 0.15, emissive: new THREE.Color(col), emissiveIntensity: emissiveFor(s), transparent: true, opacity: 0.93 }));
      m.receiveShadow = true; return m;
    }
    function makeLines(x, z) {
      const g = new THREE.Group();
      const M = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, emissive: 0xffffff, emissiveIntensity: 0.06 });
      const th = 0.07, h = 0.045;
      [[-SPOT_W / 2, SPOT_D], [SPOT_W / 2, SPOT_D]].forEach(([lx, ld]) => meshAt(g, new THREE.BoxGeometry(th, h, ld), M, lx, h / 2, 0));
      [-SPOT_D / 2, SPOT_D / 2].forEach((lz) => meshAt(g, new THREE.BoxGeometry(SPOT_W, h, th), M, 0, h / 2, lz));
      g.position.set(x, 0.02, z); return g;
    }
    function refreshSpot(s) {
      const col = spotColor(s);
      s.mesh.material.color.setHex(col);
      s.mesh.material.emissive.setHex(col);
      s.mesh.material.emissiveIntensity = emissiveFor(s);
    }

    // ─── Cars ───────────────────────────────────────────
    const PALETTES = [
      { body: 0x1a3a6e, roof: 0x112854, glass: 0x7ab8d4, rim: 0xaaaacc },
      { body: 0x7a1a1a, roof: 0x5a0e0e, glass: 0x8abecc, rim: 0xccaaaa },
      { body: 0x1a5a2a, roof: 0x114020, glass: 0x7ad4aa, rim: 0xaaccaa },
      { body: 0x4a3820, roof: 0x362a16, glass: 0x9abccc, rim: 0xbbaa88 },
      { body: 0x2a1a5a, roof: 0x1a0e42, glass: 0x88aadd, rim: 0xaaaadd },
      { body: 0x555558, roof: 0x3a3a3c, glass: 0x9ab8cc, rim: 0xbbbbbb },
      { body: 0x3a1a00, roof: 0x2a1200, glass: 0x9ab0b8, rim: 0xcc9966 },
      { body: 0x001a3a, roof: 0x001028, glass: 0x88ccee, rim: 0x88aabb },
    ];
    let cpi = 0;
    function makeCar(pal) {
      pal = pal || PALETTES[cpi++ % PALETTES.length];
      const g = new THREE.Group();
      const BM = new THREE.MeshStandardMaterial({ color: pal.body, roughness: 0.28, metalness: 0.8 });
      const RM = new THREE.MeshStandardMaterial({ color: pal.roof, roughness: 0.32, metalness: 0.75 });
      const GM = new THREE.MeshStandardMaterial({ color: pal.glass, roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.52, emissive: pal.glass, emissiveIntensity: 0.06 });
      const TM = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.95 });
      const WM = new THREE.MeshStandardMaterial({ color: pal.rim, roughness: 0.2, metalness: 0.92 });
      const LM = new THREE.MeshStandardMaterial({ color: 0xffeeaa, roughness: 0.05, emissive: 0xffeeaa, emissiveIntensity: 0.8, transparent: true, opacity: 0.95 });
      const RL = new THREE.MeshStandardMaterial({ color: 0xff2222, roughness: 0.05, emissive: 0xff1111, emissiveIntensity: 0.7, transparent: true, opacity: 0.9 });
      const GR = new THREE.MeshStandardMaterial({ color: 0x1a1a22, roughness: 0.45, metalness: 0.8 });
      const UN = new THREE.MeshStandardMaterial({ color: 0x0e0e14, roughness: 0.9 });
      meshAt(g, new THREE.BoxGeometry(1.36, 0.1, 2.62), UN, 0, 0.1, 0);
      meshAt(g, new THREE.BoxGeometry(1.42, 0.36, 2.72), BM, 0, 0.3, 0, true);
      [-0.73, 0.73].forEach((sx) => meshAt(g, new THREE.BoxGeometry(0.065, 0.12, 2.6), BM, sx, 0.16, 0));
      meshAt(g, new THREE.BoxGeometry(1.4, 0.2, 2.7), BM, 0, 0.5, 0, true);
      meshAt(g, new THREE.BoxGeometry(1.14, 0.34, 1.35), RM, 0, 0.76, -0.06, true);
      meshAt(g, new THREE.BoxGeometry(1.08, 0.07, 1.26), RM, 0, 0.95, -0.06);
      const wf = meshAt(g, new THREE.BoxGeometry(1.06, 0.3, 0.06), GM, 0, 0.78, 0.6); wf.rotation.x = -0.38;
      const wr = meshAt(g, new THREE.BoxGeometry(1.02, 0.28, 0.06), GM, 0, 0.76, -0.73); wr.rotation.x = 0.33;
      [-0.58, 0.58].forEach((sx) => meshAt(g, new THREE.BoxGeometry(0.04, 0.22, 1.12), GM, sx, 0.76, -0.06));
      meshAt(g, new THREE.BoxGeometry(0.42, 0.045, 0.95), BM, 0, 0.62, 0.9);
      meshAt(g, new THREE.BoxGeometry(1.38, 0.24, 0.12), GR, 0, 0.22, 1.41);
      meshAt(g, new THREE.BoxGeometry(0.82, 0.15, 0.06), GR, 0, 0.33, 1.43);
      meshAt(g, new THREE.BoxGeometry(1.38, 0.24, 0.12), BM, 0, 0.22, -1.41);
      [-0.52, 0.52].forEach((sx) => { meshAt(g, new THREE.BoxGeometry(0.26, 0.12, 0.06), LM, sx, 0.4, 1.38); meshAt(g, new THREE.BoxGeometry(0.24, 0.035, 0.04), LM, sx, 0.36, 1.4); });
      [-0.54, 0.54].forEach((sx) => meshAt(g, new THREE.BoxGeometry(0.26, 0.12, 0.05), RL, sx, 0.4, -1.37));
      [-0.72, 0.72].forEach((sx) => meshAt(g, new THREE.BoxGeometry(0.04, 0.06, 0.22), WM, sx, 0.55, -0.1));
      const WG = new THREE.CylinderGeometry(0.27, 0.27, 0.21, 18);
      const RG = new THREE.CylinderGeometry(0.17, 0.17, 0.23, 12);
      [[-0.72, 0.88], [-0.72, -0.88], [0.72, 0.88], [0.72, -0.88]].forEach(([wx, wz]) => {
        const w = new THREE.Mesh(WG, TM); w.rotation.z = Math.PI / 2; w.position.set(wx, 0.27, wz); w.castShadow = true; g.add(w);
        const r = new THREE.Mesh(RG, WM); r.rotation.z = Math.PI / 2; r.position.set(wx + (wx > 0 ? 0.025 : -0.025), 0.27, wz); g.add(r);
      });
      meshAt(g, new THREE.CylinderGeometry(0.04, 0.05, 0.15, 8), WM, 0.42, 0.17, -1.47).rotation.x = Math.PI / 2;
      meshAt(g, new THREE.CylinderGeometry(0.01, 0.01, 0.32, 6), WM, -0.32, 0.99, -0.28);
      g.scale.set(0.87, 0.87, 0.87); return g;
    }

    // ─── Sprite labels ──────────────────────────────────
    function labelCanvas(txt, col) {
      const c = document.createElement("canvas"); c.width = 160; c.height = 64;
      const x = c.getContext("2d");
      if (x.roundRect) { x.fillStyle = "rgba(4,12,8,.72)"; x.beginPath(); x.roundRect(4, 8, 152, 48, 10); x.fill(); x.strokeStyle = col; x.lineWidth = 1.5; x.beginPath(); x.roundRect(4, 8, 152, 48, 10); x.stroke(); }
      else { x.fillStyle = "rgba(4,12,8,.72)"; x.fillRect(4, 8, 152, 48); x.strokeStyle = col; x.lineWidth = 1.5; x.strokeRect(4, 8, 152, 48); }
      x.fillStyle = col; x.font = "bold 28px 'Space Grotesk', 'Courier New', monospace"; x.textAlign = "center"; x.textBaseline = "middle";
      x.fillText(txt, 80, 34);
      return new THREE.CanvasTexture(c);
    }
    function makeLabel(txt, col) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: labelCanvas(txt, col), transparent: true, depthTest: false }));
      s.scale.set(1.4, 0.56, 1); return s;
    }

    // ─── Lane arrows + crosswalk ────────────────────────
    function makeArrow(x, z) {
      const AM = new THREE.MeshStandardMaterial({ color: 0xffdd55, roughness: 0.8, emissive: 0xffdd55, emissiveIntensity: 0.18 });
      const g = new THREE.Group();
      const sh = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.03, 1.1), AM); sh.position.z = -0.15; g.add(sh);
      const hd = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 3), AM); hd.rotation.x = Math.PI / 2; hd.position.z = 0.5; g.add(hd);
      g.position.set(x, 0.025, z); return g;
    }
    for (let i = -3; i <= 3; i += 2) scene.add(makeArrow(i * 1.6, 0));
    const CWM = new THREE.MeshStandardMaterial({ color: 0xfafafa, roughness: 0.75, emissive: 0xffffff, emissiveIntensity: 0.04 });
    [-5.8, -4.9, -4, -3.1, -2.2, 2.2, 3.1, 4, 4.9, 5.8].forEach((cx) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, LANE_W), CWM); m.position.set(cx, 0.025, 0); scene.add(m);
    });

    // ─── Build spots from data ──────────────────────────
    const spotById = new Map();
    const spotMeshes = [];
    function rowIdx(label) { return Math.max(0, label.charCodeAt(0) - 65); }
    function colIdx(label) { return (parseInt(label.slice(1), 10) || 1) - 1; }
    function spotPos(label) {
      const r = Math.min(rowIdx(label), ROW_Z.length - 1);
      const c = colIdx(label);
      return { x: START_X + c * (SPOT_W + GAP), z: ROW_Z[r], r };
    }
    function addCar(s) {
      const car = makeCar();
      car.position.set(s.x, 0.04, s.z);
      car.rotation.y = (s.r === 1 ? Math.PI : 0) + (Math.random() - 0.5) * 0.1;
      scene.add(car); s.car = car;
    }
    function buildSpot(d) {
      const p = spotPos(d.label);
      const s = { id: d.id, label: d.label, status: d.status, level: d.level || "Niveau 1", x: p.x, z: p.z, r: p.r, selected: false, hover: false, mesh: null, car: null, label3d: null };
      s.mesh = makeSpotMesh(s); s.mesh.position.set(p.x, 0.03, p.z); s.mesh.userData.id = d.id;
      scene.add(s.mesh); spotMeshes.push(s.mesh);
      scene.add(makeLines(p.x, p.z));
      if (d.status !== "free") addCar(s);
      s.label3d = makeLabel(d.label, STATUS_CSS[d.status]); s.label3d.position.set(p.x, 1.55, p.z); scene.add(s.label3d);
      spotById.set(d.id, s);
    }
    (opts.spots || []).forEach(buildSpot);

    // ─── Trees / bushes / flowers / lamps / booth ───────
    function makeTree(x, z, sc = 1, variety = 0) {
      const g = new THREE.Group();
      const TRM = new THREE.MeshStandardMaterial({ color: 0x4a2e10, roughness: 0.9 });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12 * sc, 0.19 * sc, 1.3 * sc, 8), TRM);
      trunk.position.y = 0.65 * sc; trunk.castShadow = true; g.add(trunk);
      if (variety === 0) {
        const leafCols = [0x2a7a2a, 0x389a38, 0x24682a, 0x48aa48, 0x1e6020];
        const LM = new THREE.MeshStandardMaterial({ color: leafCols[(Math.random() * leafCols.length) | 0], roughness: 0.92 });
        [[0, 1.6 * sc, 0, 1.0 * sc], [0.32 * sc, 1.25 * sc, 0.22 * sc, 0.72 * sc], [-0.28 * sc, 1.18 * sc, -0.18 * sc, 0.68 * sc], [0.05 * sc, 2.1 * sc, -0.05 * sc, 0.6 * sc]].forEach(([bx, by, bz, br]) => {
          const b = new THREE.Mesh(new THREE.SphereGeometry(br, 9, 9), LM); b.position.set(bx, by, bz); b.castShadow = true; g.add(b);
        });
      } else {
        const PM = new THREE.MeshStandardMaterial({ color: 0x1a5a18, roughness: 0.9 });
        [[1.5 * sc, 0.8 * sc, 1.0 * sc], [2.2 * sc, 0.58 * sc, 0.9 * sc], [2.85 * sc, 0.35 * sc, 0.75 * sc]].forEach(([cy, cr, ch]) => {
          const c = new THREE.Mesh(new THREE.ConeGeometry(cr, ch, 10), PM); c.position.y = cy; c.castShadow = true; g.add(c);
        });
      }
      g.position.set(x, 0, z); g.rotation.y = Math.random() * Math.PI * 2; scene.add(g);
    }
    for (let i = 0; i < 8; i++) {
      makeTree(-14.5 + i * 4.2, 13, 0.65 + Math.random() * 0.4, i % 2);
      makeTree(-14.5 + i * 4.2, -13, 0.65 + Math.random() * 0.4, (i + 1) % 2);
    }
    [[-17, 13], [17, 13], [-17, -13], [17, -13]].forEach(([x, z]) => makeTree(x, z, 1 + Math.random() * 0.3, 0));

    function makeBush(x, z, sc = 1) {
      const g = new THREE.Group();
      const BM = new THREE.MeshStandardMaterial({ color: 0x2a6a1a, roughness: 0.95 });
      [[0, 0.24 * sc, 0, 0.32 * sc], [0.2 * sc, 0.2 * sc, 0.12 * sc, 0.24 * sc], [-0.17 * sc, 0.18 * sc, -0.13 * sc, 0.22 * sc]].forEach(([bx, by, bz, br]) => {
        const b = new THREE.Mesh(new THREE.SphereGeometry(br, 8, 8), BM); b.position.set(bx, by, bz); b.castShadow = true; g.add(b);
      });
      g.position.set(x, 0, z); scene.add(g);
    }
    for (let i = 0; i < SPOTS_PER_ROW; i++) {
      const xp = START_X + i * (SPOT_W + GAP);
      makeBush(xp, ROW_Z[0] + SPOT_D / 2 + 0.5, 0.9 + Math.random() * 0.3);
      makeBush(xp, ROW_Z[1] - SPOT_D / 2 - 0.5, 0.9 + Math.random() * 0.3);
    }

    function makeFlowers(x, z) {
      const g = new THREE.Group();
      const SM2 = new THREE.MeshStandardMaterial({ color: 0x387a18, roughness: 0.9 });
      const pCols = [0xff6688, 0xffaa22, 0xff44aa, 0xffee44, 0xcc44ff, 0xff8844];
      for (let i = 0; i < 9; i++) {
        const ox = (Math.random() - 0.5) * 0.6, oz = (Math.random() - 0.5) * 0.6;
        const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.28, 5), SM2); stem.position.set(ox, 0.14, oz); g.add(stem);
        const petal = new THREE.Mesh(new THREE.SphereGeometry(0.08, 7, 7), new THREE.MeshStandardMaterial({ color: pCols[i % pCols.length], roughness: 0.8, emissive: pCols[i % pCols.length], emissiveIntensity: 0.18 }));
        petal.position.set(ox, 0.29, oz); g.add(petal);
      }
      g.position.set(x, 0, z); scene.add(g);
    }
    [[-12, 11], [0, 12], [6, 12], [-6, 12], [12, 12], [-12, -11], [0, -12], [6, -12], [-6, -12], [12, -12]].forEach(([x, z]) => makeFlowers(x, z));

    function makeLamp(x, z) {
      const g = new THREE.Group();
      const PM2 = new THREE.MeshStandardMaterial({ color: 0x445566, roughness: 0.4, metalness: 0.88 });
      const BLB = new THREE.MeshStandardMaterial({ color: 0xfffff0, emissive: 0xffeeaa, emissiveIntensity: 2.2 });
      const SH = new THREE.MeshStandardMaterial({ color: 0x1a2a3a, roughness: 0.55, metalness: 0.5 });
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.32, 8), PM2); base.position.y = 0.16; base.castShadow = true; g.add(base);
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.1, 5.8, 10), PM2); pole.position.y = 3.06; pole.castShadow = true; g.add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.075, 0.075), PM2); arm.position.set(0.45, 5.95, 0); g.add(arm);
      const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.38, 0.5, 10), SH); shade.position.set(0.9, 6.1, 0); g.add(shade);
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 8), BLB); bulb.position.set(0.9, 5.88, 0); g.add(bulb);
      const pl = new THREE.PointLight(0xffeeaa, 1.1, 15); pl.position.set(0.9, 5.7, 0); g.add(pl); lampLights.push(pl);
      g.position.set(x, 0, z); scene.add(g);
    }
    [[-16, 12], [16, 12], [-16, -12], [16, -12], [0, 8], [0, -8]].forEach(([x, z]) => makeLamp(x, z));

    // entrance booth
    (function () {
      const g = new THREE.Group();
      const WM2 = new THREE.MeshStandardMaterial({ color: 0x1a3a22, roughness: 0.65, metalness: 0.12 });
      const RM2 = new THREE.MeshStandardMaterial({ color: 0x0d2218, roughness: 0.8 });
      const GW = new THREE.MeshStandardMaterial({ color: 0x88ddcc, roughness: 0.05, transparent: true, opacity: 0.65, emissive: 0x44bbaa, emissiveIntensity: 0.35 });
      const AC = new THREE.MeshStandardMaterial({ color: 0xff9a3c, roughness: 0.35, metalness: 0.55, emissive: 0xff9a3c, emissiveIntensity: 0.35 });
      const walls = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.8, 2.4), WM2); walls.position.y = 1.4; walls.castShadow = true; g.add(walls);
      const band = new THREE.Mesh(new THREE.BoxGeometry(2.44, 0.14, 2.44), AC); band.position.y = 2.78; g.add(band);
      const roof = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.2, 2.8), RM2); roof.position.y = 2.92; g.add(roof);
      const win = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 0.06), GW); win.position.set(0, 1.7, 1.22); g.add(win);
      const sign = makeLabel("ENTRÉE", "#ff9a3c"); sign.position.set(0, 3.4, 0); sign.scale.set(1.8, 0.7, 1); g.add(sign);
      const el = new THREE.PointLight(0xffb066, 0.6, 6); el.position.set(0, 3, 0); g.add(el); lampLights.push(el);
      g.position.set(0, 0, 14.2); scene.add(g);
    })();

    // ─── Raycasting + interaction ───────────────────────
    const raycaster = new THREE.Raycaster(), mouse = new THREE.Vector2();
    const el = renderer.domElement;
    let hoverSpot = null, downX = 0, downY = 0, downMoved = false;

    function spotFromEvent(e) {
      const r = el.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const h = raycaster.intersectObjects(spotMeshes);
      return h.length ? spotById.get(h[0].object.userData.id) : null;
    }
    function setHover(s) {
      if (hoverSpot === s) return;
      if (hoverSpot) { hoverSpot.hover = false; refreshSpot(hoverSpot); }
      hoverSpot = s && s.status === "free" ? s : null;
      if (hoverSpot) { hoverSpot.hover = true; refreshSpot(hoverSpot); }
    }
    function onPointerDown(e) { downX = e.clientX; downY = e.clientY; downMoved = false; }
    function onPointerMove(e) {
      if (e.buttons && (Math.abs(e.clientX - downX) + Math.abs(e.clientY - downY) > 6)) downMoved = true;
      const r = el.getBoundingClientRect();
      const s = spotFromEvent(e);
      setHover(s);
      if (s && s.status === "free" && !downMoved) {
        el.style.cursor = "pointer";
        onSpotHover({ id: s.id, label: s.label, level: s.level, status: s.status }, e.clientX - r.left, e.clientY - r.top);
      } else {
        el.style.cursor = "grab";
        onHoverEnd();
      }
    }
    function onClick(e) {
      if (downMoved) return;
      const s = spotFromEvent(e);
      if (s && s.status === "free") onSpotClick({ id: s.id, label: s.label, level: s.level, status: s.status });
    }
    function onLeave() { setHover(null); onHoverEnd(); }
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("click", onClick);
    el.addEventListener("pointerleave", onLeave);

    // ─── updateSpots (live diff) ────────────────────────
    function updateSpots(list) {
      list.forEach((d) => {
        const s = spotById.get(d.id);
        if (!s) { buildSpot(d); return; }
        if (s.status !== d.status) {
          s.status = d.status; s.hover = false;
          refreshSpot(s);
          // label colour
          s.label3d.material.map.dispose();
          s.label3d.material.map = labelCanvas(d.label, STATUS_CSS[d.status]);
          s.label3d.material.needsUpdate = true;
          // car add/remove
          if (d.status === "free" && s.car) { scene.remove(s.car); s.car = null; }
          if (d.status !== "free" && !s.car) addCar(s);
        }
      });
      renderer.render(scene, camera);
    }

    // ─── Theme ──────────────────────────────────────────
    function applyTheme() {
      const light = theme === "light";
      if (light) {
        scene.background.setHex(0x9fc6e6);
        scene.fog.color.setHex(0xbcd8ee); scene.fog.density = 0.006;
        ambient.intensity = 0.95; hemi.intensity = 0.8; sun.intensity = 1.7; sun.color.setHex(0xffffff);
        lampLights.forEach((l) => (l.intensity = 0));
      } else {
        scene.background.setHex(0x0a1410);
        scene.fog.color.setHex(0x0a1410); scene.fog.density = 0.019;
        ambient.intensity = 0.4; hemi.intensity = 0.34; sun.intensity = 0.82; sun.color.setHex(0xbcd0ff);
        lampLights.forEach((l) => (l.intensity = l.distance > 8 ? 1.25 : 0.7));
      }
      renderer.render(scene, camera); // force immediate repaint (robust if rAF throttled)
    }
    applyTheme();

    // ─── Smooth programmatic zoom + camera focus ────────
    let zoomTarget = null;   // desired distance
    let camTween = null;     // { pos, look, t, sp, sl }
    function curDist() { return camera.position.distanceTo(controls.target); }
    function setZoom(mult) {
      const d = (zoomTarget != null ? zoomTarget : curDist()) * mult;
      zoomTarget = Math.max(controls.minDistance, Math.min(controls.maxDistance, d));
    }
    function tweenTo(pos, look) {
      camTween = { pos: pos.clone(), look: look.clone(), t: 0, sp: camera.position.clone(), sl: controls.target.clone() };
      zoomTarget = null;
    }

    // ─── Resize ─────────────────────────────────────────
    function resize() {
      const w = container.clientWidth, h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    }
    const ro = new ResizeObserver(resize); ro.observe(container); resize();

    // ─── Loop ───────────────────────────────────────────
    let raf, alive = true, pt = 0;
    function loop() {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      controls.update();

      // camera tween (recenter / focus)
      if (camTween) {
        camTween.t = Math.min(camTween.t + 0.024, 1);
        const e = 1 - Math.pow(1 - camTween.t, 3);
        camera.position.lerpVectors(camTween.sp, camTween.pos, e);
        controls.target.lerpVectors(camTween.sl, camTween.look, e);
        if (camTween.t >= 1) camTween = null;
      } else if (zoomTarget != null) {
        const d = curDist();
        if (Math.abs(d - zoomTarget) < 0.06) { zoomTarget = null; }
        else {
          const nd = THREE.MathUtils.lerp(d, zoomTarget, 0.18);
          const dir = camera.position.clone().sub(controls.target).normalize();
          camera.position.copy(controls.target).add(dir.multiplyScalar(nd));
        }
      }

      // selected/hover pulse
      if (!reduced) {
        pt += 0.05;
        spotById.forEach((s) => {
          if (s.hover && s.status === "free") s.mesh.material.emissiveIntensity = Math.sin(pt) * 0.12 + 0.6;
        });
      }
      renderer.render(scene, camera);
    }
    loop();

    // ─── Public API ─────────────────────────────────────
    return {
      updateSpots,
      setTheme(tn) { theme = tn; applyTheme(); },
      zoomIn() { setZoom(0.8); },
      zoomOut() { setZoom(1.25); },
      recenter() { tweenTo(HOME_POS, new THREE.Vector3(0, 0, 0)); },
      focusSpot(id) {
        const s = spotById.get(id); if (!s) return;
        tweenTo(new THREE.Vector3(s.x, 15, s.z + 12), new THREE.Vector3(s.x, 0, s.z));
      },
      resize,
      destroy() {
        alive = false; cancelAnimationFrame(raf); ro.disconnect();
        el.removeEventListener("pointerdown", onPointerDown);
        el.removeEventListener("pointermove", onPointerMove);
        el.removeEventListener("click", onClick);
        el.removeEventListener("pointerleave", onLeave);
        controls.dispose(); renderer.dispose();
        if (el.parentNode) el.parentNode.removeChild(el);
      },
    };
  }

  window.ParkingMap3D = { create };
})();
