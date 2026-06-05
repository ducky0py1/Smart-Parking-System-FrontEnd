import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Neon palette — mirrors the CSS design tokens
const COLORS = {
  green: new THREE.Color('#ff9a3c'), // libre — neon orange
  cyan:  new THREE.Color('#a85cff'), // réservée — neon purple
  pink:  new THREE.Color('#ff4f9a'), // occupée — neon pink
};

const CAR_NEUTRAL = [0xf3f5fb, 0xe8edf7, 0xd9e2f0, 0x9aa6c4, 0x4a5170];
const CAR_COLORED = [0x8a4ff0, 0xff4f9a, 0xf3892f, 0x29b6cf, 0xe23c5e, 0x3d6bff, 0xb14bff];

// 3-keyframe camera path driven by scroll progress
const CAM_PATH = {
  from: { pos: new THREE.Vector3(0.5,  5.5, 34), look: new THREE.Vector3(0,   1.5,   4) },
  mid:  { pos: new THREE.Vector3(-15, 12,  18), look: new THREE.Vector3(0,   0.5,  -6) },
  to:   { pos: new THREE.Vector3(13,  30,   2), look: new THREE.Vector3(-1,  0,   -22) },
};

function easeInOut(x) {
  return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
}

function radialTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d');
  const grd = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0,    'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  grd.addColorStop(1,    'rgba(255,255,255,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

function makeCar(accentColor) {
  const g = new THREE.Group();
  const colored = Math.random() < 0.5;
  const paintHex = colored
    ? CAR_COLORED[Math.floor(Math.random() * CAR_COLORED.length)]
    : CAR_NEUTRAL[Math.floor(Math.random() * CAR_NEUTRAL.length)];

  const paint = new THREE.MeshStandardMaterial({
    color: paintHex, metalness: 0.5, roughness: 0.32,
    emissive: colored ? paintHex : 0x000000,
    emissiveIntensity: colored ? 0.22 : 0,
  });
  const glass = new THREE.MeshStandardMaterial({ color: 0x2c3654, metalness: 0.55, roughness: 0.12, transparent: true, opacity: 0.92 });
  const trim  = new THREE.MeshStandardMaterial({ color: 0x232a42, metalness: 0.6,  roughness: 0.45 });
  const tire  = new THREE.MeshStandardMaterial({ color: 0x14182a, roughness: 0.85, metalness: 0.1 });
  const hub   = new THREE.MeshStandardMaterial({ color: 0xcfd6e8, metalness: 0.8,  roughness: 0.3 });

  const L = 3.5, W = 1.64, H = 0.5;

  const add = (geo, mat, px = 0, py = 0, pz = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(px, py, pz);
    g.add(m);
    return m;
  };

  add(new THREE.BoxGeometry(W,         H,        L      ), paint, 0, 0.46, 0);
  add(new THREE.BoxGeometry(W * 0.92,  0.14,     L * 0.9), paint, 0, 0.72, 0);
  add(new THREE.BoxGeometry(W * 1.03,  0.18,     L * 0.94), trim,  0, 0.30, 0);
  add(new THREE.BoxGeometry(W * 0.86,  0.44,     L * 0.42), glass, 0, 0.92, 0.08);
  add(new THREE.BoxGeometry(W * 0.8,   0.12,     L * 0.36), paint, 0, 1.15, 0.08);

  const hlMat = new THREE.MeshStandardMaterial({ color: 0xfff6dc, emissive: 0xffeebf, emissiveIntensity: 1.3 });
  for (const sx of [-1, 1]) {
    const hl = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.17, 0.07), hlMat);
    hl.position.set(sx * 0.5, 0.5, -L / 2 + 0.015);
    g.add(hl);
  }

  const tlMat = new THREE.MeshStandardMaterial({
    color: accentColor.getHex(),
    emissive: accentColor.getHex(),
    emissiveIntensity: 1.5,
  });
  const tl = new THREE.Mesh(new THREE.BoxGeometry(W * 0.86, 0.12, 0.06), tlMat);
  tl.position.set(0, 0.52, L / 2 - 0.01);
  g.add(tl);

  const wheelGeo = new THREE.CylinderGeometry(0.34, 0.34, 0.26, 18);
  const hubGeo   = new THREE.CylinderGeometry(0.16, 0.16, 0.28, 12);
  const wz = L * 0.31;
  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const w  = new THREE.Mesh(wheelGeo, tire);
      w.rotation.z = Math.PI / 2;
      w.position.set(sx * (W / 2 + 0.01), 0.32, sz * wz);
      g.add(w);
      const hc = new THREE.Mesh(hubGeo, hub);
      hc.rotation.z = Math.PI / 2;
      hc.position.copy(w.position);
      g.add(hc);
    }
  }

  return g;
}

function buildFloor(lotGroup) {
  const base = new THREE.Mesh(
    new THREE.PlaneGeometry(160, 240),
    new THREE.MeshBasicMaterial({ color: 0x141a30, transparent: true, opacity: 0.5 })
  );
  base.rotation.x = -Math.PI / 2;
  base.position.y = -0.05;
  lotGroup.add(base);

  const grid = new THREE.GridHelper(220, 80, 0x9a5cff, 0x4a3b78);
  grid.material.transparent = true;
  grid.material.opacity = 0.45;
  lotGroup.add(grid);
  lotGroup.userData.grid = grid;
}

function buildLot(lotGroup) {
  const haloTex  = radialTexture();
  const spotData = [];

  const cols = 7, rows = 16, cw = 3.2, rd = 4.4, aisle = 4.5;
  const startX = -((cols - 1) * cw) / 2;
  const startZ = 22;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = startX + c * cw + (c > Math.floor(cols / 2) ? aisle : 0) - aisle / 2;
      const z = startZ - r * rd;

      const rnd = Math.random();
      const state = rnd > 0.78 ? 'pink' : rnd > 0.62 ? 'cyan' : 'green';
      const color = COLORS[state];

      const pad = new THREE.Mesh(
        new THREE.PlaneGeometry(cw * 0.82, rd * 0.78),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16, side: THREE.DoubleSide })
      );
      pad.rotation.x = -Math.PI / 2;
      pad.position.set(x, 0.02, z);
      lotGroup.add(pad);

      const edge = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.PlaneGeometry(cw * 0.82, rd * 0.78)),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.85 })
      );
      edge.rotation.x = -Math.PI / 2;
      edge.position.set(x, 0.03, z);
      lotGroup.add(edge);

      const halo = new THREE.Sprite(new THREE.SpriteMaterial({
        map: haloTex,
        color: color.clone(),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        opacity: 0.5,
      }));
      halo.scale.set(cw * 1.5, cw * 1.5, 1);
      halo.position.set(x, 0.06, z);
      lotGroup.add(halo);

      let car = null;
      if (state !== 'green') {
        car = makeCar(color);
        car.position.set(x, 0, z);
        car.rotation.y = (Math.PI / 2) * (c < cols / 2 ? 1 : -1);
        lotGroup.add(car);
      }

      spotData.push({ pad, edge, halo, car, state, phase: Math.random() * Math.PI * 2 });
    }
  }

  // structural pillars for depth
  for (let i = 0; i < 6; i++) {
    const pil = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 7, 0.6),
      new THREE.MeshStandardMaterial({ color: 0x3a4366, metalness: 0.35, roughness: 0.65 })
    );
    pil.position.set(-2.2, 3.5, 18 - i * 9);
    lotGroup.add(pil);
  }

  return spotData;
}

// ── Inner scene component (runs inside the R3F Canvas context) ──
function SceneCore({ theme }) {
  const { scene } = useThree();
  const s = useRef({
    spots: [], lotGroup: null,
    scrollT: 0, targetScroll: 0,
    mouseX: 0, mouseY: 0, tMouseX: 0, tMouseY: 0,
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    _p: new THREE.Vector3(),
    _l: new THREE.Vector3(),
  });

  // Build the scene imperatively once on mount
  useEffect(() => {
    const ref = s.current;
    ref.lotGroup = new THREE.Group();
    scene.add(ref.lotGroup);
    buildFloor(ref.lotGroup);
    ref.spots = buildLot(ref.lotGroup);

    scene.add(new THREE.AmbientLight(0xaeb8d8, 0.85));
    scene.add(new THREE.HemisphereLight(0xeaf0ff, 0x2a3350, 0.7));
    const key = new THREE.DirectionalLight(0xfdfcff, 1.05);
    key.position.set(12, 26, 14);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xcdd6ff, 0.4);
    fill.position.set(-14, 12, -8);
    scene.add(fill);
    const rim = new THREE.PointLight(0xb3a6ff, 0.9, 130);
    rim.position.set(-18, 9, -10);
    scene.add(rim);

    return () => { scene.remove(ref.lotGroup); ref.spots = []; };
  }, [scene]);

  // Adjust neon opacity when theme switches
  useEffect(() => {
    const ref = s.current;
    const lt = theme === 'light';
    ref.spots.forEach((sp) => {
      sp.pad.material.opacity  = lt ? 0.10 : 0.16;
      sp.edge.material.opacity = lt ? 1.00 : 0.85;
    });
    if (ref.lotGroup?.userData.grid) {
      ref.lotGroup.userData.grid.material.opacity = lt ? 0.22 : 0.45;
    }
  }, [theme]);

  // Scroll → drive camera path
  useEffect(() => {
    const handler = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      s.current.targetScroll = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Mouse parallax
  useEffect(() => {
    const handler = (e) => {
      s.current.mouseX = (e.clientX / window.innerWidth)  * 2 - 1;
      s.current.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', handler, { passive: true });
    return () => window.removeEventListener('pointermove', handler);
  }, []);

  useFrame((state) => {
    const ref = s.current;
    const t   = state.clock.elapsedTime;

    ref.scrollT  += (ref.targetScroll - ref.scrollT)  * 0.07;
    ref.tMouseX  += (ref.mouseX       - ref.tMouseX)  * 0.05;
    ref.tMouseY  += (ref.mouseY       - ref.tMouseY)  * 0.05;

    if (!ref.reduced && ref.spots.length > 0) {
      ref.spots.forEach((sp) => {
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.4 + sp.phase);
        const base  = theme === 'light' ? 0.24 : 0.5;
        sp.halo.material.opacity = base + pulse * (sp.state === 'green' ? 0.32 : 0.2);
        if (sp.car) sp.car.position.y = Math.sin(t * 0.8 + sp.phase) * 0.04;
      });
      if (ref.lotGroup) ref.lotGroup.rotation.y = Math.sin(t * 0.05) * 0.03;
    }

    // Camera keyframe interpolation
    const sc = ref.scrollT;
    if (sc < 0.5) {
      const k = easeInOut(sc / 0.5);
      ref._p.lerpVectors(CAM_PATH.from.pos,  CAM_PATH.mid.pos,  k);
      ref._l.lerpVectors(CAM_PATH.from.look, CAM_PATH.mid.look, k);
    } else {
      const k = easeInOut((sc - 0.5) / 0.5);
      ref._p.lerpVectors(CAM_PATH.mid.pos,  CAM_PATH.to.pos,  k);
      ref._l.lerpVectors(CAM_PATH.mid.look, CAM_PATH.to.look, k);
    }
    ref._p.x += ref.tMouseX * 3;
    ref._p.y -= ref.tMouseY * 1.6;

    state.camera.position.lerp(ref._p, 0.06);
    state.camera.lookAt(ref._l);
  });

  return null;
}

// ── Public component ──
export default function ParkingScene3D({ theme }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        width: '100vw', height: '100vh',
        zIndex: 0, pointerEvents: 'none',
      }}
    >
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ fov: 52, near: 0.1, far: 400, position: [0.5, 5.5, 34] }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        }}
      >
        <SceneCore theme={theme} />
      </Canvas>
    </div>
  );
}
